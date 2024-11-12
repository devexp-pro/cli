import { Command } from "@cliffy/command";
import { config } from "$/constants";
import create from "./commands/create.ts";
import edit from "./commands/edit.ts";
import list from "./commands/list.ts";

const tool = new Command()
if (config.data.tools?.alias?.hidden) tool.hidden();
tool.name("alias")
  .usage("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("storage for commands with descriptions");

tool.command("create", create.command);
tool.command("edit", edit.command);
tool.command("list", list.command);

export default tool;
