import { Command } from "@cliffy/command";

const tool = new Command()
  .name("alias")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("alias description");

export default tool;
