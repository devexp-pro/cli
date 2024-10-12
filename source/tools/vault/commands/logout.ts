import { Command } from "../deps.ts";
import { getToken, removeToken } from "../client/utils/config.ts";
import { green, red, yellow } from "../deps.ts";

export function logoutCommand() {
  return new Command()
    .description("Удалить сохранённый токен и окружение, показав токен.")
    .option("-a, --all", "Удалить и токен, и окружение.", { default: false })
    .action(async (options) => {
      try {
        const token = await getToken();
        if (!token) {
          console.error(red("Токен не найден."));
          Deno.exit(1);
        }

        console.log(yellow(`Ваш текущий токен: ${token}`));

        if (options.all) {
          await removeToken();
          console.log(green("Токен и окружение успешно удалены."));
        } else {
          await removeToken();
          console.log(green("Токен успешно удалён."));
        }
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
