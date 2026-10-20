import { SearchPalette, ThemeSwitch, LangSwitch, UserNav } from "@/components/layout/header-widgets";
import * as React from "react";
import { cn } from "@/lib/utils";

/** 复刻原件 eot / tot / not（displayName: Layout / LayoutHeader / LayoutBody） */
export const Layout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { fadedBelow?: boolean; fixedHeight?: boolean }
>(({ className, fadedBelow = false, fixedHeight = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-full w-full flex-col",
      fadedBelow &&
        "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:hidden after:h-32 after:w-full after:bg-[linear-gradient(180deg,_transparent_10%,_hsl(var(--background))_70%)] after:md:block",
      fixedHeight && "md:h-svh",
      className,
    )}
    {...props}
  />
));
Layout.displayName = "Layout";

/**
 * 复刻原件 `tot`：顶部工具条（⌘K 搜索 + 主题 / 语言 / 用户）在左，页面标题随 children 排在其下。
 * 原件各页面都是 `<tot><Eut/><div.ml-auto>…</div></tot>` + 标题位于 LayoutBody，
 * 这里把两者合并进同一个组件，避免每个页面重复拼装。
 */
export const LayoutHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inline?: boolean }
>(({ className, children, inline = false, ...props }, ref) => (
  <div ref={ref} className={cn("flex-none bg-background", className)} {...props}>
    <div className="flex h-[var(--header-height)] items-center gap-4 p-4 md:px-8">
      {inline && children ? <div className="min-w-0 flex-1">{children}</div> : <SearchPalette />}
      <div className={cn("flex items-center gap-1", inline ? "" : "ml-auto")}>
        {inline ? <SearchPalette /> : null}
        <ThemeSwitch />
        <LangSwitch />
        <UserNav />
      </div>
    </div>
    {!inline && children ? <div className="px-4 pt-6 md:px-8">{children}</div> : null}
  </div>
));
LayoutHeader.displayName = "LayoutHeader";

export const LayoutBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { fixedHeight?: boolean; dense?: boolean }
>(({ className, fixedHeight = false, dense = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-hidden px-4 md:px-8",
      dense ? "pb-6 pt-3" : "py-6",
      fixedHeight && "h-[calc(100%-var(--header-height))]",
      className,
    )}
    {...props}
  />
));
LayoutBody.displayName = "LayoutBody";
