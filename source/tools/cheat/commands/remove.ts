import { Command } from "@cliffy/command";

const action = async () => {
  Deno.exit(0);
};

const remove = new Command()
  .name("remove")
  .description("remove alias")
  .action(action);

export default {
  command: remove,
  action,
};
