import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";
import { getCurrentConfig, getFullConfigKV } from "../../config_sync.ts";
import {
  createEnvironment,
  deleteEnvironmentByUUID,
  renameEnvironmentByUUID,
  selectEnvironmentByUUID,
} from "./env_low_level_handlers.ts";
import { TUUID } from "../../GuardenDefinition.ts";
import { loadEnvironmentVariablesByName } from "./env_mid_level_handlers.ts";

export async function interactiveCreateEnvironment() {
  const envName = await Input.prompt("Enter the new environment name:");
  await createEnvironment(envName);
}

export async function interactiveDeleteEnvironment() {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }
  const { currentConfig } = await getCurrentConfig();
  if (currentConfig === null || !currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) =>
    p.uuid === currentConfig.currentProjectUUID
  );

  if (currentProject === undefined) {
    throw new Error("The current project is not found.");
  }

  const envUUID = await Select.prompt({
    message: "Select the environment to delete:",
    options: currentProject.environments.map((env) => ({
      name: env.name,
      value: env.uuid,
    })),
  });

  await deleteEnvironmentByUUID(envUUID as TUUID);
}

export async function interactiveRenameEnvironment() {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }
  const { currentConfig } = await getCurrentConfig();
  if (currentConfig === null || !currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) =>
    p.uuid === currentConfig.currentProjectUUID
  );
  if (currentProject === undefined) {
    throw new Error("The current project is not found.");
  }
  const envUUID = await Select.prompt({
    message: "Select the environment to rename:",
    options: currentProject.environments.map((env) => ({
      name: env.name,
      value: env.uuid,
    })),
  });

  const newName = await Input.prompt("Enter the new name for the environment:");
  await renameEnvironmentByUUID(envUUID as TUUID, newName);
}

export async function interactiveSelectEnvironment() {
  const projects = await getFullConfigKV();

  if (!projects) {
    throw new Error("No projects available.");
  }

  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) =>
    p.uuid === currentConfig.currentProjectUUID
  );
  if (!currentProject) {
    throw new Error("The current project is not found.");
  }

  const selectedEnvUUID = await Select.prompt({
    message: "Select the environment to use:",
    options: currentProject.environments.map((env) => ({
      name: env.name,
      value: env.uuid,
    })),
  });

  const selectedEnv = currentProject.environments.find((env) =>
    env.uuid === selectedEnvUUID
  );
  if (!selectedEnv) {
    throw new Error("Selected environment not found.");
  }

  await selectEnvironmentByUUID(selectedEnvUUID as TUUID, selectedEnv.name);
}

export async function interactiveLoadEnvFile() {
  const projects = await getFullConfigKV();
  if (!projects) {
    throw new Error("No projects available.");
  }
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID) {
    throw new Error("The current project is not selected.");
  }

  const currentProject = projects.find((p) =>
    p.uuid === currentConfig.currentProjectUUID
  );
  if (!currentProject) {
    throw new Error("The current project is not found.");
  }

  const selectedEnvName = await Select.prompt({
    message: "Select the environment to load variables into:",
    options: currentProject.environments.map((env) => env.name),
  });

  const envFilePath = await Input.prompt(
    "Enter the path to the environment variables file (default is .env):",
  ) || ".env";

  await loadEnvironmentVariablesByName(selectedEnvName, envFilePath);
}
