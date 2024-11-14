// source/tools/vault/commands/env_commands.ts

import { Tuple } from "jsr:@std/async@0.224.0/tee";
import { createClient, getCurrentConfig, getFullConfigKV, setCurrentConfigKV } from "../api.ts";
import { Command, green, red, Input, yellow } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";
import { load as loadEnv } from "@std/dotenv"; 

export async function displayCurrentEnvInfo() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig || !currentConfig.currentProjectName) {
    console.log(red("Текущий проект не выбран."));
    return;
  }

  if (!currentConfig.currentEnvName) {
    console.log(red("Текущее окружение не выбрано для проекта."));
    return;
  }

  console.log(green(`Текущий проект: ${currentConfig.currentProjectName}, Текущее окружение: ${currentConfig.currentEnvName}`));
}

export function createEnvCommand() {
  return new Command()
    .description("Создать новое окружение.")
    .arguments("<envName:string>")
    .action(async (_options: any, envName: string) => {
      try {
        const { currentConfig } = await getCurrentConfig();
        if (!currentConfig || !currentConfig.currentProjectUUID) {
          console.log(red("Текущий проект не выбран."));
          Deno.exit();
        }

        const client = await createClient();
        const response = await client.call("createEnvironment", [
          currentConfig.currentProjectUUID,
          envName,
        ]);

        if (!response.success) {
          throw new Error(`Не удалось создать окружение: ${response.message}`);
        }

        console.log(green(`Окружение '${envName}' успешно создано.`));
        Deno.exit();
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
        Deno.exit();
      }
    });
}

export function deleteEnvCommand() {
  return new Command()
    .description("Удалить окружение.")
    .option("--env-name <envName:string>", "Имя окружения для удаления.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) => project.uuid === currentConfig.currentProjectUUID);

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }

      let envUUID: TUUID;
      if (options.envName) {
        const environment = currentProject.environments.find((env) => env.name === options.envName);
        if (!environment) {
          console.log(red(`Окружение с именем ${options.envName} не найдено.`));
          Deno.exit();
        }
        envUUID = environment.uuid;
      } else {
        envUUID = (await Select.prompt({
          message: "Выберите окружение для удаления:",
          options: currentProject.environments.map((env) => ({
            name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
            value: env.uuid,
          })),
        })) as TUUID;
      }

      const client = await createClient();
      const response = await client.call("deleteEnvironment", [envUUID]);

      if (!response.success) {
        console.error(red(`Не удалось удалить окружение: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: null,
          currentEnvUUID: null,
        });
        console.log(yellow("Текущее окружение сброшено, так как оно было удалено."));
      }

      console.log(green("Окружение успешно удалено."));
      Deno.exit();
    });
}

export function renameEnvCommand() {
  return new Command()
    .description("Переименовать окружение.")
    .option("--old-name <oldName:string>", "Текущее имя окружения.")
    .option("--new-name <newName:string>", "Новое имя окружения.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) => project.uuid === currentConfig.currentProjectUUID);

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }

      let envUUID: TUUID;
      if (options.oldName && options.newName) {
        const environment = currentProject.environments.find((env) => env.name === options.oldName);
        if (!environment) {
          console.log(red(`Окружение с именем ${options.oldName} не найдено.`));
          Deno.exit();
        }
        envUUID = environment.uuid;
      } else {
        envUUID = (await Select.prompt({
          message: "Выберите окружение для переименования:",
          options: currentProject.environments.map((env) => ({
            name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
            value: env.uuid,
          })),
        })) as TUUID
        options.newName = await Input.prompt("Введите новое имя окружения:");
      }

      const client = await createClient();
      const response = await client.call("updateEnvironment", [envUUID as TUUID, options.newName]);

      if (!response.success) {
        console.error(red(`Не удалось переименовать окружение: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: options.newName,
        });
        console.log(green("Текущее окружение переименовано и обновлено в конфигурации."));
      } else {
        console.log(green(`Окружение переименовано в '${options.newName}'.`));
      }
      Deno.exit();
    });
}

