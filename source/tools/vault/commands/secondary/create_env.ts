import { Command } from "../../deps.ts";
import { createClient, getCurrentProject, setCurrentEnv } from "../../api.ts";

export function createEnvCommand() {
  return new Command()
    .description("Создать новое окружение для выбранного проекта.")
    .arguments("<envName:string>")
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

        // Найти окружение в ответе и сохранить его UUID и имя локально
        const createdEnv = response.projects?.find((p) =>
          p.name === project.currentProject
        )?.environments;
        const newEnvUUID = Object.keys(createdEnv || {}).find(
          (uuid) => createdEnv![uuid].name === envName,
        );

        if (newEnvUUID) {
          await setCurrentEnv(envName, newEnvUUID);
          console.log(
            `Окружение '${envName}' успешно создано для проекта '${project.name}' и установлено текущим!`,
          );
        } else {
          throw new Error(`Не удалось найти созданное окружение.`);
        }
      } catch (error) {
        console.error(`Ошибка: ${(error as Error).message}`);
      }
    });
}
