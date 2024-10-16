import { Command } from "@cliffy/command";
import { kv } from "$/kv";

export const remove = new Command()
  .description("remove subcommand description")
  .arguments("<tunnel_name:string>")
  .action(async (_options: any, ...args: [any]) => {
    const [name] = args;
    await kv.delete(["tool", "tunnel", "list", name]);
    console.log(`  Tunnel ${name} has been removed!`);
    Deno.exit(0);
  });
