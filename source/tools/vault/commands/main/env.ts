// source/tools/vault/commands/main/env.ts

// deno-lint-ignore-file no-case-declarations
import { Command } from "@cliffy/command";
import {
  createEnvCommand,
  deleteEnvCommand,
  renameEnvCommand,
  selectEnvCommand,
} from "../env_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";
import { displayCurrentProjectInfo, syncProjects } from "../project_commands.ts";


const envMenu = async () => {

  await syncProjects();

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
      await displayCurrentProjectInfo();
      await selectEnvCommand().parse([]);
      break;
    case "rename":
      await displayCurrentProjectInfo();
      const newName = await Input.prompt("Введите новое имя окружения:");
      await renameEnvCommand().parse([newName]);
      break;
    case "delete":
      await displayCurrentProjectInfo();
      const deleteName = await Input.prompt(
        "Введите имя окружения для удаления:",
      );
      await deleteEnvCommand().parse([deleteName]);
      break;
  }
};

const envCommand = new Command()
  .description("Управление окружениями")
  .action(envMenu);

export default envCommand;
