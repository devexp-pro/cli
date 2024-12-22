import { shelly } from "@vseplet/shelly";
import { Command } from "@cliffy/command";

export const upgrade = new Command()
  .description("Upgrade the DevExp CLI")
  .action(async (_options: any, ..._args: any) => {
    // if (REMOTE_VERSION != LOCAL_VERSION) {
    //   const res = await shelly([
    //     "deno",
    //     "install",
    //     "-r",
    //     "-f",
    //     "-g",
    //     "--allow-net",
    //     "--allow-run",
    //     "--allow-env",
    //     "--allow-read",
    //     "--allow-write",
    //     "--unstable-kv",
    //     "--unstable-broadcast-channel",
    //     "--allow-sys",
    //     "--import-map=" + IMPORT_MAP_URL,
    //     "-n",
    //     "dx",
    //     ENTRYPOINT_SOURCE_URL,
    //   ]);

    //   console.log(res.stderr || res.stderr);
    // Deno.exit(res.code);
    // } else {
    //   console.log(`  The latest version is already installed!`);
    //   Deno.exit(0);
    // }
  });
