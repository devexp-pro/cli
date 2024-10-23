import { Command } from "../../deps.ts";
import { createClient, getCurrentEnv, getCurrentProject } from "../../api.ts";
import { green, red } from "../../deps.ts";

export function runCommand(cmd: string[]) {
    return new Command()
        .description("Выполнить команду с секретами как переменными окружения.")
        .action(async () => {
            try {
                const project = await getCurrentProject();
                const env = await getCurrentEnv();

                if (!project || !env) {
                    console.error(red("Проект или окружение не выбрано."));
                    return;
                }

                const client = await createClient();
                const response = await client.call("fetchSecrets", [
                    project,
                    env,
                ]);

                if (!response.success) {
                    console.error(
                        red(`Ошибка получения секретов: ${response.error}`),
                    );
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
                const cmds = cmd[0].split(" ");
                const denoCommand = new Deno.Command(cmds[0], {
                    args: cmds.slice(1),
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
