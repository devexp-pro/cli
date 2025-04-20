import { component, html, styled } from "@vseplet/morph";

export const InspectorPage = component(() =>
  html`
  <div x-data="inspectorUI" x-init="init()" class=${styled`
    font-family: monospace;
    background: #0b0b0b;
    color: #eee;
    padding: 1rem;
    min-height: 100vh;
  `}>
    <h2 class=${styled`
      color: #00ff80;
      font-size: 1.4em;
      margin-bottom: 1rem;
    `}>📡 Tunnel Inspector</h2>

    <div class=${styled`
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    `}>
      <template x-for="type in types">
        <label class=${styled`cursor: pointer;`}>
          <input type="checkbox" x-model="filters[type]" />
          <span x-text="type"></span>
        </label>
      </template>
      
      <button @click="clearLog" class=${styled`
        background: #333;
        color: #fff;
        border: none;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        margin-left: auto;
      `}>Clear</button>
    </div>

    <div id="log" x-ref="log"></div>

    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.data('inspectorUI', () => ({
          log: null,
          entries: {},
          filters: {
            'info': true,
            'error': true,
            'http': true,
            'ws-init': true,
            'ws-message': true,
          },
          types: ['info', 'error', 'http', 'ws-init', 'ws-message'],
          
          clearLog() {
            this.log.innerHTML = '';
            this.entries = {};
          },
          
          init() {
            this.log = this.$refs.log;
            const ws = new WebSocket("ws://" + location.host + "/ws");

            ws.onmessage = (e) => {
              const { type, source, time, message, meta, body } = JSON.parse(e.data);
              if (!this.filters[type]) return;

              // Определяем ID для группировки сообщений
              const id = meta?.id || meta?.clientId || Math.random().toString(36).substring(2, 8);
              
              // Определяем направление сообщения
              const isIncoming = message.includes("➜ Upstream");
              
              // Определяем тип протокола (HTTP или WebSocket)
              const protocol = type.startsWith('ws') ? 'ws' : (type === 'http' ? 'http' : 'system');
              
              if (!this.entries[id]) {
                let tagClass, tagLabel;
                
                if (protocol === 'http') {
                  const method = (meta?.method?.toLowerCase?.()) || "http";
                  tagClass = "type-" + method;
                  tagLabel = meta?.method ? "[" + meta.method + "]" : "[HTTP]";
                } else if (protocol === 'ws') {
                  tagClass = "type-ws";
                  tagLabel = type === "ws-init" ? "[WS-INIT]" : "[WS]";
                } else {
                  tagClass = "type-" + type;
                  tagLabel = "[" + type.toUpperCase() + "]";
                }

                const wrapper = document.createElement("div");
                wrapper.className = "pair-entry " + protocol + "-entry";
                wrapper.id = \`pair-\${id}\`;
                wrapper.innerHTML = \`
                  <div class="pair-header">
                    <div class="pair-header-left">
                      <span class="tag \${tagClass}">\${tagLabel}</span>
                      <span class="id-badge" title="Connection ID">\${id}</span>
                      <span class="protocol-badge">\${protocol.toUpperCase()}</span>
                      \${protocol === 'ws' ? '<span class="ws-badge">WebSocket</span>' : ''}
                    </div>
                    <div class="pair-header-right">
                      <span class="time">\${new Date(time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div class="pair-content">
                    <div class="half left"><div class="dir">← Cloud ➜ Upstream</div></div>
                    <div class="half right"><div class="dir">← Upstream ➜ Cloud</div></div>
                  </div>
                \`;
                this.entries[id] = { wrapper, messages: new Set() };
                this.log.prepend(wrapper); // Новые сообщения сверху
              }

              const entry = this.entries[id];
              const slot = isIncoming
                ? entry.wrapper.querySelector(".left")
                : entry.wrapper.querySelector(".right");

              const key = \`\${type}::\${message}::\${JSON.stringify(meta)}::\${body?.substring(0, 50)}\`;
              if (entry.messages.has(key)) return;
              entry.messages.add(key);

              const msg = document.createElement("div");
              msg.className = "entry-block " + type + "-block";
              
              let metaDisplay = '';
              if (meta) {
                if (protocol === 'ws') {
                  // Специальное форматирование для WebSocket метаданных
                  const wsInfo = [];
                  if (meta.clientId) wsInfo.push(\`clientId: <span class="highlight">\${meta.clientId}</span>\`);
                  if (meta.type) wsInfo.push(\`type: <span class="highlight">\${meta.type}</span>\`);
                  
                  const wsHeaders = meta.headers ? Object.entries(meta.headers)
                    .filter(([k, v]) => k.toLowerCase() === 'upgrade' || k.toLowerCase() === 'connection' || k.toLowerCase() === 'sec-websocket')
                    .map(([k, v]) => \`<span class="meta-key">\${k}</span>: \${v}\`) : [];
                  
                  metaDisplay = \`
                    <details class="meta ws-meta" open>
                      <summary>WebSocket Info</summary>
                      <div class="ws-meta-content">
                        \${wsInfo.length ? '<div class="ws-id-info">' + wsInfo.join(' | ') + '</div>' : ''}
                        \${meta.url ? \`<div class="url-info">URL: <span class="highlight">\${meta.url}</span></div>\` : ''}
                        \${wsHeaders.length ? '<div class="ws-headers">' + wsHeaders.join('<br>') + '</div>' : ''}
                      </div>
                      <pre>\${JSON.stringify(meta, null, 2)}</pre>
                    </details>
                  \`;
                } else {
                  metaDisplay = \`<details class="meta" open><summary>Meta</summary><pre>\${JSON.stringify(meta, null, 2)}</pre></details>\`;
                }
              }
              
              const timestamp = new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'});
              
              msg.innerHTML = \`
                <div class="msg-header">
                  <div class="dir dir-\${isIncoming ? 'in' : 'out'}">\${message}</div>
                  <span class="msg-time">\${timestamp}</span>
                </div>
                \${metaDisplay}
                \${body ? \`<details class="body" \${type === 'ws-message' ? 'open' : ''}>
                  <summary>Body</summary>
                  <pre class="\${type === 'ws-message' ? 'ws-body' : ''}">\${body}</pre>
                </details>\` : ""}
              \`;
              slot.appendChild(msg);
            };
          }
        }));
      });
    </script>

    <style>
      .pair-entry {
        background: #161616;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 6px;
        box-shadow: 0 0 4px #000;
        border-left: 3px solid #444;
      }
      
      .http-entry {
        border-left-color: #00aa44;
      }
      
      .ws-entry {
        border-left-color: #4488ff;
      }
      
      .system-entry {
        border-left-color: #aa44aa;
      }
      
      .pair-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.6rem;
      }
      
      .pair-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .id-badge {
        color: #66aaff;
        font-family: monospace;
        font-size: 0.9em;
      }
      
      .protocol-badge {
        background: #222;
        padding: 2px 5px;
        font-size: 0.75em;
        border-radius: 3px;
        color: #888;
      }
      
      .ws-badge {
        background: #003366;
        color: #4488ff;
        padding: 2px 5px;
        font-size: 0.75em;
        border-radius: 3px;
      }
      
      .tag {
        padding: 0 0.5em;
        font-weight: bold;
        border-radius: 4px;
        margin-right: 0.2em;
      }

      /* Метки по методу HTTP */
      .type-get {
        background: #003300;
        color: #00ff00;
      }
      .type-post {
        background: #330000;
        color: #ff4444;
      }
      .type-put {
        background: #332200;
        color: #ffbb33;
      }
      .type-delete {
        background: #330022;
        color: #ff66cc;
      }
      .type-ws {
        background: #001133;
        color: #33aaff;
      }
      .type-ws-init {
        background: #001a4d;
        color: #66bbff;
      }
      .type-ws-message {
        background: #002266;
        color: #77ccff;
      }
      .type-info {
        background: #003311;
        color: #00dd88;
      }
      .type-error {
        background: #330000;
        color: #ff3333;
      }
      .type-http {
        background: #222;
        color: #fff;
      }

      .pair-content {
        display: flex;
        gap: 1rem;
      }

      .half {
        width: 50%;
        background: #111;
        padding: 1rem;
        border-radius: 4px;
      }

      .entry-block {
        margin-bottom: 1rem;
        border-top: 1px dashed #333;
        padding-top: 0.5rem;
      }
      
      .ws-message-block {
        background: #001122;
        border-radius: 4px;
      }

      .dir {
        font-weight: bold;
        margin-bottom: .5rem;
        color: #ccc;
      }
      
      .msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      
      .msg-time {
        font-size: 0.75em;
        color: #666;
      }
      
      .dir-in {
        color: #88ccff;
      }
      
      .dir-out {
        color: #88ffaa;
      }

      .meta, .body {
        margin-top: 0.6em;
        font-size: 0.9em;
      }

      .meta summary, .body summary {
        cursor: pointer;
        font-weight: bold;
        margin-bottom: 0.4em;
      }

      .meta pre {
        color: #ffaa00;
        white-space: pre-wrap;
        background: #000;
        padding: 0.5em;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
      }

      .body pre {
        color: #00ff80;
        white-space: pre-wrap;
        background: #000;
        padding: 0.5em;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .ws-body {
        color: #77bbff !important;
        background: #001122 !important;
      }

      .time {
        color: #888;
        font-size: 0.85em;
      }
      
      .ws-meta-content {
        background: #001122;
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
      }
      
      .ws-id-info {
        margin-bottom: 5px;
      }
      
      .highlight {
        color: #ffcc00;
        font-weight: bold;
      }
      
      .url-info {
        margin-bottom: 5px;
        color: #88ccff;
      }
      
      .ws-headers {
        color: #aaaaaa;
        font-size: 0.9em;
        margin-top: 5px;
      }
      
      .meta-key {
        color: #88aaff;
      }
    </style>
  </div>
`
);
