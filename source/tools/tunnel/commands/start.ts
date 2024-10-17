import { connect } from "../connect.ts";
import { WEBSOCKET_URL } from "$/constants";
import { kv } from "$/kv";
import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";

const action = async () => {
  const tunnels = await Array.fromAsync(
    kv.list({ prefix: ["tool", "tunnel", "list"] }),
  );

  const aliasToStart: string = await Select.prompt({
    message: "Please select tunnel:\n",
    options: tunnels.map((entry) => ({
      // @ts-ignore
      name: `${entry.value.alias} ${entry.value.name} ${entry.value.port}`,
      // @ts-ignore
      value: entry.value.alias,
    })),
  });

  connect(WEBSOCKET_URL, aliasToStart);
};

const command = new Command()
  .description("start a tunnel")
  .arguments("<alias:string>")
  .action(
    async (_options: any, ...args: any) => {
      const [alias] = args;
      connect(WEBSOCKET_URL, alias);
    },
  );

export default {
  command,
  action,
};
