// deno-lint-ignore-file no-fallthrough


import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";

import projectHandlers from "../handlers/project/project_handlers.ts";
import { getCurrentConfig, syncProjects } from "../config_sync.ts";
import { red, green } from "../deps.ts";


export async function displayCurrentProjectInfo() {
  const { currentConfig } = await getCurrentConfig();
  if (!currentConfig || !currentConfig.currentProjectName) {
    console.log(red("No project is currently selected."));
    return;
  }

  console.log(green(`Current project: ${currentConfig.currentProjectName}`));
  if (currentConfig.currentEnvName) {
    console.log(green(`Current environment: ${currentConfig.currentEnvName}`));
  } else {
    console.log(red("No environment is selected."));
  }
}

const projectMenu = async () => {

  const action = await Select.prompt({
    message: "What would you like to do with projects?",
    options: [
      { name: "View the current project", value: "view" },
      { name: "Create a new project", value: "create" },
      { name: "Rename a project", value: "rename" },
      { name: "Delete a project", value: "delete" },
      { name: "Select a project", value: "select" },
    ],
  });

  switch (action) {

    case "view":
      await projectHandlers.view.current();
      Deno.exit()
    case "create":
      await projectHandlers.create.interactive();
      Deno.exit()
    case "rename":
      await projectHandlers.rename.interactive();
       Deno.exit();
    case "delete":
      await projectHandlers.delete.interactive();
       Deno.exit();
    case "select":
      await projectHandlers.select.interactive();
       Deno.exit();
    default:
      console.error("Invalid action. Please try again.");
  }
};


const projectCommand = new Command()
  .description("Manage projects: create, select, rename, or delete.")
  .option("--action <action:string>", "Action: 'view', 'create', 'rename', 'delete', 'select'.")
  .option("--name <name:string>", "Name of the project for action.")
  .option("--new-name <newName:string>", "New name for renaming.")
  .example("project --action=view", "View the current project.")
  .example("project --action=create --name=MyProject", "Create a project named 'MyProject'.")
  .example(
    "project --action=rename --name=MyProject --new-name=NewProject",
    "Rename 'MyProject' to 'NewProject'."
  )
  .example("project --action=delete --name=MyProject", "Delete the project 'MyProject'.")
  .example("project --action=select --name=MyProject", "Select the project 'MyProject'.")
  .example("project", "Open the menu to manage projects.")
  .action(async (options) => {
    try {
      await syncProjects(); 
      await displayCurrentProjectInfo();
      if (!options.action) {

        await projectMenu();
      } else {

        switch (options.action) {
          case "view":
            await projectHandlers.view.current();
            Deno.exit();
          case "create":
            if (options.name) {
              await projectHandlers.create.byName(options.name);
            } else {
              await projectHandlers.create.interactive();
            }
            Deno.exit();
          case "rename":
            if (options.name && options.newName) {
              await projectHandlers.rename.byName(options.name, options.newName);
            } else {
              await projectHandlers.rename.interactive();
            }
            Deno.exit();
          case "delete":
            if (options.name) {
              await projectHandlers.delete.byName(options.name);
            } else {
              await projectHandlers.delete.interactive();
            }
            Deno.exit();
          case "select":
            if (options.name) {
              await projectHandlers.select.byName(options.name);
            } else {
              await projectHandlers.select.interactive();
            }
            Deno.exit();
          default:
            console.error("Invalid action. Use --help to see available options.");
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  });


export default projectCommand;
