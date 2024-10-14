import { Command } from "@cliffy/command";

const tool = new Command()
  .name("hyper")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("hypervisor for process management");

export default tool;
