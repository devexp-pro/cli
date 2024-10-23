import { Command } from "../../deps.ts";
import { createClient, getCurrentEnv, getCurrentProject } from "../../api.ts";

import { green, red, yellow } from "../../deps.ts";

export function fetchAndSetSecretsCommand() {
  return new Command()
    .description(
      "Получить секреты для текущего окружения и установить их в переменные окружения.",
    )
    .option("--export <path:string>", "Сохранить переменные окружения в файл")
    //@ts-ignore
    .action(async (_options: any, { export: exportPath }) => {
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

        // Если указан путь для экспорта, сохраняем секреты в файл
        if (exportPath) {
          const exportContent = Object.entries(secrets)
            .map(([key, value]) => `export ${key}="${value}"`)
            .join("\n");
          await Deno.writeTextFile(exportPath, exportContent);
          console.log(green(`Секреты сохранены в файл: ${exportPath}`));
        }

        // Устанавливаем секреты в переменные окружения
        for (const [key, value] of Object.entries(secrets)) {
          Deno.env.set(key, value as string);
          console.log(yellow(`Установлена переменная окружения: ${key}`));
        }

        console.log(
          green(
            `Все секреты для проекта '${project}' и окружения '${env}' успешно установлены как переменные окружения.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
