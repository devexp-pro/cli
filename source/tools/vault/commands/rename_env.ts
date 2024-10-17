import { Command } from "../deps.ts";
import {
  createClient,
  getCurrentEnv,
  getCurrentProject,
  setCurrentEnv,
} from "../api.ts";

import { green, red, yellow } from "../deps.ts";

export function renameEnvCommand() {
  return new Command()
    .description("Изменить название окружения.")
    .arguments("<oldEnvName:string> <newEnvName:string>")
    .action(async (_options: any, oldEnvName: string, newEnvName: string) => {
      try {
        const project = await getCurrentProject();

        if (!project) {
          console.error(
            red(
              "Проект не выбран. Выберите проект перед изменением названия окружения.",
            ),
          );
          return;
        }

        const client = await createClient();
        const response = await client.call("renameEnvironment", [
          project,
          oldEnvName,
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
            `Окружение '${oldEnvName}' успешно переименовано в '${newEnvName}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
