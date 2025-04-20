import { move } from "@std/fs";
import {
  cleanPage,
  cleanWriteln,
  clearChar,
  clearLine,
  clearScreen,
  clearScreenHard,
  disable,
  enable,
  getCursorPosition,
  hideCursor,
  moveCursor,
  readKeys,
  write,
  writeln,
} from "./tui.ts";
import { colors } from "@std/colors";

enable();

const pos = await getCursorPosition();
await moveCursor(pos.col, pos.row - 1);
await clearLine();

let inputLine = "";

await hideCursor();

const draw = async () => {
  const size = Deno.consoleSize();

  await moveCursor(0, 0);
  await clearLine();

  await cleanWriteln(
    `${size.columns}x${size.rows} [${inputLine.length}] ${
      colors.rgb24("Dev", 0xFFA500)
    }${colors.magenta("Exp")}${colors.yellow("$")} ${inputLine}█`,
  );

  await cleanWriteln(
    `${colors.red("¿?")} ${colors.bgBlue("Show help for some tool ")}`,
  );

  for (let i = 0; i < 10; i++) {
    await cleanWriteln(
      `   - строка ${i} ${Math.random()}`,
    );
  }
};

const main = async () => {
  cleanPage();

  await draw();

  for await (const key of readKeys()) {
    if (key.ctrl && key.name === "c") {
      disable();
      break;
    }

    if (key.name === "backspace") {
      if (inputLine.length > 0) {
        inputLine = inputLine.slice(0, -1);
        await draw();
      }
    } else if (key.name === "u" && key.ctrl) {
      if (inputLine.length > 0) {
        inputLine = "";
        await draw();
      }
    } else {
      if (key.type === "char" && key.ctrl === false) {
        inputLine += key.name;
        await draw();
      }
    }
  }
};

await main();
