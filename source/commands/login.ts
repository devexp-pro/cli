import { Command } from "@cliffy/command";
import { open } from "https://deno.land/x/open/index.ts";
import { kv } from "$/shared";

export const login = new Command()
  .description("Login via GitHub OAuth")
  .action(async () => {
    try {
      const sessionData = kv.list<{}>({ prefix: ["auth"] });
      let sessionDataArray = <any> [];
      for await (const entry of sessionData) {
        sessionDataArray.push(entry);
      }

      if (sessionDataArray.length > 0) {
        const sessionId = sessionDataArray[0].key[1];
        const githubUsername = sessionDataArray[0].value.github_username;

        console.log(
          `You are already logged in as ${githubUsername} with sessionId: ${sessionId}.`,
        );
        return;
      }

      const authToken = crypto.randomUUID();
      console.log(`Generated UUID for auth_token: ${authToken}`);

      const url = `http://localhost:8000/login?auth_token=${authToken}`;
      console.log(`Opening browser with URL: ${url}`);
      await open(url, { wait: false });
      console.log("Открыт браузер для авторизации через GitHub...");

      const result = await fetch(
        `http://localhost:8000/wait-for-login?auth_token=${authToken}`,
      );

      if (result.ok) {
        const responseJson = await result.json();
        const { sessionId, githubUsername, uuid } = responseJson;

        console.log(
          `Received from server: sessionId: ${sessionId}, githubUsername: ${githubUsername}`,
        );
        await kv.set(["auth", sessionId], {
          github_username: githubUsername,
          uuid,
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
