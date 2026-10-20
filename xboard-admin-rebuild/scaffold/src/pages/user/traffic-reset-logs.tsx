import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Calendar, Clock, Download, Timer, Upload, User, X } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SECURE,
  apiGet,
  formatDateTime,
} from "@/pages/_b/shared";

/**
 * 原件 `/user/traffic-reset-logs`：页面组件 N9t（offset 6518366）→ 专属组件 S9t（727B）
 * 表格 k9t、列工厂 C9t、工具栏 w9t（bundle 541707 附近）。
 * 服务端分页：queryKey ["trafficResetLogs", pagination, columnFilters, sorting]，
 * GET /traffic-reset/logs?page=&per_page=&…filters，响应 { data, total }。
 */

export interface TrafficResetLog {
  id: number;
  user_id: number;
  user_email: string;
  reset_type?: string;
  reset_type_name?: string;
  trigger_source?: string;
  trigger_source_name?: string;
  old_traffic?: { formatted?: string; upload?: number; download?: number };
  reset_time?: number;
  created_at?: number;
}

interface TrafficResetPage {
  data?: TrafficResetLog[];
  total?: number;
}

/* 端点（bundle 541707）：mT */
const fetchLogs = (params: Record<string, unknown>) =>
  apiGet<TrafficResetPage>(`${SECURE}/traffic-reset/logs`, params);

const RESET_TYPES = ["monthly", "first_day_month", "yearly", "first_day_year", "manual"];
const TRIGGER_SOURCES = ["auto", "manual", "cron"];

