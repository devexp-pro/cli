export function autocompleteInput(
  items: string[],
  options: { searchPrompt?: string } = {},
): Promise<string> {
  return new Promise((resolve) => {
    let query = "";
    let selectedIndex = -1;
    let results: string[] = [];
    let inSelectionMode = false;
    let pageIndex = 0;
    const PAGE_SIZE = 5;

    const searchPrompt = options.searchPrompt || "Search:";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    Deno.stdout.writeSync(encoder.encode("\x1b[s")); // Save cursor
    Deno.stdin.setRaw(true);

    // Функция для разбиения строки на символы с учетом Unicode
    function graphemeSplit(str: string): string[] {
      return [...str];
    }

    function getAutocompleteSuggestion(query: string): string | null {
      if (!query) return null;
      const queryLower = query.toLowerCase();
      const suggestion = items.find((item) =>
        item.toLowerCase().startsWith(queryLower)
      );
      return suggestion ? suggestion.slice(graphemeSplit(query).length) : null;
    }

    function highlightMatch(item: string, isSelected: boolean): string {
      const itemChars = graphemeSplit(item);
      const queryChars = graphemeSplit(query);
      const itemLower = item.toLowerCase();
      const queryLower = query.toLowerCase();

      const index = itemLower.indexOf(queryLower);
      if (index === -1) return item;

      const start = itemChars.slice(0, index).join("");
      const match = itemChars.slice(index, index + queryChars.length).join("");
      const end = itemChars.slice(index + queryChars.length).join("");

      if (isSelected) {
        return `\x1b[4m\x1b[32m${start}\x1b[93m${match}\x1b[32m${end}\x1b[0m`;
      } else {
        return `${start}\x1b[93m${match}\x1b[0m${end}`;
      }
    }

    function updateResults() {
      const queryLower = query.toLowerCase();
      results = items.filter((item) => item.toLowerCase().includes(queryLower));
      inSelectionMode = results.length > 0;
      if (!inSelectionMode) selectedIndex = -1;
    }

    function clearFromCursor() {
      Deno.stdout.writeSync(encoder.encode("\x1b[J"));
    }

    function updateDisplay() {
      Deno.stdout.writeSync(encoder.encode("\x1b[u"));
      clearFromCursor();

      const formattedPrompt = `\x1b[96m${searchPrompt} \x1b[0m`;
      Deno.stdout.writeSync(encoder.encode(formattedPrompt + query));

      const suggestion = getAutocompleteSuggestion(query);
      if (suggestion) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[90m" + suggestion + "\x1b[0m"),
        );
      }

      Deno.stdout.writeSync(encoder.encode("\n\n"));

      // Отображаем результаты с индексом выбранного элемента, если он выбран
      let resultsHeader;
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        resultsHeader = `\x1b[33mResults (${
          selectedIndex + 1
        }/${results.length}):\x1b[0m\n`;
      } else {
        resultsHeader = `\x1b[33mResults (${results.length}):\x1b[0m\n`;
      }
      Deno.stdout.writeSync(encoder.encode(resultsHeader));

      const totalPages = Math.ceil(results.length / PAGE_SIZE);
      const pageResults = results.slice(
        pageIndex * PAGE_SIZE,
        (pageIndex + 1) * PAGE_SIZE,
      );

      if (pageResults.length === 0) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[31mNo results found.\x1b[0m\n"),
        );
      } else {
        for (let i = 0; i < pageResults.length; i++) {
          const absoluteIndex = pageIndex * PAGE_SIZE + i;
          const isSelected = inSelectionMode &&
            selectedIndex === absoluteIndex;

          const prefix = isSelected ? " ❯ " : "   ";
          const line = highlightMatch(pageResults[i], isSelected);
          Deno.stdout.writeSync(encoder.encode(`${prefix}${line}\n`));
        }

        if (totalPages > 1) {
          const indicator = `\n\x1b[36mPage ${
            pageIndex + 1
          }/${totalPages} ←/→ to navigate, Complete: ⇥, Submit: ↵ \x1b[0m\n`;
          Deno.stdout.writeSync(encoder.encode(indicator));
        } else {
          Deno.stdout.writeSync(
            encoder.encode("\n\x1b[36mComplete: ⇥, Submit: ↵ \x1b[0m\n"),
          );
        }
      }

      Deno.stdout.writeSync(
        encoder.encode(
          `\x1b[u\x1b[${
            searchPrompt.length + 1 + graphemeSplit(query).length
          }C`,
        ),
      );
    }

    function handleArrowKey(direction: string) {
      const totalPages = Math.ceil(results.length / PAGE_SIZE);

      switch (direction) {
        case "A": // Стрелка вверх
          if (results.length > 0) {
            if (selectedIndex <= 0) {
              selectedIndex = results.length - 1;
            } else {
              selectedIndex--;
            }
            pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          }
          break;
        case "B": // Стрелка вниз
          if (results.length > 0) {
            if (selectedIndex >= results.length - 1) {
              selectedIndex = 0;
            } else {
              selectedIndex++;
            }
            pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          }
          break;
        case "D": // Стрелка влево
          if (pageIndex > 0) {
            pageIndex--;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
        case "C": // Стрелка вправо
          if (pageIndex < totalPages - 1) {
            pageIndex++;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
      }
    }

    updateResults();
    updateDisplay();

    // Буфер для чтения байтов
    const buf = new Uint8Array(16);

    // Обработка ввода в цикле
    function readInput() {
      const bytesRead = Deno.stdin.readSync(buf);
      if (bytesRead === null) return false;

      const input = decoder.decode(buf.subarray(0, bytesRead));

      // Обработка Escape-последовательностей (стрелки)
      if (input.startsWith("\x1b[")) {
        const arrowKey = input[2];
        if (
          arrowKey === "A" || arrowKey === "B" || arrowKey === "C" ||
          arrowKey === "D"
        ) {
          handleArrowKey(arrowKey);
          updateDisplay();
        }
        return true;
      }

      // Обработка других клавиш
      for (let i = 0; i < input.length; i++) {
        const char = input[i];

        switch (char) {
          case "\x03": // Ctrl+C
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\n"));
            Deno.exit();
            break;
          case "\x15": // Ctrl+U - очистить запрос
            query = "";
            selectedIndex = -1;
            pageIndex = 0;
            updateResults();
            break;
          case "\x7f": // Backspace
            if (query.length > 0) {
              query = graphemeSplit(query).slice(0, -1).join("");
              selectedIndex = -1;
              pageIndex = 0;
              updateResults();
            }
            break;
          case "\t": // Tab - автодополнение
            const suggestion = getAutocompleteSuggestion(query);
            if (suggestion) {
              query += suggestion;
              updateResults();
            } else if (selectedIndex >= 0 && selectedIndex < results.length) {
              query = results[selectedIndex];
              updateResults();
            } else if (results.length === 1) {
              query = results[0];
              updateResults();
            }
            break;
          case "\r": // Enter
            if (selectedIndex >= 0 && selectedIndex < results.length) {
              query = results[selectedIndex];
            } else if (results.length === 1) {
              query = results[0];
            }
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\r\x1b[K"));
            resolve(query);
            return false;
          default:
            // Добавляем все остальные символы к запросу (включая Unicode)
            if (char >= " " || char.charCodeAt(0) > 127) {
              query += char;
              selectedIndex = -1;
              pageIndex = 0;
              updateResults();
            }
            break;
        }
      }

      updateDisplay();
      return true;
    }

    // Асинхронный цикл чтения ввода
    (async () => {
      try {
        while (await readInput()) {
          // Продолжаем чтение, пока функция возвращает true
        }
      } catch (err) {
        console.error("Error:", err);
        Deno.stdin.setRaw(false);
        resolve("");
      }
    })();
  });
}

// Пример использования с русскими словами
const russianFruits = [
  "яблоко",
  "банан",
  "апельсин",
  "киви",
  "ананас",
  "персик",
  "слива",
  "малина",
  "клубника",
  "арбуз",
  "дыня",
  "виноград",
  "груша",
  "лимон",
  "лайм",
  "гранат",
  "манго",
  "папайя",
  "фейхоа",
  "черешня",
];

async function main() {
  console.log(
    "Вы выбрали:",
    await autocompleteInput(russianFruits, {
      searchPrompt: "Выберите фрукт:",
    }),
  );
}

if (import.meta.main) {
  main();
}
