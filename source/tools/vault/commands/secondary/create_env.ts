import { Command } from "../../deps.ts";
import { createClient, getCurrentProject } from "../../api.ts";

export function createEnvCommand() {
  return new Command()
    .description("Создать новое окружение для выбранного проекта.")
    .arguments("<envName:string>") // Добавляем аргумент для имени окружения
    .action(async (_options: any, envName: string) => {
      try {
        const project = await getCurrentProject();

        if (!project) {
          console.error(
            "Проект не выбран. Пожалуйста, выберите проект перед созданием окружения.",
          );
          return;
        }

        const client = await createClient();
        const response = await client.call("createEnvironment", [
          project,
          envName,
        ]);

        if (!response.success) {
          throw new Error(
            `Не удалось создать окружение. Ошибка: ${response.message}`,
          );
        }

        console.log(
          `Окружение '${envName}' успешно создано для проекта '${project}'.`,
        );
      } catch (error) {
        console.error(`Ошибка: ${(error as Error).message}`);
      }
    });
}
