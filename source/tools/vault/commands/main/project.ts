// deno-lint-ignore-file
// source/tools/vault/commands/main/project.ts

import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";
import {
  createProjectCommand,
  deleteProjectCommand,
  displayCurrentProjectInfo,
  renameProjectCommand,
  selectProjectCommand,
} from "../project_commands.ts";
import { syncProjects } from "../../api.ts";

const projectMenu = async () => {
  await syncProjects();
  await displayCurrentProjectInfo();
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

      Deno.exit();
    case "create":
      const projectName = await Input.prompt("Введите имя проекта:");
      await createProjectCommand().parse([projectName]);
      break;
    case "select":

      await selectProjectCommand().parse([]);
      break;
    case "rename":
      await renameProjectCommand().parse([]);
      break;
    case "delete":
      await deleteProjectCommand().parse([]);
      break;
  }
};

const projectCommand = new Command()
.description("Управление проектами: создание, выбор, переименование, удаление проектов.")
.option("--action <action:string>", "Действие с проектом: 'create', 'select', 'rename' или 'delete'.")
.option("--project-name <projectName:string>", "Название проекта для создания, выбора или удаления.")
.option("--old-name <oldName:string>", "Старое имя проекта для переименования.")
.option("--new-name <newName:string>", "Новое имя проекта для переименования.")
.example("project --action=create --project-name=MyProject", "Создать проект с именем 'MyProject'")
.example("project --action=select --project-name=MyProject", "Выбрать проект 'MyProject'")
.example("project --action=rename --old-name=MyProject --new-name=NewProject", "Переименовать проект 'MyProject' в 'NewProject'")
.example("project --action=delete --project-name=OldProject", "Удалить проект с именем 'OldProject'")
.example("project", "Открыть меню для управления проектами")
  .action((options) => {
    if (options.action === "rename" && options.oldName && options.newName) {
      renameProjectCommand().parse(["--old-name", options.oldName, "--new-name", options.newName]);
    } else if (options.action === "delete" && options.projectName) {
      deleteProjectCommand().parse(["--project-name", options.projectName]);
    } else if (options.action === "create" && options.projectName) {
      createProjectCommand().parse([options.projectName]);
    } else if (options.action === "select" && options.projectName) {
      selectProjectCommand().parse(["--project-name", options.projectName]);
    } else {
      projectMenu();
    }
  });

export default projectCommand;
