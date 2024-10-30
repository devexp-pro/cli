import { Command } from "../../deps.ts";
import { createClient, setCurrentProject } from "../../api.ts";

export function createProjectCommand() {
  return new Command()
    .description("Создать новый проект.")
    .arguments("<projectName:string>")
    .action(async (_options: any, projectName: string) => {
      try {
        const client = await createClient();
        const response = await client.call("createProject", [projectName]);

        if (!response.success) {
          throw new Error(`Не удалось создать проект.(${response.error})`);
        }

        const createdProject = response.projects?.find((p) =>
          p.name === projectName
        );

        if (createdProject) {
          await setCurrentProject(createdProject.name, createdProject.uuid);
          console.log(
            `Проект ${projectName} успешно создан и установлен текущим!`,
          );
        } else {
          throw new Error(`Не удалось найти созданный проект.`);
        }
      } catch (error) {
        console.error(`Ошибка: ${(error as Error).message}`);
      }
    });
}
