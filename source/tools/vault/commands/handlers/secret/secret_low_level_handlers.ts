import { createClient, getCurrentConfig, getFullConfigKV } from "../../../api.ts";
import { green, red } from "../../../deps.ts";
import { TUUID } from "../../../GuardenDefinition.ts";

export async function addSecret(envUUID: TUUID, key: string, value: string) {
  const client = await createClient();
  const response = await client.call("addSecret", [envUUID, key, value]);

  if (!response.success) {
    throw new Error(`Failed to add secret: ${response.message}`);
  }

  console.log(green(`Secret '${key}' added successfully.`));
}

export async function updateSecret(envUUID: TUUID, key: string, value: string) {
  const client = await createClient();
  const response = await client.call("updateSecret", [envUUID, key, value]);

  if (!response.success) {
    throw new Error(`Failed to update secret: ${response.message}`);
  }

  console.log(green(`Secret '${key}' updated successfully.`));
}

export async function deleteSecret(envUUID: TUUID, key: string) {
    const fullConfig = await getFullConfigKV();
    const { currentConfig } = await getCurrentConfig();
  
    if (!fullConfig) {
      throw new Error("Full configuration is not available.");
    }
  
    if (!currentConfig?.currentProjectUUID) {
      throw new Error("The current project is not selected.");
    }
  
    const currentProject = fullConfig.find((project) => project.uuid === currentConfig.currentProjectUUID);
  
    if (!currentProject) {
      throw new Error("The current project is not found.");
    }
  
    const environment = currentProject.environments.find((env) => env.uuid === envUUID);
  
    if (!environment) {
      throw new Error("The specified environment is not found.");
    }
  
    const secret = environment.secrets?.find((secret) => secret.key === key);
    if (!secret) {
      console.error(red(`Secret with key '${key}' does not exist in the environment.`));
      return;
    }
  

    const client = await createClient();
    const response = await client.call("deleteSecret", [envUUID, key]);
  
    if (!response.success) {
      throw new Error(`Failed to delete secret: ${response.message}`);
    }
  
    console.log(green(`Secret '${key}' deleted successfully.`));
  }

export async function fetchSecrets(envUUID: TUUID) {
    const fullConfig = await getFullConfigKV();
    const { currentConfig } = await getCurrentConfig();
  
    if (!fullConfig) {
      throw new Error("Full configuration is not available.");
    }
  
    if (!currentConfig?.currentProjectUUID) {
      throw new Error("The current project is not selected.");
    }
  
    const currentProject = fullConfig.find((project) => project.uuid === currentConfig.currentProjectUUID);
  
    if (!currentProject) {
      throw new Error("The current project is not found.");
    }
  
    const environment = currentProject.environments.find((env) => env.uuid === envUUID);
  
    if (!environment) {
      throw new Error("The specified environment is not found.");
    }
  
    if (!environment.secrets || environment.secrets.length === 0) {
      console.log(red("No secrets found in the current environment."));
      return;
    }
  
    console.log(green("Secrets for the current environment:"));
    environment.secrets.forEach((secret) => {
      console.log(`${green(secret.key)}: ${secret.value}`);
    });
  }