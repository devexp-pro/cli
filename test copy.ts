type AutocompleteInputItem = {
  name: string;
  stringForSearch?: string;
  description?: string;
  value?: any;
  prefix?: string;
  suffix?: string;
};

type AutocompleteInputList = Array<AutocompleteInputItem>;

type AutocompleteInputOptions = {
  searchPrompt?: string;
  pageSize?: number;
};

type AutocompleteInputResult =
  | { isItem: true; value: any; index: number; exit: false }
  | { isItem: false; value: string; index: -1; exit: false }
  | { isItem: false; value: null; index: -1; exit: true };

export function autocompleteInput(
  items: AutocompleteInputList,
  options: AutocompleteInputOptions = {},
): Promise<AutocompleteInputResult> {
  return new Promise((resolve) => {
    let query = "";
    let selectedIndex = -1;
    let results: AutocompleteInputList = [];
    let inSelectionMode = false;
    let pageIndex = 0;
    const PAGE_SIZE = options.pageSize || 5;

    const searchPrompt = options.searchPrompt || "Search:";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    Deno.stdout.writeSync(encoder.encode("\x1b[s")); // Save cursor
    Deno.stdin.setRaw(true);

    function graphemeSplit(str: string): string[] {
      return [...str];
    }

    function getAutocompleteSuggestion(): string | null {
      if (!query) return null;
      const queryLower = query.toLowerCase();

      // First try to find suggestion from selected item if any
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        const selectedItem = results[selectedIndex];
        const searchString = selectedItem.stringForSearch || selectedItem.name;
        if (searchString.toLowerCase().startsWith(queryLower)) {
          return searchString.slice(graphemeSplit(query).length);
        }
      }

      // Then try to find any matching item
      const matchingItem = items.find((item) => {
        const searchString = item.stringForSearch || item.name;
        return searchString.toLowerCase().startsWith(queryLower);
      });

      return matchingItem
        ? (matchingItem.stringForSearch || matchingItem.name).slice(
          graphemeSplit(query).length,
        )
        : null;
    }

    function getDisplayText(item: AutocompleteInputItem): string {
      const displayText = item.stringForSearch || item.name;
      return `${item.prefix || ""}${displayText}${item.suffix || ""}`;
    }

    function highlightMatch(
      item: AutocompleteInputItem,
      isSelected: boolean,
    ): string {
      const displayText = getDisplayText(item);
      const searchText = item.stringForSearch || item.name;
      const queryLower = query.toLowerCase();
      const searchTextLower = searchText.toLowerCase();

      const index = searchTextLower.indexOf(queryLower);
      if (index === -1 || query === "") return displayText;

      // Calculate positions in display text
      const prefixLength = item.prefix ? graphemeSplit(item.prefix).length : 0;
      const searchTextLength = graphemeSplit(searchText).length;
      const suffixLength = item.suffix ? graphemeSplit(item.suffix).length : 0;

      // Find match positions in display text
      const matchStart = prefixLength + index;
      const matchEnd = prefixLength + index + graphemeSplit(query).length;

      const beforeMatch = graphemeSplit(displayText).slice(0, matchStart).join(
        "",
      );
      const match = graphemeSplit(displayText).slice(matchStart, matchEnd).join(
        "",
      );
      const afterMatch = graphemeSplit(displayText).slice(matchEnd).join("");

      if (isSelected) {
        return `\x1b[4m\x1b[32m${beforeMatch}\x1b[93m${match}\x1b[32m${afterMatch}\x1b[0m`;
      } else {
        return `${beforeMatch}\x1b[93m${match}\x1b[0m${afterMatch}`;
      }
    }

    function updateResults() {
      const queryLower = query.toLowerCase();
      results = items.filter((item) => {
        const searchString = item.stringForSearch || item.name;
        return searchString.toLowerCase().includes(queryLower);
      });

      // Enable selection mode only when:
      // 1. There are results AND
      // 2. Either:
      //    - There are multiple results OR
      //    - The query doesn't exactly match the single result
      inSelectionMode = results.length > 0 &&
        (results.length > 1 ||
          query !== (results[0].stringForSearch || results[0].name));

      if (!inSelectionMode) selectedIndex = -1;
      else if (selectedIndex === -1 && results.length > 0) selectedIndex = 0;
    }

    function clearFromCursor() {
      Deno.stdout.writeSync(encoder.encode("\x1b[J"));
    }

    function updateDisplay() {
      Deno.stdout.writeSync(encoder.encode("\x1b[u"));
      clearFromCursor();

      const formattedPrompt = `\x1b[96m${searchPrompt} \x1b[0m`;
      Deno.stdout.writeSync(encoder.encode(formattedPrompt + query));

      // Показываем автодополнение, если есть подходящее предложение
      const suggestion = getAutocompleteSuggestion();
      if (suggestion) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[90m" + suggestion + "\x1b[0m"),
        );
      }

      Deno.stdout.writeSync(encoder.encode("\n\n"));

      // Показываем описание выбранного элемента
      if (
        selectedIndex >= 0 &&
        selectedIndex < results.length &&
        results[selectedIndex].description
      ) {
        Deno.stdout.writeSync(
          encoder.encode(
            `\x1b[36m${results[selectedIndex].description}\x1b[0m\n\n`,
          ),
        );
      }

      // Показываем результаты в режиме выбора
      if (inSelectionMode) {
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
            const isSelected = selectedIndex === absoluteIndex;

            const prefix = isSelected ? "❯ " : "  ";
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
      if (!inSelectionMode) return;

      const totalPages = Math.ceil(results.length / PAGE_SIZE);

      switch (direction) {
        case "A": // Up arrow
          if (selectedIndex <= 0) {
            selectedIndex = results.length - 1;
          } else {
            selectedIndex--;
          }
          pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          break;
        case "B": // Down arrow
          if (selectedIndex >= results.length - 1) {
            selectedIndex = 0;
          } else {
            selectedIndex++;
          }
          pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          break;
        case "D": // Left arrow
          if (pageIndex > 0) {
            pageIndex--;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
        case "C": // Right arrow
          if (pageIndex < totalPages - 1) {
            pageIndex++;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
      }
    }

    updateResults();
    updateDisplay();

    const buf = new Uint8Array(16);

    function readInput() {
      const bytesRead = Deno.stdin.readSync(buf);
      if (bytesRead === null) return false;

      const input = decoder.decode(buf.subarray(0, bytesRead));

      if (input.startsWith("\x1b[")) {
        const arrowKey = input[2];
        if (["A", "B", "C", "D"].includes(arrowKey)) {
          handleArrowKey(arrowKey);
          updateDisplay();
        }
        return true;
      }

      for (let i = 0; i < input.length; i++) {
        const char = input[i];

        switch (char) {
          case "\x03": // Ctrl+C
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\n"));
            Deno.exit();
            break;
          case "\x15": // Ctrl+U
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
          case "\t": { // Tab
            const suggestion = getAutocompleteSuggestion();
            if (suggestion) {
              query += suggestion;
              updateResults();
            } else if (selectedIndex >= 0 && selectedIndex < results.length) {
              query = results[selectedIndex].stringForSearch ||
                results[selectedIndex].name;
              updateResults();
            }
            break;
          }
          case "\r": { // Enter
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\r\x1b[K"));
            Deno.stdout.writeSync(encoder.encode("\x1b[u\x1b[0m\x1b[J"));

            // Если выбран элемент, возвращаем его
            if (
              inSelectionMode && selectedIndex >= 0 &&
              selectedIndex < results.length
            ) {
              const selectedItem = results[selectedIndex];
              resolve({
                isItem: true,
                value: selectedItem.value !== undefined
                  ? selectedItem.value
                  : selectedItem.name,
                index: selectedIndex,
                exit: false,
              });
            } else if (query === "") {
              // Возвращаем exit только если нет выбранного элемента и запрос пуст
              resolve({ isItem: false, value: null, index: -1, exit: true });
            } else {
              // Возвращаем введённый текст, если нет выбранного элемента
              resolve({ isItem: false, value: query, index: -1, exit: false });
            }
            return false;
          }
          default:
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

    try {
      while (readInput()) {}
    } catch (err) {
      console.error("Error:", err);
      Deno.stdin.setRaw(false);
      resolve({ isItem: false, value: null, index: -1, exit: true });
    }
  });
}

// Example usage
const russianFruits: AutocompleteInputList = [
  {
    name: "яблоко",
    description: "Сочный зелёный фрукт",
    value: "apple",
    prefix: "🍏 ",
  },
  {
    name: "банан",
    description: "Жёлтый тропический фрукт",
    value: "banana",
    prefix: "🍌 ",
  },
  {
    name: "апельсин",
    description: "Оранжевый цитрусовый фрукт",
    value: "orange",
    prefix: "🍊 ",
  },
  {
    name: "киви",
    description: "Мохнатый фрукт с зелёной мякотью",
    value: "kiwi",
    prefix: "🥝 ",
  },
  {
    name: "ананас",
    description: "Тропический фрукт с колючей кожурой",
    value: "pineapple",
    prefix: "🍍 ",
  },
  {
    name: "персик",
    description: "Мягкий бархатистый фрукт",
    value: "peach",
    prefix: "🍑 ",
  },
  {
    name: "слива",
    description: "Фиолетовый косточковый фрукт",
    value: "plum",
    prefix: "🍆 ",
  },
  {
    name: "малина",
    description: "Красная ягода с нежным вкусом",
    value: "raspberry",
    prefix: "🍓 ",
  },
  {
    name: "клубника",
    description: "Красная сладкая ягода",
    value: "strawberry",
    prefix: "🍓 ",
  },
  {
    name: "арбуз",
    description: "Большая зелёная ягода с красной мякотью",
    value: "watermelon",
    prefix: "🍉 ",
  },
];

async function main() {
  const result1 = await autocompleteInput(russianFruits, {
    searchPrompt: "Фрукт:",
    pageSize: 5,
  });

  console.log(result1);
}

if (import.meta.main) {
  main();
}
