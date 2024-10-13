import { colors } from "@std/colors";
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
import toolWorkflow from "$/tools/workflow";
import toolMind from "$/tools/mind";
import { upgrade } from "./upgrade.ts";
import { Command } from "@cliffy/command";
import { dash } from "./dash.ts";
import { login } from "./login.ts";
import { logout } from "./logout.ts";

export const entry = new Command()
  .name("dx")
  .usage("usage late init...")
  .description("description late init...")
  .action((_options: any, ..._args: any) => {
    console.log(colors.rgb24(logo, 0xFFA500));
    console.log(introText);

    if (REMOTE_VERSION !== VERSION && !IS_DEVELOP) {
      upgrade.showHelp();
      Deno.exit();
    }

    entry.showHelp();
    Deno.exit();
  })
  .command("tunnel", toolTunnel)
  .command("config", toolConfig)
  .command("vault", toolVault)
  .command("git", toolGit)
  .command("workflow", toolWorkflow)
  .command("mind", toolMind)
  .command("dash", dash)
  .command("login", login)
  .command("logout", logout)
  .command("upgrade", upgrade);
