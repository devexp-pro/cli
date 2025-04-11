import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const tool = new Command();
if (config.data.tools.alias.hidden) tool.hidden();
tool
  .name("alias")
  .arguments("")
  .description("Alias manager")
  .action(async (options: any, ...args: any) => {
    tool.showHelp();

    const [service_name, request] = args;

    Deno.exit();
  });

export default {
  tool,
};
