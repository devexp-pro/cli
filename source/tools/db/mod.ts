import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const spotlight = [];

const tool = new Command();
if (config.data.tools.db.hidden) tool.hidden();
tool
  .name("db")
  .arguments("")
  .description("SQLite database manager and local server")
  .action(async (options: any, ...args: any) => {
    tool.showHelp();

    const [service_name, request] = args;

    Deno.exit();
  });

spotlight.push({
  tag: "cmd",
  name: "db help",
  stringForSearch: "db help",
  description: "Show help for db tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
};
