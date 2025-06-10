import luminous from "@vseplet/luminous";
import { html } from "$/tools/tunnel/inspector/inspector-body.ts";
import { WebSocketTunnelState } from "$/tools/tunnel/state.ts";

const log = new luminous.Logger(
  new luminous.OptionsBuilder().setName("TUNNEL_INSPECTOR").build(),
);

let clients = new Set<WebSocket>();

export function serveInspector() {
  const server = Deno.serve({ port: 0 }, handler);
  log.inf(`🔎 Inspector available at http://localhost:${server.addr.port}`);
}

async function handler(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);
  if (pathname === "/tunnel-stats") {
    return new Response(JSON.stringify(WebSocketTunnelState.tunnelStats), {
      headers: { "Content-Type": "application/json" },
    });
  }
  if (pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    clients.add(socket);
    socket.onclose = () => clients.delete(socket);
    socket.onerror = (e) => log.err("Inspector WS error", e);
    return response;
  }

  if (pathname === "/__replay__" && req.method === "POST") {
    try {
      const { meta, body } = await req.json();
      if (!meta.id) meta.id = "__retry__" + crypto.randomUUID();
      const port = meta.__port || 3000;

      const init: RequestInit = {
        method: meta.method,
        headers: meta.headers,
        body: ["GET", "HEAD"].includes(meta.method) ? undefined : body,
      };

      const retryUrl = `http://localhost:${port}${meta.url}`;
      const start = performance.now();
      const retryResp = await fetch(retryUrl, init);
      const retryBody = await retryResp.text();
      const end = performance.now();
      const duration = end - start;

      // Отправляем запрос в инспектор
      postToInspector({
        type: "http",
        source: "inspector",
        direction: "cloud-to-local",
        message: "Retry ➜ Upstream",
        meta: {
          ...meta,
          __duration: duration,
        },
        body,
      });

      // Отправляем ответ в инспектор
      postToInspector({
        type: "http",
        source: "inspector",
        direction: "local-to-cloud",
        message: "Upstream ➜ Retry Response",
        meta: {
          id: meta.id, // Используем тот же ID что и для запроса
          status: retryResp.status,
          headers: Object.fromEntries(retryResp.headers.entries()),
          method: meta.method,
          url: meta.url,
        },
        body: retryBody,
      });

      return new Response("OK", { status: 200 });
    } catch (err) {
      log.err("[inspector] Retry failed", err as Error);
      return new Response("Retry failed", { status: 500 });
    }
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

type InspectorEntry = {
  type:
    | "http"
    | "info"
    | "error"
    | "ws-init"
    | "ws-message"
    | "ws-close"
    | "tunnel-stats";
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
        log.err("Failed to send to WS", err as Error);
      }
    }
  }
}
