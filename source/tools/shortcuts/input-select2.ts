// Экспортируемая функция для интерактивного автодополнения ввода
// Принимает:
// - items: массив строк для автодополнения
// - options: объект с опциями (например, кастомный текст подсказки)
// Возвращает Promise<string> - выбранный пользователем элемент
export function autocompleteInput(
  items: string[],
  options: { searchPrompt?: string } = {},
): Promise<string> {
  return new Promise((resolve) => {
    // Состояние приложения:
    let query = ""; // Текущий ввод пользователя
    let selectedIndex = -1; // Индекс выбранного элемента (-1 = ничего не выбрано)
    let results: string[] = []; // Отфильтрованные результаты поиска
    let inSelectionMode = false; // Флаг, указывающий, что есть несколько вариантов для выбора
    let pageIndex = 0; // Текущая страница результатов (для пагинации)
    const PAGE_SIZE = 5; // Количество результатов на странице

    // Настройка подсказки для ввода (используем кастомную или дефолтную)
    const searchPrompt = options.searchPrompt || "Search:";
    // Утилиты для работы с вводом/выводом
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Сохраняем позицию курсора, чтобы можно было возвращаться к ней при обновлении интерфейса
    Deno.stdout.writeSync(encoder.encode("\x1b[s")); // Save cursor
    // Включаем "сырой" режим ввода для обработки специальных клавиш
    Deno.stdin.setRaw(true);

    // Функция для получения автодополнения текущего запроса
    function getAutocompleteSuggestion(query: string): string | null {
      if (!query) return null;
      // Ищем первый элемент, начинающийся с запроса (без учета регистра)
      const suggestion = items.find((item) =>
        item.toLowerCase().startsWith(query.toLowerCase())
      );
      // Возвращаем только часть, которой не хватает в запросе
      return suggestion ? suggestion.slice(query.length) : null;
    }

    // Функция для подсветки совпадения в строке
    function highlightMatch(item: string, isSelected: boolean): string {
      // Находим индекс начала совпадения (без учета регистра)
      const index = item.toLowerCase().indexOf(query.toLowerCase());

      // Разделяем строку на части:
      const start = item.slice(0, index); // до совпадения
      const match = item.slice(index, index + query.length); // совпадение
      const end = item.slice(index + query.length); // после совпадения

      // Форматируем в зависимости от того, выбран ли элемент
      if (isSelected) {
        // Выделенный элемент: подчеркивание, зеленый цвет, жирное совпадение
        return `\x1b[4m\x1b[32m${start}\x1b[93m${match}\x1b[32m${end}\x1b[0m`;
      } else {
        // Обычный элемент: просто подсвечиваем совпадение желтым
        return start + "\x1b[93m" + match + "\x1b[0m" + end;
      }
    }

    // Обновляем результаты поиска на основе текущего запроса
    function updateResults() {
      // Фильтруем элементы, содержащие запрос (без учета регистра)
      results = items.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      // Переходим в режим выбора, если есть больше одного результата
      inSelectionMode = results.length > 1;
      // Сбрасываем выбор, если вышли из режима выбора
      if (!inSelectionMode) selectedIndex = -1;
      // Сбрасываем пагинацию
      pageIndex = 0;
    }

    // Обновляем отображение интерфейса
    function updateDisplay() {
      // Восстанавливаем позицию курсора
      Deno.stdout.writeSync(encoder.encode("\x1b[u")); // Restore cursor
      // Очищаем экран от текущей позиции курсора
      clearFromCursor();

      // Выводим подсказку с голубым цветом
      const formattedPrompt = `\x1b[96m${searchPrompt} \x1b[0m`;
      Deno.stdout.writeSync(encoder.encode(formattedPrompt + query));

      // Если есть автодополнение, выводим его серым цветом
      const suggestion = getAutocompleteSuggestion(query);
      if (suggestion) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[90m" + suggestion + "\x1b[0m"),
        );
      }

      // Переходим на новую строку и выводим заголовок результатов
      Deno.stdout.writeSync(encoder.encode("\n\n"));
      Deno.stdout.writeSync(
        encoder.encode(`\x1b[33mResults (${results.length}):\x1b[0m\n`),
      );

      // Рассчитываем пагинацию
      const totalPages = Math.ceil(results.length / PAGE_SIZE);
      // Получаем результаты для текущей страницы
      const pageResults = results.slice(
        pageIndex * PAGE_SIZE,
        (pageIndex + 1) * PAGE_SIZE,
      );

      // Если нет результатов на странице
      if (pageResults.length === 0) {
        Deno.stdout.writeSync(
          encoder.encode("\x1b[31mNo results found.\x1b[0m\n"),
        );
      } else {
        // Выводим каждый результат на странице
        for (let i = 0; i < pageResults.length; i++) {
          const absoluteIndex = pageIndex * PAGE_SIZE + i;
          const isSelected = inSelectionMode &&
            selectedIndex === absoluteIndex;

          // Префикс для выбранного элемента (стрелка) или пробелы
          const prefix = isSelected ? " ❯ " : "   ";
          // Подсвеченная строка
          const line = highlightMatch(pageResults[i], isSelected);
          Deno.stdout.writeSync(encoder.encode(`${prefix}${line}\n`));
        }

        // Если есть несколько страниц и мы в режиме выбора
        if (totalPages > 1 && inSelectionMode) {
          // Подсказка для навигации
          const indicator = `\n\x1b[36mPage ${
            pageIndex + 1
          }/${totalPages} ←/→ to navigate, Complete: ⇥, Submit: ↵ \x1b[0m\n`;
          Deno.stdout.writeSync(encoder.encode(indicator));
        } else {
          // Базовая подсказка
          Deno.stdout.writeSync(
            encoder.encode("\n\x1b[36mComplete: ⇥, Submit: ↵ \x1b[0m\n"),
          );
        }
      }

      // Возвращаем курсор в позицию после ввода
      Deno.stdout.writeSync(
        encoder.encode(
          `\x1b[u\x1b[${searchPrompt.length + 1 + query.length}C`,
        ),
      );
    }

    // Обработка специальных клавиш (стрелки)
    function handleKeySequence(keySeq: string) {
      if (!inSelectionMode) return;

      switch (keySeq) {
        case "\x1b[A": // Стрелка вверх
          if (results.length > 0) {
            selectedIndex = selectedIndex <= 0
              ? results.length - 1
              : selectedIndex - 1;
            pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          }
          break;
        case "\x1b[B": // Стрелка вниз
          if (results.length > 0) {
            selectedIndex = selectedIndex >= results.length - 1
              ? 0
              : selectedIndex + 1;
            pageIndex = Math.floor(selectedIndex / PAGE_SIZE);
          }
          break;
        case "\x1b[D": // Стрелка влево (предыдущая страница)
          if (pageIndex > 0) {
            pageIndex--;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
        case "\x1b[C": // Стрелка вправо (следующая страница)
          const totalPages = Math.ceil(results.length / PAGE_SIZE);
          if (pageIndex < totalPages - 1) {
            pageIndex++;
            selectedIndex = pageIndex * PAGE_SIZE;
          }
          break;
      }
    }

    // Инициализация: обновляем результаты и отображение
    updateResults();
    updateDisplay();

    // Буфер для чтения ввода
    const buf = new Uint8Array(8);
    let buffer = "";

    // Основной цикл ввода
    while (true) {
      const n = Deno.stdin.readSync(buf);
      if (n === null) break;

      // Декодируем ввод
      const key = decoder.decode(buf.subarray(0, n));
      buffer += key;

      // Если началась escape-последовательность, ждем ее завершения
      if (buffer.startsWith("\x1b") && buffer.length < 3) {
        continue;
      }

      // Обрабатываем escape-последовательность (стрелки)
      if (buffer.length >= 3 && buffer.startsWith("\x1b")) {
        handleKeySequence(buffer.slice(0, 3));
        buffer = buffer.slice(3);
        updateDisplay();
        continue;
      }

      // Обрабатываем каждый символ в буфере
      for (const char of buffer) {
        switch (char) {
          case "\x03": // Ctrl+C - выход
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\n"));
            Deno.exit();
            break;
          case "\x15": // Ctrl+U - очистка ввода
            query = "";
            selectedIndex = -1;
            inSelectionMode = false;
            break;
          case "\x7f": // Backspace - удаление символа
            query = query.slice(0, -1);
            selectedIndex = -1;
            updateResults();
            break;
          case "\t": // Tab - автодополнение
            const suggestion = getAutocompleteSuggestion(query);
            if (suggestion) {
              // Если есть автодополнение, добавляем его
              query += suggestion;
              selectedIndex = -1;
              updateResults();
            } else if (results.length === 1) {
              // Если только один результат, выбираем его
              query = results[0];
              selectedIndex = -1;
              updateResults();
            }
            break;
          case "\r": // Enter - подтверждение выбора
            if (inSelectionMode && selectedIndex >= 0) {
              // Если в режиме выбора и что-то выбрано
              query = results[selectedIndex];
              selectedIndex = -1;
              inSelectionMode = false;
            } else if (results.length === 1) {
              // Если только один результат
              query = results[0];
            }
            // Выходим из сырого режима и завершаем
            Deno.stdin.setRaw(false);
            Deno.stdout.writeSync(encoder.encode("\n"));
            resolve(query);
            return;
          default:
            // Обычные печатные символы
            if (char >= " " && char <= "~") {
              query += char;
              selectedIndex = -1;
            }
            break;
        }
      }

      // Очищаем буфер и обновляем интерфейс
      buffer = "";
      updateResults();
      updateDisplay();
    }
  });
}

// Вспомогательная функция для очистки экрана от текущей позиции курсора
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
  // Пример использования с кастомным промптом
  console.log(
    "You selected:",
    await autocompleteInput(fruits, {
      searchPrompt: "Выберите фрукт:",
    }),
  );

  console.log(
    "You selected:",
    await autocompleteInput(fruits, {
      searchPrompt: "Выберите фрукт:",
    }),
  );

  // Пример использования с промптом по умолчанию
  // const selectedFruit = await autocompleteInput(fruits);
  // console.log("You selected:", selectedFruit);
}

if (import.meta.main) {
  main();
}
