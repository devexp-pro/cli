import { Command } from "@cliffy/command";

const create = new Command()
  .name("create")
  .description("create git profile")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const edit = new Command()
  .name("edit")
  .description("edit git profile")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const remove = new Command()
  .name("remove")
  .description("remove git profile")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const list = new Command()
  .name("list")
  .description("list git profiles")
  .action(async (_options: any, ..._args: any) => {
    Deno.exit(0);
  });

const action = async () => {
};

const command = new Command()
  .name("profile")
  .description("update or create git profile")
  .action(async (_options: any, ..._args: any) => {
    command.showHelp();
    Deno.exit(0);
  })
  .command("create", create)
  .command("edit", edit)
  .command("remove", remove)
  .command("list", list);


export default {
  action,
  command,
};
