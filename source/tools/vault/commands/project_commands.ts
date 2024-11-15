import {
  createClient,
  getCurrentConfig,
  getFullConfigKV,
  setCurrentConfigKV,
} from "../api.ts";
import { Command, green, Input, red } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";

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

export function createProjectCommand() {
  return new Command()
    .description("Create a new project.")
    .arguments("<projectName:string>")
    .action(async (_options: any, projectName: string) => {
      try {
        const client = await createClient();
        const response = await client.call("createProject", [projectName]);

        if (!response.success) {
          throw new Error(`Failed to create project: ${response.message}`);
        }

        await setCurrentConfigKV({
          currentProjectName: response.project!.name,
          currentProjectUUID: response.project!.uuid,
          currentEnvName: response.project?.environments[0]?.name || null,
          currentEnvUUID: response.project?.environments[0]?.uuid || null,
        });

        console.log(green(`Project '${projectName}' successfully created.`));
        Deno.exit();
      } catch (error) {
        console.error(red(`Error: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteProjectCommand() {
  return new Command()
    .description("Delete a project.")
    .option(
      "--project-name <projectName:string>",
      "The name of the project to delete.",
    )
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("No projects available."));
        Deno.exit();
      }

      let projectUUID: TUUID;
      if (options.projectName) {
        const project = projects.find((p) => p.name === options.projectName);
        if (!project) {
          console.log(
            red(`Project with name ${options.projectName} not found.`),
          );
          Deno.exit();
        }
        projectUUID = project.uuid;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID
            ? `${p.name} (Current)`
            : p.name,
          value: p.uuid,
        }));
        projectUUID = (await Select.prompt({
          message: "Select the project to delete:",
          options: projectOptions,
        })) as TUUID;
      }

      const client = await createClient();
      const response = await client.call("deleteProject", [projectUUID]);

      if (!response.success) {
        console.error(red(`Failed to delete project: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig?.currentProjectUUID === projectUUID) {
        console.log(
          red("The current project was deleted. Resetting configuration."),
        );
        await setCurrentConfigKV({
          currentProjectName: null,
          currentProjectUUID: null,
          currentEnvName: null,
          currentEnvUUID: null,
        });
      }

      console.log(green(`Project successfully deleted.`));
      Deno.exit();
    });
}

export function renameProjectCommand() {
  return new Command()
    .description("Rename a project.")
    .option("--old-name <oldName:string>", "The current name of the project.")
    .option("--new-name <newName:string>", "The new name of the project.")
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("No projects available."));
        Deno.exit();
      }

      let projectUUID: TUUID;
      let newProjectName: string;

      if (options.oldName && options.newName) {
        const project = projects.find((p) => p.name === options.oldName);
        if (!project) {
          console.log(red(`Project with name ${options.oldName} not found.`));
          Deno.exit();
        }
        projectUUID = project.uuid;
        newProjectName = options.newName;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID
            ? `${p.name} (Current)`
            : p.name,
          value: p.uuid,
        }));

        projectUUID = (await Select.prompt({
          message: "Select the project to rename:",
          options: projectOptions,
        })) as TUUID;

        newProjectName = await Input.prompt("Enter the new project name:");
      }

      const client = await createClient();
      const response = await client.call("updateProject", [
        projectUUID,
        newProjectName,
      ]);

      if (!response.success) {
        console.error(
          red(`Failed to rename project: ${response.message}`),
        );
        Deno.exit();
      }

      if (currentConfig?.currentProjectUUID === projectUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentProjectName: newProjectName,
        });
        console.log(
          green(
            "The current project was renamed and updated in the configuration.",
          ),
        );
      } else {
        console.log(green(`Project renamed to '${newProjectName}'.`));
      }
      Deno.exit();
    });
}

export function selectProjectCommand() {
  return new Command()
    .description("Select a project.")
    .option(
      "--project-name <projectName:string>",
      "The name of the project to select.",
    )
    .action(async (options) => {
      const projects = await getFullConfigKV();
      const { currentConfig } = await getCurrentConfig();

      if (projects === null || !projects.length) {
        console.log(red("No projects available."));
        Deno.exit();
      }

      let selectedProjectUUID: TUUID;

      if (options.projectName) {
        const project = projects.find((p) => p.name === options.projectName);
        if (!project) {
          console.log(
            red(`Project with name ${options.projectName} not found.`),
          );
          Deno.exit();
        }
        selectedProjectUUID = project.uuid;
      } else {
        const projectOptions = projects.map((p) => ({
          name: p.uuid === currentConfig?.currentProjectUUID
            ? `${p.name} (Current)`
            : p.name,
          value: p.uuid,
        }));

        selectedProjectUUID = (await Select.prompt({
          message: "Select a project:",
          options: projectOptions,
        })) as TUUID;
      }

      const selectedProject = projects.find((p) =>
        p.uuid === selectedProjectUUID
      );
      if (selectedProject) {
        await setCurrentConfigKV({
          currentProjectName: selectedProject.name,
          currentProjectUUID: selectedProject.uuid,
          currentEnvName: selectedProject.environments[0]?.name || null,
          currentEnvUUID: selectedProject.environments[0]?.uuid || null,
        });
        console.log(green(`Project selected: ${selectedProject.name}`));
      } else {
        console.error(red("Project not found."));
      }
      Deno.exit();
    });
}
