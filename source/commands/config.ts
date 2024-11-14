import { Command } from "@cliffy/command";
import { config } from "$/constants";

export const cfg = new Command()
  .name("cfg")
  .description("show config")
  .hidden()
  .action(async () => {
    console.log(JSON.stringify(config, null, 2));
    Deno.exit();
  });
