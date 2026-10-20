// CDP-based geometry measurement: launches headless chromium on the fixture server,
// evaluates layout metrics inside the page, prints JSON, then tears the browser down.
// Read-only: only reads getBoundingClientRect / computed styles from the rendered page.
import { spawn } from "node:child_process";

const ROUTE = process.argv[2] || "/server/manage";
const APP = process.argv[3] || "app";
const PORT = 9333 + Math.floor(Math.random() * 200);
const URL_ = `http://127.0.0.1:4318/seed.html?app=${APP}&to=${ROUTE}`;

const chrome = spawn("chromium", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, "--window-size=1440,900",
  `--user-data-dir=/tmp/cdp-profile-${PORT}`, URL_,
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch { /* not up yet */ }
    await sleep(300);
  }
  throw new Error("devtools endpoint never came up");
}

const EXPR = `(() => {
  const out = { url: location.href, table: null, headers: [], rows: [], cells: [] };
  const table = document.querySelector("table");
  if (!table) return JSON.stringify(out);
  const r = table.getBoundingClientRect();
  out.table = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  const ths = [...table.querySelectorAll("thead th")];
  out.headers = ths.map((th) => {
    const b = th.getBoundingClientRect();
    const cs = getComputedStyle(th);
    return {
      text: (th.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 24),
      x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height),
      pad: cs.paddingLeft + "/" + cs.paddingRight,
    };
  });
  const trs = [...table.querySelectorAll("tbody tr")];
  out.rows = trs.map((tr) => {
    const b = tr.getBoundingClientRect();
    return { h: Math.round(b.height), y: Math.round(b.y) };
  });
  const h2 = document.querySelector("h2");
  if (h2) { const b = h2.getBoundingClientRect(); out.h2 = { y: Math.round(b.y), h: Math.round(b.height), text: (h2.innerText||"").slice(0,16) }; }
  const desc = h2?.parentElement?.querySelector("p");
  if (desc) { const b = desc.getBoundingClientRect(); out.h2p = { y: Math.round(b.y), h: Math.round(b.height) }; }
  const sidebar = document.querySelector("aside") || document.querySelector("[class*=sidebar]");
  if (sidebar) { const b = sidebar.getBoundingClientRect(); out.side = { x: Math.round(b.x), w: Math.round(b.width) }; }
  const wrap = table.parentElement?.parentElement;
  if (wrap) {
    const wr = wrap.getBoundingClientRect();
    out.wrap = { w: Math.round(wr.width), scrollW: Math.round(wrap.scrollWidth) };
  }
  const first = trs[1] || trs[0];
  if (first) {
    out.cells = [...first.querySelectorAll("td")].map((td) => {
      const b = td.getBoundingClientRect();
      const inner = td.firstElementChild ? td.firstElementChild.getBoundingClientRect() : null;
      return {
        x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height),
        innerH: inner ? Math.round(inner.height) : null,
        text: (td.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 40),
      };
    });
  }
  return JSON.stringify(out);
})()`;

try {
  const page = await targets();
  await sleep(6000); // let the SPA mount + data land
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const result = await new Promise((resolve, reject) => {
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: EXPR, returnByValue: true, awaitPromise: false } }));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 1) resolve(msg.result?.result?.value);
    };
    ws.onerror = reject;
    setTimeout(() => reject(new Error("evaluate timeout")), 20000);
  });
  ws.close();
  const data = JSON.parse(result);
  console.log(JSON.stringify({ route: ROUTE, app: APP, ...data }, null, 1));
} finally {
  chrome.kill("SIGKILL");
}
