import { Command } from "@cliffy/command";

export const update = new Command()
  .description("Update the CLI")
  .action(async () => {
    Deno.exit(0);
  });
