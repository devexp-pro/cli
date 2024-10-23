import { Command } from "../../deps.ts";
import {
  createClient,
  getCurrentEnv,
  getCurrentProject,
  setCurrentEnv,
} from "../../api.ts";

import { green, red } from "../../deps.ts";

export function renameEnvCommand() {
  return new Command()
    .description("Переименовать текущее окружение.")
    .arguments("<newEnvName:string>")
    .action(async (_options: any, newEnvName: string) => {
      try {
        const project = await getCurrentProject();
        const currentEnv = await getCurrentEnv();

        if (!project) {
          console.error(
            red(
              "Проект не выбран. Выберите проект перед изменением названия окружения.",
            ),
          );
          return;
        }

        if (!currentEnv) {
          console.error(red("Текущее окружение не выбрано."));
          return;
        }

        const client = await createClient();
        const response = await client.call("renameEnvironment", [
          project,
          currentEnv,
          newEnvName,
        ]);

        if (!response.success) {
          throw new Error(
            `Не удалось изменить название окружения: ${response.message}`,
          );
        }

        await setCurrentEnv(newEnvName);

        console.log(
          green(
            `Окружение '${currentEnv}' успешно переименовано в '${newEnvName}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
