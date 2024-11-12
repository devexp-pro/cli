import { Command } from "@cliffy/command";
import projectCommand from "./commands/main/project.ts";
import envCommand from "./commands/main/env.ts";

import { config } from "$/constants";
import secretCommand from "./commands/main/secret.ts";


const tool = new Command();
if (config.data.tools.vault.hidden) tool.hidden();



tool
  .action((_options: any, ..._args: any) => {
    tool.showHelp();
    tool.showHelp();
    Deno.exit();
  })
  .description("Centralized secrets management")
  .command("project", projectCommand)
.command("env", envCommand)
.command("secret", secretCommand)
// .command("invite", inviteCommand)
// .command("run", runCommand);


export default tool;
