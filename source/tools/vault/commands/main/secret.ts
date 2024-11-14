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
import { displayCurrentProjectInfo } from "../project_commands.ts";
import { loadEnvFileCommand } from "../env_commands.ts";

const secretMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const action = await Select.prompt({
    message: "Что вы хотите сделать с секретами?",
    options: [
      { name: "Добавить секрет", value: "add" },
      { name: "Обновить секрет", value: "update" },
      { name: "Удалить секрет", value: "delete" },
      { name: "Посмотреть секреты", value: "fetch" },
      { name: "Загрузить секреты из файла", value: "loadEnvFile" }, // Новый пункт меню
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
    case "loadEnvFile":
      await loadEnvFileCommand().parse([]);
      break;
  }
};

const secretCommand = new Command()
  .description(
    "Управление секретами: добавление, обновление, удаление, просмотр и загрузка секретов из файла.",
  )
  .option(
    "--action <action:string>",
    "Действие с секретом: 'add', 'update', 'delete', 'fetch' или 'loadEnvFile'.",
  )
  .option(
    "--key <key:string>",
    "Ключ секрета для добавления, обновления или удаления.",
  )
  .option(
    "--value <value:string>",
    "Значение для добавления или обновления секрета.",
  )
  .option("--file <filePath:string>", "Путь к файлу для загрузки секретов.")
  .option(
    "--env-name <envName:string>",
    "Имя окружения для загрузки секретов из файла.",
  ) // Дополнительный параметр
  .example(
    "secret --action=add --key=API_KEY --value=12345",
    "Добавить секрет с ключом 'API_KEY' и значением '12345'",
  )
  .example(
    "secret --action=update --key=API_KEY --value=67890",
    "Обновить значение секрета 'API_KEY' на '67890'",
  )
  .example(
    "secret --action=delete --key=API_KEY",
    "Удалить секрет с ключом 'API_KEY'",
  )
  .example(
    "secret --action=fetch",
    "Получить и отобразить все секреты для текущего окружения",
  )
  .example(
    "secret --action=loadEnvFile --file=config.env --env-name=prod",
    "Загрузить секреты из файла config.env в окружение 'prod'",
  )
  .example("secret", "Открыть меню для управления секретами")
  .action(async (options) => {
    await syncProjects();
    await displayCurrentProjectInfo();
    switch (options.action) {
      case "add":
        if (options.key && options.value) {
          addSecretCommand().parse([options.key, options.value]);
        } else {
          console.error("Для добавления секрета укажите --key и --value");
        }
        break;
      case "update":
        if (options.key && options.value) {
          updateSecretCommand().parse([
            "--key",
            options.key,
            "--value",
            options.value,
          ]);
        } else {
          updateSecretCommand().parse([]);
        }
        break;
      case "delete":
        if (options.key) {
          deleteSecretCommand().parse(["--key", options.key]);
        } else {
          deleteSecretCommand().parse([]);
        }
        break;
      case "fetch":
        fetchSecretsCommand().parse([]);
        break;
      case "loadEnvFile":
        const args = options.file ? ["--file", options.file] : [];
        if (options.envName) args.push("--env-name", options.envName);
        loadEnvFileCommand().parse(args);
        break;
      default:
        secretMenu();
    }
  });

export default secretCommand;
