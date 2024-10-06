import { Command } from "../../deps.ts";
import { kv } from "../kv.ts";

export const set = new Command()
  .description("set subcommand description")
  .arguments("<alias:string> <tunnel_name:string> <port:number>")
  // .example("set tunnel", "pp set sevapp 8000")
  .action(async (_options, ...args) => {
    const [alias, name, port] = args;
    const res = await kv.set(["tunnels", alias], {
      alias,
      name,
      port,
    });

    if (res.ok) {
      Deno.exit(0);
    } else {
      Deno.exit(-1);
    }
  });
