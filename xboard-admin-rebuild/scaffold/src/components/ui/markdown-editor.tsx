import * as React from "react";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt({ html: true, linkify: true, breaks: true });

/**
 * 原件通知/知识库正文用的是 rc-md-editor（react-markdown-editor-lite，CSS 里带 `rmel-iconfont`），
 * 工具栏图标即本组件的内置图标字体；这里保持同一实现与同一套编辑/预览行为。
 */
export function MarkdownEditor({
  value,
  onChange,
  height = 320,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}) {
  return (
    <MdEditor
      value={value}
      style={{ height }}
      renderHTML={(text: string) => mdParser.render(text)}
      onChange={({ text }) => onChange(text)}
      placeholder={placeholder}
      config={{
        view: { menu: true, md: true, html: false },
        canView: { menu: true, md: true, html: false, fullScreen: false, hideMenu: false },
      }}
    />
  );
}
