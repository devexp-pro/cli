import { Command } from "@cliffy/command";

const tool = new Command()
  .name("pm")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("process manager description");

export default tool;
