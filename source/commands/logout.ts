import { Command } from "@cliffy/command";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";
interface SessionData {
  github_username: string;
}

export const logout = new Command()
  .description("Logout from the current session")
  .action(async () => {
    const sessionData = kv.list<SessionData>({ prefix: ["auth"] });
    let sessionDataArray: Array<{ key: string[]; value: SessionData }> = [];

    for await (const entry of sessionData) {
      //@ts-ignore
      sessionDataArray.push(entry);
    }

    if (sessionDataArray.length === 0) {
      console.log("No active session found. You are not logged in.");
      return;
    }

    const sessionId = sessionDataArray[0].key[1];

    const result = await fetch(
      `${SERVICE_URL}/auth/logout?session_id=${sessionId}`,
    );

    if (result.ok) {
      await kv.delete(["auth", sessionId]);
      console.log("Logged out successfully!");
    } else {
      console.error("Error during logout");
    }
  });
