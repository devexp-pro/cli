import { Command } from "@cliffy/command";

export const login = new Command()
  .description("login subcommand description")
  .action(async (_options: any, ..._args: any) => {
  });
