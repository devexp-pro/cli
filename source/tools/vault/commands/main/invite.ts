import { Command } from "@cliffy/command";
import { inviteUserCommand } from "../secondary/invite_user.ts";
import { Input } from "../../deps.ts";

const inviteCommand = new Command()
  .description("Пригласить пользователя в проект.")
  .action(async () => {
    const username = await Input.prompt("Введите имя пользователя:");
    await inviteUserCommand(username).parse([]);
  });

export default inviteCommand;
