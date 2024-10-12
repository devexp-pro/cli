import { Command } from "../deps.ts";
import { createClient } from "../client/utils/api.ts";
import {
  getCurrentProject,
  setCurrentProject,
} from "../client/utils/config.ts";
import { green, red, yellow } from "../deps.ts";

export function deleteProjectCommand() {
  return new Command()
    .description("Удалить проект.")
    .arguments("<projectName:string>")
    .action(async (options, projectName: string) => {
      try {
        const client = await createClient();
        const currentProject = await getCurrentProject();

        if (currentProject === projectName) {
          console.log(
            yellow(
              `Текущий проект '${currentProject}' совпадает с удаляемым проектом.`,
            ),
          );
          await setCurrentProject(""); // Сбрасываем текущий проект, если он совпадает
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
