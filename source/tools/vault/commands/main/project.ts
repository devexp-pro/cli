// source/tools/vault/commands/main/project.ts

// deno-lint-ignore-file no-case-declarations no-fallthrough
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
      Deno.exit()
    case "create":
      const projectName = await Input.prompt("Введите имя проекта:");
      await createProjectCommand().parse([projectName]);
      break;
    case "select":
      await displayCurrentProjectInfo();
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
  .description("Управление проектами")
  .action(projectMenu);

export default projectCommand;
