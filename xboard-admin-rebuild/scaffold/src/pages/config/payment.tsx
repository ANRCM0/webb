import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Copy, GripVertical, HelpCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmDialog,
  SECURE,
  apiGet,
  apiPost,
  boolFilter,
  useDragSort,
  useSyncedRows,
} from "@/pages/_b/shared";

/**
 * 原件 `/config/payment`：页面组件 _Qt（offset 5866421）→ 专属组件 fQt（1679B）
 * 列工厂 pQt、工具栏 mQt、弹窗 JXt（bundle 540275 附近）。
 */

export interface PaymentRow {
  id: number;
  name: string;
  payment: string;
  enable?: boolean | number;
  icon?: string;
  notify_domain?: string;
  notify_url?: string;
  handling_fee_percent?: number;
  handling_fee_fixed?: number;
  config?: Record<string, unknown>;
}

interface PaymentForm {
  id: number | null;
  name: string;
  icon: string;
  notify_domain: string;
  handling_fee_percent: string;
  handling_fee_fixed: string;
  payment: string;
  config: string;
}

const emptyForm: PaymentForm = {
  id: null,
  name: "",
  icon: "",
  notify_domain: "",
  handling_fee_percent: "",
  handling_fee_fixed: "",
  payment: "",
  config: "",
};

/* 端点（bundle 540275）：uD/hD/gD/pD/mD/fD/_D */
const fetchPayments = () => apiGet<{ data?: PaymentRow[] }>(`${SECURE}/payment/fetch`);
const fetchPaymentMethods = () => apiGet<{ data?: string[] }>(`${SECURE}/payment/getPaymentMethods`);
const fetchPaymentForm = (body: Record<string, unknown>) =>
  apiPost<{ data?: Record<string, unknown> }>(`${SECURE}/payment/getPaymentForm`, body);
