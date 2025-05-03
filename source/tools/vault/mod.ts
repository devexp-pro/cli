// source/tools/vault/mod.ts

import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import runCommand from "./commands/run_commands.ts";
import { addMAN } from "$/helpers";
import projectCommand from "./commands/project_commands.ts";
import envCommand from "./commands/env_commands.ts";
import secretCommand from "./commands/secret_commands.ts";
import inviteCommand from "./commands/invite_commands.ts";
import integrationCommand from "./commands/integration.ts";

const spotlight: any[] = [];

const tool = new Command();
if (config.data.tools.vault.hidden) tool.hidden();

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
  .command("integration", integrationCommand)
  .command("run", runCommand);

addMAN(tool);

spotlight.push({
  tag: "cmd",
  name: "vault help",
  stringForSearch: "vault help",
  description: "Show help for vault tool",
  handler: async () => {
    tool.showHelp();
    Deno.exit();
  },
});

export default {
  spotlight,
  tool,
};
