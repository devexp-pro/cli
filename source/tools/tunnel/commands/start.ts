import { SERVICE_DOMAIN, WEBSOCKET_URL } from "$/constants";
import { kv } from "$/repositories/kv.ts";
import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import luminous from "@vseplet/luminous";
import { serveInspector } from "$/tools/tunnel/inspector/inspector.ts";

import { connectTunnel } from "../connect.ts";

const log = new luminous.Logger(
  new luminous.OptionsBuilder().setName("TUNNEL_CLI").build(),
);

async function startTunnel(alias: string) {
  const info = await kv.get(["tool", "tunnel", "list", alias]);
  const tunnel = info.value as { name: string; port: number };
  const wsUrl = `${WEBSOCKET_URL}/wss/${tunnel.name}`;
  const port = tunnel.port;

  connectTunnel(wsUrl, tunnel.name, port);
  serveInspector();

  log.inf(`🌐 HTTP:  http://${tunnel.name}.${SERVICE_DOMAIN}`);
  log.inf(`🔌 WS:    ws://${tunnel.name}.${SERVICE_DOMAIN}`);
}

// CLI action с выбором из KV
const action = async () => {
  const tunnels = await Array.fromAsync(
    kv.list({ prefix: ["tool", "tunnel", "list"] }),
  );

  const alias = await Select.prompt({
    message: "Please select tunnel:\n",
    options: tunnels.map((entry) => ({
      // @ts-ignore
      name: `${entry.value.alias} ${entry.value.name} ${entry.value.port}`,
      // @ts-ignore
      value: entry.value.alias,
    })),
  });

  await startTunnel(alias);
};

const command = new Command()
  .description("start a tunnel")
  .arguments("<alias:string>")
  .action(async (_options: any, alias: string) => {
    await startTunnel(alias);
  });

export default {
  command,
  action,
};
