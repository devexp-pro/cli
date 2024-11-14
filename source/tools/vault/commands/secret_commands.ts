// source/tools/vault/commands/secret_commands.ts

import { createClient, getCurrentConfig, getFullConfigKV } from "../api.ts";
import { Command, green, red, Input } from "../deps.ts";
import { Select } from "@cliffy/prompt";
import { TUUID } from "../GuardenDefinition.ts";

async function getSecretsFromConfig(): Promise<Record<string, string>> {
  const { currentConfig } = await getCurrentConfig();
  const fullConfig = await getFullConfigKV();
  if (!fullConfig) {
    console.log(red("Текущий проект или окружение не выбраны"));
    Deno.exit();
  }

  if (!currentConfig?.currentProjectUUID || !currentConfig.currentEnvUUID) {
    console.error(red("Текущее окружение или проект не выбраны."));
    Deno.exit();
  }

  const project = fullConfig.find((proj) => proj.uuid === currentConfig.currentProjectUUID);
  const environment = project?.environments.find((env) => env.uuid === currentConfig.currentEnvUUID);

  if (!environment || !environment.secrets) {
    console.log(red("Секреты отсутствуют для текущего окружения."));
    Deno.exit();
  }

  return environment.secrets.reduce((acc, secret) => {
    acc[secret.key] = secret.value;
    return acc;
  }, {} as Record<string, string>);
}

export function addSecretCommand() {
  return new Command()
    .description("Добавить секрет в текущее окружение.")
    .arguments("<key:string> <value:string>")
    .action(async (_options: any, key: string, value: string) => {
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.error(red("Текущее окружение не выбрано."));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("addSecret", [currentConfig.currentEnvUUID, key, value]);

      if (!response.success) {
        console.error(red(`Ошибка добавления секрета: ${response.message}`));
        Deno.exit();
      }

      console.log(green(`Секрет '${key}' успешно добавлен в текущее окружение.`));
      Deno.exit();
    });
}

export function updateSecretCommand() {
  return new Command()
    .description("Обновить секрет в текущем окружении.")
    .option("--key <key:string>", "Ключ секрета для обновления.")
    .option("--value <value:string>", "Новое значение секрета.")
    .action(async (options) => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("Секреты отсутствуют в текущем окружении."));
        Deno.exit();
      }

      const selectedKey = options.key ?? await Select.prompt({
        message: "Выберите секрет для обновления:",
        options: Object.keys(secrets),
      });

      const newValue = options.value ?? await Input.prompt("Введите новое значение для секрета:");
      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.log(red("Текущий проект или окружение не выбраны"));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("updateSecret", [currentConfig.currentEnvUUID, selectedKey, newValue]);

      if (!response.success) {
        console.error(red(`Ошибка обновления секрета: ${response.message}`));
        Deno.exit();
      }

      console.log(green(`Секрет '${selectedKey}' успешно обновлен.`));
      Deno.exit();
    });
}

export function deleteSecretCommand() {
  return new Command()
    .description("Удалить секрет из текущего окружения.")
    .option("--key <key:string>", "Ключ секрета для удаления.")
    .action(async (options) => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("Секреты отсутствуют в текущем окружении."));
        Deno.exit();
      }

      const selectedKey = options.key ?? await Select.prompt({
        message: "Выберите секрет для удаления:",
        options: Object.keys(secrets),
      });

      const { currentConfig } = await getCurrentConfig();
      if (!currentConfig?.currentEnvUUID) {
        console.log(red("Текущий проект или окружение не выбраны"));
        Deno.exit();
      }

      const client = await createClient();
      const response = await client.call("deleteSecret", [currentConfig.currentEnvUUID, selectedKey]);

      if (!response.success) {
        console.error(red(`Ошибка удаления секрета: ${response.message}`));
        Deno.exit();
      }

      console.log(green(`Секрет '${selectedKey}' успешно удален из окружения.`));
      Deno.exit();
    });
}

export function fetchSecretsCommand() {
  return new Command()
    .description("Получить и вывести секреты для текущего окружения.")
    .action(async () => {
      const secrets = await getSecretsFromConfig();
      if (Object.keys(secrets).length === 0) {
        console.log(red("Секреты отсутствуют в текущем окружении."));
        Deno.exit();
      }

      console.log(green("Секреты для текущего окружения:"));
      for (const [key, value] of Object.entries(secrets)) {
        console.log(green(`${key}: ${value}`));
      }
      Deno.exit();
    });
}
