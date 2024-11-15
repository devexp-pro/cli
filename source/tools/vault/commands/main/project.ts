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
    message: "What would you like to do with projects?",
    options: [
      { name: "View the current project", value: "view" },
      { name: "Create a project", value: "create" },
      { name: "Select a project", value: "select" },
      { name: "Rename a project", value: "rename" },
      { name: "Delete a project", value: "delete" },
    ],
  });

  switch (action) {
    case "view":
      Deno.exit();
    case "create":
      const projectName = await Input.prompt("Enter the project name:");
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
  .description(
    "Manage projects: create, select, rename, or delete projects.",
  )
  .option(
    "--action <action:string>",
    "Project action: 'create', 'select', 'rename', or 'delete'.",
  )
  .option(
    "--project-name <projectName:string>",
    "Project name for creating, selecting, or deleting.",
  )
  .option(
    "--old-name <oldName:string>",
    "Old project name for renaming.",
  )
  .option(
    "--new-name <newName:string>",
    "New project name for renaming.",
  )
  .example(
    "project --action=create --project-name=MyProject",
    "Create a project with the name 'MyProject'",
  )
  .example(
    "project --action=select --project-name=MyProject",
    "Select the project 'MyProject'",
  )
  .example(
    "project --action=rename --old-name=MyProject --new-name=NewProject",
    "Rename the project 'MyProject' to 'NewProject'",
  )
  .example(
    "project --action=delete --project-name=OldProject",
    "Delete the project with the name 'OldProject'",
  )
  .example("project", "Open the menu to manage projects")
  .action((options) => {
    if (options.action === "rename" && options.oldName && options.newName) {
      renameProjectCommand().parse([
        "--old-name",
        options.oldName,
        "--new-name",
        options.newName,
      ]);
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
