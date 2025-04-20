import luminous from "@vseplet/luminous";
import { serveFile } from "https://deno.land/std@0.203.0/http/file_server.ts";

const log = new luminous.Logger(
  new luminous.OptionsBuilder().setName("TUNNEL_CLI_INSPECTOR").build(),
);

let clients = new Set<WebSocket>();

export function serveInspector(port = 5050) {
  log.inf(`Starting Inspector server on port ${port}`);
  Deno.serve({ port }, handler);
  log.inf(`🔎 Inspector available at http://localhost:${port}`);
}

async function handler(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    clients.add(socket);
    socket.onclose = () => {
      clients.delete(socket);
      log.inf("Inspector WS client closed");
    };
    socket.onerror = (err) => {
      log.err("Inspector WS error", err);
    };
    return response;
  }

  return serveFile(req, `${import.meta.dirname}/inspector.html`);
}

type InspectorEntry = {
  type: "http" | "info" | "error" | "ws-init" | "ws-message" | "ws-close";
  source: string;
  message: string;
  meta?: any;
  body?: string;
  direction?: "cloud-to-local" | "local-to-cloud";
};

export function postToInspector(entry: InspectorEntry) {
  const payload = JSON.stringify({
    ...entry,
    time: new Date().toISOString(),
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        log.err("Failed to send to inspector WS client", err as Error);
      }
    }
  }
}
