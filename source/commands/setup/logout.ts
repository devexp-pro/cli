import { Command } from "@cliffy/command";
import { getSession, kv } from "$/kv";
import { SERVICE_URL } from "$/constants";

export const logout = new Command()
  .description("Log out of the CLI")
  .action(async () => {
    const session = await getSession();

    if (!session) {
      console.log("No active session found. You are not logged in.");
      return;
    }

    const result = await fetch(
      `${SERVICE_URL}/auth/logout`,
      {
        headers: {
          Identifier: session.id,
          Authorization: session.key,
        },
      },
    );

    if (result.ok) {
      await kv.delete(["auth", "session"]);
      console.log("Logged out successfully!");
    } else {
      console.error("Error during logout");
    }
  });
