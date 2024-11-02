import { Command } from "@cliffy/command";

const action = async () => {
};

const command = new Command()
  .name("init")
  .description("init project description")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

export default {
  action,
  command,
};
