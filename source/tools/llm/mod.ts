import { Command } from "@cliffy/command";

const tool = new Command()
  .name("llm")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("access to various large language models");

export default tool;
