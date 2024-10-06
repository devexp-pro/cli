import { Command } from "@cliffy/command";
import { connect } from "../connect.ts";
import { kv } from "../kv.ts";
import { WEBSOCKET_URL } from "$/constants";

export const start = new Command()
  .description("start subcommand description")
  .arguments("<alias:string>")
  .action(async (_options, ...args) => {
    const [alias] = args;
    const data = (await kv.get(["tunnels", args[0]])).value as any;

    connect(WEBSOCKET_URL, alias);
  });
