import { Command } from "@cliffy/command";

const tool = new Command()
  .name("mind")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("mind description");

export default tool;
