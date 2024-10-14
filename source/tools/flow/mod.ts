import { Command } from "@cliffy/command";

const tool = new Command()
  .name("flow")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("flow description");

export default tool;
