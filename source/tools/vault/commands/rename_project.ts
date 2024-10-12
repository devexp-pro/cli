import { Command } from "../deps.ts";
import { createClient } from "../client/utils/api.ts";
import {
  getCurrentProject,
  setCurrentProject,
} from "../client/utils/config.ts";
import { green, red, yellow } from "../deps.ts";

export function renameProjectCommand() {
  return new Command()
    .description("Переименовать проект.")
    .arguments("<newProjectName:string>")
    .action(async (options, newProjectName: string) => {
      try {
        const currentProject = await getCurrentProject();

        if (!currentProject) {
          console.error(red("Проект не выбран."));
          return;
        }

        const client = await createClient();
        const response = await client.call("renameProject", [
          currentProject,
          newProjectName,
        ]);

        if (!response.success) {
          throw new Error(
            `Не удалось переименовать проект: ${response.message}`,
          );
        }

        await setCurrentProject(newProjectName);

        console.log(
          green(
            `Проект '${currentProject}' успешно переименован в '${newProjectName}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
