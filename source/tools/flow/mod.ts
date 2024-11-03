import { Command } from "@cliffy/command";
import create from "./commands/create.ts";
import run from "./commands/run.ts";
import init from "./commands/init.ts";
import { Select } from "@cliffy/prompt/select";
import { config } from "$/constants";

const tool = new Command();
if (config.data.tools.flow.hidden) tool.hidden();

const action = async () => {
  const command: string = await Select.prompt({
    message: "Please, select action:",
    options: [
      { name: "create script", value: "create" },
      { name: "run script(s)", value: "run" },
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
};

tool
  .name("flow")
  .usage("")
  .description("quickly create and run automation scripts")
  .action(action)
  .command("create", create.command)
  .command("run", run.command)
  .command("init", init.command);

export default {
  tool,
  action,
};
