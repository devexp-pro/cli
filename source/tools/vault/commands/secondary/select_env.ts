import { Command, green, red } from "../../deps.ts";
import { createClient, getCurrentProject, setCurrentEnv } from "../../api.ts";

import { Select } from "@cliffy/prompt/select";

export function selectEnvCommand() {
  return new Command()
    .description("Выбрать окружение для текущего проекта.")
    .action(async () => {
      try {
        const project = await getCurrentProject();

        if (!project) {
          console.error(
            red("Проект не выбран. Выберите проект перед выбором окружения."),
          );
          return;
        }

        const client = await createClient();
        const [response, error] = await client.get();
        if (error) {
          console.error(red(`Ошибка получения данных: ${error.message}`));
          return;
        }
        const selectedProject = response!.state!.projects!.find(
          (p: any) => p!.name === project,
        );

        if (!selectedProject) {
          console.error(red(`Проект '${project}' не найден.`));
          return;
        }

        const environments = Object.keys(selectedProject!.environments!);
        if (environments.length === 0) {
          console.error(red("Окружения для выбранного проекта не найдены."));
          return;
        }

        // Показываем пользователю список окружений
        const selectedEnv = await Select.prompt({
          message: `Выберите окружение для проекта ${selectedProject.name}:`,
          options: environments,
        });

        // Сохраняем текущее окружение
        await setCurrentEnv(selectedEnv);

        console.log(green(`Окружение '${selectedEnv}' успешно выбрано.`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
