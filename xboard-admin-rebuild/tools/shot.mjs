#!/usr/bin/env node
/**
 * 基于 CDP 的单页截图（支持点击后截弹层）。
 *
 *   node tools/shot.mjs --url "http://127.0.0.1:4318/seed.html?app=orig&to=/config/notice" \
 *        --out /tmp/shots/o_notice.png [--click "添加公告"] [--wait 3500]
 *
 * 与 `chromium --screenshot` 的区别：可以执行点击、等待、滚动，用于抓「打开弹窗/抽屉」后的状态。
 * 仅依赖 Node 22 内置的 WebSocket 与 fetch，不引入任何第三方包；不访问外网。
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const args = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const clicks = [];
const scripts = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--click") clicks.push(args[i + 1]);
  if (args[i] === "--js") scripts.push(args[i + 1]);
}

const URL_ = opt("url");
const OUT = opt("out");
const WIDTH = Number(opt("width", "1440"));
const HEIGHT = Number(opt("height", "900"));
const WAIT = Number(opt("wait", "4000"));
const CHROME = process.env.CHROME || "chromium";
const PORT = Number(opt("port", String(9300 + Math.floor(Math.random() * 400))));

if (!URL_ || !OUT) {
  console.error("usage: shot.mjs --url <url> --out <file> [--click text]... [--wait ms] [--width px] [--height px]");
  process.exit(2);
}

const browser = spawn(
  CHROME,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    "about:blank",
  ],
  { stdio: "ignore", detached: false },
);

let ws = null;
const cleanup = () => {
  try { ws?.close(); } catch { /* ignore */ }
  try { browser.kill("SIGKILL"); } catch { /* ignore */ }
};

async function waitForDevtools() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch { /* not yet */ }
    await sleep(100);
  }
  throw new Error("devtools endpoint not ready");
}

class CDP {
  constructor(socketUrl) {
    this.ws = new WebSocket(socketUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ready = new Promise((res, rej) => {
      this.ws.addEventListener("open", () => res());
      this.ws.addEventListener("error", (e) => rej(e));
    });
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  async send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }
}

const main = async () => {
  const browserWs = await waitForDevtools();
  const b = new CDP(browserWs);
  await b.ready;

  const { targetId } = await b.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await b.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p) => b.send(m, p, sessionId);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send("Page.navigate", { url: URL_ });

  // 等 load + 一段稳定期（应用是 SPA，数据靠 XHR）
  const started = Date.now();
  for (let i = 0; i < 80; i++) {
    const { result } = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (result.value === "complete") break;
    await sleep(100);
  }
  await sleep(Math.max(600, WAIT - (Date.now() - started)));

  for (const text of clicks) {
    const expr = `(() => {
      const t = ${JSON.stringify(text)};
      const nodes = [...document.querySelectorAll('button,a,[role="button"],[role="menuitem"],[role="option"],[role="tab"]')];
      const el = nodes.find((n) => (n.textContent || '').trim().includes(t)) || null;
      if (!el) return 'not-found';
      el.click();
      return 'clicked';
    })()`;
    const { result } = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    if (result.value === "not-found") console.error(`[shot] click target not found: ${text}`);
    await sleep(1200);
  }

  for (const code of scripts) {
    const { result } = await send("Runtime.evaluate", { expression: code, returnByValue: true });
    console.log("[shot] js =>", JSON.stringify(result.value));
    await sleep(1200);
  }

  await sleep(600);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(OUT, Buffer.from(shot.data, "base64"));

  const check = await send("Runtime.evaluate", {
    expression: "document.querySelectorAll('[role=dialog],[data-state=open]').length",
    returnByValue: true,
  });
  console.log(JSON.stringify({ out: OUT, clicks: clicks.length, js: scripts.length, openOverlays: check.result.value }));
  await b.send("Target.closeTarget", { targetId });
};

main()
  .then(() => { cleanup(); process.exit(0); })
  .catch((e) => { console.error("[shot] error:", e.message); cleanup(); process.exit(1); });
