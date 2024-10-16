import { Command } from "../deps.ts";
import { createClient, getCurrentEnv, getCurrentProject } from "../api.ts";

import { green, red } from "../deps.ts";

export function updateSecretCommand() {
  return new Command()
    .description("Обновить секрет в текущем окружении.")
    .arguments("<key:string> <value:string>")
    .action(async (_options: any, key: string, value: string) => {
      try {
        const project = await getCurrentProject();
        const env = await getCurrentEnv();

        if (!project || !env) {
          console.error(red("Проект или окружение не выбрано."));
          return;
        }

        const client = await createClient();
        const response = await client.call("updateSecret", [
          project,
          env,
          key,
          value,
        ]);

        if (!response.success) {
          console.error(red(`Ошибка обновления секрета: ${response.message}`));
          return;
        }

        console.log(
          green(
            `Секрет '${key}' успешно обновлен в окружении '${env}' проекта '${project}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
