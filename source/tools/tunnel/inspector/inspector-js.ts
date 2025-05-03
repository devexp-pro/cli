export const js = /* js */ `
(() => {
  const sidebar = document.getElementById("sidebar");
  const details = document.getElementById("details");
  const toast = document.getElementById("toast");
  const tunnelStats = document.getElementById("tunnel-stats");

  const ws = new WebSocket("ws://" + location.host + "/ws");
  const clients = {};
  const httpStore = {};
  let statsUpdateInterval;

  function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function generateCurl(meta, body) {
    const method = meta.method;
    const url = \`http://localhost:\${meta.__port || 3000}\${meta.url}\`;
    const headers = Object.entries(meta.headers || {})
      .map(([k, v]) => \`-H "\${k}: \${v}"\`)
      .join(" ");
    const bodyArg = (method !== "GET" && method !== "HEAD")
      ? \`--data '\${body}'\`
      : "";
    return \`curl -X \${method} \${headers} \${bodyArg} "\${url}"\`.trim();
  }

  ws.onmessage = (e) => {
    const { type, meta, body, time, direction } = JSON.parse(e.data);

    if (type === "tunnel-stats" && meta) {
      updateTunnelStatsUI(meta);
      return;
    }

    if (type === "ws-message" && meta?.clientId) {
      const id = meta.clientId;
      if (!clients[id]) {
        clients[id] = [];
        const item = document.createElement("div");
        item.className = "item";
        item.textContent = "[WS] " + id;
        item.onclick = () => showClientMessages(id, item);
        const dot = document.createElement("div");
        dot.className = "pulse-dot";
        item.appendChild(dot);
        item.id = "ws-" + id;
        sidebar.prepend(item);
      }

      clients[id].unshift({ time, direction, body });

      const item = document.getElementById("ws-" + id);
      const dot = item.querySelector(".pulse-dot");
      dot.style.display = "block";
      clearTimeout(dot._timeout);
      dot._timeout = setTimeout(() => dot.style.display = "none", 2000);

      if (document.querySelector(".item.active")?.textContent.includes(id)) {
        const container = document.getElementById("ws-log-container");
        if (container) {
          const div = document.createElement("div");
          div.className = "log-entry new";
          div.innerHTML = \`
            <div class="dir \${direction === 'cloud-to-local' ? 'dir-in' : 'dir-out'}">
              \${direction === 'cloud-to-local' ? '← Cloud ➜ Upstream' : '← Upstream ➜ Cloud'}
            </div>
            <pre>\${body}</pre>
            <small>\${new Date(time).toLocaleTimeString()}</small>
          \`;
          container.prepend(div);
          setTimeout(() => div.classList.remove("new"), 800);
        }
      }
      return;
    }

    if (type === "ws-close" && meta?.clientId) {
      const item = document.getElementById("ws-" + meta.clientId);
      if (item) {
        const dot = item.querySelector(".pulse-dot");
        if (dot) dot.style.display = "none";
      }
      return;
    }

    if (type === "http") {
      const id = meta.id || ("http-" + Date.now() + Math.random());
      const isRequest = direction === "cloud-to-local";

      if (!httpStore[id]) httpStore[id] = {};
      if (isRequest) httpStore[id].req = { meta, body, time };
      else httpStore[id].res = { meta, body, time };

      let item = document.getElementById(id);
      if (!item) {
        item = document.createElement("div");
        item.className = "item";
        item.id = id;
        item.onclick = () => {
          document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
          item.classList.add("active");
          renderHttpDetails(id);
        };
        sidebar.prepend(item);
      }

      const method = httpStore[id].req?.meta?.method || "?";
      const url = httpStore[id].req?.meta?.url || "?";
      const status = httpStore[id].res?.meta?.status;
      const isRetry = id.startsWith("__retry__");

      const statusIcon =
        status >= 400 ? "🔴" :
        status >= 300 ? "🟡" :
        status >= 200 ? "🟢" : "...";

      item.innerHTML = \`[\${isRetry ? "RETRY " : ""}\${method}] \${url} <span style="float:right;">\${statusIcon} \${status || "..."}</span>\`;

      if (item.classList.contains("active") || isRetry) {
        document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        renderHttpDetails(id);
      }
    }
  };

  // Функция обновления UI статистики туннеля
  function updateTunnelStatsUI(stats) {
    const activeStatus = stats.active ? 
      '<span class="stats-active">ACTIVE</span>' : 
      '<span class="stats-inactive">INACTIVE</span>';
    
    const accessibleStatus = stats.accessible ? 
      '<span class="stats-active">ACCESSIBLE</span>' : 
      '<span class="stats-inactive">INACCESSIBLE</span>';
    
    tunnelStats.innerHTML = \`
      <div class="stats-card">
        <h4>Tunnel Status</h4>
        <p>\${activeStatus}</p>
      </div>
      <div class="stats-card">
        <h4>Accessibility</h4>
        <p>\${accessibleStatus}</p>
      </div>
      <div class="stats-card">
        <h4>Connected Users</h4>
        <p>\${stats.connectedUsers}</p>
      </div>
      <div class="stats-card">
        <h4>Tunnel Name</h4>
        <p>\${stats.tunnelName || 'N/A'}</p>
      </div>
      <div class="stats-card">
        <h4>Local Port</h4>
        <p>\${stats.port || 'N/A'}</p>
      </div>
    \`;
    
    if (stats.url) {
      tunnelStats.innerHTML += \`
        <div class="stats-card" style="flex-grow: 1;">
          <h4>URL</h4>
          <p>\${stats.url}</p>
        </div>
      \`;
    }
    
    if (stats.startTime) {
      const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      
      tunnelStats.innerHTML += \`
        <div class="stats-card">
          <h4>Uptime</h4>
          <p>\${hours}h \${minutes}m \${seconds}s</p>
        </div>
      \`;
    }
  }

  // Запустить периодический опрос статистики
  function startStatsPolling() {
    // Сначала получим данные сразу
    fetchTunnelStats();
    
    // Затем настроим интервал обновления
    statsUpdateInterval = setInterval(fetchTunnelStats, 5000);
  }

  // Функция для получения статистики туннеля
  function fetchTunnelStats() {
    fetch("/tunnel-stats")
      .then(res => res.json())
      .then(stats => {
        updateTunnelStatsUI(stats);
      })
      .catch(err => {
        tunnelStats.innerHTML = '<div class="stats-loading">Failed to load tunnel stats</div>';
        console.error("Failed to fetch tunnel stats:", err);
      });
  }

  // Инициализировать получение статистики при загрузке страницы
  startStatsPolling();

  function showClientMessages(id, item = null) {
    if (item) {
      document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
    }

    details.innerHTML = "<h3>WebSocket Messages for client: " + id + "</h3>";
    const container = document.createElement("div");
    container.id = "ws-log-container";
    details.appendChild(container);

    for (const msg of clients[id]) {
      const div = document.createElement("div");
      div.className = "log-entry";
      div.innerHTML = \`
        <div class="dir \${msg.direction === 'cloud-to-local' ? 'dir-in' : 'dir-out'}">
          \${msg.direction === 'cloud-to-local' ? '← Cloud ➜ Upstream' : '← Upstream ➜ Cloud'}
        </div>
        <pre>\${msg.body}</pre>
        <small>\${new Date(msg.time).toLocaleTimeString()}</small>
      \`;
      container.appendChild(div);
    }
  }

  function renderHttpDetails(id) {
    const { req, res } = httpStore[id] || {};
    if (!req) {
      details.innerHTML = "<p>Waiting for request data...</p>";
      return;
    }

    const reqHeaders = Object.entries(req.meta.headers || {}).map(([k, v]) =>
      \`<tr><td>\${k}</td><td>\${v}</td></tr>\`
    ).join("");

    const curlCmd = generateCurl(req.meta, req.body);

    const reqSection = \`
      <div class="log-entry">
        <div><b>[\${req.meta.method}]</b> \${req.meta.url}</div>
        <div class="dir dir-in">← Cloud ➜ Upstream</div>
        <table>\${reqHeaders}</table>
        <pre>\${req.body}</pre>
        \${req.meta.__duration ? \`<small>⏱ Duration: \${req.meta.__duration.toFixed(1)}ms</small>\` : ""}
        <div class="curl-copy">
          <input type="text" class="curl-input" value="\${curlCmd.replace(/"/g, '&quot;')}" readonly>
          <button class="copy-btn" data-cmd="\${curlCmd.replace(/"/g, '&quot;')}" onclick="copyCurl(event)">📋 Copy</button>
        </div>
      </div>
    \`;

    let resSection = "";
    if (res) {
      const headers = Object.entries(res.meta.headers || {}).map(([k, v]) =>
        \`<tr><td>\${k}</td><td>\${v}</td></tr>\`
      ).join("");

      let statusClass = "";
      if (res.meta.status >= 400) statusClass = "error";
      else if (res.meta.status >= 300) statusClass = "warn";
      else if (res.meta.status >= 200) statusClass = "ok";

      resSection = \`
        <div class="log-entry \${statusClass}">
          <div><b>Status:</b> \${res.meta.status}</div>
          <div class="dir dir-out">← Upstream ➜ Cloud</div>
          <table>\${headers}</table>
          <pre>\${res.body}</pre>
        </div>
      \`;
    }

    const retry = (res && req.meta?.__port) ? \`
      <button class="retry-btn" onclick='toggleEditor(\${JSON.stringify(JSON.stringify({ meta: req.meta, body: req.body }))})'>
        ✏️ Edit & Retry
      </button>\` : "";

    details.innerHTML = reqSection + (resSection || "") + retry;
  }

  window.copyCurl = function(event) {
    const cmd = event.currentTarget.dataset.cmd;
    if (!cmd) return showToast("Nothing to copy");
    
    // Try using the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd)
        .then(() => showToast("Copied curl!"))
        .catch(err => {
          fallbackCopy(cmd);
        });
    } else {
      // Fallback for browsers that don't support Clipboard API
      fallbackCopy(cmd);
    }
  };

  function fallbackCopy(text) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it non-editable to avoid focus and make it position outside the screen
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    
    document.body.appendChild(textarea);
    
    // Check if document has selection capability
    if (document.selection) {
      // For IE
      textarea.select();
      document.execCommand('copy');
    } else if (window.getSelection) {
      // For modern browsers
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      document.execCommand('copy');
    }
    
    document.body.removeChild(textarea);
    showToast("Copied curl!");
  }

  window.toggleEditor = function(payloadJson) {
    const payload = JSON.parse(payloadJson);
    const wrapper = document.createElement("div");
    wrapper.className = "log-entry";
    wrapper.innerHTML = \`
      <h3>Edit Request</h3>
      <textarea rows="10">\${JSON.stringify(payload.meta, null, 2)}</textarea>
      <textarea rows="6">\${payload.body}</textarea>
      <button class="retry-btn" onclick="submitRetry(this)">Send</button>
    \`;
    details.appendChild(wrapper);
  };

  window.submitRetry = function(button) {
    const wrapper = button.parentElement;
    const textareas = wrapper.querySelectorAll("textarea");
    try {
      const meta = JSON.parse(textareas[0].value);
      const body = textareas[1].value;
      const retryId = "__retry__" + generateUniqueId();
      meta.id = retryId;

      httpStore[retryId] = {
        req: {
          meta: { ...meta, __port: meta.__port },
          body,
          time: Date.now()
        }
      };

      const item = document.createElement("div");
      item.className = "item active";
      item.id = retryId;
      item.innerHTML = \`[RETRY \${meta.method}] \${meta.url} <span style="float:right;">...</span>\`;
      item.onclick = () => {
        document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        renderHttpDetails(retryId);
      };
      sidebar.prepend(item);
      document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderHttpDetails(retryId);

      fetch("/__replay__", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta, body }),
      }).then(res => {
        if (!res.ok) {
          showToast("Retry failed: " + res.status);
        } else {
          showToast("Retry sent");
          wrapper.remove();
        }
      }).catch(err => {
        showToast("Request error: " + err.message);
      });

    } catch (err) {
      showToast("Invalid JSON: " + err.message);
    }
  };

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1500);
  }
})();
`;
