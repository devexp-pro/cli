import { Command } from "../deps.ts";
import { createClient } from "../api.ts";

export function createProjectCommand() {
  return new Command()
    .description("Создать новый проект.")
    .arguments("<projectName:string>")
    .action(async (_options: any, projectName: string) => {
      try {
        const client = await createClient();
        console.log(`Ща будем создавать проект: ${projectName}`);
        const response = await client.call("createProject", [projectName]);

        if (!response.success) {
          throw new Error(`Не удалось создать проект.(${response.error})`);
        }

        console.log(`Проект ${projectName} успешно создан!`);
      } catch (error) {
        console.error(`Ошибка: ${(error as Error).message}`);
      }
    });
}
