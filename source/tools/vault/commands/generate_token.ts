import { Command } from "../deps.ts";
import { generateToken } from "../client/utils/api.ts";
import { getToken, removeToken, saveToken } from "../client/utils/config.ts";
import { green, red, yellow } from "../deps.ts";
export function generateTokenCommand() {
  return new Command()
    .description("Сгенерировать новый токен для аутентификации.")
    .arguments("<userId:string>")
    .option(
      "--reset",
      "Сбросить локально сохранённый токен, если он не существует в базе данных.",
    )
    .action(async (options, userId: string) => {
      try {
        const token = await getToken();

        if (options.reset && token) {
          console.log(yellow("Сбрасываем локальный токен..."));
          await removeToken();
          console.log(green("Локальный токен успешно сброшен."));
        }

        const result = await generateToken(userId);
        await saveToken(result);
        console.log(green(`Токен успешно создан и сохранён: ${result}`));
      } catch (error) {
        console.error(red(`Ошибка: ${(error as Error).message}`));
      }
    });
}