const savePayment = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/payment/save`, body);
const dropPayment = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/payment/drop`, body);
const showPayment = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/payment/show`, body);
const sortPayments = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/payment/sort`, body);

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function PaymentDialog({
  refetch,
  defaultFormValues,
  type = "add",
  trigger,
}: {
  refetch: () => void;
  defaultFormValues?: PaymentRow;
  type?: "add" | "edit";
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["payment", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<PaymentForm>(emptyForm);
  const [methods, setMethods] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    if (defaultFormValues) {
      setForm({
        id: defaultFormValues.id,
        name: defaultFormValues.name ?? "",
        icon: defaultFormValues.icon ?? "",
        notify_domain: defaultFormValues.notify_domain ?? "",
        handling_fee_percent: defaultFormValues.handling_fee_percent
          ? String(defaultFormValues.handling_fee_percent)
          : "",
        handling_fee_fixed: defaultFormValues.handling_fee_fixed
          ? String(defaultFormValues.handling_fee_fixed / 100)
          : "",
        payment: defaultFormValues.payment ?? "",
        config: JSON.stringify(defaultFormValues.config ?? {}, null, 2),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, defaultFormValues]);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    fetchPaymentMethods()
      .then((body) => {
        if (alive) setMethods(body.data ?? []);
      })
      .catch(() => {
        if (alive) setMethods([]);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  /* 原件：切换支付接口时拉取该接口的配置表单 */
  React.useEffect(() => {
    if (!open || !form.payment) return;
    let alive = true;
    const payload: Record<string, unknown> = { payment: form.payment };
    if (type === "edit" && form.id != null) payload.id = form.id;
    fetchPaymentForm(payload)
      .then((body) => {
        if (alive && body.data) setForm((prev) => ({ ...prev, config: JSON.stringify(body.data, null, 2) }));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [open, form.payment, form.id, type]);

  const submit = async () => {
    setBusy(true);
    try {
      let config: Record<string, unknown> = {};
      try {
        config = form.config ? (JSON.parse(form.config) as Record<string, unknown>) : {};
      } catch {
        config = {};
      }
      await savePayment({
        id: form.id,
        name: form.name,
        icon: form.icon || null,
        notify_domain: form.notify_domain || null,
        handling_fee_percent: form.handling_fee_percent ? Number(form.handling_fee_percent) : null,
        handling_fee_fixed: form.handling_fee_fixed ? Math.round(Number(form.handling_fee_fixed) * 100) : null,
        payment: form.payment,
        config,
      });
      toast.success(t("form.messages.success", { defaultValue: "保存成功" }));
      setOpen(false);
      refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "edit"
              ? t("form.edit.title", { defaultValue: "编辑支付方式" })
              : t("form.add.title", { defaultValue: "添加支付方式" })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.fields.name.label", { defaultValue: "显示名称" })}
            </label>
            <Input
              value={form.name}
              placeholder={t("form.fields.name.placeholder", { defaultValue: "请输入支付名称" })}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.fields.icon.label", { defaultValue: "图标URL" })}
            </label>
            <Input
              value={form.icon}
              placeholder={t("form.fields.icon.placeholder", { defaultValue: "https://example.com/icon.svg" })}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.fields.notify_domain.label", { defaultValue: "通知域名" })}
            </label>
            <Input
              value={form.notify_domain}
              placeholder={t("form.fields.notify_domain.placeholder", { defaultValue: "https://example.com" })}
              onChange={(e) => setForm({ ...form, notify_domain: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("form.fields.handling_fee_percent.label", { defaultValue: "百分比手续费(%)" })}
              </label>
              <Input
                type="number"
                value={form.handling_fee_percent}
                placeholder="0-100"
                onChange={(e) => setForm({ ...form, handling_fee_percent: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("form.fields.handling_fee_fixed.label", { defaultValue: "固定手续费" })}
              </label>
              <Input
                type="number"
                value={form.handling_fee_fixed}
                placeholder="0"
                onChange={(e) => setForm({ ...form, handling_fee_fixed: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.fields.payment.label", { defaultValue: "支付接口" })}
            </label>
            <Select value={form.payment} onValueChange={(v: string) => setForm({ ...form, payment: v })}>
              <SelectTrigger className="h-9 font-mono text-xs">
                <SelectValue placeholder={t("form.fields.payment.placeholder", { defaultValue: "请选择支付接口" })} />
              </SelectTrigger>
              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.payment ? (
            <div className="space-y-1 border-t pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("form.sections.payment_config", { defaultValue: "支付配置" })}
              </div>
              <Textarea
                rows={6}
                className="w-full font-mono text-xs"
                value={form.config}
                onChange={(e) => setForm({ ...form, config: e.target.value })}
              />
            </div>
          ) : null}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {t("form.buttons.cancel", { defaultValue: "取消" })}
          </Button>
          <Button onClick={submit} disabled={busy}>
            {t("form.buttons.submit", { defaultValue: "提交" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ConfigPayment() {
  const { t } = useTranslation(["payment", "common"]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isSortMode, setIsSortMode] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ "drag-handle": false });
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 20, pageIndex: 0 });

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["paymentList"],
    queryFn: async () => (await fetchPayments()).data,
  });

  const [rows, setRows] = useSyncedRows<PaymentRow>(data);

  /* 原件：把 enable 统一成布尔 */
  React.useEffect(() => {
    if (data) setRows(data.map((row) => ({ ...row, enable: Boolean(row.enable) })));
  }, [data, setRows]);

  /* 原件 fQt 第二个 useEffect */
  React.useEffect(() => {
    setColumnVisibility({ "drag-handle": isSortMode, actions: !isSortMode });
    setPagination({ pageSize: isSortMode ? 99999 : 10, pageIndex: 0 });
  }, [isSortMode]);

  const saveOrder = async () => {
    if (!isSortMode) {
      setIsSortMode(true);
      return;
    }
    await sortPayments({ ids: rows.map((r) => r.id) });
    refetch();
    setIsSortMode(false);
    toast.success(t("table.toolbar.sort.save", { defaultValue: "排序保存成功" }));
  };

  const columns = React.useMemo<ColumnDef<PaymentRow>[]>(
    () => [
      {
        id: "drag-handle",
        header: () => null,
        cell: () => (
          <div className={isSortMode ? "cursor-move" : "opacity-0"}>
            <GripVertical className="size-4" />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.toolbar.sort.edit", { defaultValue: "编辑排序" }) },
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.id", { defaultValue: "ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {row.original.id}
            </Badge>
          </div>
        ),
        enableSorting: true,
        size: 60,
        meta: { label: t("table.columns.id", { defaultValue: "ID" }) },
      },
      {
        accessorKey: "enable",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.enable", { defaultValue: "启用" })} />
        ),
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.enable)}
            onCheckedChange={async () => {
              const body = await showPayment({ id: row.original.id });
              if (!body.data) refetch();
            }}
          />
        ),
        enableSorting: false,
        size: 100,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("table.columns.enable", { defaultValue: "启用" }) },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.name", { defaultValue: "显示名称" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <span className="max-w-[200px] truncate font-medium">{row.original.name}</span>
          </div>
        ),
        enableSorting: false,
        size: 200,
        meta: { label: t("table.columns.name", { defaultValue: "显示名称" }) },
      },
      {
        accessorKey: "payment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.payment", { defaultValue: "支付接口" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <span className="max-w-[200px] truncate font-medium">{row.original.payment}</span>
          </div>
        ),
        enableSorting: false,
        size: 200,
        meta: { label: t("table.columns.payment", { defaultValue: "支付接口" }) },
      },
      {
        accessorKey: "notify_url",
        header: ({ column }) => (
          <div className="flex items-center">
            <DataTableColumnHeader
              column={column}
              title={t("table.columns.notify_url", { defaultValue: "通知地址" })}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="ml-1 h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t("table.columns.notify_url_tooltip", {
                  defaultValue: "支付网关将会把数据通知到本地址，请通过防火墙放行本地址。",
                })}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
        cell: ({ row }) => (
          <div className="group/url flex items-center gap-1">
            <span className="max-w-[260px] truncate font-medium">{row.original.notify_url}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-muted-foreground/40 opacity-0 transition-all duration-200 hover:text-muted-foreground group-hover/url:opacity-100"
              onClick={async (e) => {
                e.stopPropagation();
                const ok = await copyText(row.original.notify_url ?? "");
                if (ok) toast.success(t("common:copy.success", { defaultValue: "复制成功" }));
              }}
            >
              <Copy className="size-3" />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 3000,
        meta: { label: t("table.columns.notify_url", { defaultValue: "通知地址" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title={t("table.columns.actions", { defaultValue: "操作" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <PaymentDialog
              refetch={refetch}
              type="edit"
              defaultFormValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">{t("table.actions.edit", { defaultValue: "编辑" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("table.actions.delete.title", { defaultValue: "删除确认" })}
              description={t("table.actions.delete.description", {
                defaultValue: "确定要删除该支付方式吗？此操作无法撤销。",
              })}
              onConfirm={async () => {
                const body = await dropPayment({ id: row.original.id });
                if (body.data) refetch();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                <span className="sr-only">{t("table.actions.delete.title", { defaultValue: "删除确认" })}</span>
              </Button>
            </ConfirmDialog>
          </div>
        ),
        size: 100,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [isSortMode, refetch, t],
  );

  const table = useReactTable<PaymentRow>({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnPinning: { right: ["actions"] } },
    pageCount: isSortMode ? 1 : undefined,
  });

  const drag = useDragSort<PaymentRow>({ enabled: isSortMode, rows, setRows });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 mQt（offset 5863721）：排序模式只留提示语；否则 新增 + 搜索 + 条件重置 …… 排序模式切换 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {isSortMode ? (
          <p className="text-sm text-muted-foreground">
            {t("table.toolbar.sort.hint", { defaultValue: "拖拽支付方式进行排序，完成后点击保存" })}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <PaymentDialog
              refetch={refetch}
              trigger={
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <div>{t("form.add.button", { defaultValue: "添加支付方式" })}</div>
                </Button>
              }
            />
            <Input
              placeholder={t("table.toolbar.search", { defaultValue: "搜索支付方式..." })}
              value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => tbl.getColumn("name")?.setFilterValue(e.target.value)}
              className="h-8 w-full sm:w-[150px] lg:w-[250px]"
            />
            {filtersActive && (
              <Button variant="ghost" onClick={() => tbl.resetColumnFilters()}>
                {t("table.toolbar.reset", { defaultValue: "重置" })}
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {tbl.getRowCount() > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant={isSortMode ? "default" : "outline"} onClick={saveOrder} size="sm">
              {isSortMode
                ? t("table.toolbar.sort.save", { defaultValue: "保存排序" })
                : t("table.toolbar.sort.edit", { defaultValue: "编辑排序" })}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
        <Layout>
        <LayoutHeader>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "支付配置" })}</h2>
            <p className="text-muted-foreground mt-2">
              {t("description", { defaultValue: "在这里可以配置支付方式，包括支付宝、微信等。" })}
            </p>
          </div>
        </LayoutHeader>
        <LayoutBody dense className="flex flex-col overflow-auto">
          <DataTable
            table={table}
            toolbar={toolbar}
            draggable={isSortMode}
            onDragStart={drag.onDragStart}
            onDragEnd={drag.onDragEnd}
            onDragOver={drag.onDragOver}
            onDragLeave={drag.onDragLeave}
            onDrop={drag.onDrop}
            showPagination={!isSortMode}
            isLoading={isFetching}
            mobilePrimaryField="name"
          />
        </LayoutBody>
        </Layout>
    </TooltipProvider>
  );
}
