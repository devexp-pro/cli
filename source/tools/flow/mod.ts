import { Command } from "@cliffy/command";
import create from "./commands/create.ts";
import run from "./commands/run.ts";
import init from "./commands/init.ts";
import { Select } from "@cliffy/prompt/select";
import { config } from "$/constants";

const tool = new Command();
if (config.data.tools.flow.hidden) tool.hidden();

tool
  .name("flow")
  .usage("")
  .description("quickly create and run automation scripts")
  .action(async () => {
    const command: string = await Select.prompt({
      message: "Please, select action:",
      options: [
        { name: "create", value: "create" },
        { name: "run", value: "run" },
        // { name: "init", value: "init" },
        { name: "help", value: "help" },
      ],
    });

    switch (command) {
      case "create":
        create.action();
        break;
      case "run":
        run.action({
          path: "",
        }, true);
        break;
      case "init":
        init.action();
        break;
      case "help":
        tool.showHelp();
        Deno.exit();
        break;
    }
  })
  .command("create", create.command)
  .command("run", run.command)
  .command("init", init.command);

export default tool;
