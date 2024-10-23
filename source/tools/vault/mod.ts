import { Command } from "@cliffy/command";
import projectCommand from "./commands/main/project.ts";
import envCommand from "./commands/main/env.ts";
import secretCommand from "./commands/main/secret.ts";
import inviteCommand from "./commands/main/invite.ts"; // Импортируем команду инвайта
import runCommand from "./commands/main/run.ts";

const vault = new Command()
  .action((_options: any, ..._args: any) => {
    vault.showHelp();
    Deno.exit();
  })
  .description("Инструмент для работы с проектами, окружениями и секретами")
  .command("project", projectCommand)
  .command("env", envCommand)
  .command("secret", secretCommand)
  .command("invite", inviteCommand)
  .command("run", runCommand);

export default vault;
