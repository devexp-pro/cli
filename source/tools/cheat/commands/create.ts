import { Command } from "@cliffy/command";

const action = async () => {
  Deno.exit(0);
};

const create = new Command()
  .name("create")
  .description("create alias")
  .action(action);

export default {
  command: create,
  action,
};
