import { Command } from "@cliffy/command";

const action = async () => {
  Deno.exit(0);
};

const edit = new Command()
  .name("edit")
  .description("edit alias")
  .action(action);

export default {
  command: edit,
  action,
};
