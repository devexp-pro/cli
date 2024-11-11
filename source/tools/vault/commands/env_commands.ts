// source/tools/vault/commands/env_commands.ts

import { createClient, getCurrentConfig, setCurrentEnv } from "../api.ts";
import { Command, green, red } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";
import { Select } from "@cliffy/prompt/select";

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
          return;
        }

        const client = await createClient();
        const response = await client.call("createEnvironment", [
          currentConfig.currentProjectUUID,
          envName,
        ]);

        if (!response.success) {
          throw new Error(`Не удалось создать окружение: ${response.message}`);
        }

        await setCurrentEnv(response.environment!.name, response.environment!.uuid);
        console.log(green(`Окружение '${envName}' успешно создано.`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}

export function deleteEnvCommand() {
  return new Command()
    .description("Удалить окружение.")
    .arguments("<envName:string>")
    .action(async (_options: any, envName: string) => {
      try {
        const { currentConfig } = await getCurrentConfig();

        if (!currentConfig?.currentProjectUUID) {
          console.log(red("Текущий проект не выбран."));
          return;
        }

        const isCurrentEnv = currentConfig.currentEnvName === envName;
        const envUUID = isCurrentEnv ? currentConfig.currentEnvUUID : null;

        if (!envUUID) {
          console.error(red(`Окружение '${envName}' не найдено или не выбрано.`));
          return;
        }

        const client = await createClient();
        const response = await client.call("deleteEnvironment", [envUUID]);

        if (!response.success) {
          console.error(red(`Не удалось удалить окружение: ${response.message}`));
          return;
        }

        console.log(green(`Окружение '${envName}' успешно удалено.`));

        if (isCurrentEnv) {
          await setCurrentEnv(null, null);
          console.log(green("Текущее окружение сброшено, так как оно было удалено."));
        }
      } catch (error) {
        console.error(red(`Ошибка при удалении окружения: ${(error as Error).message}`));
      }
    });
}

export function renameEnvCommand() {
  return new Command()
    .description("Переименовать окружение.")
    .arguments("<newEnvName:string>")
    .action(async (_options: any, newEnvName: string) => {
      const client = await createClient();
      const { currentConfig } = await getCurrentConfig();

      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        return;
      }
      
      if (!currentConfig.currentEnvUUID) {
        console.log(red("Текущее окружение не выбрано."));
        return;
      }

      const response = await client.call("updateEnvironment", [currentConfig.currentEnvUUID, newEnvName]);

      if (!response.success) {
        console.error(red(`Не удалось переименовать окружение: ${response.message}`));
        return;
      }

      console.log(green(`Окружение переименовано в '${newEnvName}'.`));

      if (currentConfig.currentEnvUUID) {
        await setCurrentEnv(newEnvName, currentConfig.currentEnvUUID);
        console.log(green("Обновлено текущее окружение в конфигурации."));
      }
    });
}

export function selectEnvCommand() {
  return new Command()
    .description("Выбрать окружение.")
    .action(async () => {
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig || !currentConfig.currentProjectUUID) {
        console.log(red("Текущий проект не выбран."));
        return;
      }

      const client = await createClient();
      const response = await client.call("getProject", [currentConfig.currentProjectUUID]);

      if (!response.success || !response.project) {
        console.error(red("Ошибка при получении списка окружений."));
        return;
      }

      const environments = response.project.environments;
      if (environments.length === 0) {
        console.log(red("Окружения отсутствуют."));
        return;
      }

      const envOptions = environments.map((env) => ({ name: env!.name, value: env!.uuid }));
      const selectedEnvUUID = await Select.prompt({
        message: "Выберите окружение:",
        options: envOptions,
      });

      const selectedEnv = environments.find((e) => e.uuid === selectedEnvUUID);
      if (selectedEnv) {
        await setCurrentEnv(selectedEnv.name, selectedEnv.uuid);
        console.log(green(`Окружение '${selectedEnv.name}' выбрано.`));
      } else {
        console.error(red("Окружение не найдено."));
      }
    });
}
