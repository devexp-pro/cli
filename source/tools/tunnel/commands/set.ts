import { Command } from "@cliffy/command";
import { kv } from "$/kv";

export const set = new Command()
  .description("set subcommand description")
  .arguments("<alias:string> <tunnel_name:string> <port:number>")
  // .example("set tunnel", "pp set sevapp 8000")
  .action(async (_options: any, ...args: [any, any, any]) => {
    const [alias, name, port] = args;
    const res = await kv.set(["tool", "tunnel", "list", alias], {
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
