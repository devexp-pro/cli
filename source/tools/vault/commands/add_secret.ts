import { Command } from "../deps.ts";
import { createClient } from "../client/utils/api.ts";
import { getCurrentEnv, getCurrentProject } from "../client/utils/config.ts";
import { green, red } from "../deps.ts";

export function addSecretCommand() {
  return new Command()
    .description("Добавить секрет в текущее окружение.")
    .arguments("<key:string> <value:string>")
    .action(async (options, key: string, value: string) => {
      try {
        const project = await getCurrentProject();
        const env = await getCurrentEnv();

        if (!project || !env) {
          console.error(red("Проект или окружение не выбрано."));
          return;
        }

        const client = await createClient();
        const response = await client.call("addSecret", [
          project,
          env,
          key,
          value,
        ]);

        if (!response.success) {
          console.error(red(`Ошибка добавления секрета: ${response.message}`));
          return;
        }

        console.log(
          green(
            `Секрет '${key}' успешно добавлен в окружение '${env}' проекта '${project}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
