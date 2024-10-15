import { Command } from "@cliffy/command";

const tool = new Command()
  .name("clip")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("share text between devices");

export default tool;
