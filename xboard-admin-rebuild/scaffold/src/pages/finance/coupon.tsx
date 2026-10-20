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
import { Calendar as CalendarIcon, Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmDialog,
  FacetedFilter,
  SECURE,
  apiGet,
  apiPost,
  formatDateTime,
} from "@/pages/_b/shared";

/**
 * 原件 `/finance/coupon`：页面组件 B6t（offset 6362347）→ 专属组件 F6t（1124B）
 * 列工厂 P6t、工具栏 R6t、弹窗 I6t（bundle 541707 附近）。
 * 服务端分页：queryKey ["couponList", pagination, columnFilters, sorting]，
 * POST /coupon/fetch { pageSize, current, filter, sort }，响应 { data, total }。
 */

/** 原件 oqt，优惠券类型 */
const COUPON_TYPE = { AMOUNT: 1, PERCENTAGE: 2 } as const;

export interface CouponRow {
  id: number;
  name: string;
  code?: string;
  show?: boolean | number;
  type?: number;
  value?: number;
  limit_use?: number | null;
  limit_use_with_user?: number | null;
  started_at?: number | null;
  ended_at?: number | null;
  limit_plan_ids?: number[] | null;
  limit_period?: string[] | null;
}

interface CouponPage {
  data?: CouponRow[];
  total?: number;
}

/* 端点（bundle 541707）：tT/nT/iT/rT */
const fetchCoupons = (body: Record<string, unknown>) => apiPost<CouponPage>(`${SECURE}/coupon/fetch`, body);
/** 原件 nT：批量生成时后端直接回 CSV 文本，故响应类型放宽为 unknown */
const generateCoupon = (body: Record<string, unknown>) => apiPost<unknown>(`${SECURE}/coupon/generate`, body);
const dropCoupon = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/coupon/drop`, body);
const updateCoupon = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/coupon/update`, body);
/* 原件 RD()：限制订阅下拉的数据源 */
const fetchPlans = () => apiGet<{ data?: { id: number; name: string }[] }>(`${SECURE}/plan/fetch`);

/* ------------------------------------------------------------------ *
 * 优惠券表单（原件 I6t @ bundle 6345594，zod schema + T6t 默认值）
 * ------------------------------------------------------------------ */

/** 原件 cqt：可限制的订阅周期枚举（key → 提交值） */
const COUPON_PERIODS = {
  MONTH: "monthly",
  QUARTER: "quarterly",
  HALF_YEAR: "half_yearly",
  YEAR: "yearly",
  TWO_YEAR: "two_yearly",
  THREE_YEAR: "three_yearly",
  ONETIME: "onetime",
  RESET: "reset_traffic",
} as const;
type CouponPeriodKey = keyof typeof COUPON_PERIODS;
type CouponPeriodValue = (typeof COUPON_PERIODS)[CouponPeriodKey];
const COUPON_PERIOD_KEYS = Object.keys(COUPON_PERIODS) as CouponPeriodKey[];

/** 原件 form.timeRange.presets：快速设置按钮 */
const TIME_PRESETS: { labelKey: string; days: number }[] = [
  { labelKey: "1week", days: 7 },
  { labelKey: "2weeks", days: 14 },
  { labelKey: "1month", days: 30 },
  { labelKey: "3months", days: 90 },
  { labelKey: "6months", days: 180 },
  { labelKey: "1year", days: 365 },
];

/* 原件 shadcn form 原语的基类（脚手架未提供 form.tsx，这里在页面内复刻同样的合并结果） */
const FORM_LABEL_BASE = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
const FORM_DESCRIPTION_BASE = "text-[0.8rem] text-muted-foreground";
const FORM_MESSAGE_BASE = "text-[0.8rem] font-medium text-destructive";

interface CouponFormValues {
  id?: number | null;
  name: string;
  code: string | null;
  type: number;
  /** AMOUNT 以「分」保存（输入框显示 /100），PERCENTAGE 保存原值；清空时为 "" */
  value: number | string;
  started_at: number;
  ended_at: number;
  limit_use: number | string | null;
  limit_use_with_user: number | string | null;
  generate_count: number | string | null;
  limit_plan_ids: number[];
  limit_period: CouponPeriodValue[];
}

