// deno-lint-ignore-file no-case-declarations
import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";
import {
  createProjectCommand,
  deleteProjectCommand,
  displayCurrentProjectInfo,
  renameProjectCommand,
  selectProjectCommand,
  syncProjects,
} from "../project_commands.ts";


const projectMenu = async () => {

  await syncProjects();

  const action = await Select.prompt({
    message: "Что вы хотите сделать с проектами?",
    options: [
      { name: "Посмотреть текущий проект", value: "view" },
      { name: "Создать проект", value: "create" },
      { name: "Выбрать проект", value: "select" },
      { name: "Переименовать проект", value: "rename" },
      { name: "Удалить проект", value: "delete" },
    ],
  });

  switch (action) {
    case "view":
      await displayCurrentProjectInfo();
      break;
    case "create":
      const projectName = await Input.prompt("Введите имя проекта:");
      await createProjectCommand().parse([projectName]);
      break;
    case "select":
      await displayCurrentProjectInfo();
      await selectProjectCommand().parse([]);
      break;
    case "rename":
      await displayCurrentProjectInfo();
      const newName = await Input.prompt("Введите новое имя проекта:");
      await renameProjectCommand().parse([newName]);
      break;
    case "delete":
      await displayCurrentProjectInfo();
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
