import { Command } from "@cliffy/command";
import list from "./commands/list.ts";
import remove from "./commands/remove.ts";
import set from "./commands/set.ts";
import start from "./commands/start.ts";
import {
  Checkbox,
  Confirm,
  Input,
  List,
  Number,
  prompt,
  Select,
} from "@cliffy/prompt";

// https://www.asciiart.eu/text-to-ascii-art font Pagga
const tool = new Command()
  .name("tunnel")
  .usage("start <tunnel_name>")
  .action(async (options: any, ..._args: any) => {
    const command: string = await Select.prompt({
      message: "select command",
      options: [
        { name: "set tunnel alias", value: "set" },
        { name: "start tunnel", value: "start" },
        { name: "remove tunnel alias", value: "remove" },
        { name: "show list of tunnels", value: "list" },
        { name: "help", value: "help" },
      ],
    });

    switch (command) {
      case "start":
        await start.action();
        break;
      case "set":
        await set.action();
        break;
      case "remove":
        await remove.action();
        break;
      case "list":
        await list.action();
        break;
      case "help":
        tool.showHelp();
        break;
    }
  })
  .description("HTTP tunnels for development and public access")
  .command("set", set.command)
  .command("start", start.command)
  .command("remove", remove.command)
  .command("list", list.command);

export default tool;
