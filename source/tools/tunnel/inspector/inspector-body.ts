export const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tunnel Inspector</title>
    <style>
      body {
        font-family: monospace;
        background: #0b0b0b;
        color: #eee;
        padding: 1rem;
        margin: 0;
      }
      h2 {
        color: #00ff80;
        margin-bottom: 1rem;
      }
      .log-controls {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .log-controls label {
        cursor: pointer;
      }
      .log-controls button {
        margin-left: auto;
        padding: 0.25rem 0.75rem;
        background: #333;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .log-entry {
        background: #161616;
        border-left: 3px solid #444;
        border-radius: 6px;
        box-shadow: 0 0 4px #000;
        margin-bottom: 1rem;
        padding: 1rem;
      }
      .http {
        border-left-color: #00aa44;
      }
      .ws {
        border-left-color: #4488ff;
      }
      .system {
        border-left-color: #aa44aa;
      }
      .entry-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
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
      .dir {
        font-weight: bold;
        color: #ccc;
      }
      .dir-in {
        color: #88ccff;
      }
      .dir-out {
        color: #88ffaa;
      }
    </style>
  </head>
  <body>
    <h2>📡 Tunnel Inspector</h2>
    <div class="log-controls">
      <label><input type="checkbox" value="http" checked /> HTTP</label>
      <label><input type="checkbox" value="ws-init" checked /> WS-INIT</label>
      <label><input type="checkbox" value="ws-message" checked /> WS-MSG</label>
      <label><input type="checkbox" value="info" checked /> INFO</label>
      <label><input type="checkbox" value="error" checked /> ERROR</label>
      <button onclick="clearLog()">Clear</button>
    </div>
    <div id="log"></div>

    <script>
      const filters = new Set([
        "http",
        "ws-init",
        "ws-message",
        "info",
        "error",
      ]);
      document.querySelectorAll(".log-controls input[type=checkbox]")
        .forEach((input) => {
          input.addEventListener("change", () => {
            if (input.checked) filters.add(input.value);
            else filters.delete(input.value);
          });
        });

      function clearLog() {
        document.getElementById("log").innerHTML = "";
      }

      const ws = new WebSocket("ws://" + location.host + "/ws");
      ws.onmessage = (e) => {
        const { type, source, message, time, meta, body, direction } =
          JSON.parse(e.data);
        if (!filters.has(type)) return;

        const wrapper = document.createElement("div");
        wrapper.className = \`log-entry \${
          type.startsWith("ws")
            ? "ws"
            : type === "http"
            ? "http"
            : "system"
        }\`;

        wrapper.innerHTML = \`
        <div class="entry-header">
          <div><strong>[\${type.toUpperCase()}]</strong> \${message}</div>
          <div>\${new Date(time).toLocaleTimeString()}</div>
        </div>
        <div class="dir \${
          direction === "cloud-to-local" ? "dir-in" : "dir-out"
        }">
          \${
          direction === "cloud-to-local"
            ? "← Cloud ➜ Upstream"
            : "← Upstream ➜ Cloud"
        }
        </div>
        \${
          meta
            ? \`<details class="entry-meta" open><summary>Meta</summary><pre>\${
              JSON.stringify(meta, null, 2)
            }</pre></details>\`
            : ""
        }
        \${
          body
            ? \`<details class="entry-body" open><summary>Body</summary><pre>\${body}</pre></details>\`
            : ""
        }
      \`;

        document.getElementById("log").prepend(wrapper);
      };
    </script>
  </body>
</html>`;
