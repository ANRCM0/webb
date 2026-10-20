// Measure the plan dialog geometry on either side (orig on 4318, app build on 4319).
import { spawn } from "node:child_process";

const BASE = process.argv[2] || "http://127.0.0.1:4318";
const APP = process.argv[3] || "orig";
const PORT = 9700 + Math.floor(Math.random() * 200);
const URL_ = `${BASE}/seed.html?app=${APP}&to=/finance/plan`;

const chrome = spawn("chromium", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, "--window-size=1440,900",
  `--user-data-dir=/tmp/cdp-plan-${PORT}`, URL_,
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXPR = `(() => {
  const out = { dialog: null, items: [] };
  const dlg = [...document.querySelectorAll('[role="dialog"]')].find((d) => (d.innerText || "").includes("添加套餐"));
  if (!dlg) return JSON.stringify(out);
  const r = dlg.getBoundingClientRect();
  out.dialog = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  const sel = 'label, input, [role="combobox"], button, h3, hr, [data-slot], p, .border-dashed';
  const nodes = [...dlg.querySelectorAll(sel)];
  for (const el of nodes) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) continue;
    const cs = getComputedStyle(el);
    const text = (el.innerText || el.placeholder || "").replace(/\\s+/g, " ").trim().slice(0, 18);
    out.items.push({
      tag: el.tagName.toLowerCase(),
      text,
      x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
      fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight,
      bs: cs.borderStyle, bb: cs.borderBottomWidth,
    });
  }
  return JSON.stringify(out);
})()`;

try {
  let page = null;
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) break;
    } catch { /* wait */ }
    await sleep(300);
  }
  if (!page) throw new Error("no devtools page");
  await sleep(4500);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const send = (id, method, params) => ws.send(JSON.stringify({ id, method, params }));
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  // click 添加套餐
  send(1, "Runtime.evaluate", { expression: `(() => {
    const btn = [...document.querySelectorAll("button")].find(b => (b.innerText||"").includes("添加套餐"));
    if (btn) btn.click();
    return !!btn;
  })()`, returnByValue: true });
  await sleep(3500);
  const value = await new Promise((resolve, reject) => {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 2) resolve(msg.result?.result?.value);
    };
    send(2, "Runtime.evaluate", { expression: EXPR, returnByValue: true });
    setTimeout(() => reject(new Error("timeout")), 15000);
  });
  ws.close();
  const data = JSON.parse(value);
  console.log(JSON.stringify({ app: APP, ...data }, null, 0));
} finally {
  chrome.kill("SIGKILL");
}
