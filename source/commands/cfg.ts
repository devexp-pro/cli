import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import * as constants from "$/constants";
import * as version from "$/constants";

export const cfg = new Command()
  .name("cfg")
  .description("show config")
  .hidden()
  .action(async () => {
    console.log("--------------------------------");
    console.log(JSON.stringify(config, null, 2));
    console.log("--------------------------------");
    console.log(JSON.stringify(constants, null, 2));
    console.log(JSON.stringify(version, null, 2));
    console.log(JSON.stringify(import.meta, null, 2));
    console.log("--------------------------------");
    Deno.exit();
  });
