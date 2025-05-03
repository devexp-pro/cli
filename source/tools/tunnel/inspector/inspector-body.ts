import { css } from "./inspector-css.ts";
import { js } from "./inspector-js.ts";

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tunnel Inspector</title>
  <style>${css}</style>
</head>
<body>
  <h2>📡 Tunnel Inspector</h2>
  

  <div class="tunnel-stats" id="tunnel-stats">
    <div class="stats-loading">Loading tunnel status...</div>
  </div>
  
  <div class="container">
    <div class="sidebar" id="sidebar"></div>
    <div class="details" id="details">Click a client/request to view details</div>
  </div>
  <div class="toast" id="toast"></div>
  <script type="module">${js}</script>
</body>
</html>`;
