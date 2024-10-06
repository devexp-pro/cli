import {
  ENTRYPOINT_SOURCE_URL,
  IMPORT_MAP_URL,
  REMOTE_VERSION,
  VERSION,
} from "$/constants";
import { shelly } from "@vseplet/shelly";
import { Command } from "@cliffy/command";

export const upgrade = new Command()
  .description("upgrade subcommand description")
  .action(async (_options, ..._args) => {
    if (REMOTE_VERSION != VERSION) {
      const res = await shelly([
        "deno",
        "install",
        "-r",
        "-f",
        "-g",
        "--allow-net",
        "--allow-run",
        "--allow-env",
        "--allow-read",
        "--unstable-kv",
        "--import-map=" + IMPORT_MAP_URL,
        "-n",
        "dx",
        ENTRYPOINT_SOURCE_URL,
      ]);
      console.log(res.stderr || res.stderr);
      Deno.exit(res.code);
    } else {
      console.log(`  The latest version is already installed!`);
    }
  });
