import { Command } from "@cliffy/command";

const tool = new Command()
  .name("alias")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("storage for commands with descriptions");

export default tool;
