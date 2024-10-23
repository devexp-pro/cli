import { Command } from "../../deps.ts";
import { createClient } from "../../api.ts";

import { green, red } from "../../deps.ts";
import { Select } from "@cliffy/prompt/select";

export function inviteUserCommand(username: string) {
  return new Command()
    .description("Пригласить пользователя в проект.")
    .action(async () => {
      try {
        const client = await createClient();

        const [response, error] = await client.get();
        if (error) {
          console.error(red(`Ошибка получения проектов: ${error.message}`));
          return;
        }

        const projects = response!.state.projects!.map((p: any) => p!.name!);

        if (projects.length === 0) {
          console.error(red("У вас нет доступных проектов."));
          return;
        }

        const selectedProject = await Select.prompt({
          message: "Выберите проект:",
          options: projects,
        });

        const checkUserResponse = await client.call("checkUserExists", [
          username,
        ]);

        if (!checkUserResponse.success) {
          console.error(
            red(`Пользователь с именем '${username}' не найден.`),
          );
          return;
        }

        const inviteResponse = await client.call("inviteUserToProject", [
          username,
          selectedProject,
        ]);

        if (!inviteResponse.success) {
          console.error(
            red(
              `Не удалось пригласить пользователя в проект: ${inviteResponse.message}`,
            ),
          );
          return;
        }

        console.log(
          green(
            `Пользователь '${username}' успешно приглашен в проект '${selectedProject}'.`,
          ),
        );
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
