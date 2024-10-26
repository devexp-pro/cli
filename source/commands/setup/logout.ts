import { Command } from "@cliffy/command";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export const logout = new Command()
  .description("Log out of the CLI")
  .action(async () => {
    const sessionData = await kv.get<
      { sessionId: string; username: string; userId: string }
    >(["auth", "session"]);

    if (!sessionData.value) {
      console.log("No active session found. You are not logged in.");
      return;
    }

    const { sessionId } = sessionData.value;

    const result = await fetch(
      `${SERVICE_URL}/auth/logout?sessionId=${sessionId}`,
    );

    if (result.ok) {
      await kv.delete(["auth", "session"]);
      console.log("Logged out successfully!");
    } else {
      console.error("Error during logout");
    }
  });
