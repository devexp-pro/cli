import { Command } from "../deps.ts";
import { saveToken } from "../client/utils/config.ts";
import { green, red } from "../deps.ts";

export function loginCommand() {
  return new Command()
    .description("Сохранить токен для аутентификации.")
    .arguments("<token:string>")
    .action(async (options, token: string) => {
      try {
        await saveToken(token);
        console.log(green("Токен успешно сохранён."));
      } catch (error) {
        console.error(
          red(`Ошибка при сохранении токена: ${(error as Error).message}`),
        );
      }
    });
}
