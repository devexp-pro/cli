import { Command } from "@cliffy/command";
import dashboard from "./gui.ts";
import { config } from "$/providers/config.ts";

export const dash = new Command()
  .name("dash")
  .description("graphical dashboard for working with some utilities")
  .action(async (_options: any, ..._args: any) => {
    dashboard.start();
  });

if (config.data.commands.dash.hidden) dash.hidden();
