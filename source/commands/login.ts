import { Command } from "@cliffy/command";
import { open } from "x/open";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export const login = new Command()
  .description("Login via GitHub OAuth")
  .action(async () => {
    try {
      // Ищем сессии, хранящиеся по ключу ["auth", "session"]
      const sessionData = await kv.get<
        { sessionId: string; github_username: string }
      >(["auth", "session"]);

      if (sessionData.value) {
        const { sessionId, github_username } = sessionData.value;
        console.log(
          `You are already logged in as ${github_username} with sessionId: ${sessionId}.`,
        );
        return;
      }

      const authToken = crypto.randomUUID();
      console.log(`Generated UUID for auth_token: ${authToken}`);

      const url = `${SERVICE_URL}/auth/login?auth_token=${authToken}`;
      console.log(`Opening browser with URL: ${url}`);
      await open(url, { wait: false });
      console.log("Открыт браузер для авторизации через GitHub...");

      const result = await fetch(
        `${SERVICE_URL}/auth/wait-for-login?auth_token=${authToken}`,
      );

      if (result.ok) {
        const responseJson = await result.json();
        const { sessionId, githubUsername, uuid } = responseJson;

        console.log(
          `Received from server: sessionId: ${sessionId}, githubUsername: ${githubUsername}`,
        );

        // Сохраняем данные сессии в новый ключ
        await kv.set(["auth", "session"], {
          sessionId,
          github_username: githubUsername,
        });

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
