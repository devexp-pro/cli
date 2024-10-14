import { Command } from "@cliffy/command";

const tool = new Command()
  .name("template")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("creating projects using flexible templates");

export default tool;
