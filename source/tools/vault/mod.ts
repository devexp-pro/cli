// source/tools/vault/mod.ts

import { Command } from "@cliffy/command";
import projectCommand from "./commands/main/project.ts";
import envCommand from "./commands/main/env.ts";
import secretCommand from "./commands/main/secret.ts";
import runCommand from "./commands/run_command.ts"; 
// import integrationCommand from "./commands/main/integration.ts";

const tool = new Command();

tool
  .action((_options: any, ..._args: any) => {
    tool.showHelp();
    Deno.exit();
  })
  .description("Centralized secrets management")
  .command("project", projectCommand)
  .command("env", envCommand)
  .command("secret", secretCommand)
  // .command("integration", integrationCommand)
  .command("run", runCommand); 

export default tool;
