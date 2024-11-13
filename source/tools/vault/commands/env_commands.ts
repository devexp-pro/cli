// source/tools/vault/commands/env_commands.ts

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
    .action(async () => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }


      const projects = await getFullConfigKV();
      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }
      const currentProject = projects.find(
        (project) => project.uuid === currentConfig.currentProjectUUID
      );

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }


      const envOptions = currentProject.environments.map((env) => ({
        name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
        value: env.uuid,
      }));

      const envUUID = await Select.prompt({
        message: "Выберите окружение для удаления:",
        options: envOptions,
      });

      const client = await createClient();
      const response = await client.call("deleteEnvironment", [envUUID as TUUID]);

      if (!response.success) {
        console.error(red(`Не удалось удалить окружение: ${response.message}`));
        Deno.exit();
      }

      console.log(green(`Окружение успешно удалено.`));

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: null,
          currentEnvUUID: null,
        });
        console.log(yellow("Текущее окружение сброшено, так как оно было удалено."));
      }
      Deno.exit();
    });
}


export function renameEnvCommand() {
  return new Command()
    .description("Переименовать окружение.")
    .action(async () => {
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }

      // Загружаем полный конфиг из локального KV
      const projects = await getFullConfigKV();
      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }
      const currentProject = projects.find(
        (project) => project.uuid === currentConfig.currentProjectUUID
      );

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }


      const envOptions = currentProject.environments.map((env) => ({
        name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
        value: env.uuid,
      }));

      const envUUID = await Select.prompt({
        message: "Выберите окружение для переименования:",
        options: envOptions,
      });

      const newEnvName = await Input.prompt("Введите новое имя окружения:");
      const client = await createClient();
      const response = await client.call("updateEnvironment", [envUUID as TUUID, newEnvName]);

      if (!response.success) {
        console.error(red(`Не удалось переименовать окружение: ${response.message}`));
        Deno.exit();
      }

      if (currentConfig.currentEnvUUID === envUUID) {
        await setCurrentConfigKV({
          ...currentConfig,
          currentEnvName: newEnvName,
        });
        console.log(green("Текущее окружение переименовано и обновлено в конфигурации."));
      } else {
        console.log(green(`Окружение переименовано в '${newEnvName}'.`));
      }
      Deno.exit();
    });
}


export  function selectEnvCommand() {
  return new Command()
    .description("Выбрать окружение.")
    .action(async () => {
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        Deno.exit();
      }


      const projects = await getFullConfigKV();

      if (projects === null || !projects.length) {
        console.log(red("Проекты отсутствуют."));
        Deno.exit();
      }
      const currentProject = projects.find(
        (project) => project.uuid === currentConfig.currentProjectUUID
      );

      if (!currentProject || !currentProject.environments || !currentProject.environments.length) {
        console.log(red("Окружения отсутствуют для текущего проекта."));
        Deno.exit();
      }


      const envOptions = currentProject.environments.map((env) => ({
        name: env.uuid === currentConfig.currentEnvUUID ? `${env.name} (Текущее)` : env.name,
        value: env.uuid,
      }));

      const selectedEnvUUID = await Select.prompt({
        message: "Выберите окружение:",
        options: envOptions,
      });

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


export async function promptAndLoadEnvFile() {
  const { currentConfig } = await getCurrentConfig();

  if (!currentConfig?.currentProjectUUID) {
    console.error(red("Текущий проект не выбран."));
    return;
  }

  const projects = await getFullConfigKV();
  const currentProject = projects?.find(p => p.uuid === currentConfig.currentProjectUUID);

  if (!currentProject || !currentProject.environments?.length) {
    console.error(red("Окружения для текущего проекта отсутствуют."));
    return;
  }


  const selectedEnvUUID = await Select.prompt({
    message: "Выберите окружение для загрузки переменных:",
    options: currentProject.environments.map(env => ({
      name: env.name,
      value: env.uuid,
    })),
  });

  const envFilePath = await Input.prompt("Введите путь к файлу переменных окружения (по умолчанию .env):");
  await loadEnvFileAndAddSecrets(envFilePath || ".env", selectedEnvUUID);
}


export async function loadEnvFileAndAddSecrets(filePath: string, envUUID: string) {
  try {

    const envVars = await loadEnv({ envPath: filePath, export: false });

    console.log(green(`Переменные из файла ${filePath} успешно загружены.`));


    const client = await createClient();
    const addSecretPromises = Object.entries(envVars).map(([key, value]) =>
      client.call("addSecret", [envUUID as TUUID, key, value])
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