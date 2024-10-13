import { Command } from "@cliffy/command";
import dashboard from "$/dashboard";

export const dash = new Command()
  .description("gui subcommand description")
  .action(async (_options: any, ..._args: any) => {
    dashboard.start();
  });
