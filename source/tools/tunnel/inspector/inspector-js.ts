export const js = /* js */ `
(() => {
  const sidebar = document.getElementById("sidebar");
  const details = document.getElementById("details");
  const toast = document.getElementById("toast");

  const ws = new WebSocket("ws://" + location.host + "/ws");
  const clients = {};
  const httpStore = {};

  function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  ws.onmessage = (e) => {
    const { type, meta, body, time, direction } = JSON.parse(e.data);

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
      const status = httpStore[id].res?.meta?.status || "...";
      const isRetry = id.startsWith("__retry__");
      item.innerHTML = \`[\${isRetry ? "RETRY " : ""}\${method}] \${url} <span style="float:right;">\${status}</span>\`;

      if (item.classList.contains("active") || isRetry) {
        document.querySelectorAll(".item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        renderHttpDetails(id);
      }
    }
  };

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

const reqSection = \`
  <div class="log-entry">
    <div><b>[\${req.meta.method}]</b> \${req.meta.url}</div>
    <div class="dir dir-in">← Cloud ➜ Upstream</div>
    <table>\${reqHeaders}</table>
    <pre>\${req.body}</pre>
    \${req.meta.__duration ? \`<small>⏱ Duration: \${req.meta.__duration.toFixed(1)}ms</small>\` : ""}
  </div>
\`;

    let resSection = "";
    if (res) {
      const headers = Object.entries(res.meta.headers || {}).map(([k, v]) =>
        \`<tr><td>\${k}</td><td>\${v}</td></tr>\`
      ).join("");
      resSection = \`
        <div class="log-entry">
          <div><b>Status:</b> \${res.meta.status}</div>
          <div class="dir dir-out">← Upstream ➜ Cloud</div>
          <table>\${headers}</table>
          <pre>\${res.body}</pre>
        </div>
      \`;
    } else {
      resSection = \`
        <div class="log-entry">
          <div><i>Waiting for response...</i></div>
        </div>
      \`;
    }

    const retry = (res && req.meta?.__port) ? \`
      <button class="retry-btn" onclick='toggleEditor(\${JSON.stringify(JSON.stringify({ meta: req.meta, body: req.body }))})'>
        Edit & Retry
      </button>\` : "";

    details.innerHTML = reqSection + resSection + retry;
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

      // Создаем новый ID для запроса retry
      const retryId = "__retry__" + generateUniqueId();
      meta.id = retryId;  // Убедимся, что ID в meta совпадает с ID в httpStore

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
