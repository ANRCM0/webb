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
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Ban, CornerUpRight, Globe, Pencil, Plus, Route as RouteIcon, Trash2, X } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/pages/_b/shared";

/**
 * 原件 `/server/route`：页面组件 Y3t（offset 6299974）→ 专属组件 G3t（56B 壳）
 * 列工厂 Z3t、工具栏 K3t、表单 q3t（bundle 540043 附近）。
 * 注：原件列表用 useState + useEffect 直接调用 aD()，这里按本组约定改成 useQuery。
 */

export type RouteAction = "block" | "dns" | "direct" | "proxy";

export interface RouteRow {
  id: number;
  remarks: string;
  match?: string[];
  action: RouteAction;
  action_value?: string | null;
}

interface RouteForm {
  id: number | null;
  remarks: string;
  match: string;
  action: RouteAction;
  action_value: string;
}

const emptyForm: RouteForm = { id: null, remarks: "", match: "", action: "block", action_value: "" };

/* 端点（bundle 540043）：aD/lD/cD */
const fetchRoutes = () => apiGet<{ data?: RouteRow[] }>(`${SECURE}/server/route/fetch`);
const saveRoute = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/route/save`, body);
const dropRoute = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/route/drop`, body);

/** 原件 Z3t 的四色徽标：variant 与 className 逐字对齐 */
const ACTION_STYLES: Record<
  RouteAction,
  { variant: "destructive" | "secondary" | "default"; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  block: {
    variant: "destructive",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800",
    icon: Ban,
  },
  dns: {
    variant: "secondary",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800",
    icon: Globe,
  },
  direct: {
    variant: "secondary",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800",
    icon: CornerUpRight,
  },
  proxy: {
    variant: "default",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800",
    icon: RouteIcon,
  },
};

/* 原件 shadcn form 原语的基类（脚手架未提供 form.tsx，与 coupon 页同样在页面内复刻合并结果） */
const FORM_LABEL_BASE = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
const FORM_MESSAGE_BASE = "text-[0.8rem] font-medium text-destructive";

/**
 * 原件 TYt：Label(+必填星号) +（自定义控件 | Input）+ Message。
 * `extra` 分支在原件里会被包进 `<div className="flex min-h-9 w-full items-center">`。
 */
