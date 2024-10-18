import { Command } from "@cliffy/command";
import projectCommand from "./commands/project.ts";
import envCommand from "./commands/env.ts";
import secretCommand from "./commands/secret.ts";
import inviteCommand from "./commands/invite.ts"; // Импортируем команду инвайта

const vault = new Command()
  .action((_options: any, ..._args: any) => {
    vault.showHelp();
    Deno.exit();
  })
  .description("Инструмент для работы с проектами, окружениями и секретами")
  .command("project", projectCommand)
  .command("env", envCommand)
  .command("secret", secretCommand)
  .command("invite", inviteCommand); // Добавляем новый модуль инвайтов

export default vault;
