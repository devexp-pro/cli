import { Command } from "@cliffy/command";
import dashboard from "$/dashboard";
import { config } from "$/constants";

export const dash = new Command()
  .description("graphical dashboard for working with some utilities")
  .action(async (_options: any, ..._args: any) => {
    dashboard.start();
  });

if (config.data.commands.dash.hidden) dash.hidden();
