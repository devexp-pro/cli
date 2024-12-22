import { Command } from "@cliffy/command";
import { open } from "x/open";
import { getSession, setSessionWithExpiration } from "$/providers/session.ts";
import { SERVICE_URL } from "$/constants";

export const login = new Command()
  .description("Authenticate to DevExp")
  .action(async () => {
    try {
      const session = await getSession();

      if (session) {
        console.log(
          `You are already logged in as ${session.email}`,
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
        `${SERVICE_URL}/auth/wait-for-complete?loginToken=${loginToken}`,
      );

      if (result.ok) {
        const responseJson = await result.json();
        const { key, email, id, username } = responseJson;

        console.log(
          `Received from server: sessionKey: ${key}, email: ${email}, id: ${id}`,
        );

        await setSessionWithExpiration({ key, email, id, username });
      } else {
        console.error("Authorization error");
      }
    } catch (error) {
      console.error("Error during auth process:", error);
    }

    Deno.exit(0);
  });
