import { Command } from "@cliffy/command";

export const logout = new Command()
  .description("logout subcommand description")
  .action(async (_options: any, ..._args: any) => {
  });