/** 原件 C9t 的徽标配色 */
function resetTypeClass(type?: string): string {
  switch (type) {
    case "manual":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "monthly":
      return "bg-green-100 text-green-800 border-green-200";
    case "yearly":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "first_day_month":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "first_day_year":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function triggerSourceClass(source?: string): string {
  switch (source) {
    case "manual":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "cron":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "auto":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function UserTrafficResetLogs() {
  const { t } = useTranslation(["user", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ reset_time: false });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "created_at", desc: true }]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [dateStart, setDateStart] = React.useState("");
  const [dateEnd, setDateEnd] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  /* 原件 S9t：columnFilters + date_range → 查询参数 */
  const queryParams = React.useMemo(() => {
    const params: Record<string, unknown> = { page: pagination.pageIndex + 1, per_page: pagination.pageSize };
    for (const filter of columnFilters) {
      if (!filter.value) continue;
      if (filter.id === "date_range") {
        const range = filter.value as { start?: string | null; end?: string | null };
        if (range.start) params.start_date = range.start;
        if (range.end) params.end_date = range.end;
      } else {
        params[filter.id] = filter.value;
      }
    }
    return params;
  }, [columnFilters, pagination]);

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["trafficResetLogs", pagination, columnFilters, sorting],
    queryFn: () => fetchLogs(queryParams),
  });

  const columns = React.useMemo<ColumnDef<TrafficResetLog>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.id", { defaultValue: "日志ID" })}
            className="w-[60px]"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[60px]">
            <Badge variant="outline" className="text-xs">
              {row.original.id}
            </Badge>
          </div>
        ),
        enableSorting: true,
        size: 60,
        meta: { label: t("traffic_reset_logs.columns.id", { defaultValue: "日志ID" }) },
      },
      {
        accessorKey: "user_email",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.user", { defaultValue: "用户" })}
            className="min-w-[200px]"
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-[200px] items-start gap-2">
            <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{row.original.user_email}</div>
              <div className="text-xs text-muted-foreground">ID: {row.original.user_id}</div>
            </div>
          </div>
        ),
        enableSorting: false,
        size: 100,
        meta: { label: t("traffic_reset_logs.columns.user", { defaultValue: "用户" }) },
      },
      {
        accessorKey: "trigger_source",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.trigger_source", { defaultValue: "触发源" })}
            className="w-[120px]"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[120px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={`flex items-center gap-1.5 border text-xs ${triggerSourceClass(row.original.trigger_source)}`}>
                  <Timer className="h-3 w-3" />
                  <span className="truncate">{row.original.trigger_source_name}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{row.original.trigger_source_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(`traffic_reset_logs.trigger_descriptions.${row.original.trigger_source ?? "other"}`, {
                      defaultValue: row.original.trigger_source_name ?? "",
                    })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
        enableSorting: true,
        size: 120,
        meta: { label: t("traffic_reset_logs.columns.trigger_source", { defaultValue: "触发源" }) },
      },
      {
        accessorKey: "reset_type",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.reset_type", { defaultValue: "重置类型" })}
            className="w-[120px]"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[120px]">
            <Badge className={`border text-xs ${resetTypeClass(row.original.reset_type)}`}>
              <span className="truncate">{row.original.reset_type_name}</span>
            </Badge>
          </div>
        ),
        enableSorting: true,
        size: 120,
        meta: { label: t("traffic_reset_logs.columns.reset_type", { defaultValue: "重置类型" }) },
      },
      {
        accessorKey: "old_traffic",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.cleared_traffic", { defaultValue: "清除流量" })}
            className="w-[120px]"
          />
        ),
        cell: ({ row }) => {
          const traffic = row.original.old_traffic;
          return (
            <div className="w-[120px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer text-center">
                    <div className="text-sm font-medium text-destructive">{traffic?.formatted ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("traffic_reset_logs.columns.cleared", { defaultValue: "已清除" })}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="h-3 w-3" />
                    <span>
                      {t("traffic_reset_logs.columns.upload", { defaultValue: "上传" })}:{" "}
                      {((traffic?.upload ?? 0) / 1024 ** 3).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-3 w-3" />
                    <span>
                      {t("traffic_reset_logs.columns.download", { defaultValue: "下载" })}:{" "}
                      {((traffic?.download ?? 0) / 1024 ** 3).toFixed(2)} GB
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
        enableSorting: false,
        size: 120,
        meta: { label: t("traffic_reset_logs.columns.cleared_traffic", { defaultValue: "清除流量" }) },
      },
      {
        accessorKey: "reset_time",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.reset_time", { defaultValue: "重置时间" })}
            className="w-[140px]"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[140px]">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{formatDateTime(row.original.reset_time, "MM-DD")}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(row.original.reset_time, "HH:mm")}</div>
              </div>
            </div>
          </div>
        ),
        enableSorting: true,
        size: 140,
        meta: { label: t("traffic_reset_logs.columns.reset_time", { defaultValue: "重置时间" }) },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("traffic_reset_logs.columns.log_time", { defaultValue: "记录时间" })}
            className="w-[140px]"
          />
        ),
        cell: ({ row }) => (
          <div className="w-[140px]">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{formatDateTime(row.original.created_at, "yyyy-MM-dd")}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(row.original.created_at, "H:m:s")}</div>
              </div>
            </div>
          </div>
        ),
        enableSorting: true,
        size: 1400,
        meta: { label: t("traffic_reset_logs.columns.log_time", { defaultValue: "记录时间" }) },
      },
    ],
    [t],
  );

  const table = useReactTable<TrafficResetLog>({
    data: data?.data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    rowCount: data?.total ?? 0,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // 原件 k9t 没有 actions 列；此处保留组内统一的右侧固定声明（对不存在的列是无操作）
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const applyDateRange = () => {
    if (!dateStart && !dateEnd) return;
    const rest = table.getState().columnFilters.filter((f) => f.id !== "date_range");
    table.setColumnFilters([
      ...rest,
      { id: "date_range", value: { start: dateStart || null, end: dateEnd || null } },
    ]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const body = await fetchLogs({ ...queryParams, page: 1, per_page: 10000 });
      const rows = body.data ?? [];
      const header = ["ID", "用户邮箱", "用户ID", "重置类型", "触发源", "清零流量", "上传流量(GB)", "下载流量(GB)", "重置时间", "记录时间"];
      const lines = rows.map((row) =>
        [
          row.id,
          row.user_email,
          row.user_id,
          row.reset_type_name ?? "",
          row.trigger_source_name ?? "",
          row.old_traffic?.formatted ?? "",
          ((row.old_traffic?.upload ?? 0) / 1024 ** 3).toFixed(2),
          ((row.old_traffic?.download ?? 0) / 1024 ** 3).toFixed(2),
          formatDateTime(row.reset_time, "yyyy-MM-dd HH:mm:ss"),
          formatDateTime(row.created_at, "yyyy-MM-dd HH:mm:ss"),
        ]
          .map((cell) => {
            const text = String(cell);
            return text.includes(",") ? `"${text}"` : text;
          })
          .join(","),
      );
      const csv = [header.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `traffic-reset-logs-${formatDateTime(Date.now() / 1000, "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(t("traffic_reset_logs.actions.export_success", { defaultValue: "导出成功" }));
    } catch {
      toast.error(t("traffic_reset_logs.actions.export_failed", { defaultValue: "导出失败" }));
    } finally {
      setExporting(false);
    }
  };

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    const resetType = (tbl.getColumn("reset_type")?.getFilterValue() as string | undefined) ?? "";
    const triggerSource = (tbl.getColumn("trigger_source")?.getFilterValue() as string | undefined) ?? "";
    /* 原件 w9t（offset 6501603）：搜索 + 重置类型/触发源下拉 + 日期区间 + 条件重置，右侧独立一行导出 */
    return (
      <div className="space-y-4">
        {/* 原件在窄屏用筛选抽屉；此处以搜索框兜底，避免小屏失去检索能力 */}
        <div className="flex items-center justify-between gap-2 md:hidden">
          <Input
            placeholder={t("traffic_reset_logs.filters.search_user", { defaultValue: "搜索用户邮箱..." })}
            value={(tbl.getColumn("user_email")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => {
              tbl.getColumn("user_email")?.setFilterValue(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 flex-1"
          />
        </div>
        <div className="hidden items-center justify-between md:flex">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder={t("traffic_reset_logs.filters.search_user", { defaultValue: "搜索用户邮箱..." })}
              value={(tbl.getColumn("user_email")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => {
                tbl.getColumn("user_email")?.setFilterValue(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
            />
            <Select
              value={resetType === "" ? "all" : resetType}
              onValueChange={(value) => {
                tbl.getColumn("reset_type")?.setFilterValue(value === "all" ? "" : value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder={t("traffic_reset_logs.filters.reset_type", { defaultValue: "重置类型" })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("traffic_reset_logs.filters.all_types", { defaultValue: "全部类型" })}
                </SelectItem>
                {RESET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`traffic_reset_logs.filters.reset_types.${type}`, { defaultValue: type })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={triggerSource === "" ? "all" : triggerSource}
              onValueChange={(value) => {
                tbl.getColumn("trigger_source")?.setFilterValue(value === "all" ? "" : value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue
                  placeholder={t("traffic_reset_logs.filters.trigger_source", { defaultValue: "触发源" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("traffic_reset_logs.filters.all_sources", { defaultValue: "全部来源" })}
                </SelectItem>
                {TRIGGER_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {t(`traffic_reset_logs.filters.trigger_sources.${source}`, { defaultValue: source })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="h-8 w-[140px]"
                aria-label={t("traffic_reset_logs.filters.start_date", { defaultValue: "开始日期" })}
              />
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="h-8 w-[140px]"
                aria-label={t("traffic_reset_logs.filters.end_date", { defaultValue: "结束日期" })}
              />
              {(dateStart || dateEnd) && (
                <Button variant="outline" size="sm" className="h-8" onClick={applyDateRange}>
                  {t("traffic_reset_logs.filters.apply_date", { defaultValue: "应用筛选" })}
                </Button>
              )}
            </div>
            {filtersActive && (
              <Button
                variant="ghost"
                onClick={() => {
                  tbl.resetColumnFilters();
                  setDateStart("");
                  setDateEnd("");
                }}
                className="h-8 px-2 lg:px-3"
              >
                {t("traffic_reset_logs.filters.reset", { defaultValue: "重置筛选" })}
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 border-dashed" onClick={exportCsv} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting
              ? t("traffic_reset_logs.actions.exporting", { defaultValue: "导出中..." })
              : t("traffic_reset_logs.actions.export", { defaultValue: "导出日志" })}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
        <Layout>
        <LayoutHeader>
          <div>
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              {t("traffic_reset_logs.title", { defaultValue: "流量重置日志" })}
            </h2>
            <p className="text-sm text-muted-foreground md:mt-2">
              {t("traffic_reset_logs.description", { defaultValue: "查看系统中所有流量重置操作的详细记录" })}
            </p>
          </div>
        </LayoutHeader>
        <LayoutBody dense fixedHeight className="flex flex-col overflow-hidden">
          <div className="h-full w-full">
            <DataTable table={table} toolbar={toolbar} isLoading={isFetching} />
          </div>
        </LayoutBody>
        </Layout>
    </TooltipProvider>
  );
}
