// source/tools/vault/commands/env_commands.ts

import { Tuple } from "jsr:@std/async@0.224.0/tee";
import {
  createClient,
  getCurrentConfig,
  getFullConfigKV,
  setCurrentConfigKV,
} from "../api.ts";
import { Command, green, Input, red, yellow } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";
import { load as loadEnv } from "@std/dotenv";

export async function displayCurrentEnvInfo() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig || !currentConfig.currentProjectName) {
    console.log(red("The current project is not selected."));
    return;
  }

  if (!currentConfig.currentEnvName) {
    console.log(
      red("The current environment is not selected for the project."),
    );
    return;
  }

  console.log(
    green(
      `Current project: ${currentConfig.currentProjectName}, Current environment: ${currentConfig.currentEnvName}`,
    ),
  );
}

export function createEnvCommand() {
  return new Command()
    .description("Create a new environment.")
    .arguments("<envName:string>")
    .action(async (_options: any, envName: string) => {
      try {
        const { currentConfig } = await getCurrentConfig();
        if (!currentConfig || !currentConfig.currentProjectUUID) {
          console.log(red("The current project is not selected."));
          Deno.exit();
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
        Deno.exit();
      } catch (error) {
        console.error(red(`Error: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteEnvCommand() {
  return new Command()
    .description("Delete an environment.")
    .option("--env-name <envName:string>", "Name of the environment to delete.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("The current project is not selected."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) =>
        project.uuid === currentConfig.currentProjectUUID
      );

      if (
        !currentProject || !currentProject.environments ||
        !currentProject.environments.length
      ) {
        console.log(red("No environments available for the current project."));
        Deno.exit();
      }

      let envUUID: TUUID;
      if (options.envName) {
        const environment = currentProject.environments.find((env) =>
          env.name === options.envName
        );
        if (!environment) {
          console.log(
            red(`Environment with the name ${options.envName} not found.`),
          );
          Deno.exit();
        }
        envUUID = environment.uuid;
      } else {
        envUUID = (await Select.prompt({
          message: "Select the environment to delete:",
          options: currentProject.environments.map((env) => ({
            name: env.uuid === currentConfig.currentEnvUUID
              ? `${env.name} (Current)`
              : env.name,
            value: env.uuid,
          })),
        })) as TUUID;
      }

      const client = await createClient();
      const response = await client.call("deleteEnvironment", [envUUID]);

      if (!response.success) {
        console.error(red(`Failed to delete environment: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: null,
          currentEnvUUID: null,
        });
        console.log(
          yellow("The current environment was reset as it was deleted."),
        );
      }

      console.log(green("Environment deleted successfully."));
      Deno.exit();
    });
}

export function renameEnvCommand() {
  return new Command()
    .description("Rename an environment.")
    .option("--old-name <oldName:string>", "Current name of the environment.")
    .option("--new-name <newName:string>", "New name of the environment.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("The current project is not selected."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) =>
        project.uuid === currentConfig.currentProjectUUID
      );

      if (
        !currentProject || !currentProject.environments ||
        !currentProject.environments.length
      ) {
        console.log(red("No environments available for the current project."));
        Deno.exit();
      }

      let envUUID: TUUID;
      if (options.oldName && options.newName) {
        const environment = currentProject.environments.find((env) =>
          env.name === options.oldName
        );
        if (!environment) {
          console.log(
            red(`Environment with the name ${options.oldName} not found.`),
          );
          Deno.exit();
        }
        envUUID = environment.uuid;
      } else {
        envUUID = (await Select.prompt({
          message: "Select the environment to rename:",
          options: currentProject.environments.map((env) => ({
            name: env.uuid === currentConfig.currentEnvUUID
              ? `${env.name} (Current)`
              : env.name,
            value: env.uuid,
          })),
        })) as TUUID;
        options.newName = await Input.prompt("Enter the new environment name:");
      }

      const client = await createClient();
      const response = await client.call("updateEnvironment", [
        envUUID as TUUID,
        options.newName,
      ]);

      if (!response.success) {
        console.error(
          red(`Failed to rename environment: ${response.message}`),
        );
        Deno.exit();
      }

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: options.newName,
        });
        console.log(
          green(
            "The current environment was renamed and updated in the configuration.",
          ),
        );
      } else {
        console.log(green(`Environment renamed to '${options.newName}'.`));
      }
      Deno.exit();
    });
}

export function selectEnvCommand() {
  return new Command()
    .description("Select an environment.")
    .option("--env-name <envName:string>", "Name of the environment to select.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("The current project is not selected."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) =>
        project.uuid === currentConfig.currentProjectUUID
      );

      if (
        !currentProject || !currentProject.environments ||
        !currentProject.environments.length
      ) {
        console.log(red("No environments available for the current project."));
        Deno.exit();
      }

      let selectedEnvUUID: TUUID;

      if (options.envName) {
        const environment = currentProject.environments.find((env) =>
          env.name === options.envName
        );
        if (!environment) {
          console.log(
            red(`Environment with the name ${options.envName} not found.`),
          );
          Deno.exit();
        }
        selectedEnvUUID = environment.uuid;
      } else {
        const envOptions = currentProject.environments.map((env) => ({
          name: env.uuid === currentConfig.currentEnvUUID
            ? `${env.name} (Current)`
            : env.name,
          value: env.uuid,
        }));

        selectedEnvUUID = (await Select.prompt({
          message: "Select an environment:",
          options: envOptions,
        })) as TUUID;
      }

      const selectedEnv = currentProject.environments.find((env) =>
        env.uuid === selectedEnvUUID
      );
      if (selectedEnv) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: selectedEnv.name,
          currentEnvUUID: selectedEnv.uuid,
        });
        console.log(green(`Environment '${selectedEnv.name}' selected.`));
      } else {
        console.error(red("Environment not found."));
      }
      Deno.exit();
    });
}

export function loadEnvFileCommand() {
  return new Command()
    .description("Load environment variables from a file.")
    .option(
      "--file <filePath:string>",
      "Path to the environment variables file (default is .env).",
    )
    .option(
      "--env-name <envName:string>",
      "Name of the environment to load variables into.",
    )
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig?.currentProjectUUID) {
        console.error(red("The current project is not selected."));
        return;
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((p) =>
        p.uuid === currentConfig.currentProjectUUID
      );

      if (!currentProject || !currentProject.environments?.length) {
        console.error(
          red("No environments available for the current project."),
        );
        return;
      }

      let selectedEnvUUID: TUUID | undefined;

      if (options.envName) {
        const environment = currentProject.environments.find((env) =>
          env.name === options.envName
        );
        if (!environment) {
          console.log(
            red(`Environment with the name ${options.envName} not found.`),
          );
          Deno.exit();
        }
        selectedEnvUUID = environment.uuid;
      } else {
        selectedEnvUUID = (await Select.prompt({
          message: "Select the environment to load variables into:",
          options: currentProject.environments.map((env) => ({
            name: env.name,
            value: env.uuid,
          })),
        })) as TUUID;
      }

      const envFilePath = options.file ||
        await Input.prompt(
          "Enter the path to the environment variables file (default is .env):",
        ) || ".env";
      await loadEnvFileAndAddSecrets(envFilePath, selectedEnvUUID);
      Deno.exit();
    });
}

export async function loadEnvFileAndAddSecrets(
  filePath: string,
  envUUID: TUUID,
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
              result.message || "unknown error"}`,
          ),
        );
      }
    });
  } catch (error) {
    console.error(
      red(`Error loading file ${filePath}: ${(error as Error).message}`),
    );
  }
}
