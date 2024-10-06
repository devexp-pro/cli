import { Command } from "../../deps.ts";
import { remove } from "./remove.ts";
import { set } from "./set.ts";
import { start } from "./start.ts";

const introText = `
 _____  _____       ___  ___
|  _  ||  _  | ___ |   ||_  |
|   __||   __||___|| | | _| |_
|__|   |__|        |___||_____|


version 0.0.1
created by Vsevolod Pletnev with <3
`;

export const entry = new Command()
  .name("pportal")
  .version("0.1.0")
  .description("Command line framework for Deno")
  // .globalOption("-d, --debug", "Enable debug output.")
  .action((options, ...args) => {
    console.log(introText);
    console.log(`Not found tunnels`);
    Deno.exit();
  })
  .command("remove", remove)
  .command("setup", set)
  .command("start", start);
