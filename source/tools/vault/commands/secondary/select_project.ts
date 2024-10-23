import { Command } from "../../deps.ts";

import { createClient, setCurrentProject } from "../../api.ts";

import { green, red } from "../../deps.ts";
import { Select } from "@cliffy/prompt/select";

export function selectProjectCommand() {
  return new Command()
    .description("Выбрать текущий проект.")
    .action(async () => {
      try {
        const client = await createClient();
        const [response, error] = await client.get();

        if (error) {
          console.error(
            red(`Не удалось получить список проектов(${error.message})`),
          );
          return;
        }

        const selectedProject = await Select.prompt<string>({
          message: "Выберите проект:",

          options: response!.state.projects!.map((p) => p!.name!),
        });

        await setCurrentProject(selectedProject);

        console.log(green(`Проект '${selectedProject}' успешно выбран.`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
