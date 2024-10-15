import { Command } from "@cliffy/command";

export const create = new Command()
  .name("create")
  .description("create subcommand description")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });
