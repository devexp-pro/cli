import { Command } from "@cliffy/command";
import projectCommand from "./commands/main/project.ts";
import envCommand from "./commands/main/env.ts";
import secretCommand from "./commands/main/secret.ts";
import inviteCommand from "./commands/main/invite.ts"; // Импортируем команду инвайта
import runCommand from "./commands/main/run.ts";
import { config } from "$/constants";
import { config } from "$/constants";

const tool = new Command();
if (config.data.tools.vault.hidden) tool.hidden();
tool
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
// .command("secret", secretCommand)
// .command("invite", inviteCommand)
// .command("run", runCommand);

export default tool;
export default tool;
