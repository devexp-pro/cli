import { Command } from "@cliffy/command";

export const setup = new Command()
  .description("setup subcommand description")
  .action(async (_options: any, ..._args: any) => {
  });
