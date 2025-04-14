export function autocompleteInput(
  items: string[],
  options: { searchPrompt?: string } = {},
): Promise<string> {
  return new Promise((resolve) => {
    (async () => {
      let query = "";
      let selectedIndex = -1;
      let results: string[] = [];
      let inSelectionMode = false;
      let pageIndex = 0;
      const PAGE_SIZE = 5;

      // Используем пользовательский промпт или значение по умолчанию
      const searchPrompt = options.searchPrompt || "Search:";

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      Deno.stdout.writeSync(encoder.encode("\x1b[s")); // Save cursor
      Deno.stdin.setRaw(true);

      function getAutocompleteSuggestion(query: string): string | null {
        if (!query) return null;
        const suggestion = items.find((item) =>
          item.toLowerCase().startsWith(query.toLowerCase())
        );
        return suggestion ? suggestion.slice(query.length) : null;
      }

      function highlightMatch(item: string, isSelected: boolean): string {
        const index = item.toLowerCase().indexOf(query.toLowerCase());
        // if (index === -1 || !query) {
        //   // Если нет совпадения или нет запроса, просто возвращаем элемент
        //   // с применением цвета, если он выбран
        //   return isSelected ? `\x1b[32m${item}\x1b[0m` : item;
        // }

        const start = item.slice(0, index);
        const match = item.slice(index, index + query.length);
        const end = item.slice(index + query.length);

        if (isSelected) {
          // тут добавь подчеркивание
          return `\x1b[4m\x1b[32m${start}\x1b[93m${match}\x1b[32m${end}\x1b[0m`;
        } else {
          return start + "\x1b[93m" + match + "\x1b[0m" + end;
        }
      }

      function updateResults() {
        results = items.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        );
        // Если найдено более одного результата, включаем режим выбора
        // В противном случае выключаем его
        inSelectionMode = results.length > 1;
        if (!inSelectionMode) selectedIndex = -1;
        pageIndex = 0;
      }

      function updateDisplay() {
        Deno.stdout.writeSync(encoder.encode("\x1b[u")); // Restore cursor
        clearFromCursor();

        // Search query and autocomplete suggestion
        // Используем пользовательский промпт
        const formattedPrompt = `\x1b[96m${searchPrompt} \x1b[0m`;
        Deno.stdout.writeSync(encoder.encode(formattedPrompt + query));

        const suggestion = getAutocompleteSuggestion(query);
        if (suggestion) {
          Deno.stdout.writeSync(
            encoder.encode("\x1b[90m" + suggestion + "\x1b[0m"),
          );
        }

        Deno.stdout.writeSync(encoder.encode("\n\n"));
        Deno.stdout.writeSync(
          encoder.encode(`\x1b[33mResults (${results.length}):\x1b[0m\n`),
        ); // Yellow color for "Results"

        const totalPages = Math.ceil(results.length / PAGE_SIZE);
        const pageResults = results.slice(
          pageIndex * PAGE_SIZE,
          (pageIndex + 1) * PAGE_SIZE,
        );

        if (pageResults.length === 0) {
          Deno.stdout.writeSync(
            encoder.encode("\x1b[31mNo results found.\x1b[0m\n"),
          ); // Red for "No results"
        } else {
          for (let i = 0; i < pageResults.length; i++) {
            const absoluteIndex = pageIndex * PAGE_SIZE + i;
            const isSelected = inSelectionMode &&
              selectedIndex === absoluteIndex;

            // Изменяем префикс для лучшей визуализации выбора
            const prefix = isSelected ? " ❯ " : "   ";

            // Используем обновленную функцию подсветки с учетом выбора
            const line = highlightMatch(pageResults[i], isSelected);

            Deno.stdout.writeSync(
              encoder.encode(`${prefix}${line}\n`),
            );
          }

          // Page indicator - показываем навигацию только если есть более одного результата
          if (totalPages > 1 && inSelectionMode) {
            const indicator = `\n\x1b[36mPage ${
              pageIndex + 1
            }/${totalPages} ←/→ to navigate, Complete: ⇥, Submit: ↵ \x1b[0m\n`;
            Deno.stdout.writeSync(encoder.encode(indicator));
          } else {
            // Простое сообщение, если нет режима выбора
            Deno.stdout.writeSync(
              encoder.encode("\n\x1b[36mComplete: ⇥, Submit: ↵ \x1b[0m\n"),
            );
          }
        }

        // Корректируем позицию курсора с учетом длины промпта
        // Прибавляем 1 для учета пробела после промпта
        Deno.stdout.writeSync(
          encoder.encode(
            `\x1b[u\x1b[${searchPrompt.length + 1 + query.length}C`,
          ),
        );
      }

      function handleKeySequence(keySeq: string) {
        // Обрабатываем клавиши стрелок только если включен режим выбора
        if (!inSelectionMode) return;

        switch (keySeq) {
          case "\x1b[A": // Arrow up
            if (results.length > 0) {
              selectedIndex = selectedIndex <= 0
                ? results.length - 1
                : selectedIndex - 1;
              pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
            }
            break;

          case "\x1b[B": // Arrow down
            if (results.length > 0) {
              selectedIndex = selectedIndex >= results.length - 1
                ? 0
                : selectedIndex + 1;
              pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
            }
            break;

          case "\x1b[D": // Arrow left (previous page)
            if (pageIndex > 0) {
              pageIndex--;
              selectedIndex = pageIndex * PAGE_SIZE;
            }
            break;

          case "\x1b[C": // Arrow right (next page)
            const totalPages = Math.ceil(results.length / PAGE_SIZE);
            if (pageIndex < totalPages - 1) {
              pageIndex++;
              selectedIndex = pageIndex * PAGE_SIZE;
            }
            break;

          default:
            break;
        }
      }

      updateResults();
      updateDisplay();

      let buffer = "";
      for await (const chunk of Deno.stdin.readable) {
        const key = decoder.decode(chunk);
        buffer += key;

        // Arrow keys come as 3-byte sequences
        if (buffer.startsWith("\x1b") && buffer.length < 3) {
          continue; // Wait for full escape sequence
        }

        if (buffer.length >= 3 && buffer.startsWith("\x1b")) {
          handleKeySequence(buffer.slice(0, 3));
          buffer = buffer.slice(3);
          updateDisplay();
          continue;
        }

        for (const char of buffer) {
          switch (char) {
            case "\x03": // Ctrl+C
              Deno.stdin.setRaw(false);
              Deno.stdout.writeSync(encoder.encode("\n"));
              Deno.exit();
              break;

            case "\x15": // Ctrl+U
              query = "";
              selectedIndex = -1;
              inSelectionMode = false;
              break;

            case "\x7f": // Backspace
              query = query.slice(0, -1);
              selectedIndex = -1;
              updateResults(); // Обновляем results и режим выбора при удалении символа
              break;

            case "\t": // Tab
              const suggestion = getAutocompleteSuggestion(query);
              if (suggestion) {
                query += suggestion;
                selectedIndex = -1;
                updateResults(); // Обновляем режим выбора после автодополнения
              } else if (results.length === 1) {
                // Если только один результат, выбираем его автоматически
                query = results[0];
                selectedIndex = -1;
                updateResults();
              }
              break;

            case "\r": // Enter
              if (inSelectionMode && selectedIndex >= 0) {
                query = results[selectedIndex];
                selectedIndex = -1;
                inSelectionMode = false;
              } else if (results.length === 1) {
                // Если только один результат, выбираем его
                query = results[0];
                Deno.stdin.setRaw(false);
                Deno.stdout.writeSync(encoder.encode("\n"));
                resolve(query);
                return;
              } else {
                Deno.stdin.setRaw(false);
                Deno.stdout.writeSync(encoder.encode("\n"));
                resolve(query);
                return;
              }
              break;

            default:
              if (char >= " " && char <= "~") {
                query += char;
                selectedIndex = -1;
              }
              break;
          }
        }

        buffer = "";

        updateResults();
        updateDisplay();
      }
    })();
  });
}

function clearFromCursor() {
  Deno.stdout.writeSync(new TextEncoder().encode("\x1b[J"));
}

// Пример использования:
const fruits = [
  "apple",
  "banana",
  "grape",
  "orange",
  "kiwi",
  "avocado",
  "pineapple",
  "peach",
  "plum",
  "blueberry",
  "blackberry",
  "mango",
  "melon",
  "apricot",
  "coconut",
  "cranberry",
  "fig",
  "guava",
  "lemon",
  "lime",
];

async function main() {
  // Пример использования с настраиваемым промптом
  const selectedFruit = await autocompleteInput(fruits, {
    searchPrompt: "Выберите фрукт:",
  });
  console.log("You selected:", selectedFruit);

  // Пример использования с промптом по умолчанию
  // const selectedFruit = await autocompleteInput(fruits);
  // console.log("You selected:", selectedFruit);
}

if (import.meta.main) {
  main();
}
