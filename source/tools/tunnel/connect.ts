// source/tools/tunnel/connect.ts
import { postToInspector } from "./inspector/inspector.ts";
import { WebSocketTunnelState } from "./state.ts";
import luminous from "@vseplet/luminous";

const log = new luminous.Logger(
  new luminous.OptionsBuilder().setName("TUNNEL_CLI_CONNECT").build(),
);

export function connectTunnel(wsUrl: string, tunnelName: string, port: number) {
  const ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";
  const upstreamMap = WebSocketTunnelState.upstreamMap;

  postToInspector({
    type: "info",
    source: "cli",
    message: "Tunnel connected",
    meta: { tunnelName, port },
  });

  ws.onmessage = async (e) => {
    const raw = e.data instanceof Blob
      ? new Uint8Array(await e.data.arrayBuffer())
      : new Uint8Array(e.data);

    const newline = raw.indexOf(10);
    if (newline === -1) {
      log.wrn("[cli] ⚠️ Received raw WS message without metadata (unexpected)");
      return;
    }

    const metaBytes = raw.slice(0, newline);
    const body = raw.slice(newline + 1);
    const metaStr = new TextDecoder().decode(metaBytes).trim();

    let meta: any;
    try {
      meta = JSON.parse(metaStr);
    } catch (err) {
      log.err(`[cli] ❌ Invalid JSON meta from cloud`, err as {});
      return;
    }

    const clientId = meta.clientId;

    // 🔄 Инициализация нового WS-клиента
    if (meta.type === "ws-proxy" && clientId && meta.url) {
      if (upstreamMap.has(clientId)) {
        const upstream = upstreamMap.get(clientId);
        if (upstream?.socket.readyState === WebSocket.OPEN) {
          upstream.socket.send(body);
          log.inf(`[cli] ⬆️ Forwarded WS to upstream (existing ${clientId})`);
        } else {
          log.wrn(`[cli] ⚠️ Upstream closed for clientId=${clientId}`);
        }
        return;
      }

      const upstream = new WebSocket(`ws://localhost:${port}${meta.url}`);
      upstream.binaryType = "arraybuffer";
      upstreamMap.set(clientId, {
        socket: upstream,
        timestamp: Date.now(),
        meta,
      });

      log.inf(`[cli] ⬆️ Opened upstream WS for clientId=${clientId}`);

      upstream.onopen = () => {
        if (body.length) {
          upstream.send(body);
          log.dbg(`[cli] ⬆️ Initial WS message sent (${body.length} bytes)`);
        }
      };

      upstream.onmessage = async (msg) => {
        let data: Uint8Array;

        if (typeof msg.data === "string") {
          data = new TextEncoder().encode(msg.data);
        } else if (msg.data instanceof Blob) {
          data = new Uint8Array(await msg.data.arrayBuffer());
        } else if (msg.data instanceof ArrayBuffer) {
          data = new Uint8Array(msg.data);
        } else {
          console.warn(
            "Unsupported WebSocket message data type:",
            typeof msg.data,
          );
          data = new Uint8Array(); // fail-safe
        }

        // ✅ Оборачиваем только в meta, проксируем только body
        const meta = { clientId, timestamp: Date.now() };
        const metaBytes = new TextEncoder().encode(JSON.stringify(meta) + "\n");

        const full = new Uint8Array(metaBytes.length + data.length);
        full.set(metaBytes);
        full.set(data, metaBytes.length);

        ws.send(full);
        log.inf(`[cli] ⬅️ WS response → cloud (clientId=${clientId})`);
      };

      upstream.onclose = () => {
        upstreamMap.delete(clientId);
        const meta = { clientId, type: "close", timestamp: Date.now() };
        ws.send(new TextEncoder().encode(JSON.stringify(meta) + "\n"));
        log.inf(`[cli] 🔒 Upstream WS closed (${clientId})`);
      };

      upstream.onerror = (err) => {
        log.err(`[cli] ❌ Upstream WS error (${clientId})`, err);
      };

      return;
    }

    // ➕ Прокси обычного WS-сообщения (без type)
    if (clientId && meta.type !== "http") {
      const upstream = upstreamMap.get(clientId);
      if (upstream?.socket.readyState === WebSocket.OPEN) {
        upstream.socket.send(body);
        log.inf(`[cli] ⬆️ Forwarded WS to upstream (${clientId})`);
      } else {
        log.wrn(`[cli] ⚠️ No open upstream for clientId=${clientId}`);
      }
      return;
    }

    // 🧾 HTTP-прокси
    if (meta.id && meta.method && meta.url) {
      try {
        const init: RequestInit = {
          method: meta.method,
          headers: meta.headers,
          body: ["GET", "HEAD"].includes(meta.method) ? undefined : body,
        };

        const response = await fetch(
          `http://localhost:${port}${meta.url}`,
          init,
        );
        const bodyBuf = new Uint8Array(await response.arrayBuffer());
        const headers: Record<string, string> = {};
        response.headers.forEach((v, k) => (headers[k] = v));

        const respMeta = JSON.stringify({
          id: meta.id,
          status: response.status,
          headers,
        });
        const respMetaBytes = new TextEncoder().encode(respMeta + "\n");

        const full = new Uint8Array(respMetaBytes.length + bodyBuf.length);
        full.set(respMetaBytes);
        full.set(bodyBuf, respMetaBytes.length);

        ws.send(full);
        log.inf(`[cli] ⬅️ HTTP response sent (id=${meta.id})`);
      } catch (err) {
        log.err(`[cli] ❌ HTTP proxy error`, err as {});
      }
      return;
    }

    log.wrn(`[cli] ⚠️ Unknown meta received`);
  };

  ws.onopen = () => log.inf(`[cli] ✅ Tunnel connected: ${wsUrl}`);
  ws.onclose = () => log.inf(`[cli] 🔌 Tunnel closed`);
  ws.onerror = (e) => log.err(`[cli] ❌ Tunnel error`, e);
}
