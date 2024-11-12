// source/tools/vault/commands/main/secret.ts

// deno-lint-ignore-file no-case-declarations
import { Command } from "@cliffy/command";
import {
  addSecretCommand,
  deleteSecretCommand,
  fetchSecretsCommand,
  updateSecretCommand,
} from "../secret_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";
import { syncProjects } from "../../api.ts";

const secretMenu = async () => {
  await syncProjects();

  const action = await Select.prompt({
    message: "Что вы хотите сделать с секретами?",
    options: [
      { name: "Добавить секрет", value: "add" },
      { name: "Обновить секрет", value: "update" },
      { name: "Удалить секрет", value: "delete" },
      { name: "Посмотреть секреты", value: "fetch" },
    ],
  });

  switch (action) {
    case "add":
      const key = await Input.prompt("Введите ключ секрета:");
      const value = await Input.prompt("Введите значение секрета:");
      await addSecretCommand().parse([key, value]);
      break;
    case "update":
      await updateSecretCommand().parse([]);
      break;
    case "delete":
      await deleteSecretCommand().parse([]);
      break;
    case "fetch":
      await fetchSecretsCommand().parse([]);
      break;
  }
};

const secretCommand = new Command()
  .description("Управление секретами")
  .action(secretMenu);

export default secretCommand;
