export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tunnel Inspector</title>
  <style>
    body {
      font-family: monospace;
      background: #0b0b0b;
      color: #eee;
      margin: 0;
      padding: 1rem;
    }
    h2 { color: #00ff80; margin-bottom: 1rem; }
    .log-entry {
      background: #161616;
      border-left: 3px solid #444;
      border-radius: 6px;
      box-shadow: 0 0 4px #000;
      margin-bottom: 1rem;
      padding: 1rem;
      animation-duration: 0.7s;
      animation-fill-mode: forwards;
    }
    .http { border-left-color: #00aa44; animation-name: flash-in-http; }
    .ws { border-left-color: #4488ff; animation-name: flash-in-ws; }
    .system { border-left-color: #aa44aa; animation-name: flash-in-info; }
    .error { animation-name: flash-in-error; }

    .entry-header, .entry-footer {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .entry-meta pre, .entry-body pre {
      background: #000;
      padding: 0.5rem;
      white-space: pre-wrap;
      border-radius: 4px;
      margin: 0.5rem 0;
      overflow-x: auto;
    }
    .entry-meta summary, .entry-body summary {
      cursor: pointer;
      font-weight: bold;
    }
    .dir { font-weight: bold; color: #ccc; }
    .dir-in { color: #88ccff; }
    .dir-out { color: #88ffaa; }
    .method-label { font-weight: bold; color: #00ff80; }
    .meta-detail {
      background: #222;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .retry-btn {
      background: #444;
      color: #fff;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .message-block {
      background: #1e1e1e;
      border-radius: 4px;
      margin-top: 0.25rem;
      padding: 0.25rem 0.5rem;
    }
    .message-block.ws {
      animation: flash-in-ws 0.7s forwards;
    }
    textarea {
      width: 100%;
      background: #111;
      color: #eee;
      font-family: monospace;
      border: 1px solid #333;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .toast {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: #222;
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      box-shadow: 0 0 6px #000;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1000;
    }
    .toast.show {
      opacity: 1;
    }
   @keyframes pulse {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px #00ff80);
  }
  50% {
    transform: scale(1.04);
    filter: drop-shadow(0 0 6px #66ffb2);
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px #00ff80);
  }
}

h2 {
  display: inline-block;
  transform-origin: center center;
  transition: transform 0.1s ease;
}

h2.pulsing {
  animation: pulse 0.2s ease;
}

    @keyframes flash-in-http { 0% { box-shadow: 0 0 10px #00ff80; } 100% { box-shadow: 0 0 4px #000; } }
    @keyframes flash-in-ws   { 0% { box-shadow: 0 0 10px #4488ff; } 100% { box-shadow: 0 0 4px #000; } }
    @keyframes flash-in-info { 0% { box-shadow: 0 0 10px #aaaaaa; } 100% { box-shadow: 0 0 4px #000; } }
    @keyframes flash-in-error { 0% { box-shadow: 0 0 10px #ff4444; } 100% { box-shadow: 0 0 4px #000; } }
  </style>
</head>
<body>
  <h2>📡 Tunnel Inspector</h2>
  <div id="log"></div>
  <div id="toast" class="toast"></div>

  <script>
    const logEl = document.getElementById("log");
    const toastEl = document.getElementById("toast");
    const ws = new WebSocket("ws://" + location.host + "/ws");

    ws.onmessage = (e) => {
      const { type, source, message, time, meta, body, direction } = JSON.parse(e.data);
       const title = document.querySelector("h2");
  title.classList.add("pulsing");
  setTimeout(() => title.classList.remove("pulsing"), 400);

      if (type === "ws-message" && meta?.clientId) {
        const containerId = "ws-" + meta.clientId;
        let group = document.getElementById(containerId);
        if (!group) {
          group = document.createElement("div");
          group.id = containerId;
          group.className = "log-entry ws";
          group.innerHTML = \`
            <div class="entry-header">
              <div><strong>[WS]</strong> Messages from client <code>\${meta.clientId}</code></div>
              <div>\${new Date(time).toLocaleTimeString()}</div>
            </div>
            <div class="dir">\${direction === "cloud-to-local" ? "← Cloud ➜ Upstream" : "← Upstream ➜ Cloud"}</div>
            <details class="entry-meta" open>
              <summary>Meta</summary>
              <pre>\${JSON.stringify(meta, null, 2)}</pre>
            </details>
            <div class="entry-body" id="\${containerId}-messages"></div>
          \`;
          logEl.prepend(group);
        }
        const messagesEl = document.getElementById(containerId + "-messages");
        const block = document.createElement("div");
        block.className = "message-block ws";
        block.innerHTML = \`<pre>\${body}</pre>\`;
        messagesEl.prepend(block);
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "log-entry " + (
        type.startsWith("ws") ? "ws" :
        type === "http" ? "http" : type === "error" ? "error" : "system"
      );

      const methodLabel = (type === "http" && meta?.method)
        ? \`<span class="method-label">[\${meta.method.toUpperCase()}]</span>\`
        : "";

      const retryButton = (type === "http" && meta?.__port)
        ? \`<button class="retry-btn" onclick='toggleEditor(this, \${JSON.stringify(JSON.stringify({ meta, body }))})'>Edit & Retry</button>\`
        : "";

      const duration = meta?.__duration ? \`<span class="meta-detail">⏱ \${meta.__duration.toFixed(1)}ms</span>\` : "";
      const size = body ? \`<span class="meta-detail">📦 \${body.length} bytes</span>\` : "";

      wrapper.innerHTML = \`
        <div class="entry-header">
          <div>\${methodLabel} <b>[\${type.toUpperCase()}]</b> \${message}</div>
          <div>\${new Date(time).toLocaleTimeString()}</div>
        </div>
        <div class="dir \${direction === "cloud-to-local" ? "dir-in" : "dir-out"}">
          \${direction === "cloud-to-local" ? "← Cloud ➜ Upstream" : "← Upstream ➜ Cloud"}
        </div>
        <div><code>\${meta?.url || "(no url)"}</code></div>
        <details class="entry-meta" open><summary>Meta</summary><pre>\${JSON.stringify(meta, null, 2)}</pre></details>
        <details class="entry-body" open><summary>Body</summary><pre>\${body}</pre></details>
        <div class="entry-footer">
          <div>\${duration} \${size}</div>
          \${retryButton}
        </div>
      \`;

      logEl.prepend(wrapper);
    };

    function toggleEditor(button, payloadJson) {
      const payload = JSON.parse(payloadJson);
      const container = document.createElement("div");
      container.style.marginTop = "1rem";
      container.innerHTML = \`
        <details open>
          <summary>Edit Request</summary>
          <textarea id="edit-meta" rows="8">\${JSON.stringify(payload.meta, null, 2)}</textarea>
          <textarea id="edit-body" rows="6" style="margin-top:0.5rem;">\${payload.body}</textarea>
          <button class="retry-btn" onclick="submitRetry(this)">Send</button>
        </details>
      \`;
      button.replaceWith(container);
    }

    function submitRetry(button) {
      const details = button.closest("details");
      const metaText = details.querySelector("#edit-meta")?.value;
      const bodyText = details.querySelector("#edit-body")?.value;

      try {
        const meta = JSON.parse(metaText);
        const payload = { meta, body: bodyText };
        fetch("/__replay__", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => {
          if (!r.ok) {
            showToast("Retry failed: " + r.status);
          } else {
            showToast("Retry sent");
            details.remove();
          }
        });
      } catch (err) {
        showToast("Invalid JSON in meta");
      }
    }

    function showToast(text) {
      toastEl.textContent = text;
      toastEl.classList.add("show");
      setTimeout(() => toastEl.classList.remove("show"), 1500);
    }
  </script>
</body>
</html>`;
