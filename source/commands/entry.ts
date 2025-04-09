import { Command } from "@cliffy/command";

import { colors } from "@std/colors";

import tservices from "$/tools/tservices/mod.ts";
import toolIsolate from "$/tools/isolate";
import toolTunnel from "$/tools/tunnel";
import toolConfig from "$/tools/config";
import toolVault from "$/tools/vault";
import toolGit from "$/tools/git";
import toolFlow from "$/tools/flow";
import toolClip from "$/tools/clip";

import { dash } from "./dash/mod.ts";
import { intro } from "./intro.ts";
import { setup } from "./setup/mod.ts";
import { cfg } from "./cfg.ts";

export const logo = `
  ${colors.rgb24("██████╗ ███████╗██╗   ██╗", 0xFFA500)}${
  colors.magenta("███████╗██╗  ██╗██████╗")
}
  ${colors.rgb24("██╔══██╗██╔════╝██║   ██║", 0xFFA500)}${
  colors.magenta("██╔════╝╚██╗██╔╝██╔══██╗")
}
  ${colors.rgb24("██║  ██║█████╗  ██║   ██║", 0xFFA500)}${
  colors.magenta("█████╗   ╚███╔╝ ██████╔╝")
}
  ${colors.rgb24("██║  ██║██╔══╝  ╚██╗ ██╔╝", 0xFFA500)}${
  colors.magenta("██╔══╝   ██╔██╗ ██╔═══╝")
}
  ${colors.rgb24("██████╔╝███████╗ ╚████╔╝ ", 0xFFA500)}${
  colors.magenta("███████╗██╔╝ ██╗██║")
}
  ${colors.rgb24("╚═════╝ ╚══════╝  ╚═══╝  ", 0xFFA500)}${
  colors.magenta("╚══════╝╚═╝  ╚═╝╚═╝")
}`;

const r = colors.red;
const b = colors.blue;
const g = colors.green;
const y = colors.yellow;
const d = colors.reset;
export const logo2 = y(`
        ,~~.
   ,   (  - )${r(">")}    ${g("Crafted with")} ${r("<3")} ${
  b("https://devexp.pro")
}
   )\`~~'   (      ${g('Use "dx -h" to get help on commands.')}
  (  .__)   )
   \`-.____,'      ${colors.rgb24("Dev", 0xFFA500)}${colors.magenta("Exp")}
`);

export const introText = `  Crafted with ${colors.red("<3")} ${
  colors.blue("https://devexp.pro")
}
  Use "dx -h" to get help on commands.
`;

export const entry = new Command()
  .name("dx")
  .usage("[command]")
  .description(
    "This is a powerful entry point for all developers, significantly\nimproving the developer experience",
  )
  .action((_options: any, ..._args: any) => {
    console.log(logo2);
    // console.log(introText);
    entry.showHelp();
    Deno.exit();
  })
  // tools
  .command("isolate", toolIsolate.tool)
  .command("tunnel", toolTunnel)
  .command("config", toolConfig)
  .command("vault", toolVault)
  .command("flow", toolFlow.tool)
  .command("git", toolGit.tool)
  .command("clip", toolClip.tool)
  .command("tservices", tservices.tool)
  // commands
  .command("dash", dash)
  .command("intro", intro)
  .command("cfg", cfg)
  .command("setup", setup);
