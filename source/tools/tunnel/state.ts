// В state.ts
export interface UpstreamConnection {
  socket: WebSocket;
  timestamp: number;
  meta?: Record<string, any>;
}

export const WebSocketTunnelState = {
  upstreamMap: new Map<string, UpstreamConnection>(),
};
