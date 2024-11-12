import { Command } from "@cliffy/command";

const action = async () => {
  Deno.exit(0);
};

const list = new Command()
  .name("list")
  .description("list alias")
  .action(action);

export default {
  command: list,
  action,
};
