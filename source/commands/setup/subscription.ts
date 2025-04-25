import { Command } from "@cliffy/command";

export const subscription = new Command()
  .description("Manage your subscription")
  .action(async () => {
    Deno.exit(0);
  });
