import { Command } from "@cliffy/command";

const tool = new Command()
  .name("workflow")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("workflow description");

export default tool;
