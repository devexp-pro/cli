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

      // Для невыбранных элементов или если запрос пустой — просто текст с подсветкой совпадений
      const index = searchTextLower.indexOf(queryLower);
      if (index === -1 || query === "") return displayText;

      const prefixLength = item.prefix ? graphemeSplit(item.prefix).length : 0;
      const matchStart = prefixLength + index;
      const matchEnd = prefixLength + index + graphemeSplit(query).length;

      const beforeMatch = graphemeSplit(displayText).slice(0, matchStart).join(
        "",
      );
      const match = graphemeSplit(displayText).slice(matchStart, matchEnd).join(
        "",
      );
      const afterMatch = graphemeSplit(displayText).slice(matchEnd).join("");

      // Для выбранного элемента не добавляем подчёркивание и зелёный цвет
      return `${beforeMatch}\x1b[93m${match}\x1b[0m${afterMatch}`;
    }

    function updateResults() {
      const queryLower = query.toLowerCase();
      results = items.filter((item) => {
        const searchString = item.stringForSearch || item.name;
        return searchString.toLowerCase().includes(queryLower);
      });

      // Сохраняем режим выбора, даже если есть полное совпадение
      inSelectionMode = results.length > 0;

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

      const suggestion = getAutocompleteSuggestion();
      if (suggestion) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[90m" + suggestion + "\x1b[0m"),
        );
      }

      Deno.stdout.writeSync(encoder.encode("\n\n"));

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

            const prefix = isSelected ? " ❯ " : "  ";
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
              resolve({ isItem: false, value: null, index: -1, exit: true });
            } else {
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
    name: "tunnel set",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "tunnel start",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },

  {
    name: "tunnel remove",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },

  {
    name: "tunnel list",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },

  {
    name: "tunnel man",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias add",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias run",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias list",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias edit",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias remove",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "alias copy",
    description: " ",
    value: "apple",
    prefix: "[cmd] ",
    suffix: "",
  },
  {
    name: "spotify next",
    description: " ",
    prefix: "[srt] ",
    suffix: "",
  },
  {
    name: "spotify play/stop",
    description: " ",
    prefix: "[srt] ",
    suffix: "",
  },
  {
    name: "arc open",
    description: " ",
    prefix: "[srt] ",
    suffix: "",
  },
  {
    name: "chatgpt ask",
    description: "open ChatGPT desktop app and ask",
    prefix: "[srt] ",
    suffix: "",
  },
  {
    name: "hr",
    stringForSearch: "hr - ssh root@62.72.16.228",
    description: "connect to devexp cloud on Hostinger",
    prefix: "[als] ",
    suffix: "",
  },
  {
    name: "dev",
    description: "deno task dev",
    prefix: "[als] ",
    suffix: "",
  },
];

async function main() {
  const result1 = await autocompleteInput(russianFruits, {
    searchPrompt: "spotlight:",
    pageSize: 10,
  });

  console.log(result1);
}

if (import.meta.main) {
  main();
}
