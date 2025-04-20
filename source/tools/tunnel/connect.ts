// source/tools/tunnel/connectTunnel.ts

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

  ws.onopen = () => {
    log.inf(`[cli] ✅ Tunnel connected: ${wsUrl}`);
    postToInspector({
      type: "info",
      source: "cli",
      message: "Tunnel connected",
      meta: { tunnelName, port },
    });
  };

  ws.onclose = () => log.inf(`[cli] 🔌 Tunnel closed`);
  ws.onerror = (e) => log.err(`[cli] ❌ Tunnel error`, e);

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

    postToInspector({
      type: "ws-message",
      source: "cli",
      direction: "cloud-to-local",
      message: "Cloud ➜ Upstream",
      meta,
      body: new TextDecoder().decode(body),
    });

    if (meta.type === "ws-proxy" && meta.clientId && meta.url) {
      return handleWebSocketProxy(ws, meta, body, port);
    }

    if (meta.clientId && meta.type !== "http") {
      return handleWebSocketResponse(meta.clientId, body);
    }

    if (meta.id && meta.method && meta.url) {
      return handleHttpRequest(ws, meta, body, port);
    }

    log.wrn(`[cli] ⚠️ Unknown meta received`);
  };

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
        meta,
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
      const init: RequestInit = {
        method: meta.method,
        headers: meta.headers,
        body: ["GET", "HEAD"].includes(meta.method) ? undefined : body,
      };

      const resp = await fetch(`http://localhost:${port}${meta.url}`, init);
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
}
