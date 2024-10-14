import { Command } from "@cliffy/command";
import { create } from "./commands/create.ts";
import { run } from "./commands/run.ts";
import { init } from "./commands/init.ts";

const tool = new Command()
  .name("flow")
  .usage("")
  .description("quickly create and run automation scripts")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .command("create", create)
  .command("run", run)
  .command("init", init);

export default tool;
