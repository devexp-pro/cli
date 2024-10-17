import { Command } from "@cliffy/command";
import { kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export const logout = new Command()
  .description("Logout from the current session")
  .action(async () => {
    // Проверяем текущую сессию по новому ключу
    const sessionData = await kv.get<
      { sessionId: string; github_username: string }
    >(["auth", "session"]);

    if (!sessionData.value) {
      console.log("No active session found. You are not logged in.");
      return;
    }

    const { sessionId } = sessionData.value;

    const result = await fetch(
      `${SERVICE_URL}/auth/logout?session_id=${sessionId}`,
    );

    if (result.ok) {
      // Удаляем сессию из KV
      await kv.delete(["auth", "session"]);
      console.log("Logged out successfully!");
    } else {
      console.error("Error during logout");
    }
  });
