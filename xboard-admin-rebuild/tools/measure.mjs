#!/usr/bin/env node
/**
 * 用 CDP 打开页面并执行一段 JS，打印返回的 JSON（几何/样式测量用）。
 *
 *   node tools/measure.mjs --url "http://127.0.0.1:4318/seed.html?app=orig&to=/server/manage" --wait 5000 \
 *        --expr "JSON.stringify([...document.querySelectorAll('aside a')].slice(0,3).map(e=>({t:e.textContent.trim(),r:e.getBoundingClientRect()})))"
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const URL_ = opt("url"); const EXPR = opt("expr"); const WAIT = Number(opt("wait", "5000"));
const CHROME = process.env.CHROME || "chromium";
const PORT = Number(opt("port", String(9500 + Math.floor(Math.random() * 400))));
if (!URL_ || !EXPR) { console.error("usage: measure.mjs --url <url> --expr <js> [--wait ms]"); process.exit(2); }

const browser = spawn(CHROME, ["--headless=new","--no-sandbox","--disable-gpu","--hide-scrollbars","--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`,"--window-size=1440,900","about:blank"], { stdio: "ignore" });

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url); this.id = 0; this.pending = new Map();
    this.ready = new Promise((res, rej) => { this.ws.addEventListener("open", () => res()); this.ws.addEventListener("error", rej); });
    this.ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id; const payload = { id, method, params }; if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify(payload)); });
  }
}

const main = async () => {
  let wsUrl;
  for (let i = 0; i < 100; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {} await sleep(100); }
  const b = new CDP(wsUrl); await b.ready;
  const { targetId } = await b.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await b.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p) => b.send(m, p, sessionId);
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: URL_ });
  for (let i = 0; i < 80; i++) {
    const { result } = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (result.value === "complete") break; await sleep(100);
  }
  await sleep(WAIT);
  const { result } = await send("Runtime.evaluate", { expression: EXPR, returnByValue: true, awaitPromise: true });
  console.log(typeof result.value === "string" ? result.value : JSON.stringify(result.value));
  await b.send("Target.closeTarget", { targetId });
};
main().then(() => { try { browser.kill("SIGKILL"); } catch {} process.exit(0); })
  .catch((e) => { console.error("[measure] error:", e.message); try { browser.kill("SIGKILL"); } catch {} process.exit(1); });
