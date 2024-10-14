import { Command } from "@cliffy/command";
import { list } from "./commands/list.ts";
import { remove } from "./commands/remove.ts";
import { set } from "./commands/set.ts";
import { start } from "./commands/start.ts";

// https://www.asciiart.eu/text-to-ascii-art font Pagga
const tool = new Command()
  .name("tunnel")
  .usage("start <tunnel_name>")
  .action(() => {
    tool.showHelp();
    Deno.exit();
  })
  .description("HTTP tunnels for development and sharing")
  .command("set", set)
  .command("start", start)
  .command("remove", remove)
  .command("list", list);

export default tool;
