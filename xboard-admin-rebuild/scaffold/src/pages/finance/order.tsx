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
import { CheckCircle2, ChevronDown, Clock, HelpCircle, Loader2, MoreHorizontal, Plus, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FacetedFilter,
  SECURE,
  apiPost,
  formatAmount,
  formatDateTime,
} from "@/pages/_b/shared";

/**
 * 原件 `/finance/order`：页面组件 L6t（offset 6342596）→ 专属组件 E6t（1332B）
 * 列工厂 N6t、工具栏 _6t（bundle 541073 附近）。
 * 服务端分页：queryKey ["orderList", pagination, columnFilters, sorting]，
 * POST /order/fetch { pageSize, current, filter, sort }，响应 { data, total }。
 */

/** 原件 Z$t，订单状态 */
const ORDER_STATUS = { PENDING: 0, PROCESSING: 1, CANCELLED: 2, COMPLETED: 3, DISCOUNTED: 4 } as const;
const STATUS_NAMES: Record<number, string> = {
  0: "PENDING",
  1: "PROCESSING",
  2: "CANCELLED",
  3: "COMPLETED",
  4: "DISCOUNTED",
};

/** 原件 Q$t，订单类型 */
const ORDER_TYPE: Record<number, string> = { 1: "NEW", 2: "RENEWAL", 3: "UPGRADE", 4: "RESET_FLOW" };

/** 原件 J$t，佣金状态 */
const COMMISSION_STATUS = { PENDING: 0, PROCESSING: 1, VALID: 2, INVALID: 3 } as const;
const COMMISSION_NAMES: Record<number, string> = { 0: "PENDING", 1: "PROCESSING", 2: "VALID", 3: "INVALID" };

const PERIODS = [
  "month_price",
  "quarter_price",
  "half_year_price",
  "year_price",
  "two_year_price",
  "three_year_price",
  "onetime_price",
  "reset_price",
];

export interface OrderRow {
  id: number;
  trade_no: string;
  type?: number | null;
  period?: string | null;
  plan?: { name?: string } | null;
  total_amount?: number;
  status?: number;
  commission_balance?: number;
  commission_status?: number;
  created_at?: number;
}

interface OrderPage {
  data?: OrderRow[];
  total?: number;
}

/* 端点（bundle 541073）：FD/VD/WD/HD */
const fetchOrders = (body: Record<string, unknown>) => apiPost<OrderPage>(`${SECURE}/order/fetch`, body);
const markOrderPaid = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/order/paid`, body);
const cancelOrder = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/order/cancel`, body);
const updateOrder = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/order/update`, body);
/* 原件 f6t：订单分配对话框的提交端点（/order/assign）与订阅计划来源（/plan/fetch） */
const assignOrder = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/order/assign`, body);
const fetchPlans = () => apiPost<{ data?: { id: number; name: string }[] }>(`${SECURE}/plan/fetch`);

/** facet 写入 string[]，而列值为 number/string，统一按字符串比较 */
const facetFilter = (row: { getValue: (id: string) => unknown }, id: string, value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) return true;
  const raw = row.getValue(id);
  return raw != null && value.map(String).includes(String(raw));
};

