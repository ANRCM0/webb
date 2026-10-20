/**
 * monaco-editor 0.57.0 的 package.json `exports` 仅暴露根入口，深路径
 * 在 TS moduleResolution=bundler 下解析失败。这里为 `src/lib/monaco.ts`
 * 用到的深路径补环境声明（运行时仍是真实 ESM 文件，仅补类型）。
 */

declare module "monaco-editor/esm/vs/editor/editor.api" {
  export * from "monaco-editor";
  const monaco: typeof import("monaco-editor");
  export default monaco;
}

declare module "monaco-editor/esm/vs/language/json/monaco.contribution" {
  const contribution: void;
  export default contribution;
}

declare module "monaco-editor/esm/vs/languages/definitions/html/register.js" {
  const register: void;
  export default register;
}

declare module "monaco-editor/esm/vs/languages/definitions/yaml/register.js" {
  const register: void;
  export default register;
}

declare module "monaco-editor/esm/vs/languages/definitions/ini/register.js" {
  const register: void;
  export default register;
}

declare module "monaco-editor/esm/vs/editor/editor.worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "monaco-editor/esm/vs/language/json/json.worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "monaco-editor/esm/vs/language/html/html.worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "monaco-editor/esm/vs/language/css/css.worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}
