import { config } from "$/constants";
import { Command } from "@cliffy/command";
import create from "./commands/create.ts";
import edit from "./commands/edit.ts";
import show from "./commands/show.ts";
import remove from "./commands/remove.ts";

const tool = new Command()
if (config.data.tools?.cheat?.hidden) tool.hidden();
tool.name("cheat")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("storage for commands with descriptions")
  .command("create", create.command)
  .command("edit", edit.command)
  .command("show", show.command)
  .command("remove", remove.command);

export default tool;
