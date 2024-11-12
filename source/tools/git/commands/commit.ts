import { Command } from "@cliffy/command";

const action = async () => {
};

const command = new Command()
  .name("commit")
  .description("commit changes to the repository")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });


export default {
  action,
  command,
};
