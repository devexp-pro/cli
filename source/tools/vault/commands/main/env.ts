// source/tools/vault/commands/main/env.ts

// deno-lint-ignore-file
import { Command } from "@cliffy/command";
import {
  createEnvCommand,
  deleteEnvCommand,
  renameEnvCommand,
  selectEnvCommand,
} from "../env_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";
import { syncProjects } from "../../api.ts";

const envMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();

  const action = await Select.prompt({
    message: "Что вы хотите сделать с окружениями?",
    options: [
      { name: "Создать окружение", value: "create" },
      { name: "Выбрать окружение", value: "select" },
      { name: "Переименовать окружение", value: "rename" },
      { name: "Удалить окружение", value: "delete" },
    ],
  });

  switch (action) {
    case "create":
      const envName = await Input.prompt("Введите имя окружения:");
      await createEnvCommand().parse([envName]);
      break;
    case "select":
      await selectEnvCommand().parse([]);
      break;
    case "rename":
      await renameEnvCommand().parse([]);
      break;
    case "delete":
      await deleteEnvCommand().parse([]);
      break;
  }
};

const envCommand = new Command()
  .description(
    "Управление окружениями проекта: создание, выбор, переименование и удаление окружений.",
  )
  .option(
    "--action <action:string>",
    "Действие с окружением: 'create', 'select', 'rename' или 'delete'.",
  )
  .option(
    "--env-name <envName:string>",
    "Имя окружения для создания, выбора или удаления.",
  )
  .option(
    "--new-name <newName:string>",
    "Новое имя для переименования окружения.",
  )
  .example(
    "env --action=create --env-name=dev",
    "Создать окружение с именем 'dev'",
  )
  .example("env --action=select --env-name=prod", "Выбрать окружение 'prod'")
  .example(
    "env --action=rename --env-name=dev --new-name=prod",
    "Переименовать окружение 'dev' в 'prod'",
  )
  .example(
    "env --action=delete --env-name=prod",
    "Удалить окружение с именем 'prod'",
  )
  .example("env", "Открыть меню для управления окружениями")
  .action((options) => {
    if (options.action === "create" && options.envName) {
      createEnvCommand().parse([options.envName]);
    } else if (options.action === "select" && options.envName) {
      selectEnvCommand().parse(["--env-name", options.envName]);
    } else if (
      options.action === "rename" && options.envName && options.newName
    ) {
      renameEnvCommand().parse([
        "--old-name",
        options.envName,
        "--new-name",
        options.newName,
      ]);
    } else if (options.action === "delete" && options.envName) {
      deleteEnvCommand().parse(["--env-name", options.envName]);
    } else {
      envMenu();
    }
  });

export default envCommand;
