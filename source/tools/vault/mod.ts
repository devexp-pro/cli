// source/tools/vault/mod.ts

import { Command } from "@cliffy/command";



import runCommand from "./commands/run_command.ts"; // Импорт команды run
import inviteCommand from "./commands/main/invite.ts";
import { addMAN } from "$/helpers";
import projectCommand from "./commands/project_commands.ts";
import envCommand from "./commands/env_commands.ts";
import secretCommand from "./commands/secret_commands.ts";

const tool = new Command();

tool
  .name("vault")
  .action((_options: any, ..._args: any) => {
    tool.showHelp();
    Deno.exit();
  })
  .description("Centralized secrets management")
  .command("project", projectCommand)
  .command("env", envCommand)
  .command("secret", secretCommand)
  .command("invite", inviteCommand)
  .command("run", runCommand);

addMAN(tool);

export default tool;
