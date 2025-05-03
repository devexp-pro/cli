export interface TunnelStats {
  active: boolean;
  accessible: boolean;
  connectedUsers: number;
  tunnelName: string;
  port: number;
  startTime?: number;
  lastChecked?: number;
  url?: string;
}
export interface UpstreamConnection {
  socket: WebSocket; // WebSocket-соединение с локальным сервером
  timestamp: number; // Временная метка создания соединения
  meta?: Record<string, any>; // Метаданные о соединении
}

export const WebSocketTunnelState = {
  upstreamMap: new Map<string, UpstreamConnection>(),
  tunnelStats: {
    active: false,
    accessible: false,
    connectedUsers: 0,
    tunnelName: "",
    port: 0,
    startTime: 0,
    lastChecked: 0,
    url: "",
  } as TunnelStats,
};
