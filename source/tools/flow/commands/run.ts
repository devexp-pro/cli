import { Command } from "@cliffy/command";

export const run = new Command()
  .name("run")
  .description("run subcommand description")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });
