import { Command } from "@cliffy/command";

export const init = new Command()
  .name("init")
  .description("init project description")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });
