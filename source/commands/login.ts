import { Command } from "@cliffy/command";
import { open } from "https://deno.land/x/open/index.ts";

// Подключаемся к локальному хранилищу KV
const kv = await Deno.openKv("ololo");

// Команда для авторизации
export const login = new Command()
  .description("Login via GitHub OAuth")
  .action(async () => {
    try {
      // Генерация соли (UUID)
      const authToken = crypto.randomUUID();
      console.log(`Generated UUID for auth_token: ${authToken}`);

      // Открываем браузер с URL для авторизации через GitHub
      const url = `http://localhost:8000/login?auth_token=${authToken}`;
      console.log(`Opening browser with URL: ${url}`);
      await open(url, { wait: false });
      console.log("Открыт браузер для авторизации через GitHub...");

      // Отправляем запрос на сервер с этим UUID, который будет ожидать завершения авторизации
      console.log(
        `Sending wait-for-login request with auth_token: ${authToken}`,
      );
      const result = await fetch(
        `http://localhost:8000/wait-for-login?auth_token=${authToken}`,
      );

      if (result.ok) {
        const responseJson = await result.json();
        const { sessionId, githubUsername } = responseJson;

        // Сохраняем sessionId и githubUsername в локальном KV
        console.log(
          `Received from server: sessionId: ${sessionId}, githubUsername: ${githubUsername}`,
        );
        await kv.set(["auth", sessionId], { github_username: githubUsername });
        console.log(
          `Успешная авторизация! Username: ${githubUsername}, sessionId: ${sessionId}`,
        );
      } else {
        console.error("Ошибка авторизации");
      }
    } catch (error) {
      console.error("Error during login process:", error);
    }
  });
