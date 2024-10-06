import { colors, Command } from "../../deps.ts";
import { list } from "./list.ts";
import { auth } from "./auth.ts";
import { remove } from "./remove.ts";
import { set } from "./set.ts";
import { start } from "./start.ts";
import { IS_DEVELOP, REMOTE_VERSION, VERSION } from "../constants.ts";
import { upgrade } from "./upgrade.ts";

// https://www.asciiart.eu/text-to-ascii-art font Pagga
const logoText = `
   ▄▄▄· ▄▄▄·      ▄▄▄  ▄▄▄▄▄
  ▐█ ▄█▐█ ▄█▪     ▀▄ █·•██
   ██▀· ██▀· ▄█▀▄ ▐▀▀▄  ▐█.▪
  ▐█▪·•▐█▪·•▐█▌.▐▌▐█•█▌ ▐█▌·
  .▀   .▀    ▀█▄▀▪.▀  ▀ ▀▀▀ `;

const introText = `
  Version ${colors.green(VERSION)}
  Crafted with ${colors.red("<3")} by Vsevolod Pletnev
  Use "pp -h" to get help on commands.
  ${IS_DEVELOP}
`;

export const entry = new Command()
  .name("pp")
  .usage("start <tunnel_name>")
  .description("Simple API gateway based on Deno")
  .action((_options, ..._args) => {
    console.log(colors.rgb24(logoText, 0xFFA500));
    console.log(introText);

    if (REMOTE_VERSION !== VERSION) {
      upgrade.showHelp();
      Deno.exit();
    }

    // entry.showHelp();
    Deno.exit();
  })
  .command("auth", auth)
  .command("set", set)
  .command("start", start)
  .command("remove", remove)
  .command("list", list)
  .command("upgrade", upgrade);