/** 原件 T6t */
function couponFormDefaults(): CouponFormValues {
  const now = Math.floor(Date.now() / 1000);
  return {
    name: "",
    code: null,
    type: COUPON_TYPE.AMOUNT,
    value: 0,
    started_at: now,
    ended_at: now + 604800,
    limit_use: null,
    limit_use_with_user: null,
    generate_count: null,
    limit_plan_ids: [],
    limit_period: [],
  };
}

function couponFormFromRow(row: CouponRow): CouponFormValues {
  return {
    id: row.id,
    name: row.name ?? "",
    code: row.code ?? null,
    type: row.type ?? COUPON_TYPE.AMOUNT,
    value: row.value ?? 0,
    started_at: row.started_at ?? Math.floor(Date.now() / 1000),
    ended_at: row.ended_at ?? Math.floor(Date.now() / 1000) + 604800,
    limit_use: row.limit_use ?? null,
    limit_use_with_user: row.limit_use_with_user ?? null,
    generate_count: null,
    limit_plan_ids: row.limit_plan_ids ?? [],
    limit_period: (row.limit_period ?? []) as CouponPeriodValue[],
  };
}

/** 原件 TYt：Label(+必填星号) + Input(+单位后缀) + Description + Message */
function CouponField({
  label,
  required,
  placeholder,
  description,
  error,
  type = "text",
  unit,
  className,
  value,
  onChange,
  inputRef,
}: {
  label?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  error?: string;
  type?: string;
  unit?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className={cn("space-y-2", "space-y-1.5", className)}>
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
        <Input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("h-9 font-mono text-xs transition-all focus-visible:ring-1", unit && "pr-10")}
        />
        {unit && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground/40">{unit}</span>
          </div>
        )}
      </div>
      {description && (
        <p className={cn(FORM_DESCRIPTION_BASE, "font-mono text-[10px] leading-relaxed")}>{description}</p>
      )}
      {error && (
        <p className={cn(FORM_MESSAGE_BASE, "font-mono text-[10px] uppercase tracking-tight")}>{error}</p>
      )}
    </div>
  );
}

interface PickerOption {
  label: string;
  value: string;
}

