#!/usr/bin/env node
/**
 * One command: build the rebuild with base=/app/, start the fixture server, print both URLs.
 *
 *   node tools/build-and-serve.mjs            # build + serve
 *   node tools/build-and-serve.mjs --skip-build
 *   PORT=4318 HOST=0.0.0.0 node tools/build-and-serve.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./mock-api.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCAFFOLD = path.resolve(HERE, "../scaffold");
const skipBuild = process.argv.includes("--skip-build");

function run(label, args, extraEnv = {}) {
  console.log(`[build] ${label}`);
  const result = spawnSync(process.execPath, args, {
    cwd: SCAFFOLD,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.error) {
    console.error(`[build] failed to start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[build] ${label} failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

if (!skipBuild) {
  // `npm run build` runs `tsc -b`, which emits JS next to the sources (src/**) because the
  // scaffold tsconfig has no outDir/noEmit. Use --noEmit + vite build to keep src/** untouched.
  run("tsc --noEmit", [path.join(SCAFFOLD, "node_modules/typescript/bin/tsc"), "--noEmit", "-p", "tsconfig.json"]);
  run("vite build (BASE_URL=/app/)", [path.join(SCAFFOLD, "node_modules/vite/bin/vite.js"), "build"], {
    BASE_URL: "/app/",
  });
} else {
  console.log("[build] skipped (--skip-build); serving existing scaffold/dist");
}

let instance;
try {
  instance = await startServer();
} catch (error) {
  if (error && error.code === "EADDRINUSE") {
    console.error(`[serve] port ${process.env.PORT || 4318} is already in use; stop the other process first.`);
  } else {
    console.error("[serve] failed to start:", error);
  }
  process.exit(1);
}

const base = instance.url;
console.log("");
console.log("  Xboard visual-regression environment is ready");
console.log("  ----------------------------------------------");
console.log(`  original SPA : ${base}/orig/index.html`);
console.log(`  rebuild      : ${base}/app/`);
console.log(`  fixtures     : ${base}/__fixtures`);
console.log(`  seed auth    : ${base}/seed.html?app=orig&to=/config/notice`);
console.log("");
console.log("  Press Ctrl+C to stop.");
console.log("");

const shutdown = async () => {
  await instance.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
