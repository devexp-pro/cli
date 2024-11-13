// deno-lint-ignore-file
import { Command } from "@cliffy/command";
import {
  createEnvCommand,
  deleteEnvCommand,
  promptAndLoadEnvFile,
  renameEnvCommand,
  selectEnvCommand,
} from "../env_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { green, Input, red } from "../../deps.ts";
import { displayCurrentProjectInfo } from "../project_commands.ts";
import { syncProjects, createClient, getFullConfigKV, getCurrentConfig } from "../../api.ts";


const envMenu = async () => {
  await syncProjects();

  const action = await Select.prompt({
    message: "Что вы хотите сделать с окружениями?",
    options: [
      { name: "Создать окружение", value: "create" },
      { name: "Выбрать окружение", value: "select" },
      { name: "Переименовать окружение", value: "rename" },
      { name: "Удалить окружение", value: "delete" },
      { name: "Загрузить переменные из файла", value: "loadEnvFile" }, 
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
      await renameEnvCommand().parse([]);
      break;
    case "delete":
      await displayCurrentProjectInfo();
      await deleteEnvCommand().parse([]);
      break;
    case "loadEnvFile":
      await promptAndLoadEnvFile();
      break;
  }
};




const envCommand = new Command()
  .description("Управление окружениями")
  .action(envMenu);

export default envCommand;
