import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const spotlight = [];

const tool = new Command();
if (config.data.tools.db.hidden) tool.hidden();
tool
  .name("term")
  .arguments("")
  .description("Web terminal for remote access (unsafe)")
  .action(async (options: any, ...args: any) => {
    tool.showHelp();

    Deno.exit();
  });

spotlight.push({
  tag: "cmd",
  name: "term help",
  stringForSearch: "term help",
  description: "Show help for term tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
};
