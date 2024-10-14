import { Command } from "@cliffy/command";
import dashboard from "$/dashboard";

export const dash = new Command()
  .description("graphical dashboard for working with some utilities")
  .action(async (_options: any, ..._args: any) => {
    dashboard.start();
  });
