/**
 * Monaco 离线加载（懒）。
 *
 * - 不再在应用启动时引入 editor 核心与语言贡献，只在真正渲染
 *   `<MonacoEditor/>`（订阅模板 / 邮件模板 / 主题配置）时动态加载，
 *   首次打开这些页面前不消耗 4MB+ 的 JS。
 * - `self.MonacoEnvironment.getWorker` 与 `loader.config({ monaco })`
 *   在首次加载成功后设置；语言贡献（json/yaml/ini/html）同步注册，
 *   保证 `<Editor>` 实例化前语言与 worker 都就绪。
 * - worker 均经 Vite `?worker` 本地打包，无 CDN 依赖。
 */
import { loader } from "@monaco-editor/react";

interface MonacoEnvironment {
  getWorker: (_moduleId: string, label: string) => Worker;
}

interface WorkerCtor {
  new (): Worker;
}

let monacoPromise: Promise<unknown> | null = null;

/** 加载（并注册）Monaco，返回 editor api 模块；幂等，可并发调用。 */
export function loadMonaco(): Promise<unknown> {
  if (!monacoPromise) {
    monacoPromise = (async () => {
      /* worker 构造器（Vite ?worker 产物），随首次加载一并取回 */
      const [EditorWorkerCtor, JsonWorkerCtor, HtmlWorkerCtor, CssWorkerCtor] = (await Promise.all([
        import("monaco-editor/esm/vs/editor/editor.worker?worker"),
        import("monaco-editor/esm/vs/language/json/json.worker?worker"),
        import("monaco-editor/esm/vs/language/html/html.worker?worker"),
        import("monaco-editor/esm/vs/language/css/css.worker?worker"),
      ])) as unknown as [WorkerCtor, WorkerCtor, WorkerCtor, WorkerCtor];

      (self as unknown as { MonacoEnvironment?: MonacoEnvironment }).MonacoEnvironment = {
        getWorker(_moduleId, label) {
          switch (label) {
            case "json":
              return new JsonWorkerCtor();
            case "html":
            case "handlebars":
            case "razor":
              return new HtmlWorkerCtor();
            case "css":
            case "scss":
            case "less":
              return new CssWorkerCtor();
            default:
              return new EditorWorkerCtor();
          }
        },
      };

      /* 语言贡献（basic languages + JSON 富语言贡献）。顺序先行，注册语言后 Editor 才认识。 */
      await import("monaco-editor/esm/vs/language/json/monaco.contribution");
      await import("monaco-editor/esm/vs/languages/definitions/html/register.js");
      await import("monaco-editor/esm/vs/languages/definitions/yaml/register.js");
      await import("monaco-editor/esm/vs/languages/definitions/ini/register.js");

      /* editor 核心 */
      const monaco = await import("monaco-editor/esm/vs/editor/editor.api");
      loader.config({ monaco });
      return monaco;
    })();
  }
  return monacoPromise;
}
