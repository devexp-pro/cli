import { colors } from "@std/colors";
import { Command } from "@cliffy/command";

import {
  introText,
  IS_DEVELOP,
  logo,
  REMOTE_VERSION,
  VERSION,
} from "$/constants";

import toolTunnel from "$/tools/tunnel";
import toolConfig from "$/tools/config";
import toolVault from "$/tools/vault";
import toolGit from "$/tools/git";
import toolFlow from "$/tools/flow";
import toolAlias from "$/tools/alias";
import toolClip from "$/tools/clip";

import { dash } from "./dash.ts";
import { intro } from "./intro.ts";
import { setup } from "./setup/mod.ts";
import { upgrade } from "./setup/upgrade.ts";

export const entry = new Command()
  .name("dx")
  .usage("[command]")
  .description(
    "This is a powerful entry point for all developers, significantly improving the developer experience",
  )
  .action((_options: any, ..._args: any) => {
    console.log(logo);
    console.log(introText);

    if (REMOTE_VERSION !== VERSION && !IS_DEVELOP) {
      upgrade.showHelp();
      Deno.exit();
    }

    entry.showHelp();
    Deno.exit();
  })
  // tools
  .command("tunnel", toolTunnel)
  .command("config", toolConfig)
  .command("vault", toolVault)
  .command("flow", toolFlow.tool)
  .command("alias", toolAlias)
  .command("git", toolGit)
  .command("clip", toolClip)
  // commands
  .command("dash", dash)
  .command("intro", intro)
  .command("setup", setup);
