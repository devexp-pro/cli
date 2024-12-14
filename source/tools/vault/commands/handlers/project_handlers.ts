// source/tools/vault/commands/handlers/project_handlers.ts

import {
    createClient,
    getCurrentConfig,
    getFullConfigKV,
    setCurrentConfigKV,
  } from "../../api.ts";
  import { green, red } from "../../deps.ts";
  import { Select } from "@cliffy/prompt/select";
  import { Input } from "@cliffy/prompt/input";
  import { TUUID } from "../../GuardenDefinition.ts";
  

  export async function renameProjectByUUID(uuid: TUUID, newName: string) {
    const client = await createClient();
    const response = await client.call("updateProject", [uuid, newName]);
  
    if (!response.success) {
      throw new Error(`Failed to rename project: ${response.message}`);
    }
  
    const { currentConfig } = await getCurrentConfig();
  
    if (currentConfig?.currentProjectUUID === uuid) {
      await setCurrentConfigKV({
        ...currentConfig,
        currentProjectName: newName,
      });
    }
  
    console.log(green(`Project renamed to '${newName}'.`));
  }
  

  export async function renameProjectByName(oldName: string, newName: string) {
    const projects = await getFullConfigKV();
    if (!projects) {
      throw new Error("No projects available.");
    }
  
    const project = projects.find((p) => p.name === oldName);
    if (!project) {
      throw new Error(`Project with name '${oldName}' not found.`);
    }
  
    await renameProjectByUUID(project.uuid, newName);
  }
  

  export async function interactiveRenameProject() {
    const projects = await getFullConfigKV();
    const { currentConfig } = await getCurrentConfig();
  
    if (!projects || projects.length === 0) {
      throw new Error("No projects available.");
    }
  
    const selectedProjectUUID = await Select.prompt({
      message: "Select the project to rename:",
      options: projects.map((p) => ({
        name: p.uuid === currentConfig?.currentProjectUUID
          ? `${p.name} (Current)`
          : p.name,
        value: p.uuid,
      })),
    });
  
    const newName = await Input.prompt("Enter the new project name:");
    await renameProjectByUUID(selectedProjectUUID as TUUID, newName);
  }
  

  export async function viewCurrentProject() {
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
  

  export async function createProject(name: string) {
    const client = await createClient();
    const response = await client.call("createProject", [name]);
  
    if (!response.success) {
      throw new Error(`Failed to create project: ${response.message}`);
    }
  
    await setCurrentConfigKV({
      currentProjectName: response.project!.name,
      currentProjectUUID: response.project!.uuid,
      currentEnvName: response.project?.environments[0]?.name || null,
      currentEnvUUID: response.project?.environments[0]?.uuid || null,
    });
  
    console.log(green(`Project '${name}' successfully created.`));
  }
  

  export async function interactiveCreateProject() {
    const name = await Input.prompt("Enter the new project name:");
    await createProject(name);
  }
  

  export async function deleteProjectByUUID(uuid: TUUID) {
    const client = await createClient();
    const response = await client.call("deleteProject", [uuid]);
  
    if (!response.success) {
      throw new Error(`Failed to delete project: ${response.message}`);
    }
  
    const { currentConfig } = await getCurrentConfig();
    if (currentConfig?.currentProjectUUID === uuid) {
      await setCurrentConfigKV({
        currentProjectName: null,
        currentProjectUUID: null,
        currentEnvName: null,
        currentEnvUUID: null,
      });
    }
  
    console.log(green("Project successfully deleted."));
  }
  

  export async function deleteProjectByName(name: string) {
    const projects = await getFullConfigKV();
    if (!projects) {
      throw new Error("No projects available.");
    }
  
    const project = projects.find((p) => p.name === name);
    if (!project) {
      throw new Error(`Project with name '${name}' not found.`);
    }
  
    await deleteProjectByUUID(project.uuid);
  }
  

  export async function interactiveDeleteProject() {
    const projects = await getFullConfigKV();
    if (!projects || projects.length === 0) {
      throw new Error("No projects available.");
    }
  
    const selectedProjectUUID = await Select.prompt({
      message: "Select the project to delete:",
      options: projects.map((p) => ({
        name: p.name,
        value: p.uuid,
      })),
    });
  
    await deleteProjectByUUID(selectedProjectUUID as TUUID);
  }
  

  export async function selectProjectByUUID(uuid: TUUID) {
    const projects = await getFullConfigKV();
    if (!projects) {
      throw new Error("No projects available.");
    }
  
    const project = projects.find((p) => p.uuid === uuid);
    if (!project) {
      throw new Error("Project not found.");
    }
  
    await setCurrentConfigKV({
      currentProjectName: project.name,
      currentProjectUUID: project.uuid,
      currentEnvName: project.environments[0]?.name || null,
      currentEnvUUID: project.environments[0]?.uuid || null,
    });
  
    console.log(green(`Project selected: ${project.name}`));
  }
  

  export async function selectProjectByName(name: string) {
    const projects = await getFullConfigKV();
    if (!projects) {
      throw new Error("No projects available.");
    }
  
    const project = projects.find((p) => p.name === name);
    if (!project) {
      throw new Error(`Project with name '${name}' not found.`);
    }
  
    await selectProjectByUUID(project.uuid);
  }
  

  export async function interactiveSelectProject() {
    const projects = await getFullConfigKV();
    if (!projects || projects.length === 0) {
      throw new Error("No projects available.");
    }
  
    const selectedProjectUUID = await Select.prompt({
      message: "Select a project:",
      options: projects.map((p) => ({
        name: p.name,
        value: p.uuid,
      })),
    });
  
    await selectProjectByUUID(selectedProjectUUID as TUUID);
  }
  
  const projectHandlers = {
    viewCurrentProject,
    createProject,
    interactiveCreateProject,
    renameProjectByUUID,
    renameProjectByName,
    interactiveRenameProject,
    deleteProjectByUUID,
    deleteProjectByName,
    interactiveDeleteProject,
    selectProjectByUUID,
    selectProjectByName,
    interactiveSelectProject,
  };
  
  export default projectHandlers;
  