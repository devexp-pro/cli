export const css = /* css */ `
body {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  background: #0b0b0b;
  color: #eee;
  height: 100vh;
}
h2 {
  background: #111;
  color: #00ff80;
  padding: 1rem;
  margin: 0;
}
.container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.sidebar {
  width: 30%;
  background: #111;
  border-right: 1px solid #333;
  padding: 0.5rem;
  overflow-y: auto;
}
.item {
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-left: 4px solid #555;
  background: #222;
  cursor: pointer;
  position: relative;
}
.item.active {
  background: #333;
}
.pulse-dot {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff80;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1) translateY(-50%); }
  50% { opacity: 0.2; transform: scale(1.6) translateY(-50%); }
}
.details {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
.log-entry {
  background: #161616;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0 4px #000;
}
.log-entry.new {
  animation: fadeInHighlight 1s ease-out;
}
@keyframes fadeInHighlight {
  0% { outline: 2px solid #00ff80; }
  100% { outline: 0px solid transparent; }
}
.dir { font-weight: bold; color: #ccc; }
.dir-in { color: #88ccff; }
.dir-out { color: #88ffaa; }
pre {
  background: #000;
  color: #eee;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 0.25rem;
}
textarea {
  width: 100%;
  background: #111;
  color: #eee;
  font-family: monospace;
  border: 1px solid #444;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}
.retry-btn {
  margin-top: 0.5rem;
  background: #444;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
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
small {
  color: #888;
  display: block;
  margin-top: 0.25rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}
td {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #333;
  vertical-align: top;
}
`;
