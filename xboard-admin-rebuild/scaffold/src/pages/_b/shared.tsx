import * as React from "react";
import { useTranslation } from "react-i18next";
import type { Column, ColumnDef, ColumnFiltersState, RowData } from "@tanstack/react-table";
import { Check, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FilterRule } from "@/components/data-table/filter-builder";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http";

/**
 * B 组（DataTable CRUD 页）共用的本地支撑代码。
 *
 * 说明：原件在模块作用域内以 `OL()` 取 `window.settings.secure_path` 作为 API 前缀
 * （bundle offset 539065：`OL=()=>window?.settings?.secure_path??""`），
 * 且 axios 响应拦截器返回响应体（bundle offset 539016：`TL.interceptors.response.use(e=>e?.data||…)`），
 * 因此这里保持同样的语义：`apiGet/apiPost` 直接解析出响应体。
 */

declare module "@tanstack/react-table" {
  // 列元信息：列标题（供列可见性下拉使用），与原件 eQt(DataTableColumnHeader) 的 title 等价
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

export const SECURE: string = window.settings?.secure_path ?? "";

export interface PageBody<T> {
  data?: T;
  total?: number;
  code?: number;
  message?: string;
}

export async function apiGet<B>(url: string, params?: Record<string, unknown>): Promise<B> {
  const res = await http.get<B>(url, params ? { params } : undefined);
  return res.data;
}

export async function apiPost<B>(url: string, body?: unknown): Promise<B> {
  const res = await http.post<B>(url, body);
  return res.data;
}

/**
 * 二进制响应的 POST（原件 `RL(url, body, { responseType: "blob" })`）：
 * user/manage 的 /user/generate 与 /user/dumpCSV 走这条路径。
 */
export async function apiPostBlob(url: string, body?: unknown): Promise<Blob> {
  const res = await http.post<Blob>(url, body, { responseType: "blob" });
  return res.data;
}

/* ------------------------------------------------------------------ *
 * 格式化（原件 RS / SS，bundle offset 541xxx）
 * ------------------------------------------------------------------ */

/** 复刻原件 RS：字节数 → 人类可读流量 */
export function formatBytes(value?: number | null): string {
  if (value == null || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = Math.floor(Math.log(value) / Math.log(1024));
  if (i < 0) i = 0;
  if (i >= units.length) i = units.length - 1;
  return `${parseFloat((value / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 复刻原件 SS：Unix 秒/毫秒/ISO 字符串 → 日期字符串（支持 yyyy MM dd HH mm ss 令牌） */
export function formatDateTime(value?: string | number | null, pattern = "yyyy-MM-dd HH:mm:ss"): string {
  if (value == null || value === "") return "";
  let d: Date;
  if (typeof value === "number") d = new Date(value < 1e11 ? value * 1000 : value);
  else if (/^\d+$/.test(value)) d = new Date(Number(value) < 1e11 ? Number(value) * 1000 : Number(value));
  else d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return pattern.replace(/yyyy|YYYY|MM|DD|dd|HH|H|mm|m|ss|s/g, (token) => {
    switch (token) {
      case "yyyy":
      case "YYYY":
        return String(d.getFullYear());
      case "MM":
        return pad2(d.getMonth() + 1);
      case "DD":
      case "dd":
        return pad2(d.getDate());
      case "HH":
        return pad2(d.getHours());
      case "H":
        return String(d.getHours());
      case "mm":
        return pad2(d.getMinutes());
      case "m":
        return String(d.getMinutes());
      case "ss":
        return pad2(d.getSeconds());
      default:
        return String(d.getSeconds());
    }
  });
}

/** 金额：分 → 元 */
export function formatAmount(cents?: number | null): string {
  if (cents == null) return "-";
  return (cents / 100).toFixed(2);
}

const GB = 1024 * 1024 * 1024;

/** 原件的 GB 输入框：GB → 字节 */
export function gbToBytes(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n * GB : 0;
}

/**
 * 复刻原件高级筛选的应用逻辑（user/manage x8t 片段）：
 * contains 直接取值；date → Unix 秒；boolean → 1/0；其余 "operator:value"。
 * GB 单位字段在 UI 层已完成换算，这里只做编码。
 */
export function applyFilterRules(
  rules: FilterRule[],
  options?: { dateFields?: string[]; booleanFields?: string[] },
): ColumnFiltersState {
  const dateFields = options?.dateFields ?? [];
  const booleanFields = options?.booleanFields ?? [];
  const out: ColumnFiltersState = [];
  for (const r of rules) {
    if (!r.field || !r.operator || r.value === "") continue;
    if (r.operator === "contains") {
      out.push({ id: r.field, value: r.value });
      continue;
    }
    let value: string | number = r.value;
    if (dateFields.includes(r.field)) {
      const d = new Date(r.value);
      if (!Number.isNaN(d.getTime())) value = Math.floor(d.getTime() / 1000);
    }
    if (booleanFields.includes(r.field)) value = r.value === "true" || r.value === "1" ? 1 : 0;
    out.push({ id: r.field, value: `${r.operator}:${value}` });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 表格辅助
 * ------------------------------------------------------------------ */

/** 复刻原件 eQt 之外的通用选择列（server/manage、user/manage 的批量操作入口） */
export function makeSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
        aria-label="select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
        disabled={!row.getCanSelect()}
        aria-label="select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    meta: { label: "选择" },
  };
}

/**
 * 布尔/开关列的本地筛选（原件用 switch 列的 filterFn 等价实现）。
 * 值可能是 "1"/"0"、"true"/"false"，也可能带 "eq:" 前缀。
 */
export function boolFilter<TData>(row: { getValue: (id: string) => unknown }, id: string, value: unknown): boolean {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return true;
  const raw = Array.isArray(value) ? String(value[0]) : String(value);
  const expected = raw.replace(/^eq:/, "") === "1" || raw.replace(/^eq:/, "") === "true";
  return Boolean(row.getValue(id)) === expected;
}

/**
 * 工具栏 facet 过滤器，复刻原件 `DataTableFacetedFilter`
 * （notice 无；knowledge `Q2t` offset 6057490、server/manage `b5t` offset 6204610、
 *  server/machine `i3t` offset 6248592、finance/order `g6t` offset 6321781、
 *  finance/coupon `D6t` offset 6343499 —— 五处结构一致，仅图标/去重键不同）。
 *
 * 结构：Popover + 可搜索的多选列表，选中态以 Badge 展示；
 * 写入的列筛选值恒为 `string[]`（原件 `Array.from(set)`，空集合写 `undefined`）。
 * 注意 "No results found." / "Clear filters" 在原件中是硬编码英文字面量，此处保持一致。
 */
export interface FacetedOption {
  label: string;
  value: string;
  /** 原件 `option.icon` 为图标组件 */
  icon?: React.ComponentType<{ className?: string }>;
  /** 原件以 `text-${color}` 拼接色值类名 */
  color?: string;
}

export function FacetedFilter<TData>({
  column,
  title,
  options,
}: {
  column?: Column<TData, unknown>;
  title: string;
  options: FacetedOption[];
}) {
  const [query, setQuery] = React.useState("");
  const raw = column?.getFilterValue();
  const selected = new Set<string>(Array.isArray(raw) ? (raw as string[]) : []);
  const facets = column?.getFacetedUniqueValues();
  const visible = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    const values = Array.from(next);
    column?.setFilterValue(values.length ? values : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selected.has(option.value))
                    .map((option) => (
                      <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="flex flex-col overflow-hidden p-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={title}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
            {visible.length === 0 && <div className="py-6 text-center text-sm">No results found.</div>}
            {visible.map((option) => {
              const active = selected.has(option.value);
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      active ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  {IconComponent && (
                    <IconComponent
                      className={cn("mr-2 h-4 w-4 text-muted-foreground", option.color && `text-${option.color}`)}
                    />
                  )}
                  <span>{option.label}</span>
                  {facets?.get(option.value) !== undefined && (
                    <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                      {facets.get(option.value)}
                    </span>
                  )}
                </button>
              );
            })}
            {selected.size > 0 && (
              <>
                <div className="-mx-1 my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => column?.setFilterValue(undefined)}
                  className="w-full justify-center rounded-sm px-2 py-1.5 text-center text-sm hover:bg-accent"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** 复刻原件 hQt：确认对话框 */
export function ConfirmDialog({
  title,
  description,
  confirmText,
  cancelText,
  confirmVariant = "destructive",
  onConfirm,
  children,
}: {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onConfirm: () => void | Promise<void>;
  children: React.ReactElement;
}) {
  const { t } = useTranslation("common");
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {cancelText ?? t("cancel", { defaultValue: "取消" })}
          </Button>
          <Button
            variant={confirmVariant}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmText ?? t("confirm", { defaultValue: "确定" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 * 拖拽排序（原件 5 个页面共用同一套 HTML5 DnD 逻辑）
 * ------------------------------------------------------------------ */

export interface DragSortHandlers {
  onDragStart: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDrop: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
}

/**
 * @param keyMode "index"：dataTransfer 传行下标（notice/knowledge/payment/plan）
 *                "id"：dataTransfer 传行主键（server/manage，原件以 node.original.id 传输）
 */
export function useDragSort<T>({
  enabled,
  rows,
  setRows,
  keyMode = "index",
  getKey,
}: {
  enabled: boolean;
  rows: T[];
  setRows: React.Dispatch<React.SetStateAction<T[]>>;
  keyMode?: "index" | "id";
  getKey?: (row: T) => string | number;
}): DragSortHandlers {
  return {
    onDragStart: (e, index) => {
      if (!enabled) return;
      const payload = keyMode === "id" && getKey ? String(getKey(rows[index])) : String(index);
      e.dataTransfer.setData("text/plain", payload);
      e.currentTarget.classList.add("opacity-50");
    },
    onDragEnd: (e) => e.currentTarget.classList.remove("opacity-50"),
    onDragOver: (e) => {
      e.preventDefault();
      e.currentTarget.classList.add("bg-muted");
    },
    onDragLeave: (e) => e.currentTarget.classList.remove("bg-muted"),
    onDrop: (e, index) => {
      if (!enabled) return;
      e.preventDefault();
      e.currentTarget.classList.remove("bg-muted");
      const raw = e.dataTransfer.getData("text/plain");
      if (keyMode === "id" && getKey) {
        const id = Number(raw);
        const from = rows.findIndex((r) => getKey(r) === id);
        const target = rows[index] ? getKey(rows[index]) : undefined;
        if (from === -1 || target === undefined || getKey(rows[index]) === id) return;
        const next = [...rows];
        const [moved] = next.splice(from, 1);
        const to = next.findIndex((r) => getKey(r) === target);
        if (to === -1) return;
        next.splice(to, 0, moved);
        setRows(next);
        return;
      }
      const from = parseInt(raw, 10);
      if (Number.isNaN(from) || from === index) return;
      const next = [...rows];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(index, 0, moved);
      setRows(next);
    },
  };
}

/** 服务端已排序数据 → 本地可变行（排序模式下暂停同步，原件相同） */
export function useSyncedRows<T>(data: T[] | undefined, sync = true) {
  const [rows, setRows] = React.useState<T[]>([]);
  React.useEffect(() => {
    if (sync && Array.isArray(data)) setRows(data);
  }, [data, sync]);
  return [rows, setRows] as const;
}
