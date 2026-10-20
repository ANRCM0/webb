import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * 复刻原件 `AGt`（bundle offset ≈5,729,9xx）：
 * 「已选择 N 项，共 M 项」+ 每页显示 [50▾] + 第 [n] 页，共 N 页 + 四个翻页按钮（首/上/下/尾，首尾仅 lg 显示）。
 */
export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  const { t } = useTranslation("common");
  const pageIndex = table.getState().pagination.pageIndex;
  const [pageInput, setPageInput] = React.useState(String(pageIndex + 1));

  React.useEffect(() => {
    setPageInput(String(pageIndex + 1));
  }, [pageIndex]);

  const commit = (raw: string) => {
    const next = Number.parseInt(raw, 10);
    if (!Number.isNaN(next) && next >= 1 && next <= table.getPageCount()) {
      table.setPageIndex(next - 1);
    } else {
      setPageInput(String(pageIndex + 1));
    }
  };

  return (
    <div className="flex flex-col-reverse gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        {t("table.pagination.selected", {
          selected: table.getFilteredSelectedRowModel().rows.length,
          total: table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t("table.pagination.itemsPerPage")}</p>
          <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 100, 500].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm font-medium">
          <span>{t("table.pagination.page")}</span>
          <Input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(e.currentTarget.value);
            }}
            className="h-8 w-[50px] text-center"
          />
          <span>{t("table.pagination.pageOf", { total: table.getPageCount() })}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">{t("table.pagination.firstPage")}</span>
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">{t("table.pagination.previousPage")}</span>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">{t("table.pagination.nextPage")}</span>
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <span className="sr-only">{t("table.pagination.lastPage")}</span>
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
