import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const spotlight = [];

const tool = new Command();
if (config.data.tools.link.hidden) tool.hidden();
tool
  .name("link")
  .alias("lk")
  .arguments("")
  .description("Quickly open a link in the browser")
  .option("-h, --help", "Show help")
  .action(async (options: any, ...args: any) => {
    if (options.help) {
      // tool.showHelp();
    }

    Deno.exit();
  });

spotlight.push({
  tag: "cmd",
  name: "link help",
  stringForSearch: "link help",
  description: "Show help for link tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
};
