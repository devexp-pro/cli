// parseKey.ts
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const writer = Deno.stdout.writable.getWriter();
const reader = Deno.stdin.readable.getReader();

export type KeyEvent = {
  name: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  raw: string;
  type: "control" | "char" | "escape" | "other";
};

export async function readKey(
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
): Promise<KeyEvent> {
  const { value, done } = await reader.read();
  if (done || !value) {
    return {
      name: "",
      ctrl: false,
      alt: false,
      shift: false,
      raw: "",
      type: "other",
    };
  }

  const raw = decoder.decode(value);

  if (value.length === 0) {
    return {
      name: "",
      ctrl: false,
      alt: false,
      shift: false,
      raw: "",
      type: "other",
    };
  }

  const code = value[0];

  if (value.length == 1) {
    // Обрабатываем Enter
    if (value[0] === 13 || value[0] === 10) {
      return {
        name: "enter",
        ctrl: false,
        alt: false,
        shift: false,
        raw,
        type: "control",
      };
    }
    if (code === 9) {
      return {
        name: "tab",
        ctrl: false,
        alt: false,
        shift: false,
        raw,
        type: "control",
      };
    }
    if (code === 127) {
      return {
        name: "backspace",
        ctrl: false,
        alt: false,
        shift: false,
        raw,
        type: "control",
      };
    }
    if (code === 27) {
      return {
        name: "escape",
        ctrl: false,
        alt: false,
        shift: false,
        raw,
        type: "control",
      };
    }
  }

  // Ctrl + key (ASCII < 32)
  if (code <= 0x1a && code > 0) {
    const name = String.fromCharCode(code + 96); // Ctrl+A → 1 → "a"
    return { name, ctrl: true, alt: false, shift: false, raw, type: "control" };
  }

  // Escape sequences
  if (raw === "\x1b[A") {
    return {
      name: "up",
      ctrl: false,
      alt: false,
      shift: false,
      raw,
      type: "escape",
    };
  }
  if (raw === "\x1b[B") {
    return {
      name: "down",
      ctrl: false,
      alt: false,
      shift: false,
      raw,
      type: "escape",
    };
  }
  if (raw === "\x1b[C") {
    return {
      name: "right",
      ctrl: false,
      alt: false,
      shift: false,
      raw,
      type: "escape",
    };
  }
  if (raw === "\x1b[D") {
    return {
      name: "left",
      ctrl: false,
      alt: false,
      shift: false,
      raw,
      type: "escape",
    };
  }

  // Printable characters
  const char = raw;
  return {
    name: char,
    ctrl: false,
    alt: false,
    shift: char !== char.toLowerCase(),
    raw,
    type: "char",
  };
}

export async function* readKeys() {
  Deno.stdin.setRaw(true);

  try {
    while (true) {
      const key = await readKey(reader);
      yield key;
    }
  } finally {
    // reader.releaseLock();
    Deno.stdin.setRaw(false);
  }
}

export const getCursorPosition = async (): Promise<
  { row: number; col: number }
> => {
  // const stdin = Deno.stdin.readable.getReader();

  // Включаем raw mode, чтобы получать сырые escape-последовательности
  // Deno.stdin.setRaw(true);

  // Отправляем ESC-цепочку, чтобы терминал вернул позицию курсора
  await writer.write(encoder.encode("\x1b[6n"));

  // Читаем ответ типа ESC[row;colR
  let response = "";
  while (!response.endsWith("R")) {
    const { value } = await reader.read();
    if (!value) break;
    response += decoder.decode(value);
  }

  // Пример ответа: \x1b[24;42R
  const match = /\[(\d+);(\d+)R/.exec(response);
  if (match) {
    const [, row, col] = match;
    // Deno.stdin.setRaw(false);
    // stdin.releaseLock();
    return { row: parseInt(row), col: parseInt(col) };
  }
  // Deno.stdin.setRaw(false);

  throw new Error("Не удалось определить позицию курсора");
};

export const moveCursor = async (x: number, y: number) => {
  const moveTo = `\x1b[${y};${x}H`;
  await Deno.stdout.write(encoder.encode(moveTo));
};

export const hideCursor = async () => {
  await writer.write(encoder.encode("\x1b[?25l"));
};

export const showCursor = async () => {
  await writer.write(encoder.encode("\x1b[?25h"));
};

export const clearLine = async () => {
  await writer.write(encoder.encode("\x1b[2K")); // стирание всей строки
};

export const clearChar = async () => {
  // Сдвиг курсора назад, затираем символ пробелом, и снова назад
  await writer.write(encoder.encode("\b \b"));
};

export const clearScreen = async () => {
  await writer.write(encoder.encode("\x1b[2J")); // стирание всего экрана
};

export const cleanPage = () => {
  const height = Deno.consoleSize().rows;
  console.log("\n".repeat(height));
  console.log(`\x1b[${height}A`);
};

export const clearScreenHard = async () => {
  await writer.write(encoder.encode("\x1b[2J\x1b[H"));
};

export const writeln = async (text: string) => {
  await writer.write(encoder.encode(text + "\n"));
};

export const cleanWriteln = async (text: string) => {
  await clearLine();
  await writer.write(encoder.encode(text + "\n"));
};

export const write = async (text: string) => {
  await writer.write(encoder.encode(text));
};

export const enable = () => {
  Deno.stdin.setRaw(true);
};

export const disable = async () => {
  await showCursor();
  Deno.stdin.setRaw(false);
  writer.releaseLock();
  reader.releaseLock();
};
