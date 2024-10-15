import { Command } from "@cliffy/command";

const tool = new Command()
  .name("term")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("share a terminal session");

export default tool;
