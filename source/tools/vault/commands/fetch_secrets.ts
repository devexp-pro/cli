import { Command } from "../deps.ts";

import { createClient } from "../client/utils/api.ts";
import { getCurrentEnv, getCurrentProject } from "../client/utils/config.ts";
import { green, red } from "../deps.ts";
import { Table } from "@cliffy/table";

export function fetchSecretsCommand() {
  return new Command()
    .description("Получить и вывести секреты для текущего окружения.")
    .action(async () => {
      try {
        const project = await getCurrentProject();
        const env = await getCurrentEnv();

        if (!project || !env) {
          console.error(red("Проект или окружение не выбрано."));
          return;
        }

        const client = await createClient();
        const response = await client.call("fetchSecrets", [project, env]);

        if (!response.success) {
          console.error(red(`Ошибка получения секретов: ${response.error}`));
          return;
        }

        const { secrets } = response;

        if (Object.keys(secrets).length === 0) {
          console.log(
            green(
              `Нет секретов в окружении '${env}' проекта '${project}'.`,
            ),
          );
          return;
        }

        // Создаем таблицу и выводим секреты
        const table = new Table()
          .header(["Key", "Value"])
          .body(Object.entries(secrets)) // Преобразуем объект секретов в массив для таблицы
          .border();

        console.log(
          `Секреты для проекта '${project}' и окружения '${env}':`,
        );
        table.render();
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
