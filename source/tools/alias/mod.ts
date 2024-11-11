import { Command } from "@cliffy/command";
import { config } from "$/constants";

const tool = new Command()
if (config.data.tools?.alias?.hidden) tool.hidden();
  tool.name("alias")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("storage for commands with descriptions");

export default tool;
