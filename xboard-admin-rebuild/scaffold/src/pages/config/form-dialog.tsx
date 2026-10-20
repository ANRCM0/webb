import * as React from "react";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * 原件 `U2t`（公告）/`X2t`（知识库）两个编辑弹层共用的外壳，逐类复刻 bundle 里的
 * DialogContent/Header/Footer 组合（offset ≈6,052,1xx / 6,064,4xx）：
 *
 *   <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
 *     <DialogHeader className="border-b bg-muted/20 px-6 pb-4 pt-6"> … </DialogHeader>
 *     <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4 font-mono text-xs"> … </div>
 *     <DialogFooter className="border-t bg-muted/20 px-6 py-4"> … </DialogFooter>
 *   </DialogContent>
 */
export function EditorDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  bodyClassName = "font-mono",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactElement;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** 原件公告正文容器是 `font-mono`，知识库是 `font-mono text-xs` */
  bodyClassName?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b bg-muted/20 px-6 pb-4 pt-6">
          <DialogTitle className="font-mono text-lg tracking-tight">{title}</DialogTitle>
          <DialogDescription className="font-mono text-xs opacity-70">{description}</DialogDescription>
        </DialogHeader>
        <div className={cn("max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4", bodyClassName)}>{children}</div>
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <div className="flex w-full items-center justify-end gap-3">{footer}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原件 `Gy`（FormItem `space-y-2`）+ `Zy`（FormLabel 默认 `font-medium`）的组合 */
export function FormField({
  label,
  className,
  required,
  children,
}: {
  label: React.ReactNode;
  className?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}

/** 原件 `f2t`（rc-md-editor）：外层 border-input 包裹 + 编辑器本体 `border-none font-mono text-xs`，高度 400px */
export function MarkdownField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: React.ReactNode;
}) {
  return (
    <FormField label={label} className="space-y-2">
      <div className="overflow-hidden rounded-md border border-input focus-within:ring-1 focus-within:ring-ring">
        <div className="font-mono text-xs">
          <MarkdownEditor value={value} onChange={onChange} height={400} />
        </div>
      </div>
    </FormField>
  );
}
