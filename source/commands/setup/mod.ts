import { Command } from "@cliffy/command";
import { login } from "./login.ts";
import { logout } from "./logout.ts";
import { update } from "$/commands/setup/update.ts";
import { subscription } from "$/commands/setup/subscription.ts";

export const setup = new Command()
  .name("setup")
  .description("Login, subscription, update and more")
  .action(async (_options: any, ..._args: any) => {
    setup.showHelp();
    Deno.exit(0);
  })
  .command("login", login)
  .command("subscription", subscription)
  .command("update", update)
  .command("logout", logout);
