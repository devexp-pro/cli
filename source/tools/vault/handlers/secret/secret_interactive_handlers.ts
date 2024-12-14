import { Input, Select } from "@cliffy/prompt";
import { getCurrentConfig, getFullConfigKV } from "../../config_sync.ts";
import {
  addSecretByName,
  deleteSecretByName,
  fetchSecretsByName,
  updateSecretByName,
} from "./secret_mid_level_handlers.ts";

async function getCurrentEnvironmentName(): Promise<string> {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID || !currentConfig.currentEnvName) {
    throw new Error("No current environment selected. Please select an environment first.");
  }

  return currentConfig.currentEnvName;
}

async function getSecretsForEnvironment(envName: string): Promise<string[]> {
  const fullConfig = await getFullConfigKV();
  const { currentConfig } = await getCurrentConfig();

  if (!fullConfig || !currentConfig?.currentProjectUUID) {
    throw new Error("No projects or environments available.");
  }

  const project = fullConfig.find((p) => p.uuid === currentConfig.currentProjectUUID);
  const environment = project?.environments.find((env) => env.name === envName);

  if (!environment || !environment.secrets) {
    throw new Error(`No secrets found for environment '${envName}'.`);
  }

  return environment.secrets.map((secret) => secret.key);
}

export async function interactiveAddSecret() {
  const envName = await getCurrentEnvironmentName();

  const key = await Input.prompt("Enter the secret key:");
  const value = await Input.prompt("Enter the secret value:");
  await addSecretByName(envName, key, value);
}

export async function interactiveUpdateSecret() {
  const envName = await getCurrentEnvironmentName();
  const secretKeys = await getSecretsForEnvironment(envName);

  if (secretKeys.length === 0) {
    console.error("No secrets found to update.");
    return;
  }

  const key = await Select.prompt({
    message: "Select the secret to update:",
    options: secretKeys,
  });

  const value = await Input.prompt("Enter the new secret value:");
  await updateSecretByName(envName, key, value);
}

export async function interactiveDeleteSecret() {
  const envName = await getCurrentEnvironmentName();
  const secretKeys = await getSecretsForEnvironment(envName);

  if (secretKeys.length === 0) {
    console.error("No secrets found to delete.");
    return;
  }

  const key = await Select.prompt({
    message: "Select the secret to delete:",
    options: secretKeys,
  });

  await deleteSecretByName(envName, key);
}

export async function interactiveFetchSecrets() {
  const envName = await getCurrentEnvironmentName();

  await fetchSecretsByName(envName);
}
