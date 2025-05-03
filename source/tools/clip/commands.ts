import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import { addMAN } from "$/helpers";
import { loadAction, storeAction } from "./actions.ts";

const store = new Command()
  .name(storeAction.name)
  .usage("<text...>")
  .description(storeAction.description)
  .arguments("[text...]")
  .option("-s, --show", "show stored data")
  .action(storeAction.handler);

const load = new Command()
  .name(loadAction.name)
  .description(loadAction.description)
  .usage("")
  .option("-s, --show", "show loaded data")
  .action(loadAction.handler);

const toolCommand = new Command();
if (config.data.tools.clip.hidden) toolCommand.hidden();
toolCommand
  .name("clip")
  .usage("")
  .description("share text between devices using the cloud clipboard")
  .action(() => {
    toolCommand.showHelp();
    Deno.exit();
  })
  .command("store", store)
  .command("load", load);

addMAN(toolCommand);

export { toolCommand };
