import { Command } from "@cliffy/command";
import { config } from "$/constants";
import * as constants from "$/constants";

export const cfg = new Command()
  .name("cfg")
  .description("show config")
  .hidden()
  .action(async () => {
    // console.log(JSON.stringify(config, null, 2));
    console.log("--------------------------------");
    console.log(JSON.stringify(constants, null, 2));
    console.log("--------------------------------");
    Deno.exit();
  });
