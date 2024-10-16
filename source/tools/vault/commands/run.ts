import { Command } from "../deps.ts";
import { createClient, getCurrentEnv, getCurrentProject } from "../api.ts";
import { green, red } from "../deps.ts";

export function runCommand() {
  return new Command()
    .description("Выполнить команду с секретами как переменными окружения.")
    .arguments("<command...:string>")
    .action(async (_options: any, ...command: string[]) => {
      try {
        const project = await getCurrentProject();
        const env = await getCurrentEnv();

        if (!project || !env) {
          console.error(red("Проект или окружение не выбрано."));
          return;
        }

        const client = await createClient();
        const response = await client.call("fetchSecrets", [project, env]);

        if (!response.success) {
          console.error(red(`Ошибка получения секретов: ${response.error}`));
          return;
        }

        const { secrets } = response;

        if (Object.keys(secrets).length === 0) {
          console.log(
            green(
              `Нет секретов в окружении '${env}' проекта '${project}'.`,
            ),
          );
          return;
        }

        const cmd = command.join(" ");
        const denoCommand = new Deno.Command("sh", {
          args: ["-c", cmd],
          env: { ...Deno.env.toObject(), ...secrets },
          stdout: "inherit",
          stderr: "inherit",
        });

        const { success } = await denoCommand.output();

        if (success) {
          console.log(green("Команда успешно выполнена."));
        } else {
          console.error(red("Команда завершилась с ошибкой."));
          Deno.exit(1);
        }
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