function RouteField({
  label,
  required,
  placeholder,
  error,
  extra,
  value,
  onChange,
  inputRef,
}: {
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  extra?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className={cn("space-y-2", "space-y-1.5")}>
      {label && (
        <label
          className={cn(
            FORM_LABEL_BASE,
            "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
          )}
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {extra ? (
          <div className="flex min-h-9 w-full items-center">{extra}</div>
        ) : (
          <Input
            ref={inputRef}
            value={value ?? ""}
            placeholder={placeholder}
            onChange={(event) => onChange?.(event.target.value)}
            className="h-9 font-mono text-xs transition-all focus-visible:ring-1"
          />
        )}
      </div>
      {error && (
        <p className={cn(FORM_MESSAGE_BASE, "font-mono text-[10px] uppercase tracking-tight")}>{error}</p>
      )}
    </div>
  );
}

/** 原件 q3t（offset 6292582）：创建/编辑路由弹窗 */
function RouteDialog({
  refetch,
  defaultFormValues,
  trigger,
}: {
  refetch: () => void;
  defaultFormValues?: RouteRow;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["route", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<RouteForm>(emptyForm);
  const [errors, setErrors] = React.useState<{ remarks?: string }>({});

  React.useEffect(() => {
    if (!open) return;
    if (defaultFormValues) {
      setForm({
        id: defaultFormValues.id,
        remarks: defaultFormValues.remarks ?? "",
        match: (defaultFormValues.match ?? []).join("\n"),
        action: defaultFormValues.action ?? "block",
        action_value: defaultFormValues.action_value ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, defaultFormValues]);

  const remarksInputRef = React.useRef<HTMLInputElement>(null);

  /* 原件实测：编辑态打开后备注输入框获得焦点且文本全选（selectionStart/End = 0/len） */
  React.useEffect(() => {
    if (!open || !defaultFormValues) return;
    const timer = window.setTimeout(() => {
      remarksInputRef.current?.focus();
      remarksInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, defaultFormValues]);

  const update = (patch: Partial<RouteForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    /* 原件 $3t：remarks 必填（form.validation.remarks），其余可选 */
    const nextErrors: { remarks?: string } = {};
    if (!form.remarks.trim()) {
      nextErrors.remarks = t("form.validation.remarks", { defaultValue: "请输入有效的备注" });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      if (defaultFormValues?.id) payload.id = defaultFormValues.id;
      payload.remarks = form.remarks;
      /* 原件：match 允许数组/字符串，提交前拆行并过滤空行 */
      payload.match = form.match
        .split("\n")
        .filter((line) => line !== "" && line.trim() !== "");
      payload.action = form.action;
      /* 原件：非 dns/proxy 时把 action_value 置空字符串 */
      payload.action_value = form.action === "dns" || form.action === "proxy" ? form.action_value : "";
      await saveRoute(payload);
      toast.success(
        defaultFormValues
          ? t("messages.updateSuccess", { defaultValue: "更新成功" })
          : t("messages.createSuccess", { defaultValue: "创建成功" }),
      );
      setOpen(false);
      refetch();
    } catch {
      toast.error(t("messages.saveFailed", { defaultValue: "保存失败" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl">
        <DialogHeader className="flex-shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-lg tracking-tight">
            {defaultFormValues
              ? t("form.edit", { defaultValue: "编辑路由" })
              : t("form.create", { defaultValue: "创建路由" })}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 py-4 text-sm">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 rounded border border-destructive/20 bg-destructive/10 p-2 font-mono text-xs text-destructive">
                  {t("messages.validationError", { defaultValue: "表单校验失败，请检查输入" })}
                </div>
              )}
              <RouteField
                label={t("form.remarks", { defaultValue: "备注" })}
                placeholder={t("form.remarksPlaceholder", { defaultValue: "请输入备注" })}
                required
                value={form.remarks}
                onChange={(value) => update({ remarks: value })}
                error={errors.remarks}
                inputRef={remarksInputRef}
              />
              <RouteField
                label={t("form.match", { defaultValue: "匹配规则" })}
                required
                extra={
                  <Textarea
                    className="min-h-[120px] font-mono text-xs"
                    placeholder={t("form.matchPlaceholder", { defaultValue: "example.com\n*.example.com" })}
                    value={form.match}
                    onChange={(event) => update({ match: event.target.value })}
                  />
                }
              />
              <RouteField
                label={t("form.action", { defaultValue: "动作" })}
                required
                extra={
                  <Select
                    value={form.action}
                    onValueChange={(value: string) => update({ action: value as RouteAction })}
                  >
                    <SelectTrigger className="h-9 font-mono text-xs">
                      <SelectValue placeholder={t("form.actionPlaceholder", { defaultValue: "请选择动作" })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">{t("actions.block", { defaultValue: "禁止访问" })}</SelectItem>
                      <SelectItem value="dns">{t("actions.dns", { defaultValue: "指定DNS服务器进行解析" })}</SelectItem>
                      <SelectItem value="direct">{t("actions.direct", { defaultValue: "直连" })}</SelectItem>
                      <SelectItem value="proxy">{t("actions.proxy", { defaultValue: "转发" })}</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              {form.action === "dns" && (
                <RouteField
                  label={t("form.dns", { defaultValue: "DNS服务器" })}
                  placeholder={t("form.dnsPlaceholder", { defaultValue: "请输入DNS服务器" })}
                  required
                  value={form.action_value}
                  onChange={(value) => update({ action_value: value })}
                />
              )}
              {form.action === "proxy" && (
                <RouteField
                  label={t("form.proxy", { defaultValue: "转发标签 (Outbound Tag)" })}
                  placeholder={t("form.proxyPlaceholder", { defaultValue: "请输入转发标签" })}
                  required
                  value={form.action_value}
                  onChange={(value) => update({ action_value: value })}
                />
              )}
            </form>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t border-border px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2" />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-8 px-4 text-xs font-bold"
                disabled={busy}
              >
                {t("common:cancel", { defaultValue: "取消" })}
              </Button>
              <Button
                type="submit"
                onClick={(event) => {
                  event.preventDefault();
                  void submit();
                }}
                className="h-8 px-8 text-xs font-bold"
                disabled={busy}
              >
                {t("common:confirm", { defaultValue: "确认" })}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ServerRoute() {
  const { t } = useTranslation(["route", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => (await fetchRoutes()).data,
  });

  const columns = React.useMemo<ColumnDef<RouteRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.id", { defaultValue: "组ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{row.original.id}</Badge>
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { label: t("columns.id", { defaultValue: "组ID" }) },
      },
      {
        accessorKey: "remarks",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.remarks", { defaultValue: "备注" })} />
        ),
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">{row.original.remarks}</span>
          </div>
        ),
        enableHiding: false,
        enableSorting: false,
        meta: { label: t("columns.remarks", { defaultValue: "备注" }) },
      },
      {
        accessorKey: "action_value",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.action_value.title", { defaultValue: "动作值" })}
          />
        ),
        cell: ({ row }) => {
          const action = row.original.action;
          const value = row.original.action_value;
          const ruleCount = row.original.match?.length ?? 0;
          return (
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium">
                {action === "dns" && value
                  ? t("columns.action_value.dns", { defaultValue: "DNS: {{value}}", value })
                  : action === "proxy" && value
                    ? t("columns.action_value.proxy", { defaultValue: "转发 ({{value}})", value })
                    : action === "block"
                      ? t("columns.action_value.block", { defaultValue: "阻止访问" })
                      : t("columns.action_value.direct", { defaultValue: "直连" })}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("columns.matchRules", { defaultValue: "匹配{{count}}条规则", count: ruleCount })}
              </span>
            </div>
          );
        },
        enableHiding: false,
        enableSorting: false,
        size: 300,
        meta: { label: t("columns.action_value.title", { defaultValue: "动作值" }) },
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.action", { defaultValue: "动作" })} />
        ),
        cell: ({ row }) => {
          const action = row.original.action;
          const style = ACTION_STYLES[action];
          const Icon = style?.icon;
          return (
            <div className="flex items-center space-x-2">
              <Badge
                variant={style?.variant ?? "default"}
                className={cn("flex items-center gap-1.5 px-3 py-1 capitalize", style?.className)}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {t(`actions.${action}`, { defaultValue: action })}
              </Badge>
            </div>
          );
        },
        enableSorting: false,
        size: 9000,
        meta: { label: t("columns.action", { defaultValue: "动作" }) },
      },
      {
        id: "actions",
        header: () => <div className="text-right">{t("columns.actions", { defaultValue: "操作" })}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <RouteDialog
              refetch={refetch}
              defaultFormValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">{t("form.edit", { defaultValue: "编辑路由" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("messages.deleteConfirm", { defaultValue: "确认删除" })}
              description={t("messages.deleteDescription", {
                defaultValue: "此操作将永久删除该路由组，删除后无法恢复。确定要继续吗？",
              })}
              confirmText={t("messages.deleteButton", { defaultValue: "删除" })}
              onConfirm={async () => {
                await dropRoute({ id: row.original.id });
                toast.success(t("messages.deleteSuccess", { defaultValue: "删除成功" }));
                refetch();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400" />
                <span className="sr-only">{t("messages.deleteButton", { defaultValue: "删除" })}</span>
              </Button>
            </ConfirmDialog>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<RouteRow>({
    data: data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
    /* 原件 K3t（offset 6295209）：新增 + 搜索（remarks）+ 条件重置，右侧无控件 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          <RouteDialog
            refetch={refetch}
            trigger={
              <Button variant="outline" size="sm" className="space-x-2">
                <Plus className="h-4 w-4" />
                <div>{t("form.add", { defaultValue: "添加路由" })}</div>
              </Button>
            }
          />
          <Input
            placeholder={t("toolbar.searchPlaceholder", { defaultValue: "搜索路由..." })}
            value={(tbl.getColumn("remarks")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => tbl.getColumn("remarks")?.setFilterValue(e.target.value)}
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
          />
          {filtersActive && (
            <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-8 px-2 lg:px-3">
              {t("toolbar.reset", { defaultValue: "重置" })}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "路由管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("description", { defaultValue: "管理所有路由组，包括添加、删除、编辑等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <DataTable table={table} toolbar={toolbar} isLoading={isFetching} mobilePrimaryField="remarks" />
      </LayoutBody>
    </Layout>
  );
}
