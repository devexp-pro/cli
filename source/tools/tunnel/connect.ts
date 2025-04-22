// source/tools/tunnel/connect.ts

import { postToInspector } from "./inspector/inspector.ts";
import { WebSocketTunnelState } from "./state.ts";
import luminous from "@vseplet/luminous";

const log = new luminous.Logger(
  new luminous.OptionsBuilder().setName("TUNNEL_CLI_CONNECT").build(),
);

export function connectTunnel(wsUrl: string, tunnelName: string, port: number) {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;

  const upstreamMap = WebSocketTunnelState.upstreamMap;
  WebSocketTunnelState.tunnelStats = {
    active: false,
    accessible: false,
    connectedUsers: 0,
    tunnelName: tunnelName,
    port: port,
    startTime: Date.now(),
    url: wsUrl,
  };
  function start() {
    ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      reconnectAttempts = 0;
      log.inf(`[cli] ✅ Tunnel connected: ${wsUrl}`);
      // Обновить статус туннеля
      WebSocketTunnelState.tunnelStats.active = true;
      WebSocketTunnelState.tunnelStats.accessible = true;
      postToInspector({
        type: "info",
        source: "cli",
        message: "Tunnel connected",
        meta: { tunnelName, port },
      });

      // Периодически проверять доступность и отправлять статистику
      setupTunnelStatsReporting(ws!);
    };

    ws.onclose = () => {
      log.wrn(`[cli] 🔌 Tunnel closed`);
      WebSocketTunnelState.tunnelStats.active = false;
      WebSocketTunnelState.tunnelStats.accessible = false;
      postToInspector({
        type: "tunnel-stats",
        source: "cli",
        message: "Tunnel stats updated",
        meta: WebSocketTunnelState.tunnelStats,
      });
      reconnect();
    };

    ws.onerror = (e) => {
      log.err(`[cli] ❌ Tunnel error`, e);
      ws?.close();
    };

    ws.onmessage = async (e) => {
      const raw = e.data instanceof Blob
        ? new Uint8Array(await e.data.arrayBuffer())
        : new Uint8Array(e.data);

      const newline = raw.indexOf(10);
      if (newline === -1) {
        log.wrn(
          "[cli] ⚠️ Received raw WS message without metadata (unexpected)",
        );
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

      if (meta.type === "ws-proxy" && meta.clientId && meta.url) {
        if (ws) return handleWebSocketProxy(ws, meta, body, port);
        log.err("[cli] ❌ WebSocket is null, cannot handle proxy");
        return;
      }

      if (meta.clientId && meta.type !== "http") {
        return handleWebSocketResponse(meta.clientId, body);
      }

      if (meta.id && meta.method && meta.url) {
        if (ws) return handleHttpRequest(ws, meta, body, port);
        log.err("[cli] ❌ WebSocket is null, cannot handle HTTP request");
        return;
      }

      log.wrn(`[cli] ⚠️ Unknown meta received`);
    };
  }

  function reconnect() {
    reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);
    log.inf(`[cli] 🔄 Reconnecting in ${delay}ms...`);
    setTimeout(() => start(), delay);
  }

  function handleWebSocketProxy(
    ws: WebSocket,
    meta: any,
    body: Uint8Array,
    port: number,
  ) {
    const clientId = meta.clientId;
    const existing = upstreamMap.get(clientId);

    if (existing?.socket.readyState === WebSocket.OPEN) {
      existing.socket.send(body);
      log.inf(`[cli] ⬆️ Forwarded WS to upstream (existing ${clientId})`);
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
    postToInspector({
      type: "ws-init",
      source: "cli",
      direction: "local-to-cloud",
      message: "Upstream WS opened",
      meta: { clientId, url: meta.url },
    });

    upstream.onopen = () => {
      if (body.length) {
        upstream.send(body);
        log.dbg(`[cli] ⬆️ Initial WS message sent (${body.length} bytes)`);
      }
    };

    upstream.onmessage = async (msg) => {
      const data = await toUint8Array(msg.data);
      const metaBytes = new TextEncoder().encode(
        JSON.stringify({
          clientId,
          timestamp: Date.now(),
        }) + "\n",
      );

      const full = new Uint8Array(metaBytes.length + data.length);
      full.set(metaBytes);
      full.set(data, metaBytes.length);
      ws.send(full);

      postToInspector({
        type: "ws-message",
        source: "cli",
        direction: "local-to-cloud",
        message: "Upstream ➜ Cloud",
        meta: { clientId },
        body: new TextDecoder().decode(data),
      });

      log.inf(`[cli] ⬅️ WS response → cloud (clientId=${clientId})`);
    };

    upstream.onclose = () => {
      upstreamMap.delete(clientId);
      const closeMeta = JSON.stringify({
        type: "close",
        clientId,
        timestamp: Date.now(),
      });
      ws.send(new TextEncoder().encode(closeMeta + "\n"));
      postToInspector({
        type: "ws-close",
        source: "cli",
        direction: "local-to-cloud",
        message: "Upstream WS closed",
        meta: { clientId },
      });
      log.inf(`[cli] 🔒 Upstream WS closed (${clientId})`);
    };

    upstream.onerror = (err) => {
      log.err(`[cli] ❌ Upstream WS error (${clientId})`, err);
    };
  }

  function handleWebSocketResponse(clientId: string, body: Uint8Array) {
    const upstream = upstreamMap.get(clientId);
    if (upstream?.socket.readyState === WebSocket.OPEN) {
      upstream.socket.send(body);
      log.inf(`[cli] ⬆️ Forwarded WS to upstream (${clientId})`);
    } else {
      log.wrn(`[cli] ⚠️ No open upstream for clientId=${clientId}`);
    }
  }

  async function handleHttpRequest(
    ws: WebSocket,
    meta: any,
    body: Uint8Array,
    port: number,
  ) {
    try {
      const start = performance.now();

      const init: RequestInit = {
        method: meta.method,
        headers: meta.headers,
        body: ["GET", "HEAD"].includes(meta.method) ? undefined : body,
      };

      const resp = await fetch(`http://localhost:${port}${meta.url}`, init);
      const end = performance.now();

      const duration = end - start;
      const respBody = new Uint8Array(await resp.arrayBuffer());
      const headers: Record<string, string> = {};
      resp.headers.forEach((v, k) => (headers[k] = v));

      const respMeta = JSON.stringify({
        id: meta.id,
        status: resp.status,
        headers,
      });
      const metaBytes = new TextEncoder().encode(respMeta + "\n");
      const full = new Uint8Array(metaBytes.length + respBody.length);
      full.set(metaBytes);
      full.set(respBody, metaBytes.length);
      ws.send(full);
      postToInspector({
        type: "http",
        source: "cli",
        direction: "local-to-cloud",
        message: "Upstream ➜ Cloud",
        meta: {
          id: meta.id,
          status: resp.status,
          headers,
          method: meta.method,
          url: meta.url,
        },
        body: new TextDecoder().decode(respBody),
      });
      const requestHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(meta.headers || {})) {
        requestHeaders[k] = v as string;
      }

      postToInspector({
        type: "http",
        source: "cli",
        direction: "cloud-to-local",
        message: "Cloud ➜ Upstream",
        meta: {
          ...meta,
          headers: requestHeaders,
          __port: port,
          __duration: duration,
        },
        body: new TextDecoder().decode(body),
      });

      log.inf(`[cli] ⬅️ HTTP response sent (id=${meta.id})`);
    } catch (err) {
      log.err(`[cli] ❌ HTTP proxy error`, err as {});
    }
  }

  async function toUint8Array(
    data: string | Blob | ArrayBuffer,
  ): Promise<Uint8Array> {
    if (typeof data === "string") {
      return new TextEncoder().encode(data);
    } else if (data instanceof Blob) {
      return new Uint8Array(await data.arrayBuffer());
    } else if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    } else {
      log.wrn(`[cli] ❓ Unknown data type: ${typeof data}`);
      return new Uint8Array();
    }
  }
  function setupTunnelStatsReporting(ws: WebSocket) {
    const checkInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(checkInterval);
        return;
      }

      // Проверить доступность туннеля
      checkTunnelAccessibility().then((accessible) => {
        WebSocketTunnelState.tunnelStats.accessible = accessible;
        WebSocketTunnelState.tunnelStats.lastChecked = Date.now();

        // Получить количество подключений (может быть запрос к серверу)
        fetchConnectedUsers().then((count) => {
          WebSocketTunnelState.tunnelStats.connectedUsers = count;

          // Отправить обновленную статистику в инспектор
          postToInspector({
            type: "tunnel-stats",
            source: "cli",
            message: "Tunnel stats updated",
            meta: WebSocketTunnelState.tunnelStats,
          });
        });
      });
    }, 10000); // Проверка каждые 10 секунд
  }

  // Вспомогательная функция для проверки доступности
  async function checkTunnelAccessibility(): Promise<boolean> {
    try {
      // Используем pingUrl вместо wsUrl для HTTP-проверки
      const pingUrl = wsUrl.replace("ws://", "http://").replace(
        "wss://",
        "https://",
      );
      const response = await fetch(pingUrl, { method: "HEAD" });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  // Функция для получения количества подключенных пользователей
  async function fetchConnectedUsers(): Promise<number> {
    // В реальном сценарии это мог бы быть запрос к серверу туннеля
    // Для простоты используем размер upstreamMap как приближение
    return upstreamMap.size;
  }

  start();
}
