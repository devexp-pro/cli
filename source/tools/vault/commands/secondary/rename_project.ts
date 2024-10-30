import { Command } from "../../deps.ts";
import {
  createClient,
  getCurrentProject,
  setCurrentProject,
} from "../../api.ts";

import { green, red } from "../../deps.ts";

export function renameProjectCommand() {
  return new Command()
    .description("Переименовать текущий проект.")
    .arguments("<newProjectName:string>")
    .action(async (_options: any, newProjectName: string) => {
      try {
        const currentProject = await getCurrentProject();

        if (!currentProject) {
          console.error(red("Текущий проект не выбран."));
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

        await setCurrentProject(newProjectName, currentProject.uuid);

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
