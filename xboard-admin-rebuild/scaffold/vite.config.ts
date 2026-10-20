import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
/** Visual-regression harness: `BASE_URL=/app/ npm run build` produces a sub-path build. */
const base = process.env.BASE_URL || "/";

/**
 * monaco-editor@0.57 的 package.json `exports` 仅暴露根入口，深路径
 * （editor.api / 语言贡献 / worker）会被 Vite 拒绝。这里按
 * `src/lib/monaco.ts` 实际使用的深路径逐一映射到 node_modules 内实体文件，
 * worker 入口保留 `?worker` 查询以走 Vite 的 worker 打包。
 */
const monacoRoot = path.resolve(__dirname, "node_modules/monaco-editor");
const monacoAliases: Record<string, string> = {
  "monaco-editor/esm/vs/editor/editor.api": path.join(monacoRoot, "esm/vs/editor/editor.api.js"),
  "monaco-editor/esm/vs/language/json/monaco.contribution": path.join(
    monacoRoot,
    "esm/vs/language/json/monaco.contribution.js",
  ),
  "monaco-editor/esm/vs/languages/definitions/html/register.js": path.join(
    monacoRoot,
    "esm/vs/languages/definitions/html/register.js",
  ),
  "monaco-editor/esm/vs/languages/definitions/yaml/register.js": path.join(
    monacoRoot,
    "esm/vs/languages/definitions/yaml/register.js",
  ),
  "monaco-editor/esm/vs/languages/definitions/ini/register.js": path.join(
    monacoRoot,
    "esm/vs/languages/definitions/ini/register.js",
  ),
  "monaco-editor/esm/vs/editor/editor.worker?worker": `${path.join(monacoRoot, "esm/vs/editor/editor.worker.js")}?worker`,
  "monaco-editor/esm/vs/language/json/json.worker?worker": `${path.join(
    monacoRoot,
    "esm/vs/language/json/json.worker.js",
  )}?worker`,
  "monaco-editor/esm/vs/language/html/html.worker?worker": `${path.join(
    monacoRoot,
    "esm/vs/language/html/html.worker.js",
  )}?worker`,
  "monaco-editor/esm/vs/language/css/css.worker?worker": `${path.join(
    monacoRoot,
    "esm/vs/language/css/css.worker.js",
  )}?worker`,
};

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      ...Object.entries(monacoAliases).map(([find, replacement]) => ({ find, replacement })),
    ],
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Monaco 相关模块拆成独立 chunk：首屏主包不再背负 editor 核心与语言贡献，
         * 且能与版本化缓存配合（升级 monaco 只换对应 chunk）。
         */
        manualChunks(id) {
          if (id.includes("node_modules/monaco-editor")) {
            if (id.includes("/language/json/") || id.includes("/languages/features/json/")) {
              return "monaco-json";
            }
            if (id.includes("/languages/definitions/")) {
              return "monaco-langs";
            }
            if (id.includes("/editor/editor.worker") || id.includes("/language/")) {
              return "monaco-workers";
            }
            return "monaco-vs";
          }
        },
      },
    },
  },
});
