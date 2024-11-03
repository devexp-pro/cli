import { colors } from "@std/colors";
import { Command } from "@cliffy/command";

import {
  introText,
  IS_DEVELOP,
  logo,
  REMOTE_VERSION,
  VERSION,
} from "$/constants";

import toolLlm from "$/tools/llm";
import toolTunnel from "$/tools/tunnel";
import toolConfig from "$/tools/config";
import toolVault from "$/tools/vault";
import toolGit from "$/tools/git";
import toolFlow from "$/tools/flow";
import toolHyper from "$/tools/hyper";
import toolTemplate from "$/tools/template";
import toolAlias from "$/tools/alias";
import toolTerm from "$/tools/term";
import toolRadio from "$/tools/radio";
import toolClip from "$/tools/clip";

import { upgrade } from "./upgrade.ts";
import { dash } from "./dash.ts";
import { login } from "./setup/login.ts";
import { logout } from "./setup/logout.ts";
import { setup } from "./setup/setup.ts";
import { intro } from "./intro.ts";

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
  // .command("llm", toolLlm)
  .command("tunnel", toolTunnel)
  .command("config", toolConfig)
  .command("vault", toolVault)
  .command("flow", toolFlow.tool)
  // .command("template", toolTemplate)
  // .command("alias", toolAlias)
  // .command("hyper", toolHyper)
  .command("git", toolGit)
  // .command("term", toolTerm)
  // .command("radio", toolRadio)
  .command("clip", toolClip)
  .command("dash", dash)
  .command("login", login)
  .command("logout", logout)
  // .command("setup", setup)
  .command("intro", intro)
  .command("upgrade", upgrade);
