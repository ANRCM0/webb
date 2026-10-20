import * as React from "react";
import Editor, { type EditorProps } from "@monaco-editor/react";
import { loadMonaco } from "@/lib/monaco";

/**
 * 懒加载的 Monaco 编辑器。
 *
 * 原件在订阅模板 / 邮件模板 / 主题配置页使用 Monaco；本重建把 editor 核心
 * （≈4MB）与语言贡献推迟到首次真正渲染编辑器时才通过动态 import 加载，
 * 避免主应用首屏背负重 chunk。加载期间显示与原件骨架一致的占位块。
 */
export function MonacoEditor(props: EditorProps) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    loadMonaco()
      .then(() => {
        if (alive) setReady(true);
      })
      .catch(() => {
        if (alive) setReady(true); // 即使失败也交给 Editor 的自身错误路径
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return (
      <div
        className="h-[300px] animate-pulse rounded-md border bg-muted/30"
        aria-busy="true"
        aria-label="loading editor"
      />
    );
  }
  return <Editor {...props} />;
}
