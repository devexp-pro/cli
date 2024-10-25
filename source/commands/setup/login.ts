import { Command } from "@cliffy/command";
import { open } from "x/open";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export const login = new Command()
  .description("Authenticate to DevExp")
  .action(async () => {
    try {
      const sessionData = await kv.get<
        { sessionId: string; username: string; userId: string }
      >(["auth", "session"]);

      if (sessionData.value) {
        const { sessionId, username } = sessionData.value;
        console.log(
          `You are already logged in as ${username} with sessionId: ${sessionId}.`,
        );
        return;
      }

      const loginToken = crypto.randomUUID();
      console.log(`Generated UUID for loginToken: ${loginToken}`);

      const url = `${SERVICE_URL}/auth/login?loginToken=${loginToken}`;
      console.log(`Opening browser with URL: ${url}`);

      try {
        await open(url, { wait: false });
      } catch {
        console.log(`URL: ${url}`);
      }

      console.log(
        "The browser has been opened for authentication via GitHub...",
      );

      const result = await fetch(
        `${SERVICE_URL}/auth/wait-for-login?loginToken=${loginToken}`,
      );

      if (result.ok) {
        const responseJson = await result.json();
        const { sessionId, username, userId } = responseJson;

        console.log(
          `Received from server: sessionId: ${sessionId}, username: ${username}`,
        );

        await kv.set(["auth", "session"], {
          sessionId,
          username,
          userId,
        });

        console.log(
          `Successful auth! Username: ${username}, sessionId: ${sessionId}`,
        );
      } else {
        console.error("Authorization error");
      }
    } catch (error) {
      console.error("Error during auth process:", error);
    }
  });
