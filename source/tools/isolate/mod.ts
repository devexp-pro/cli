import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import hev from "@devexp/hev";

const add = new Command()
  .name("add")
  .usage("<text...>")
  .description("")
  .arguments("<path_to_script:string> <slug:string>")
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
    hev.init();
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
