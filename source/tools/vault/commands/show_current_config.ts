import { Command } from "../deps.ts";
import { getCurrentEnv, getCurrentProject } from "../client/utils/config.ts";
import { green, red, yellow } from "../deps.ts";

export function showCurrentConfigCommand() {
  return new Command()
    .description(
      "Показать текущий проект и окружение (без обращения к серверу).",
    )
    .action(async () => {
      try {
        const project = await getCurrentProject();
        const env = await getCurrentEnv();

        if (!project) {
          console.log(yellow("Текущий проект не выбран."));
        } else {
          console.log(green(`Текущий проект: ${project}`));
        }

        if (!env) {
          console.log(yellow("Текущее окружение не выбрано."));
        } else {
          console.log(green(`Текущее окружение: ${env}`));
        }
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
