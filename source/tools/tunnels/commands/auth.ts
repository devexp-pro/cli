import { Command } from "../../deps.ts";

export const auth = new Command()
  .name("auth")
  .description("auth subcommand description (Not implemented)")
  .arguments("<auth_key:string>")
  .usage("<auth_key>")
  .action((options, ...args) => {
    console.log("Not implemented!");
    Deno.exit(-1);
  });
