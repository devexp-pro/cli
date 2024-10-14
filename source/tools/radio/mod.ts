import { Command } from "@cliffy/command";

const tool = new Command()
  .name("radio")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("messaging, audio, video");

export default tool;
