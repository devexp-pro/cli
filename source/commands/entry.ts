import { Command } from "@cliffy/command";

// import { IS_DEVELOP, LOCAL_VERSION, REMOTE_VERSION } from "$/constants";

import { colors } from "@std/colors";

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
import { BASE_RESOURCE_PATH, GIT_BRANCH, MODE } from "$/providers/version.ts";

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
}

  https://devexp.pro`;

export const introText = `
  VERSION MODE: ${MODE}
  GIT_BRANCH: ${GIT_BRANCH}
  BASE_RESOURCE_PATH: ${BASE_RESOURCE_PATH}

  Crafted with ${colors.red("<3")} by DevExp
  Use "dx -h" to get help on commands.
`;

export const entry = new Command()
  .name("dx")
  .usage("[command]")
  .description(
    "This is a powerful entry point for all developers, significantly improving the developer experience",
  )
  .action((_options: any, ..._args: any) => {
    console.log(logo);
    console.log(introText);

    // if (REMOTE_VERSION !== LOCAL_VERSION && !IS_DEVELOP) {
    //   upgrade.showHelp();
    //   Deno.exit();
    // }

    entry.showHelp();
    Deno.exit();
  })
  // tools
  .command("tunnel", toolTunnel)
  .command("config", toolConfig)
  .command("vault", toolVault)
  .command("flow", toolFlow.tool)
  .command("git", toolGit.tool)
  .command("clip", toolClip.tool)
  // commands
  .command("dash", dash)
  .command("intro", intro)
  .command("cfg", cfg)
  .command("setup", setup);
