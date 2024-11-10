import { Command } from "@cliffy/command";
import { login } from "./login.ts";
import { logout } from "./logout.ts";
import { upgrade } from "./upgrade.ts";

export const setup = new Command()
  .description("login, upgrade and more")
  .action(async (_options: any, ..._args: any) => {
    setup.showHelp();
    Deno.exit(0);
  })
  .command("login", login)
  .command("logout", logout)
  .command("upgrade", upgrade);