import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";

const add = new Command()
  .name("add")
  .usage("<text...>")
  .description("")
  .arguments("[text...]")
  .option("-s, --show", "show stored data")
  .action(async (options: any, ...args: any) => {
    Deno.exit();
  });

const remove = new Command()
  .name("remove")
  .usage("")
  .description("")
  .option("-s, --show", "show loaded data")
  .action(async (options: any) => {
    Deno.exit();
  });

const list = new Command()
  .name("list")
  .usage("")
  .description("")
  .option("-s, --show", "show loaded data")
  .action(async (options: any) => {
    Deno.exit();
  });

const serve = new Command()
  .name("serve")
  .usage("")
  .description("")
  .option("-s, --show", "show loaded data")
  .action(async (options: any) => {
    Deno.exit();
  });

const tool = new Command();
if (config.data.tools.isolate.hidden) tool.hidden();
tool
  .name("isolate")
  .usage("")
  .description("")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .command("add", add)
  .command("remove", remove)
  .command("list", list)
  .command("serve", serve);

// addMAN(tool);

export default {
  tool,
};
