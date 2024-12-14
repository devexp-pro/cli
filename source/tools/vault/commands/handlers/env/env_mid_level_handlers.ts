import { getCurrentConfig, getFullConfigKV } from "../../../api.ts";
import { deleteEnvironmentByUUID, loadEnvironmentVariablesByUUID, renameEnvironmentByUUID, selectEnvironmentByUUID } from "./env_low_level_handlers.ts";

export async function deleteEnvironmentByName(envName: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();

  if (!projects) {
    throw new Error("No projects available.");
  }

  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);

  const environment = currentProject?.environments?.find((env) => env.name === envName);
  if (!environment) {
    throw new Error(`Environment with name '${envName}' not found.`);
  }

  await deleteEnvironmentByUUID(environment.uuid);
}

export async function renameEnvironmentByName(oldName: string, newName: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();
  if (!projects) {
    throw new Error("No projects available.");
  }
  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);

  const environment = currentProject?.environments?.find((env) => env.name === oldName);
  if (!environment) {
    throw new Error(`Environment with name '${oldName}' not found.`);
  }

  await renameEnvironmentByUUID(environment.uuid, newName);
}

export async function selectEnvironmentByName(envName: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();
  if (!projects) {
    throw new Error("No projects available.");
  }
  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);

  const environment = currentProject?.environments?.find((env) => env.name === envName);
  if (!environment) {
    throw new Error(`Environment with name '${envName}' not found.`);
  }

  await selectEnvironmentByUUID(environment.uuid, environment.name);
}

export async function loadEnvironmentVariablesByName(envName: string, filePath: string) {
    const projects = await getFullConfigKV();
    const { currentConfig } = await getCurrentConfig();
  
    if (!projects) {
      throw new Error("No projects available.");
    }
  
    if (!currentConfig?.currentProjectUUID) {
      throw new Error("The current project is not selected.");
    }
  
    const currentProject = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);
  
    if (!currentProject) {
      throw new Error("The current project is not found.");
    }
  
    const environment = currentProject.environments.find((env) => env.name === envName);
  
    if (!environment) {
      throw new Error(`Environment with name '${envName}' not found.`);
    }
  
    await loadEnvironmentVariablesByUUID(environment.uuid, filePath);
  }
