import {
  createClient,
  getCurrentConfig,
  setCurrentConfigKV,
} from "../../config_sync.ts";
import { green, red, yellow } from "../../deps.ts";
import { TUUID } from "../../GuardenDefinition.ts";
import { load as loadEnv } from "@std/dotenv";

export async function viewCurrentEnv() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig || !currentConfig.currentProjectUUID) {
    console.log(red("The current project is not selected."));
    return;
  }

  if (!currentConfig.currentEnvName) {
    console.log(red("No environment is selected for the current project."));
    return;
  }

  console.log(
    green(
      `Current project: ${currentConfig.currentProjectName}, Environment: ${currentConfig.currentEnvName}`,
    ),
  );
}

export async function createEnvironment(envName: string) {
  const { currentConfig } = await getCurrentConfig();
  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const client = await createClient();
  const response = await client.call("createEnvironment", [
    currentConfig.currentProjectUUID,
    envName,
  ]);

  if (!response.success) {
    throw new Error(`Failed to create environment: ${response.message}`);
  }

  console.log(green(`Environment '${envName}' created successfully.`));
}

export async function deleteEnvironmentByUUID(envUUID: TUUID) {
  const { currentConfig } = await getCurrentConfig();
  const client = await createClient();

  const response = await client.call("deleteEnvironment", [envUUID]);

  if (!response.success) {
    throw new Error(`Failed to delete environment: ${response.message}`);
  }

  if (currentConfig?.currentEnvUUID === envUUID) {
    await setCurrentConfigKV({
      ...currentConfig,
      currentEnvName: null,
      currentEnvUUID: null,
    });

    console.log(yellow("The current environment was reset as it was deleted."));
  }

  console.log(green("Environment deleted successfully."));
}

export async function renameEnvironmentByUUID(envUUID: TUUID, newName: string) {
  const { currentConfig } = await getCurrentConfig();
  const client = await createClient();

  const response = await client.call("updateEnvironment", [envUUID, newName]);

  if (!response.success) {
    throw new Error(`Failed to rename environment: ${response.message}`);
  }

  if (currentConfig?.currentEnvUUID === envUUID) {
    await setCurrentConfigKV({
      ...currentConfig,
      currentEnvName: newName,
    });

    console.log(green("The current environment was renamed and updated."));
  }

  console.log(green(`Environment renamed to '${newName}'.`));
}

export async function selectEnvironmentByUUID(envUUID: TUUID, envName: string) {
  const { currentConfig } = await getCurrentConfig();
  await setCurrentConfigKV({
    ...currentConfig,
    currentEnvUUID: envUUID,
    currentEnvName: envName,
  });

  console.log(green(`Environment with UUID '${envUUID}' selected.`));
}

export async function loadEnvironmentVariablesByUUID(
  envUUID: TUUID,
  filePath: string,
) {
  try {
    const envVars = await loadEnv({ envPath: filePath, export: false });
    console.log(
      green(`Variables from the file ${filePath} loaded successfully.`),
    );

    const client = await createClient();
    const addSecretPromises = Object.entries(envVars).map(([key, value]) =>
      client.call("addSecret", [envUUID, key, value])
    );

    const results = await Promise.allSettled(addSecretPromises);
    results.forEach((result, idx) => {
      const key = Object.keys(envVars)[idx];
      if (result.status === "fulfilled" && result.value.success) {
        console.log(green(`Secret '${key}' added successfully.`));
      } else {
        console.error(
          red(
            `Error adding secret '${key}': ${
              //@ts-ignore
              result.reason?.message || "unknown error"}`,
          ),
        );
      }
    });
  } catch (error) {
    console.error(
      red(`Error loading file ${filePath}: ${(error as Error).message}`),
    );
    throw error;
  }
}
