import { Command } from "@cliffy/command";

import { colors } from "@std/colors";

// Tools
import toolIsolate from "$/tools/isolate";
import toolDB from "$/tools/db/mod.ts";
import toolTunnel from "$/tools/tunnel";
import toolVault from "$/tools/vault";
import toolGit from "$/tools/git";
import toolFlow from "$/tools/flow";
import toolClip from "$/tools/clip";
import toolTerm from "$/tools/term/mod.ts";
// Integrations
import integrations from "$/integrations/mod.ts";
// Just a commands
import { dash } from "$/commands/dash/mod.ts";
import { intro } from "$/commands/intro.ts";
import { setup } from "$/commands/setup/mod.ts";
import { cfg } from "$/commands/cfg.ts";

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

const entry = new Command()
  .name("dx")
  .usage("[command]")
  .description(
    "This is a powerful entry point for all developers, significantly\nimproving the developer experience",
  )
  .action((_options: any, ..._args: any) => {
    console.log(logo2);
    entry.showHelp();
    Deno.exit();
  })
  // tools
  .command(toolTunnel.tool.getName(), toolTunnel.tool)
  .command(toolVault.tool.getName(), toolVault.tool)
  .command(toolIsolate.tool.getName(), toolIsolate.tool)
  .command(toolDB.tool.getName(), toolDB.tool)
  .command(toolFlow.tool.getName(), toolFlow.tool)
  .command(toolGit.tool.getName(), toolGit.tool)
  .command(toolClip.tool.getName(), toolClip.tool)
  .command(toolTerm.tool.getName(), toolTerm.tool)
  // integrations
  .command(integrations.getName(), integrations)
  // commands
  .command("dash", dash)
  .command("intro", intro)
  .command("cfg", cfg)
  .command("setup", setup);

await entry.parse(Deno.args);
