import { colors } from "@std/colors";
import { introText, logo, REMOTE_VERSION, VERSION } from "$/constants";
import tunnel from "$/tools/tunnel";
import { upgrade } from "./upgrade.ts";
import { Command } from "@cliffy/command";

export const entry = new Command()
  .name("dx")
  .usage("usage late init...")
  .description("description late init...")
  .action((_options, ..._args) => {
    console.log(colors.rgb24(logo, 0xFFA500));
    console.log(introText);

    // if (REMOTE_VERSION !== VERSION) {
    //   upgrade.showHelp();
    //   Deno.exit();
    // }

    entry.showHelp();
    Deno.exit();
  })
  .command("tunnel", tunnel)
  .command("upgrade", upgrade);
