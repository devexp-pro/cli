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
  try {
    while (true) {
      const key = await readKey(reader);
      yield key;
    }
  } finally {
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

export const resetStyle = async () => {
  // Сброс всех атрибутов (цвета, стили текста и т.д.) к значениям по умолчанию
  await writer.write(encoder.encode("\x1b[0m"));
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

// text_buffer.ts
export class TextBuffer {
  private lines: string[] = [];
  private lastDrawnLines: string[] = [];
  private cursorY = 0;
  private lastTerminalRows = 0;
  private lastTerminalCols = 0;

  write(text: string) {
    const line = text;
    if (this.cursorY >= this.lines.length) {
      this.lines.push(line);
    } else {
      this.lines[this.cursorY] = line;
    }
  }

  writeln(text: string) {
    this.write(text);
    this.cursorY++;
  }

  clear() {
    this.lines = [];
    this.cursorY = 0;
  }

  // async draw(reverse: boolean = false) {
  //   const { columns: termCols, rows: termRows } = Deno.consoleSize();

  //   // Check if terminal size changed
  //   if (
  //     termRows !== this.lastTerminalRows || termCols !== this.lastTerminalCols
  //   ) {
  //     // Clear screen and reset attributes
  //     await clearScreen();
  //     await moveCursor(0, 0);
  //     await resetStyle();
  //     this.lastDrawnLines = [];
  //     this.lastTerminalRows = termRows;
  //     this.lastTerminalCols = termCols;
  //   }

  //   // Draw all visible lines
  //   for (let y = 0; y < termRows; y++) {
  //     const line = this.lines[y] ?? "";
  //     const clippedLine = line.slice(0, termCols).padEnd(termCols, " ");
  //     const last = this.lastDrawnLines[y] ?? "";

  //     if (clippedLine !== last) {
  //       // Ensure we're at the correct position for each line
  //       await moveCursor(0, y + 1);
  //       await write(`${clippedLine}`); // вот тут вывожу номер строки
  //       this.lastDrawnLines[y] = clippedLine;
  //     }
  //   }

  //   // Update the cached lines array size
  //   this.lastDrawnLines = this.lastDrawnLines.slice(0, termRows);
  // }
  async draw(reverse: boolean = false) {
    const { columns: termCols, rows: termRows } = Deno.consoleSize();

    // Check if terminal size changed
    if (
      termRows !== this.lastTerminalRows || termCols !== this.lastTerminalCols
    ) {
      // Clear screen and reset attributes
      await clearScreenHard();
      await moveCursor(0, 0);
      await resetStyle();
      this.lastDrawnLines = [];
      this.lastTerminalRows = termRows;
      this.lastTerminalCols = termCols;
    }

    // Prepare lines based on reverse parameter
    let linesToDraw: string[] = [];

    if (reverse) {
      // Create an array to hold our lines in display order
      linesToDraw = new Array(termRows).fill("");

      // Always place the first line of the buffer at the bottom of the screen
      if (this.lines.length > 0) {
        linesToDraw[termRows - 1] = this.lines[0];
      }

      // Fill remaining terminal rows from bottom to top with newer lines
      let screenPosition = termRows - 2; // Start one row above the bottom row

      // Start from the second line in the buffer (index 1)
      for (let i = 1; i < this.lines.length && screenPosition >= 0; i++) {
        linesToDraw[screenPosition] = this.lines[i];
        screenPosition--;
      }
    } else {
      // Normal order - just use the original lines
      linesToDraw = this.lines;
    }

    // Draw all visible lines
    for (let y = 0; y < termRows; y++) {
      const line = linesToDraw[y] ?? "";
      const clippedLine = clipLineToVisibleLength(line, termCols); // line.slice(0, termCols).padEnd(termCols, " ");
      const last = this.lastDrawnLines[y] ?? "";

      if (clippedLine !== last) {
        // Ensure we're at the correct position for each line
        await moveCursor(0, y + 1);
        await write(`${clippedLine}`);
        this.lastDrawnLines[y] = clippedLine;
      }
    }

    // Update the cached lines array size
    this.lastDrawnLines = this.lastDrawnLines.slice(0, termRows);
  }
}

function clipLineToVisibleLength(str: string, visibleLength: number): string {
  // Regex to match ANSI escape sequences
  const ansiRegex = /\x1B\[[0-9;]*[A-Za-z]/g;

  // Remove ANSI sequences to get the visible text
  const visibleText = str.replace(ansiRegex, "");

  // If visible text is already shorter than or equal to the desired length, return the original
  if (visibleText.length <= visibleLength) {
    return str.padEnd(str.length + (visibleLength - visibleText.length), " ");
  }

  // We need to clip the string to show only visibleLength characters
  let result = "";
  let visibleCount = 0;
  let i = 0;

  while (visibleCount < visibleLength && i < str.length) {
    // Check if current character is the start of an ANSI sequence
    const isAnsiSeq = str.slice(i).match(/^\x1B\[[0-9;]*[A-Za-z]/);

    if (isAnsiSeq) {
      // Add the entire ANSI sequence to result
      result += isAnsiSeq[0];
      i += isAnsiSeq[0].length;
    } else {
      // Add visible character
      result += str[i++];
      visibleCount++;
    }
  }

  // Extract all ANSI sequences from the remaining part of the string
  const remaining = str.slice(i);
  const ansiSequences = [];
  let match;

  // Reset the regex state
  ansiRegex.lastIndex = 0;

  // Collect all ANSI sequences from the remaining text
  while ((match = ansiRegex.exec(remaining)) !== null) {
    ansiSequences.push(match[0]);
  }

  // Add all ANSI reset sequences to preserve formatting
  result += ansiSequences.join("");

  // Add padding to fill the width
  const paddingLength = visibleLength - visibleCount;
  if (paddingLength > 0) {
    result += " ".repeat(paddingLength);
  }

  return result;
}

export class Spinner {
  private frames: string[];
  private index: number = 0;

  constructor(frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]) {
    this.frames = frames;
  }

  frame(offset: number = 0): string {
    const f = this.frames[this.index];
    this.index = (this.index + 1) % this.frames.length;
    return f;
  }

  reset() {
    this.index = 0;
  }
}

export class BlinkingCursor {
  private visible: boolean = true;
  private interval: number;
  private style: string;
  private timer: number | undefined;

  constructor(style = "_", interval = 500) {
    this.style = style;
    this.interval = interval;
    this.start();
  }

  getChar(): string {
    return this.visible ? this.style : " ";
  }

  start() {
    this.timer = setInterval(() => {
      this.visible = !this.visible;
    }, this.interval);
  }

  stop() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
    }
  }
}

export function hashStringToHue(str: string): number {
  let hash = 0;
  for (const char of str) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash) % 360;
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))),
    );

  return [f(0), f(8), f(4)];
}

export function nicknameToColorCode(nickname: string): number {
  const hue = hashStringToHue(nickname);
  const [r, g, b] = hslToRgb(hue, 70, 60);
  return (r << 16) | (g << 8) | b;
}

export function stripAnsiAndControlChars(text: string): string {
  return text
    // Удаляем ANSI escape-последовательности
    .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "")
    // Удаляем все управляющие символы: 0x00–0x1F и 0x7F (включая \n, \r, \t и т.д.)
    .replace(/[\x00-\x1F\x7F]/g, "");
}
