import { colors } from "@std/colors";
import {
  introText,
  IS_DEVELOP,
  logo,
  REMOTE_VERSION,
  VERSION,
} from "$/constants";
import tunnel from "$/tools/tunnel";
import git from "$/tools/git";
import vault from "$/tools/vault";
import { upgrade } from "./upgrade.ts";
import { Command } from "@cliffy/command";
import tuner from "../tools/config/mod.ts";

export const entry = new Command()
  .name("dx")
  .usage("usage late init...")
  .description("description late init...")
  .action((_options, ..._args) => {
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
  .command("vault", vault)
  .command("config", tuner)
  .command("git", git)
  .command("upgrade", upgrade);
