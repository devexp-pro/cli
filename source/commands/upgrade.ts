import { ENTRYPOINT_SOURCE_URL, REMOTE_VERSION, VERSION } from "$/constants";
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
        "--allow-net",
        "--allow-run",
        "--unstable-kv",
        "-n",
        "pp",
        ENTRYPOINT_SOURCE_URL,
      ]);
      console.log(res.stderr || res.stderr);
      Deno.exit(res.code);
    } else {
      console.log(`  The latest version is already installed!`);
    }
  });
