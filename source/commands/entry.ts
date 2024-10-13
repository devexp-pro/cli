import { colors } from "@std/colors";
import {
  introText,
  IS_DEVELOP,
  logo,
  REMOTE_VERSION,
  VERSION,
} from "$/constants";
import tunnel from "$/tools/tunnel";
import gitManager from "$/tools/git";
import vault from "$/tools/vault";
import { upgrade } from "./upgrade.ts";
import { Command } from "@cliffy/command";
import tuner from "../tools/config/mod.ts";
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
  .command("tunnel", tunnel)
  .command("git", gitManager)
  .command("vault", vault)
  .command("config", tuner)
  .command("dash", dash)
  .command("login", login)
  .command("logout", logout)
  .command("upgrade", upgrade);
