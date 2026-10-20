import * as React from "react";
import { flexRender, type Column, type Table as TanstackTable } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

export interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  isLoading?: boolean;
  showPagination?: boolean;
  /** 移动端卡片主字段列 id（原件 mobilePrimaryField） */
  mobilePrimaryField?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  onDragEnd?: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  className?: string;
}

/**
 * 复刻原件 DataTable（bundle offset ≈5,736,500）：
 * - 列宽真正生效：`<th/td style={{width: column.getSize()}}>`（否则列定义里的 size 是死数据）；
 * - 表头 `h-11 bg-card px-4 text-muted-foreground`（比 shadcn 默认 h-10 px-2 更宽松）；
 * - 行 `animate-fade-in hover:bg-muted/50`，单元格 `bg-card`；
 * - 左右固定列 `sticky z-20` + `before:` 分隔线，偏移按相邻固定列宽度累加。
 */
export function DataTable<TData>({
  table,
  toolbar,
  isLoading,
  showPagination = true,
  mobilePrimaryField,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  className,
}: DataTableProps<TData>) {
  const { t } = useTranslation("common");
  const rows = table.getRowModel().rows;

  const leftPinned = table.getLeftLeafColumns();
  const rightPinned = table.getRightLeafColumns();
  const offsetOf = (column: Column<TData, unknown>): number | undefined => {
    const isLeft = column.getIsPinned() === "left";
    const set = isLeft ? leftPinned : rightPinned;
    const idx = set.findIndex((c) => c.id === column.id);
    if (idx < 0) return undefined;
    const neighbours = isLeft ? set.slice(0, idx) : set.slice(idx + 1);
    return neighbours.reduce((sum, c) => sum + c.getSize(), 0);
  };
  const pinnedClasses = (column: Column<TData, unknown>) => {
    const isLeft = column.getIsPinned() === "left";
    const isRight = column.getIsPinned() === "right";
    if (!isLeft && !isRight) return "";
    return cn(
      "sticky z-20",
      "before:absolute before:bottom-0 before:top-0 before:w-[1px] before:bg-border",
      isLeft && "before:right-0",
      isRight && "before:left-0",
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar?.(table)}
      <div className="relative overflow-auto rounded-md border bg-card">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const column = header.column as Column<TData, unknown>;
                    const pinned = column.getIsPinned();
                    const offset = pinned ? offsetOf(column) : undefined;
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width: header.getSize(),
                          ...(pinned === "left" ? { left: offset } : {}),
                          ...(pinned === "right" ? { right: offset } : {}),
                        }}
                        className={cn("h-11 bg-card px-4 text-muted-foreground", pinned && pinnedClasses(column))}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && rows.length === 0 && (
                <TableRow className="animate-fade-in">
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-muted-foreground">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow className="animate-fade-in">
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {t("table.noData", { defaultValue: "暂无数据" })}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="animate-fade-in hover:bg-muted/50"
                  draggable={draggable}
                  onDragStart={(e) => onDragStart?.(e, index)}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop?.(e, index)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const column = cell.column as Column<TData, unknown>;
                    const pinned = column.getIsPinned();
                    const offset = pinned ? offsetOf(column) : undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: column.getSize(),
                          ...(pinned === "left" ? { left: offset } : {}),
                          ...(pinned === "right" ? { right: offset } : {}),
                        }}
                        className={cn("bg-card", pinned && pinnedClasses(column))}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {showPagination && !isLoading && <DataTablePagination table={table} />}
      {mobilePrimaryField && (
        <div className="grid gap-3 md:hidden">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border p-3">
              <div className="font-medium">{String(row.getValue(mobilePrimaryField) ?? "")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
