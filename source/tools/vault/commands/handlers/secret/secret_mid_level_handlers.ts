import { getCurrentConfig, getFullConfigKV } from "../../../api.ts";
import { addSecret, deleteSecret, fetchSecrets, updateSecret } from "./secret_low_level_handlers.ts";

export async function addSecretByName(envName: string, key: string, value: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID || !projects) {
    throw new Error("Current project or environment is not selected.");
  }

  const project = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);
  const environment = project?.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment '${envName}' not found.`);
  }

  await addSecret(environment.uuid, key, value);
}

export async function updateSecretByName(envName: string, key: string, value: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID || !projects) {
    throw new Error("Current project or environment is not selected.");
  }

  const project = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);
  const environment = project?.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment '${envName}' not found.`);
  }

  await updateSecret(environment.uuid, key, value);
}

export async function deleteSecretByName(envName: string, key: string) {
    const projects = await getFullConfigKV();
    const { currentConfig } = await getCurrentConfig();
  
    if (!currentConfig?.currentProjectUUID || !projects) {
      throw new Error("Current project or environment is not selected.");
    }
  
    const project = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);
    const environment = project?.environments.find((env) => env.name === envName);
  
    if (!environment) {
      throw new Error(`Environment '${envName}' not found.`);
    }
  
    await deleteSecret(environment.uuid, key);
  }

export async function fetchSecretsByName(envName: string) {
  const projects = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID || !projects) {
    throw new Error("Current project or environment is not selected.");
  }

  const project = projects.find((p) => p.uuid === currentConfig.currentProjectUUID);
  const environment = project?.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment '${envName}' not found.`);
  }

  await fetchSecrets(environment.uuid);
}
