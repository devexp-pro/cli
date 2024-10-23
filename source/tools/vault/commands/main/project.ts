import { Command } from "@cliffy/command";
import {
  createProjectCommand,
  deleteProjectCommand,
  renameProjectCommand,
  selectProjectCommand,
} from "../project_commands.ts";
import { Select } from "@cliffy/prompt/select";
import { Input } from "../../deps.ts";

// Главное меню для работы с проектами
const projectMenu = async () => {
  const action = await Select.prompt({
    message: "Что вы хотите сделать с проектами?",
    options: [
      { name: "Создать проект", value: "create" },
      { name: "Выбрать проект", value: "select" },
      { name: "Переименовать проект", value: "rename" },
      { name: "Удалить проект", value: "delete" },
    ],
  });

  switch (action) {
    case "create":
      const projectName = await Input.prompt("Введите имя проекта:");

      await createProjectCommand().parse([projectName]);
      break;
    case "select":
      await selectProjectCommand().parse([]);
      break;
    case "rename":
      const newName = await Input.prompt("Введите новое имя проекта:");
      await renameProjectCommand().parse([newName]);
      break;
    case "delete":
      const deleteName = await Input.prompt(
        "Введите имя проекта для удаления:",
      );
      await deleteProjectCommand().parse([deleteName]);
      break;
  }
};

const projectCommand = new Command()
  .description("Управление проектами")
  .action(projectMenu);

export default projectCommand;