/** 原件 f6t（offset 6323846）：订单分配对话框 */
function AssignOrderDialog({ refetch }: { refetch: () => void }) {
  const { t } = useTranslation(["order", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [plans, setPlans] = React.useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = React.useState({ email: "", plan_id: "", period: PERIODS[0], total_amount: "" });

  React.useEffect(() => {
    if (!open) return;
    fetchPlans()
      .then((body) => setPlans(body.data ?? []))
      .catch(() => setPlans([]));
  }, [open]);

  const submit = async () => {
    setBusy(true);
    try {
      const body = await assignOrder({
        email: form.email,
        plan_id: form.plan_id ? Number(form.plan_id) : null,
        period: form.period,
        /* 表单以元输入，接口以分提交（原件 `onChange(100*parseFloat(...))`） */
        total_amount: Math.round(Number(form.total_amount || "0") * 100),
      });
      if (body.data) {
        toast.success(t("dialog.messages.addSuccess", { defaultValue: "添加成功" }));
        setForm({ email: "", plan_id: "", period: PERIODS[0], total_amount: "" });
        setOpen(false);
        refetch();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 space-x-2">
          <Plus className="h-4 w-4" />
          <div>{t("dialog.addOrder", { defaultValue: "添加订单" })}</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialog.assignOrder", { defaultValue: "订单分配" })}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dialog.fields.userEmail", { defaultValue: "用户邮箱" })}
            </label>
            <Input
              value={form.email}
              placeholder={t("dialog.placeholders.email", { defaultValue: "请输入用户邮箱" })}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dialog.fields.subscriptionPlan", { defaultValue: "订阅计划" })}
            </label>
            <Select value={form.plan_id} onValueChange={(value) => setForm({ ...form, plan_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("dialog.placeholders.plan", { defaultValue: "请选择订阅计划" })} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dialog.fields.orderPeriod", { defaultValue: "订单周期" })}
            </label>
            <Select value={form.period} onValueChange={(value) => setForm({ ...form, period: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("dialog.placeholders.period", { defaultValue: "请选择购买时长" })} />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((period) => (
                  <SelectItem key={period} value={period}>
                    {t(`period.${period}`, { defaultValue: period })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dialog.fields.paymentAmount", { defaultValue: "支付金额" })}
            </label>
            <div className="relative">
              <Input
                type="number"
                value={form.total_amount}
                placeholder={t("dialog.placeholders.amount", { defaultValue: "请输入需要支付的金额" })}
                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                className="pr-10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground/40">CNY</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {t("dialog.actions.cancel", { defaultValue: "取消" })}
          </Button>
          <Button onClick={submit} disabled={busy}>
            {t("dialog.actions.confirm", { defaultValue: "确定" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FinanceOrder() {
  const { t } = useTranslation(["order", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["orderList", pagination, columnFilters, sorting],
    queryFn: () =>
      fetchOrders({
        pageSize: pagination.pageSize,
        current: pagination.pageIndex + 1,
        filter: columnFilters,
        sort: sorting,
      }),
  });

  const columns = React.useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: "trade_no",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.tradeNo", { defaultValue: "订单号" })} />
        ),
        cell: ({ row }) => {
          const tradeNo = row.original.trade_no ?? "";
          const short = tradeNo.length > 6 ? `${tradeNo.slice(0, 3)}...${tradeNo.slice(-3)}` : tradeNo;
          return (
            <div className="flex items-center">
              <span className="flex h-8 items-center gap-1.5 px-2 font-mono font-medium text-primary">
                {short}
              </span>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.tradeNo", { defaultValue: "订单号" }) },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.type", { defaultValue: "类型" })} />
        ),
        cell: ({ row }) => {
          const type = row.original.type;
          const name = type != null ? ORDER_TYPE[type] : undefined;
          return (
            <Badge variant="secondary" className="font-medium text-nowrap">
              {name ? t(`type.${name}`, { defaultValue: name }) : String(type ?? "-")}
            </Badge>
          );
        },
        enableSorting: false,
        enableHiding: false,
        /* facet 写入 string[]，列值为 number/string */
        filterFn: (row, id, value) => facetFilter(row, id, value),
        meta: { label: t("table.columns.type", { defaultValue: "类型" }) },
      },
      {
        accessorKey: "plan.name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.plan", { defaultValue: "订阅计划" })} />
        ),
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <span className="max-w-32 truncate font-medium text-foreground/90 sm:max-w-72 md:max-w-[31rem]">
              {row.original.plan?.name || "-"}
            </span>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.plan", { defaultValue: "订阅计划" }) },
      },
      {
        accessorKey: "period",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.period", { defaultValue: "周期" })} />
        ),
        cell: ({ row }) => {
          const period = row.original.period;
          return (
            <Badge variant="secondary" className="font-medium text-nowrap">
              {period ? t(`period.${period}`, { defaultValue: period }) : "-"}
            </Badge>
          );
        },
        enableSorting: false,
        enableHiding: false,
        /* facet 写入 string[]，列值为 number/string */
        filterFn: (row, id, value) => facetFilter(row, id, value),
        meta: { label: t("table.columns.period", { defaultValue: "周期" }) },
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.amount", { defaultValue: "支付金额" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center font-mono text-foreground/90">
            ¥{formatAmount(row.original.total_amount)}
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { label: t("table.columns.amount", { defaultValue: "支付金额" }) },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <DataTableColumnHeader column={column} title={t("table.columns.status", { defaultValue: "订单状态" })} />
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground/70" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-sm">
                {t("status.tooltip", { defaultValue: "标记为[已支付]后将会由系统进行开通后并完成" })}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const name = status != null ? STATUS_NAMES[status] : undefined;
          if (!name) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {status === ORDER_STATUS.PENDING ? (
                  <Loader2 className="h-4 w-4 text-amber-500" />
                ) : status === ORDER_STATUS.COMPLETED ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">{t(`status.${name}`, { defaultValue: name })}</span>
              </div>
              {status === ORDER_STATUS.PENDING ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/60">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("actions.openMenu", { defaultValue: "打开菜单" })}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[140px]">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        await markOrderPaid({ trade_no: row.original.trade_no });
                        refetch();
                      }}
                    >
                      {t("actions.markAsPaid", { defaultValue: "标记为已支付" })}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={async () => {
                        await cancelOrder({ trade_no: row.original.trade_no });
                        refetch();
                      }}
                    >
                      {t("actions.cancel", { defaultValue: "取消订单" })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
        /* facet 写入 string[]，列值为 number/string */
        filterFn: (row, id, value) => facetFilter(row, id, value),
        meta: { label: t("table.columns.status", { defaultValue: "订单状态" }) },
      },
      {
        accessorKey: "commission_balance",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.commission", { defaultValue: "佣金金额" })} />
        ),
        cell: ({ row }) => {
          const balance = row.original.commission_balance;
          return (
            <div className="flex items-center font-mono text-foreground/90">
              {balance ? `¥${formatAmount(balance)}` : "-"}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
        meta: { label: t("table.columns.commission", { defaultValue: "佣金金额" }) },
      },
      {
        accessorKey: "commission_status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.columns.commissionStatus", { defaultValue: "佣金状态" })}
          />
        ),
        cell: ({ row }) => {
          const commission = row.original.commission_status;
          const orderStatus = row.original.status;
          const balance = row.original.commission_balance;
          const name = commission != null ? COMMISSION_NAMES[commission] : undefined;
          if (!balance || !name) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t(`commission.${name}`, { defaultValue: name })}</span>
              {commission === COMMISSION_STATUS.PENDING && orderStatus === ORDER_STATUS.COMPLETED ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/60">
                      <ChevronDown className="h-4 w-4" />
                      <span className="sr-only">{t("actions.openMenu", { defaultValue: "打开菜单" })}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[120px]">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        await updateOrder({
                          trade_no: row.original.trade_no,
                          commission_status: COMMISSION_STATUS.PROCESSING,
                        });
                        refetch();
                      }}
                    >
                      {t("commission.PROCESSING", { defaultValue: "发放中" })}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={async () => {
                        await updateOrder({
                          trade_no: row.original.trade_no,
                          commission_status: COMMISSION_STATUS.INVALID,
                        });
                        refetch();
                      }}
                    >
                      {t("commission.INVALID", { defaultValue: "无效" })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
        /* facet 写入 string[]，列值为 number/string */
        filterFn: (row, id, value) => facetFilter(row, id, value),
        meta: { label: t("table.columns.commissionStatus", { defaultValue: "佣金状态" }) },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.createdAt", { defaultValue: "创建时间" })} />
        ),
        cell: ({ row }) => (
          <div className="text-nowrap font-mono text-sm text-muted-foreground">
            {formatDateTime(row.original.created_at, "yyyy/MM/dd HH:mm:ss")}
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { label: t("table.columns.createdAt", { defaultValue: "创建时间" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<OrderRow>({
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
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 _6t（offset 6326983）：添加订单 + 搜索 + 类型/周期/状态/佣金状态 facet + 条件重置 */
    const typeOptions = Object.keys(ORDER_TYPE).map((value) => ({
      label: t(`type.${ORDER_TYPE[Number(value)]}`, { defaultValue: ORDER_TYPE[Number(value)] }),
      value,
      color:
        Number(value) === 1
          ? "green-500"
          : Number(value) === 2
            ? "blue-500"
            : Number(value) === 3
              ? "purple-500"
              : "orange-500",
    }));
    const periodOptions = PERIODS.map((period) => ({
      label: t(`period.${period}`, { defaultValue: period }),
      value: period,
    }));
    const statusOptions = Object.keys(STATUS_NAMES).map((value) => ({
      label: t(`status.${STATUS_NAMES[Number(value)]}`, { defaultValue: STATUS_NAMES[Number(value)] }),
      value,
      icon: Number(value) === 0 ? Clock : Number(value) === 1 ? Loader2 : Number(value) === 3 ? CheckCircle2 : XCircle,
      color:
        Number(value) === 0
          ? "yellow-500"
          : Number(value) === 1
            ? "blue-500"
            : Number(value) === 2
              ? "red-500"
              : "green-500",
    }));
    const commissionOptions = Object.keys(COMMISSION_NAMES).map((value) => ({
      label: t(`commission.${COMMISSION_NAMES[Number(value)]}`, { defaultValue: COMMISSION_NAMES[Number(value)] }),
      value,
      icon: Number(value) === 0 ? Clock : Number(value) === 1 ? Loader2 : Number(value) === 2 ? CheckCircle2 : XCircle,
      color:
        Number(value) === 0
          ? "yellow-500"
          : Number(value) === 1
            ? "blue-500"
            : Number(value) === 2
              ? "green-500"
              : "red-500",
    }));

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
          <AssignOrderDialog refetch={refetch} />
          <Input
            placeholder={t("search.placeholder", { defaultValue: "搜索订单..." })}
            value={(tbl.getColumn("trade_no")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => {
              tbl.getColumn("trade_no")?.setFilterValue(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
          />
          <div className="flex flex-wrap gap-2">
            {tbl.getColumn("type") && (
              <FacetedFilter
                column={tbl.getColumn("type")}
                title={t("table.columns.type", { defaultValue: "类型" })}
                options={typeOptions}
              />
            )}
            {tbl.getColumn("period") && (
              <FacetedFilter
                column={tbl.getColumn("period")}
                title={t("table.columns.period", { defaultValue: "周期" })}
                options={periodOptions}
              />
            )}
            {tbl.getColumn("status") && (
              <FacetedFilter
                column={tbl.getColumn("status")}
                title={t("table.columns.status", { defaultValue: "订单状态" })}
                options={statusOptions}
              />
            )}
            {tbl.getColumn("commission_status") && (
              <FacetedFilter
                column={tbl.getColumn("commission_status")}
                title={t("table.columns.commissionStatus", { defaultValue: "佣金状态" })}
                options={commissionOptions}
              />
            )}
          </div>
          {filtersActive && (
            <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-8 px-2 lg:px-3">
              {t("actions.reset", { defaultValue: "重置" })}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
        <Layout>
        <LayoutHeader>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "订单管理" })}</h2>
            <p className="text-muted-foreground mt-2">
              {t("description", { defaultValue: "在这里可以查看和管理所有订单。" })}
            </p>
          </div>
        </LayoutHeader>
        <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
          <DataTable
            table={table}
            toolbar={toolbar}
            showPagination
            isLoading={isFetching}
            mobilePrimaryField="trade_no"
          />
        </LayoutBody>
        </Layout>
    </TooltipProvider>
  );
}
