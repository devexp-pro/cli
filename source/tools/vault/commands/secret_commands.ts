// source/tools/vault/commands/secret_commands.ts

import { createClient } from "../api.ts";
import { Command, green, red } from "../deps.ts";
import { TUUID } from "../GuardenDefinition.ts";

export function addSecretCommand() {
  return new Command()
    .description("Добавить секрет в текущее окружение.")
    .arguments("<envUUID:string> <key:string> <value:string>")
    //@ts-ignore
    .action(async (_options: any, envUUID: TUUID, key: string, value: string) => {
      const client = await createClient();
      const response = await client.call("addSecret", [envUUID, key, value]);

      if (!response.success) {
        console.error(red(`Ошибка добавления секрета: ${response.message}`));
        return;
      }

      console.log(green(`Секрет '${key}' успешно добавлен в окружение '${envUUID}'.`));
    });
}

export function updateSecretCommand() {
  return new Command()
    .description("Обновить секрет в текущем окружении.")
    .arguments("<envUUID:string> <key:string> <newValue:string>")
     //@ts-ignore
    .action(async (_options: any, envUUID: TUUID, key: string, newValue: string) => {
      const client = await createClient();
      const response = await client.call("updateSecret", [envUUID, key, newValue]);

      if (!response.success) {
        console.error(red(`Ошибка обновления секрета: ${response.message}`));
        return;
      }

      console.log(green(`Секрет '${key}' успешно обновлен в окружении '${envUUID}'.`));
    });
}

export function deleteSecretCommand() {
  return new Command()
    .description("Удалить секрет из текущего окружения.")
    .arguments("<envUUID:string> <key:string>")
     //@ts-ignore
    .action(async (_options: any, envUUID: TUUID, key: string) => {
      const client = await createClient();
      const response = await client.call("deleteSecret", [envUUID, key]);

      if (!response.success) {
        console.error(red(`Ошибка удаления секрета: ${response.message}`));
        return;
      }

      console.log(green(`Секрет '${key}' успешно удален из окружения '${envUUID}'.`));
    });
}

export function fetchSecretsCommand() {
  return new Command()
    .description("Получить и вывести секреты для окружения.")
    .arguments("<envUUID:string>")
     //@ts-ignore
    .action(async (_options: any, envUUID: TUUID) => {
      const client = await createClient();
      const response = await client.call("getSecrets", [envUUID]);

      if (!response.success) {
        console.error(red(`Ошибка получения секретов: ${response.message}`));
        return;
      }

      const secrets = response.secrets;
      console.log(green(`Секреты для окружения '${envUUID}':`));
      for (const [key, value] of Object.entries(secrets)) {
        console.log(green(`${key}: ${value}`));
      }
    });
}
