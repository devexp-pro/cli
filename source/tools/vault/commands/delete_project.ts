import { Command } from "../deps.ts";
import { createClient, getCurrentProject, setCurrentProject } from "../api.ts";

import { green, red, yellow } from "../deps.ts";

export function deleteProjectCommand() {
  return new Command()
    .description("Удалить проект.")
    .arguments("<projectName:string>")
    .action(async (_options: any, projectName: string) => {
      try {
        const client = await createClient();
        const currentProject = await getCurrentProject();

        if (currentProject === projectName) {
          console.log(
            yellow(
              `Текущий проект '${currentProject}' совпадает с удаляемым проектом.`,
            ),
          );
          await setCurrentProject("");
          console.log(green(`Текущий проект сброшен.`));
        }

        const response = await client.call("deleteProject", [projectName]);

        if (!response.success) {
          throw new Error(`Не удалось удалить проект: ${response.message}`);
        }

        console.log(green(`Проект '${projectName}' успешно удален.`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
