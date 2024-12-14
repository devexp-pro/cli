// deno-lint-ignore-file no-fallthrough


import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";

import projectHandlers from "./handlers/project_handlers.ts";
import { getCurrentConfig, syncProjects } from "../api.ts";
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
  await syncProjects();

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
      await projectHandlers.viewCurrentProject();
      Deno.exit()
    case "create":
      await projectHandlers.interactiveCreateProject();
      Deno.exit()
    case "rename":
      await projectHandlers.interactiveRenameProject();
       Deno.exit();
    case "delete":
      await projectHandlers.interactiveDeleteProject();
       Deno.exit();
    case "select":
      await projectHandlers.interactiveSelectProject();
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

      if (!options.action) {

        await projectMenu();
      } else {

        switch (options.action) {
          case "view":
            await projectHandlers.viewCurrentProject();
            break;
          case "create":
            if (options.name) {
              await projectHandlers.createProject(options.name);
            } else {
              await projectHandlers.interactiveCreateProject();
            }
            break;
          case "rename":
            if (options.name && options.newName) {
              await projectHandlers.renameProjectByName(options.name, options.newName);
            } else {
              await projectHandlers.interactiveRenameProject();
            }
            break;
          case "delete":
            if (options.name) {
              await projectHandlers.deleteProjectByName(options.name);
            } else {
              await projectHandlers.interactiveDeleteProject();
            }
            break;
          case "select":
            if (options.name) {
              await projectHandlers.selectProjectByName(options.name);
            } else {
              await projectHandlers.interactiveSelectProject();
            }
            break;
          default:
            console.error("Invalid action. Use --help to see available options.");
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  });

  // try {
  //   console.log("\n--- Testing API chain ---");

  //   // Step 1: Create a new project
  //   console.log("\n[1] Creating a project...");
  //   const projectName = "TestProject";
  //   await syncProjects();
  //   await projectHandlers.createProject(projectName);

  //   // Step 2: View the current project
  //   console.log("\n[2] Viewing the current project...");
  //   await syncProjects();
  //   await projectHandlers.viewCurrentProject();

  //   // Step 3: Rename the project
  //   console.log("\n[3] Renaming the project...");
  //   const newProjectName = "RenamedProject";
  //   await syncProjects();
  //   await projectHandlers.renameProjectByName(projectName, newProjectName);

  //   // Step 4: Select the renamed project
  //   console.log("\n[4] Selecting the renamed project...");
  //   await syncProjects();
  //   await projectHandlers.selectProjectByName(newProjectName);

  //   // Step 5: Delete the renamed project
  //   console.log("\n[5] Deleting the renamed project...");
  //   await syncProjects();
  //   await projectHandlers.deleteProjectByName(newProjectName);

  //   console.log("\n--- API chain test completed successfully ---");
  // } catch (testError) {
  //   console.error("\n--- Error during API chain test ---");
  //   console.error((testError as Error).message);
  // }


export default projectCommand;
