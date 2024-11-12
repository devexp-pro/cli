import { Command } from "@cliffy/command";

const action = async () => {
  Deno.exit(0);
};

const show = new Command()
  .name("show")
  .description("show alias")
  .action(action);

export default {
  command: show,
  action,
};
