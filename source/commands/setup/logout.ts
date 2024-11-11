import { Command } from "@cliffy/command";
import { getSession, kv } from "$/kv";

export const logout = new Command()
  .description("Log out of the CLI")
  .action(async () => {
    const session = await getSession();

    if (!session) {
      console.log("No active session found. You are not logged in.");
      return;
    }

    await kv.delete(["auth", "session"]);
    console.log("Logged out successfully!");

    Deno.exit(0);
  });
