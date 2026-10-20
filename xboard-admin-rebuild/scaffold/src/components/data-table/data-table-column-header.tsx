import type { Column } from "@tanstack/react-table";
import {
  IconInfoCircle,
  IconSelector,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * 复刻原件 `eQt`（bundle offset 5,856,485）：
 * - 可排序列：ghost 按钮 `-ml-3 flex h-8 items-center gap-2 text-nowrap font-medium hover:bg-muted/60`
 *   + 标题 + 可选 ⓘ tooltip + 三态排序图标（升/降/未排序）；
 * - 不可排序列：纯文本 `flex items-center space-x-1 text-nowrap py-2 font-medium text-muted-foreground`
 *   + 可选 ⓘ —— 原件在这里**不渲染**任何下拉/箭头（列显隐不在表头里）。
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  tooltip,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  tooltip?: React.ReactNode;
  className?: string;
}) {
  const info = tooltip ? (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconInfoCircle className="h-4 w-4 cursor-pointer text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;

  if (!column.getCanSort()) {
    return (
      <div className={cn("flex items-center space-x-1 text-nowrap py-2 font-medium text-muted-foreground", className)}>
        <span>{title}</span>
        {info}
      </div>
    );
  }

  const sorted = column.getIsSorted();
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="default"
          className={cn("-ml-3 flex h-8 items-center gap-2 text-nowrap font-medium hover:bg-muted/60", className)}
          onClick={() => column.toggleSorting(sorted === "asc")}
        >
          <span>{title}</span>
          {info}
          {sorted === "asc" ? (
            <IconSortAscending className="h-4 w-4 text-foreground/70" />
          ) : sorted === "desc" ? (
            <IconSortDescending className="h-4 w-4 text-foreground/70" />
          ) : (
            <IconSelector className="h-4 w-4 text-muted-foreground/70 transition-colors hover:text-foreground/70" />
          )}
        </Button>
      </div>
    </div>
  );
}