export function selectEnvCommand() {
  return new Command()
    .description("Выбрать окружение.")
    .option("--env-name <envName:string>", "Имя окружения для выбора.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((project) => project.uuid === currentConfig.currentProjectUUID);

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }

      let selectedEnvUUID: TUUID;

      if (options.envName) {
        const environment = currentProject.environments.find((env) => env.name === options.envName);
        if (!environment) {
          console.log(red(`Окружение с именем ${options.envName} не найдено.`));
          Deno.exit();
        }
        selectedEnvUUID = environment.uuid;
      } else {
        const envOptions = currentProject.environments.map((env) => ({
          name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
          value: env.uuid,
        }));

        selectedEnvUUID = (await Select.prompt({
          message: "Выберите окружение:",
          options: envOptions,
        })) as TUUID;
      }

      const selectedEnv = currentProject.environments.find((env) => env.uuid === selectedEnvUUID);
      if (selectedEnv) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: selectedEnv.name,
          currentEnvUUID: selectedEnv.uuid,
        });
        console.log(green(`Окружение '${selectedEnv.name}' выбрано.`));
      } else {
        console.error(red("Окружение не найдено."));
      }
      Deno.exit();
    });
}



export function loadEnvFileCommand() {
  return new Command()
    .description("Загрузить переменные окружения из файла.")
    .option("--file <filePath:string>", "Путь к файлу переменных окружения (по умолчанию .env).")
    .option("--env-name <envName:string>", "Имя окружения для загрузки переменных.")
    .action(async (options) => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig?.currentProjectUUID) {
        console.error(red("Текущий проект не выбран."));
        return;
      }

      const projects = await getFullConfigKV();
      const currentProject = projects?.find((p) => p.uuid === currentConfig.currentProjectUUID);

      if (!currentProject || !currentProject.environments?.length) {
        console.error(red("Окружения для текущего проекта отсутствуют."));
        return;
      }


      let selectedEnvUUID: TUUID | undefined;

      if (options.envName) {

        const environment = currentProject.environments.find((env) => env.name === options.envName);
        if (!environment) {
          console.log(red(`Окружение с именем ${options.envName} не найдено.`));
          Deno.exit();
        }
        selectedEnvUUID = environment.uuid;
      } else {

        selectedEnvUUID = (await Select.prompt({
          message: "Выберите окружение для загрузки переменных:",
          options: currentProject.environments.map((env) => ({
            name: env.name,
            value: env.uuid,
          })),
        })) as TUUID;
      }

      const envFilePath = options.file || await Input.prompt("Введите путь к файлу переменных окружения (по умолчанию .env):") || ".env";
      await loadEnvFileAndAddSecrets(envFilePath, selectedEnvUUID);
      Deno.exit();
    });
}

export async function loadEnvFileAndAddSecrets(filePath: string, envUUID: TUUID) {
  try {
    const envVars = await loadEnv({ envPath: filePath, export: false });
    console.log(green(`Переменные из файла ${filePath} успешно загружены.`));

    const client = await createClient();
    const addSecretPromises = Object.entries(envVars).map(([key, value]) =>
      client.call("addSecret", [envUUID, key, value])
    );

    const results = await Promise.allSettled(addSecretPromises);
    results.forEach((result, idx) => {
      const key = Object.keys(envVars)[idx];
      if (result.status === "fulfilled" && result.value.success) {
        console.log(green(`Секрет '${key}' успешно добавлен.`));
      } else {
        //@ts-ignore
        console.error(red(`Ошибка при добавлении секрета '${key}': ${result.message || "неизвестная ошибка"}`));
      }
    });
  } catch (error) {
    console.error(red(`Ошибка при загрузке файла ${filePath}: ${(error as Error).message}`));
  }
}