/** 原件 a4t（MultipleSelector）的收起态：带边框的输入行 + 已选 Badge */
function CouponMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  emptyText,
  className,
}: {
  options: PickerOption[];
  value: PickerOption[];
  onChange: (next: PickerOption[]) => void;
  placeholder: string;
  emptyText: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selected = new Set(value.map((item) => item.value));
  const visible = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (option: PickerOption) => {
    onChange(selected.has(option.value) ? value.filter((item) => item.value !== option.value) : [...value, option]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "rounded-md border border-input text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring",
            value.length > 0 && "cursor-text px-3 py-2",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1">
            {value.map((item) => (
              <Badge key={item.value} className="items-center gap-1">
                {item.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(item);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={value.length > 0 ? "" : placeholder}
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                value.length === 0 ? "w-full px-3 py-2" : "ml-1",
              )}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="border-none bg-transparent p-0 shadow-none"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <div
          role="listbox"
          className="max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {visible.length === 0 && <div className="py-6 text-center text-sm">{emptyText}</div>}
          {visible.map((option) => {
            const active = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => toggle(option)}
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** `<input type="datetime-local">` 需要的 "YYYY-MM-DDTHH:mm:ss"（Unix 秒 → 本地时间） */
function toDateTimeLocalValue(seconds: number): string {
  if (!seconds) return "";
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

/** 原件 I6t：添加/编辑优惠券弹窗 */
function CouponDialog({
  refetch,
  defaultValues,
  trigger,
}: {
  refetch: () => void;
  defaultValues?: CouponRow;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["coupon", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<CouponFormValues>(couponFormDefaults);
  const [errors, setErrors] = React.useState<{ name?: string; ended_at?: string }>({});

  /* 原件 `RD()`（/plan/fetch）：限制订阅下拉的数据源，组件挂载即拉取 */
  const { data: plans } = useQuery({
    queryKey: ["planList"],
    queryFn: async () => (await fetchPlans()).data ?? [],
  });

  const nameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(defaultValues ? couponFormFromRow(defaultValues) : couponFormDefaults());
    setErrors({});
  }, [open, defaultValues]);

  /* 原件实测：编辑态打开后名称输入框获得焦点且文本全选（selectionStart=0, selectionEnd=len） */
  React.useEffect(() => {
    if (!open || !defaultValues) return;
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, defaultValues]);

  const update = (patch: Partial<CouponFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  /* 原件：切换类型时按比例换算已填金额（0 / "" 不换算） */
  const handleTypeChange = (next: number) => {
    const previous = form.type;
    const current = form.value;
    let value = current;
    if (current !== "" && current !== 0) {
      if (previous === COUPON_TYPE.AMOUNT && next === COUPON_TYPE.PERCENTAGE) value = Number(current) / 100;
      if (previous === COUPON_TYPE.PERCENTAGE && next === COUPON_TYPE.AMOUNT) value = 100 * Number(current);
    }
    update({ type: next, value });
  };

  /* 原件把 started_at / ended_at 直接喂给日历（毫秒 → Date） */
  const selectedRange = React.useMemo(() => {
    const from = new Date(form.started_at * 1000);
    const to = new Date(form.ended_at * 1000);
    return {
      from: Number.isNaN(from.getTime()) ? undefined : from,
      to: Number.isNaN(to.getTime()) ? undefined : to,
    };
  }, [form.started_at, form.ended_at]);

  const displayValue =
    form.value == null
      ? ""
      : form.type === COUPON_TYPE.AMOUNT && typeof form.value === "number"
        ? (form.value / 100).toString()
        : String(form.value);

  const submit = async () => {
    const nextErrors: { name?: string; ended_at?: string } = {};
    if (!form.name.trim()) {
      nextErrors.name = t("form.name.required", { defaultValue: "请输入优惠券名称" });
    }
    /* 原件 schema：refine(ended_at > started_at, form.validity.endTimeError) */
    if (!(form.ended_at > form.started_at)) {
      nextErrors.ended_at = t("form.validity.endTimeError", { defaultValue: "结束时间必须晚于开始时间" });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      /* 原件提交体字段顺序（zod schema 顺序）：编辑态 id 在首位且不带 generate_count；
         新建态从 name 起、generate_count 必带。保持键序一致便于与原件逐字节比对。 */
      const payload: Record<string, unknown> = {};
      if (defaultValues?.id) payload.id = defaultValues.id;
      payload.name = form.name;
      payload.code = form.code || null;
      payload.type = form.type;
      payload.value = form.value === "" ? 0 : Number(form.value);
      payload.started_at = form.started_at;
      payload.ended_at = form.ended_at;
      payload.limit_use = form.limit_use === "" ? null : form.limit_use;
      payload.limit_use_with_user = form.limit_use_with_user === "" ? null : form.limit_use_with_user;
      if (!defaultValues) payload.generate_count = form.generate_count === "" ? null : form.generate_count;
      payload.limit_plan_ids = form.limit_plan_ids;
      payload.limit_period = form.limit_period;
      const body = await generateCoupon(payload);
      /* 原件：批量生成时后端返回 CSV 文本 → 直接下载 */
      if (form.generate_count && typeof body === "string") {
        const blob = new Blob([body], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `coupons_${Date.now()}.csv`;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
      setOpen(false);
      if (!defaultValues) setForm(couponFormDefaults());
      refetch();
    } finally {
      setBusy(false);
    }
  };

  const dateTimeField = (field: "started_at" | "ended_at", label: string) => (
    <div className="flex-1 space-y-1.5" key={field}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <Input
        type="datetime-local"
        step="1"
        value={toDateTimeLocalValue(form[field])}
        onChange={(e) => {
          const parsed = new Date(e.target.value);
          update({ [field]: Number.isNaN(parsed.getTime()) ? 0 : Math.floor(parsed.getTime() / 1000) });
        }}
        className="h-8 [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </div>
  );

  const planOptions: PickerOption[] = (plans ?? []).map((plan) => ({
    label: plan.name,
    value: String(plan.id),
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl">
        <DialogHeader className="flex-shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-lg tracking-tight">
            {defaultValues
              ? t("form.edit", { defaultValue: "编辑优惠券" })
              : t("form.add", { defaultValue: "添加优惠券" })}
          </DialogTitle>
          <DialogDescription className="text-xs opacity-70">
            {t("form.description", { defaultValue: "创建或编辑优惠券，支持金额、百分比优惠及多种限制。" })}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 py-4 text-sm">
            <form
              className="space-y-4 font-mono text-xs"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <CouponField
                label={t("form.name.label", { defaultValue: "优惠券名称" })}
                required
                placeholder={t("form.name.placeholder", { defaultValue: "请输入优惠券名称" })}
                value={form.name}
                onChange={(value) => update({ name: value })}
                error={errors.name}
                inputRef={nameInputRef}
              />

              <div className="flex flex-col space-y-4">
                {!defaultValues && (
                  <CouponField
                    label={t("form.generateCount.label", { defaultValue: "批量生成数量" })}
                    type="number"
                    placeholder={t("form.generateCount.placeholder", {
                      defaultValue: "批量生成优惠码数量，留空则生成单个",
                    })}
                    description={t("form.generateCount.description", {
                      defaultValue: "批量生成多个优惠码，留空则只生成单个优惠码",
                    })}
                    className="w-full"
                    value={form.generate_count == null ? "" : String(form.generate_count)}
                    onChange={(value) => update({ generate_count: value })}
                  />
                )}
                {(!form.generate_count || form.generate_count == null) && (
                  <CouponField
                    label={t("form.code.label", { defaultValue: "自定义优惠码" })}
                    placeholder={t("form.code.placeholder", { defaultValue: "自定义优惠码，留空则自动生成" })}
                    description={t("form.code.description", {
                      defaultValue: "可以自定义优惠码，留空则系统自动生成",
                    })}
                    className="w-full"
                    value={form.code ?? ""}
                    onChange={(value) => update({ code: value })}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className={cn("space-y-2", "space-y-1.5 md:col-span-2")}>
                  <label
                    className={cn(
                      FORM_LABEL_BASE,
                      "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    )}
                  >
                    {t("form.type.label", { defaultValue: "优惠券类型和值" })}
                  </label>
                  <div className="flex">
                    <Select value={String(form.type)} onValueChange={(value) => handleTypeChange(Number(value))}>
                      <SelectTrigger className="h-9 flex-[1.2] rounded-r-none border-r-0 font-mono text-xs shadow-none focus:z-10">
                        <SelectValue placeholder={t("form.type.placeholder", { defaultValue: "优惠券类型" })} />
                      </SelectTrigger>
                      <SelectContent className="font-mono text-xs">
                        <SelectItem value={String(COUPON_TYPE.AMOUNT)}>
                          {t("table.toolbar.types.1", { defaultValue: "按金额优惠" })}
                        </SelectItem>
                        <SelectItem value={String(COUPON_TYPE.PERCENTAGE)}>
                          {t("table.toolbar.types.2", { defaultValue: "按比例优惠" })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      placeholder={t("form.value.placeholder", { defaultValue: "请输入值" })}
                      value={displayValue}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          update({ value: "" });
                          return;
                        }
                        const parsed = parseFloat(raw);
                        if (Number.isNaN(parsed)) return;
                        update({
                          value:
                            form.type === COUPON_TYPE.AMOUNT ? Math.round(100 * parsed) : parsed,
                        });
                      }}
                      className="h-9 flex-[2] rounded-none border-x-0 text-left font-mono text-xs shadow-none focus-visible:ring-0"
                    />
                    <div className="flex min-w-[40px] items-center justify-center rounded-md rounded-l-none border border-l-0 border-input bg-muted/50 px-3 text-[10px] font-bold text-muted-foreground/50">
                      <span>{form.type === COUPON_TYPE.AMOUNT ? "¥" : "%"}</span>
                    </div>
                  </div>
                </div>

                <div className={cn("space-y-2", "space-y-1.5 md:col-span-2")}>
                  <label
                    className={cn(
                      FORM_LABEL_BASE,
                      "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    )}
                  >
                    {t("form.validity.label", { defaultValue: "优惠券有效期" })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start gap-0 text-left font-mono text-xs shadow-none",
                          !form.started_at && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon
                          className="mr-2 opacity-50"
                          style={{ width: "0.875rem", height: "0.875rem" }}
                        />
                        <span className="truncate">
                          {formatDateTime(form.started_at, "yyyy-MM-dd HH:mm:ss")}
                          {" - "}
                          {formatDateTime(form.ended_at, "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto border-muted p-0 font-mono text-xs shadow-xl"
                      align="start"
                    >
                      <div className="border-b border-border bg-muted/20 p-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t("form.timeRange.quickSet", { defaultValue: "快速设置" })}
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_PRESETS.map((preset) => (
                            <Button
                              key={preset.days}
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2 font-mono text-[10px] shadow-none"
                              onClick={() => {
                                const now = new Date();
                                update({
                                  started_at: Math.floor(now.getTime() / 1000),
                                  ended_at: Math.floor((now.getTime() + 24 * preset.days * 60 * 60 * 1000) / 1000),
                                });
                              }}
                            >
                              {t(`form.timeRange.presets.${preset.labelKey}`, { defaultValue: preset.labelKey })}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {/* 原件：`hidden border-t border-border sm:block` 包一层双月范围日历（o$t mode="range" numberOfMonths={2}） */}
                      <div className="hidden border-t border-border sm:block">
                        <Calendar
                          mode="range"
                          selected={selectedRange}
                          onSelect={(range) => {
                            if (!range) return;
                            /* 原件：日期取所选日，时间部分沿用当前 started_at / ended_at */
                            const withTime = (day: Date, seconds: number) => {
                              const previous = new Date(seconds * 1000);
                              const next = new Date(day);
                              next.setHours(previous.getHours(), previous.getMinutes(), previous.getSeconds());
                              return Math.floor(next.getTime() / 1000);
                            };
                            const patch: Partial<CouponFormValues> = {};
                            if (range.from) patch.started_at = withTime(range.from, form.started_at);
                            if (range.to) patch.ended_at = withTime(range.to, form.ended_at);
                            update(patch);
                          }}
                          numberOfMonths={2}
                          /* 原件 Calendar 是 rdp v9（`[--cell-size:2rem]` + 根节点 `w-fit`）；
                             本仓库组件是 rdp v8 且把格子写死成 36px、月份标题行只有 24px，故在此把根宽、
                             格子与标题行按原件的 32px 校正（`[&_…]` 变体优先级高于组件内 `.w-9`）。 */
                          className="w-fit bg-background font-mono [&_th]:w-8 [&_td]:h-8 [&_td]:w-8 [&_td_button]:h-8 [&_td_button]:w-8 [&_td_button]:opacity-100 [&_[class*=caption]>div:first-child]:h-8 [&_[class*=caption]>div:first-child]:pt-0 [&_.rdp-button.left-1]:left-0 [&_.rdp-button.right-1]:right-0 [&_.rdp-button.left-1]:h-8 [&_.rdp-button.left-1]:w-8 [&_.rdp-button.left-1]:border-0 [&_.rdp-button.left-1]:opacity-100 [&_.rdp-button.right-1]:h-8 [&_.rdp-button.right-1]:w-8 [&_.rdp-button.right-1]:border-0 [&_.rdp-button.right-1]:opacity-100"
                        />
                      </div>
                      <div className="border-t border-border bg-muted/10 p-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          {dateTimeField("started_at", t("table.validity.startTime", { defaultValue: "开始时间" }))}
                          <div className="pb-2 text-center text-xs opacity-40">TO</div>
                          {dateTimeField("ended_at", t("table.validity.endTime", { defaultValue: "结束时间" }))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.ended_at && (
                    <p className={cn(FORM_MESSAGE_BASE, "font-mono text-[10px] uppercase")}>{errors.ended_at}</p>
                  )}
                </div>

                <CouponField
                  label={t("form.limitUse.label", { defaultValue: "最大使用次数" })}
                  type="number"
                  placeholder={t("form.limitUse.placeholder", {
                    defaultValue: "限制最大使用次数，留空则不限制",
                  })}
                  description={t("form.limitUse.description", {
                    defaultValue: "设置优惠券的总使用次数限制，留空表示不限制使用次数",
                  })}
                  value={form.limit_use == null ? "" : String(form.limit_use)}
                  onChange={(value) => update({ limit_use: value })}
                />

                <CouponField
                  label={t("form.limitUseWithUser.label", { defaultValue: "每个用户可使用次数" })}
                  type="number"
                  placeholder={t("form.limitUseWithUser.placeholder", {
                    defaultValue: "限制每个用户可使用次数，留空则不限制",
                  })}
                  description={t("form.limitUseWithUser.description", {
                    defaultValue: "限制每个用户可使用该优惠券的次数，留空表示不限制单用户使用次数",
                  })}
                  value={form.limit_use_with_user == null ? "" : String(form.limit_use_with_user)}
                  onChange={(value) => update({ limit_use_with_user: value })}
                />

                <div className={cn("space-y-2", "flex flex-col")}>
                  <label
                    className={cn(
                      FORM_LABEL_BASE,
                      "mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    )}
                  >
                    {t("form.limitPeriod.label", { defaultValue: "指定周期" })}
                  </label>
                  <div className="flex-1">
                    <CouponMultiSelect
                      className="min-h-9 font-mono text-xs shadow-none"
                      options={COUPON_PERIOD_KEYS.map((key) => ({
                        label: t(`period.${COUPON_PERIODS[key]}`, { defaultValue: COUPON_PERIODS[key] }),
                        value: key,
                      }))}
                      value={form.limit_period.map((period) => ({
                        label: t(`period.${period}`, { defaultValue: period }),
                        value: COUPON_PERIOD_KEYS.find((key) => COUPON_PERIODS[key] === period) ?? period,
                      }))}
                      onChange={(next) =>
                        update({
                          limit_period: next.map(
                            (item) => COUPON_PERIODS[item.value as CouponPeriodKey] ?? item.value,
                          ) as CouponPeriodValue[],
                        })
                      }
                      placeholder={t("form.limitPeriod.placeholder", {
                        defaultValue: "限制指定周期可以使用优惠，留空则不限制",
                      })}
                      emptyText={t("form.limitPeriod.empty", { defaultValue: "没有找到匹配的周期" })}
                    />
                  </div>
                  <p className={cn(FORM_DESCRIPTION_BASE, "mt-2 font-mono text-[10px] opacity-70")}>
                    {t("form.limitPeriod.description", {
                      defaultValue: "选择可以使用优惠券的订阅周期，留空表示不限制使用周期",
                    })}
                  </p>
                </div>

                <div className={cn("space-y-2", "flex flex-col")}>
                  <label
                    className={cn(
                      FORM_LABEL_BASE,
                      "mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    )}
                  >
                    {t("form.limitPlan.label", { defaultValue: "指定订阅" })}
                  </label>
                  <div className="flex-1">
                    <CouponMultiSelect
                      className="min-h-9 font-mono text-xs shadow-none"
                      options={planOptions}
                      value={form.limit_plan_ids.map((id) => ({
                        label: planOptions.find((option) => option.value === String(id))?.label ?? String(id),
                        value: String(id),
                      }))}
                      onChange={(next) => update({ limit_plan_ids: next.map((item) => Number(item.value)) })}
                      placeholder={t("form.limitPlan.placeholder", {
                        defaultValue: "限制指定订阅可以使用优惠，留空则不限制",
                      })}
                      emptyText={t("form.limitPlan.empty", { defaultValue: "没有找到匹配的订阅" })}
                    />
                  </div>
                  <p className={cn(FORM_DESCRIPTION_BASE, "mt-2 font-mono text-[10px] opacity-70")}>
                    {t("form.limitPlan.description", {
                      defaultValue: "选择可以使用优惠券的订阅计划，留空表示不限制计划",
                    })}
                  </p>
                </div>
              </div>
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
                {/* 原件 XXt 的默认提交文案取 `common.submit`，原件资源渲染为「确认」；
                    脚手架 zh-CN 的 common.submit 是「提交」，为保持像素一致这里取等义的 common.confirm */}
                {t("common:confirm", { defaultValue: "确认" })}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FinanceCoupon() {
  const { t } = useTranslation(["coupon", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["couponList", pagination, columnFilters, sorting],
    queryFn: () =>
      fetchCoupons({
        pageSize: pagination.pageSize,
        current: pagination.pageIndex + 1,
        filter: columnFilters,
        sort: sorting,
      }),
  });

  const total = data?.total ?? 0;

  const columns = React.useMemo<ColumnDef<CouponRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.id", { defaultValue: "ID" })} />
        ),
        cell: ({ row }) => <Badge>{row.original.id}</Badge>,
        enableSorting: true,
        meta: { label: t("table.columns.id", { defaultValue: "ID" }) },
      },
      {
        accessorKey: "show",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.show", { defaultValue: "启用" })} />
        ),
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.show)}
            onCheckedChange={async (checked: boolean) => {
              await updateCoupon({ id: row.original.id, show: checked });
              refetch();
            }}
          />
        ),
        enableSorting: false,
        meta: { label: t("table.columns.show", { defaultValue: "启用" }) },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.name", { defaultValue: "卷名称" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <span>{row.original.name}</span>
          </div>
        ),
        enableSorting: false,
        size: 800,
        meta: { label: t("table.columns.name", { defaultValue: "卷名称" }) },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.type", { defaultValue: "类型" })} />
        ),
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant="outline">
              {type != null
                ? t(`table.toolbar.types.${type}`, { defaultValue: String(type) })
                : String(type ?? "-")}
            </Badge>
          );
        },
        enableSorting: true,
        /* facet 写入 string[]，列值为 number */
        filterFn: (row, id, value) => {
          if (!Array.isArray(value) || value.length === 0) return true;
          const raw = row.getValue(id);
          return raw != null && value.map(String).includes(String(raw));
        },
        meta: { label: t("table.columns.type", { defaultValue: "类型" }) },
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.code", { defaultValue: "卷码" })} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.code}
          </Badge>
        ),
        enableSorting: true,
        meta: { label: t("table.columns.code", { defaultValue: "卷码" }) },
      },
      {
        accessorKey: "limit_use",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.limitUse", { defaultValue: "剩余次数" })} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.limit_use == null
              ? t("table.validity.unlimited", { defaultValue: "无限次" })
              : row.original.limit_use}
          </Badge>
        ),
        enableSorting: true,
        meta: { label: t("table.columns.limitUse", { defaultValue: "剩余次数" }) },
      },
      {
        accessorKey: "limit_use_with_user",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("table.columns.limitUseWithUser", { defaultValue: "可用次数/用户" })}
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.limit_use_with_user == null
              ? t("table.validity.noLimit", { defaultValue: "无限制" })
              : row.original.limit_use_with_user}
          </Badge>
        ),
        enableSorting: true,
        meta: { label: t("table.columns.limitUseWithUser", { defaultValue: "可用次数/用户" }) },
      },
      {
        /* 原件 P6t（offset 6360705）：该列 id 就是 `#`（accessorKey:"#"），size:8000 */
        id: "#",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.validity", { defaultValue: "有效期" })} />
        ),
        cell: ({ row }) => {
          const { started_at: startedAt, ended_at: endedAt } = row.original;
          if (!startedAt || !endedAt) {
            return (
              <Badge variant="secondary" className="px-2 py-0.5 text-xs text-muted-foreground">
                {t("table.validity.noLimit", { defaultValue: "无限制" })}
              </Badge>
            );
          }
          const now = Date.now();
          const startMs = startedAt * 1000;
          const endMs = endedAt * 1000;
          const day = 86400000;
          /* 原件 M6t（offset 6355944）：状态芯片（红=已过期 / 黄=未开始 / 绿=剩余）
             + 起止时间（MM/dd HH:mm）+ 展开箭头，整行 max-w-[280px]。 */
          const chip = now > endMs
            ? {
                label: t("table.validity.expired", {
                  defaultValue: "已过期{{days}}天",
                  days: Math.abs(Math.ceil((endMs - now) / day)),
                }),
                color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
              }
            : now < startMs
              ? {
                  label: t("table.validity.notStarted", {
                    defaultValue: "{{days}}天后开始",
                    days: Math.abs(Math.ceil((startMs - now) / day)),
                  }),
                  color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
                }
              : {
                  label: t("table.validity.remaining", {
                    defaultValue: "剩余{{days}}天",
                    days: Math.ceil((endMs - now) / day),
                  }),
                  color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
                };
          return (
            <div className="group -m-0.5 flex max-w-[280px] cursor-pointer items-center gap-2 rounded-md p-0.5 transition-colors hover:bg-muted/40">
              <div className="flex flex-1 items-center gap-2">
                <div className={cn("whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium", chip.color)}>
                  {chip.label}
                </div>
                <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
                  <div className="truncate text-xs">{formatDateTime(startedAt, "MM/dd HH:mm")}</div>
                  <div className="shrink-0 opacity-30">{"->"}</div>
                  <div className="truncate text-xs">{formatDateTime(endedAt, "MM/dd HH:mm")}</div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200" />
            </div>
          );
        },
        enableSorting: false,
        size: 8000,
        meta: { label: t("table.columns.validity", { defaultValue: "有效期" }) },
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
          <div className="flex items-center justify-end gap-1">
            <CouponDialog
              refetch={refetch}
              defaultValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">{t("table.actions.edit", { defaultValue: "编辑" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("table.actions.deleteConfirm.title", { defaultValue: "确认删除" })}
              description={t("table.actions.deleteConfirm.description", {
                defaultValue: "此操作将永久删除该优惠券，删除后无法恢复。确定要继续吗？",
              })}
              confirmText={t("table.actions.deleteConfirm.confirmText", { defaultValue: "删除" })}
              onConfirm={async () => {
                await dropCoupon({ id: row.original.id });
                refetch();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<CouponRow>({
    data: data?.data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    pageCount: Math.ceil(total / pagination.pageSize),
    rowCount: total,
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
    /* 原件 R6t（offset 6354728）：左侧 添加优惠券 + 搜索；右侧 类型 facet + 条件重置 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
          <CouponDialog
            refetch={refetch}
            trigger={
              <Button variant="outline" size="sm" className="h-8 space-x-2">
                <Plus className="h-4 w-4" />
                <div>{t("form.add", { defaultValue: "添加优惠券" })}</div>
              </Button>
            }
          />
          <Input
            placeholder={t("table.toolbar.search", { defaultValue: "搜索优惠券..." })}
            value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => {
              tbl.getColumn("name")?.setFilterValue(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
          />
        </div>
        <div className="flex items-center gap-2">
          {tbl.getColumn("type") && (
            <FacetedFilter
              column={tbl.getColumn("type")}
              title={t("table.toolbar.type", { defaultValue: "类型" })}
              options={[
                {
                  label: t("table.toolbar.types.1", { defaultValue: "按金额优惠" }),
                  value: String(COUPON_TYPE.AMOUNT),
                },
                {
                  label: t("table.toolbar.types.2", { defaultValue: "按比例优惠" }),
                  value: String(COUPON_TYPE.PERCENTAGE),
                },
              ]}
            />
          )}
          {filtersActive && (
            <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-8 px-2 lg:px-3">
              {t("table.toolbar.reset", { defaultValue: "重置" })}
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
          <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "优惠券管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("description", { defaultValue: "在这里可以查看优惠券，包括增加、查看、删除等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <DataTable table={table} toolbar={toolbar} isLoading={isFetching} mobilePrimaryField="name" />
      </LayoutBody>
    </Layout>
  );
}
