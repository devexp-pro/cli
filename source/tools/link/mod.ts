import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const tool = new Command();
if (config.data.tools.link.hidden) tool.hidden();
tool
  .name("link")
  .alias("lk")
  .arguments("")
  .description("Quickly open a link in the browser")
  .action(async (options: any, ...args: any) => {
    tool.showHelp();
    Deno.exit();
  });

export default {
  tool,
};
