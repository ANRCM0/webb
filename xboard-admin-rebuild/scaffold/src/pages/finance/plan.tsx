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
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2, WandSparkles, X } from "lucide-react";
import MarkdownIt from "markdown-it";
import { cn } from "@/lib/utils";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { GroupDialog } from "@/pages/server/group-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
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
 * 原件 `/finance/plan`：页面组件 d6t（offset 6320121）→ 专属组件 c6t（1925B）
 * 列工厂 n6t、工具栏 J3t、编辑弹窗 l6t（bundle 540917 附近）。
 * 拖拽排序：POST /plan/sort，body 直接是 id 数组（原件 `PD=e=>RL(ID+"/plan/sort",{ids:e})`）。
 */

export interface PlanGroup {
  id: number;
  name: string;
}

/** 后端 `Plan::$periodMap` 与原件列工厂一致：prices.<period>，period ∈ monthly|quarterly|half_yearly|yearly|two_yearly|three_yearly|onetime */
export interface PlanPrices {
  monthly?: number | null;
  quarterly?: number | null;
  half_yearly?: number | null;
  yearly?: number | null;
  two_yearly?: number | null;
  three_yearly?: number | null;
  onetime?: number | null;
  reset_traffic?: number | null;
}

export interface PlanRow {
  id: number;
  name: string;
  show?: boolean | number;
  sell?: boolean | number;
  renew?: boolean | number;
  users_count?: number;
  active_users_count?: number;
  group_id?: number | null;
  group?: PlanGroup | null;
  prices?: PlanPrices | null;
  transfer_enable?: number;
  device_limit?: number | null;
  capacity_limit?: number | null;
  speed_limit?: number | null;
  tags?: string[] | null;
  content?: string | null;
  reset_traffic_method?: number | null;
  force_update?: boolean | number;
  /* 列表里 _ 前缀是为了让「表单专用字段」与列定义无歧义 */
}

/** 列表「价格」列的展示顺序（原件 n6t prices 列的 map 顺序） */
const PRICE_FIELDS: Array<{ key: keyof PlanPrices; label: string }> = [
  { key: "monthly", label: "月付" },
  { key: "quarterly", label: "季付" },
  { key: "half_yearly", label: "半年付" },
  { key: "yearly", label: "年付" },
  { key: "two_yearly", label: "两年付" },
  { key: "three_yearly", label: "三年付" },
  { key: "onetime", label: "一次性" },
];

/* 端点（bundle 540917）：RD/OD/MD/AD/PD */
const fetchPlans = () => apiGet<{ data?: PlanRow[] }>(`${SECURE}/plan/fetch`);
const savePlan = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/plan/save`, body);
const updatePlan = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/plan/update`, body);
const dropPlan = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/plan/drop`, body);
const sortPlans = (ids: number[]) => apiPost<{ data?: unknown }>(`${SECURE}/plan/sort`, { ids });
const fetchGroups = () => apiGet<{ data?: PlanGroup[] }>(`${SECURE}/server/group/fetch`);

/* ------------------------------------------------------------------ *
 * 表单契约（原件 s6t / o6t / a6t，bundle offset ≈6,310,000–6,318,200）
 * ------------------------------------------------------------------ */

/** 原件 o6t：价格周期 → 月份数 / 折扣（基础价换算用） */
const PRICE_PERIODS = [
  { key: "monthly", months: 1, discount: 1 },
  { key: "quarterly", months: 3, discount: 0.95 },
  { key: "half_yearly", months: 6, discount: 0.9 },
  { key: "yearly", months: 12, discount: 0.85 },
  { key: "two_yearly", months: 24, discount: 0.8 },
  { key: "three_yearly", months: 36, discount: 0.75 },
  { key: "onetime", months: 1, discount: 1 },
  { key: "reset_traffic", months: 1, discount: 1 },
] as const;

type PriceKey = (typeof PRICE_PERIODS)[number]["key"];

/** 价格区 4 列网格：`Object.entries(o6t).filter(([k]) => !["onetime","reset_traffic"].includes(k))` */
const GRID_PRICE_KEYS = PRICE_PERIODS.filter((period) => !["onetime", "reset_traffic"].includes(period.key));
/** 价格区底部的两个「流量包 / 重置包」字段 */
const PACKAGE_PRICE_KEYS = PRICE_PERIODS.filter((period) => ["onetime", "reset_traffic"].includes(period.key));

/** 原件 a6t：流量重置方式（`null` 序列化为 "null"） */
const RESET_METHODS = [
  { value: "null", label: "follow_system" },
  { value: "0", label: "monthly_first" },
  { value: "1", label: "monthly_reset" },
  { value: "2", label: "no_reset" },
  { value: "3", label: "yearly_first" },
  { value: "4", label: "yearly_reset" },
] as const;

/** 预览用 markdown 解析器（与 markdown-editor 内的实例同配置） */
const planMdParser = new MarkdownIt({ html: true, linkify: true, breaks: true });

interface PlanForm {
  id: number | null;
  name: string;
  tags: string[];
  group_id: string;
  transfer_enable: string;
  speed_limit: string;
  device_limit: string;
  capacity_limit: string;
  reset_traffic_method: string;
  content: string;
  force_update: boolean;
  prices: Record<PriceKey, string>;
}

function emptyPrices(): Record<PriceKey, string> {
  return {
    monthly: "",
    quarterly: "",
    half_yearly: "",
    yearly: "",
    two_yearly: "",
    three_yearly: "",
    onetime: "",
    reset_traffic: "",
  };
}

/** 原件 s6t */
const emptyPlanForm: PlanForm = {
  id: null,
  name: "",
  tags: [],
  group_id: "",
  transfer_enable: "",
  speed_limit: "",
  device_limit: "",
  capacity_limit: "",
  reset_traffic_method: "null",
  content: "",
  force_update: false,
  prices: emptyPrices(),
};

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/* ------------------------------------------------------------------ *
 * 表单原语：原件 Gy / Zy / Qy / Xy / TYt / W2t 的等价实现
 * ------------------------------------------------------------------ */

/** 原件 Gy（FormItem）+ Zy（FormLabel）+ Qy（FormMessage）+ Xy（FormDescription） */
function PlanField({
  label,
  labelVariant = "upper",
  labelAction,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  /** 原件：TYt 字段的标题是 11px 大写带字距；内联 FormLabel（标签/分组/重置方式）用默认 14px */
  labelVariant?: "upper" | "default";
  /** 原件 `FormLabel className="flex items-center justify-between"` 里的右侧动作（如「添加分组」） */
  labelAction?: React.ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const labelNode = label ? (
    labelVariant === "upper" ? (
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    ) : (
      <Label>{label}</Label>
    )
  ) : null;
  return (
    <div className={cn(labelVariant === "default" ? "space-y-2" : "space-y-1.5", className)}>
      {labelNode ? (
        labelAction ? (
          <div className="flex items-center justify-between">
            {labelNode}
            {labelAction}
          </div>
        ) : (
          labelNode
        )
      ) : null}
      {children}
      {hint ? <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      {error ? <p className="font-mono text-[10px] uppercase tracking-tight text-destructive">{error}</p> : null}
    </div>
  );
}

/** 原件 TYt：`h-9 font-mono text-xs` 输入框 + 右侧单位（pr-10） */
function PlanNumberField({
  label,
  value,
  onChange,
  placeholder,
  unit,
  step,
  hint,
  error,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit?: string;
  step?: string;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <PlanField label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <Input
          type="number"
          step={step}
          min={0}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn("h-9 font-mono text-xs transition-all focus-visible:ring-1", unit && "pr-10")}
        />
        {unit ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground/40">{unit}</span>
          </div>
        ) : null}
      </div>
    </PlanField>
  );
}

/** 原件 W2t：标签输入（Enter / 逗号 或 输入内含逗号都提交，Backspace 删末尾） */
function PlanTagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const tags = Array.isArray(value) ? value : [];
  const [draft, setDraft] = React.useState("");

  const commit = React.useCallback(
    (raw: string) => {
      const next = new Set([...tags, ...raw.split(",").map((item) => item.trim())].filter(Boolean));
      onChange(Array.from(next));
      setDraft("");
    },
    [tags, onChange],
  );

  React.useEffect(() => {
    if (draft.includes(",")) commit(draft);
  }, [draft, commit]);

  return (
    <div className="flex w-full flex-wrap gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm has-[:focus-visible]:outline-none has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-neutral-950 dark:has-[:focus-visible]:ring-neutral-300">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-2 h-3 w-3"
            onClick={() => onChange(tags.filter((item) => item !== tag))}
          >
            <X className="w-3" />
          </Button>
        </Badge>
      ))}
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        value={draft}
        placeholder={tags.length === 0 ? placeholder : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            if (draft) commit(draft);
          } else if (event.key === "Backspace" && draft.length === 0 && tags.length > 0) {
            event.preventDefault();
            onChange(tags.slice(0, -1));
          }
        }}
      />
    </div>
  );
}

/**
 * 原件 l6t（bundle offset 6,311,043）：套餐新建/编辑弹窗。
 *
 * 说明：本组件在 19:05 的一次误删中被移除，随后从上一版构建产物（`/tmp/build-fin`
 * 18:57 的编译结果，早于误删）反解 JSX 逐字还原：类名、文案键、默认值与提交体均保持原样。
 * 与原件一致的关键点：`max-w-xl` 外壳、`form.space-y-6`、价格区「基础价 × 月数 × 折扣」联动、
 * 价格清空按钮（Trash2）、`<Separator />` 分隔、仅编辑态出现的「强制更新用户套餐」开关、
 * 提交统一走 `POST /plan/save`（原件 `OD`）。
 */
function PlanDialog({
  refetch,
  defaultValues,
  trigger,
}: {
  refetch: () => void;
  defaultValues?: PlanRow;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["subscribe", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<PlanForm>(emptyPlanForm);
  const [groups, setGroups] = React.useState<PlanGroup[]>([]);
  const [preview, setPreview] = React.useState(false);
  const [nameError, setNameError] = React.useState("");
  const isEdit = !!defaultValues;

  const loadGroups = React.useCallback(() => {
    fetchGroups()
      .then((body) => setGroups(body.data ?? []))
      .catch(() => setGroups([]));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    loadGroups();
    if (!defaultValues) {
      setForm(emptyPlanForm);
      setNameError("");
      return;
    }
    const prices = emptyPrices();
    for (const period of PRICE_PERIODS) prices[period.key] = "";
    for (const period of PRICE_PERIODS) {
      const value = defaultValues.prices?.[period.key];
      prices[period.key] = value == null ? "" : String(value);
    }
    setForm({
      id: defaultValues.id,
      name: defaultValues.name ?? "",
      tags: defaultValues.tags ?? [],
      group_id: defaultValues.group_id != null ? String(defaultValues.group_id) : "",
      transfer_enable: defaultValues.transfer_enable != null ? String(defaultValues.transfer_enable) : "",
      speed_limit: defaultValues.speed_limit != null ? String(defaultValues.speed_limit) : "",
      device_limit: defaultValues.device_limit != null ? String(defaultValues.device_limit) : "",
      capacity_limit: defaultValues.capacity_limit != null ? String(defaultValues.capacity_limit) : "",
      reset_traffic_method:
        defaultValues.reset_traffic_method == null ? "null" : String(defaultValues.reset_traffic_method),
      content: defaultValues.content ?? "",
      force_update: !!defaultValues.force_update,
      prices,
    });
    setNameError("");
  }, [open, defaultValues, loadGroups]);

  /** 「基础价格」联动：按 月数 × 折扣 换算每个周期 */
  const applyBasePrice = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    const prices = emptyPrices();
    for (const period of PRICE_PERIODS) {
      prices[period.key] = (parsed * period.months * period.discount).toFixed(2);
    }
    setForm((prev) => ({ ...prev, prices }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setNameError(t("plan.form.name.label", { defaultValue: "套餐名称" }) + " *");
      return;
    }
    setNameError("");
    setBusy(true);
    try {
      const prices: Record<PriceKey, number | null> = {} as Record<PriceKey, number | null>;
      for (const period of PRICE_PERIODS) prices[period.key] = toNumberOrNull(form.prices[period.key]);
      await savePlan({
        id: form.id,
        name: form.name,
        tags: form.tags,
        group_id: form.group_id ? Number(form.group_id) : null,
        transfer_enable: form.transfer_enable === "" ? 0 : Number(form.transfer_enable),
        speed_limit: toNumberOrNull(form.speed_limit),
        device_limit: toNumberOrNull(form.device_limit),
        capacity_limit: toNumberOrNull(form.capacity_limit),
        reset_traffic_method: form.reset_traffic_method === "null" ? null : Number(form.reset_traffic_method),
        content: form.content,
        force_update: form.force_update,
        prices,
      });
      toast.success(
        isEdit
          ? t("plan.form.submit.success.update", { defaultValue: "套餐更新成功" })
          : t("plan.form.submit.success.add", { defaultValue: "套餐添加成功" }),
      );
      setOpen(false);
      refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl">
        <DialogHeader className="flex-shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-lg tracking-tight">
            {isEdit
              ? t("plan.form.edit_title", { defaultValue: "编辑套餐" })
              : t("plan.form.add_title", { defaultValue: "添加套餐" })}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 py-4 text-sm">
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanField label={t("plan.form.name.label", { defaultValue: "套餐名称" })} error={nameError}>
                  <Input
                    value={form.name}
                    placeholder={t("plan.form.name.placeholder", { defaultValue: "请输入套餐名称" })}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="h-9 font-mono text-xs transition-all focus-visible:ring-1"
                  />
                </PlanField>
                <PlanField labelVariant="default" label={t("plan.form.tags.label", { defaultValue: "标签" })}>
                  <PlanTagsInput
                    value={form.tags}
                    onChange={(tags) => setForm({ ...form, tags })}
                    placeholder={t("plan.form.tags.placeholder", { defaultValue: "输入标签后按回车确认" })}
                  />
                </PlanField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanField
                  labelVariant="default"
                  label={t("plan.form.group.label", { defaultValue: "服务器分组" })}
                  labelAction={
                    <GroupDialog
                      refetch={loadGroups}
                      trigger={
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          {t("plan.form.group.add", { defaultValue: "添加分组" })}
                        </Button>
                      }
                    />
                  }
                >
                  <Select
                    value={form.group_id}
                    onValueChange={(value: string) => setForm({ ...form, group_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("plan.form.group.placeholder", { defaultValue: "请选择服务器分组" })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem value={String(group.id)} key={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PlanField>
                <PlanNumberField
                  label={t("plan.form.transfer.label", { defaultValue: "流量" })}
                  value={form.transfer_enable}
                  onChange={(value) => setForm({ ...form, transfer_enable: value })}
                  placeholder={t("plan.form.transfer.placeholder", { defaultValue: "请输入流量限制" })}
                  unit={t("plan.form.transfer.unit", { defaultValue: "GB" })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanNumberField
                  label={t("plan.form.speed.label", { defaultValue: "速度限制" })}
                  value={form.speed_limit}
                  onChange={(value) => setForm({ ...form, speed_limit: value })}
                  placeholder={t("plan.form.speed.placeholder", { defaultValue: "请输入速度限制" })}
                  unit={t("plan.form.speed.unit", { defaultValue: "Mbps" })}
                />
                <PlanNumberField
                  label={t("plan.form.device.label", { defaultValue: "设备限制" })}
                  value={form.device_limit}
                  onChange={(value) => setForm({ ...form, device_limit: value })}
                  placeholder={t("plan.form.device.placeholder", { defaultValue: "请输入设备限制" })}
                  unit={t("plan.form.device.unit", { defaultValue: "台" })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanNumberField
                  label={t("plan.form.capacity.label", { defaultValue: "容量限制" })}
                  value={form.capacity_limit}
                  onChange={(value) => setForm({ ...form, capacity_limit: value })}
                  placeholder={t("plan.form.capacity.placeholder", { defaultValue: "请输入容量限制" })}
                  unit={t("plan.form.capacity.unit", { defaultValue: "人" })}
                />
                <PlanField
                  labelVariant="default"
                  label={t("plan.form.reset_method.label", { defaultValue: "流量重置方式" })}
                >
                  <Select
                    value={form.reset_traffic_method}
                    onValueChange={(value: string) => setForm({ ...form, reset_traffic_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("plan.form.reset_method.placeholder", { defaultValue: "请选择重置方式" })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {RESET_METHODS.map((method) => (
                        <SelectItem value={method.value} key={method.value}>
                          {t(`plan.form.reset_method.options.${method.label}`, { defaultValue: method.label })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PlanField>
              </div>

              <div className="space-y-4 rounded-lg border border-dashed p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{t("plan.form.price.title", { defaultValue: "价格设置" })}</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t("plan.form.price.base_price", { defaultValue: "基础价格" })}
                        className="h-8 w-24 pl-5 text-xs"
                        onChange={(event) => applyBasePrice(event.target.value)}
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 [&_svg]:size-3.5"
                      title={t("plan.form.price.clear.tooltip", { defaultValue: "清空所有价格" })}
                      onClick={() => setForm({ ...form, prices: emptyPrices() })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {GRID_PRICE_KEYS.map((period) => (
                    <PlanNumberField
                      key={period.key}
                      label={t(`plan.columns.price_period.${period.key}`, { defaultValue: period.key })}
                      value={form.prices[period.key]}
                      onChange={(value) =>
                        setForm({ ...form, prices: { ...form.prices, [period.key]: value } })
                      }
                      step="0.01"
                      className="text-xs"
                    />
                  ))}
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PACKAGE_PRICE_KEYS.map((period) => (
                    <PlanNumberField
                      key={period.key}
                      label={t(`plan.columns.price_period.${period.key}`, { defaultValue: period.key })}
                      value={form.prices[period.key]}
                      onChange={(value) =>
                        setForm({ ...form, prices: { ...form.prices, [period.key]: value } })
                      }
                      hint={t(period.key === "onetime" ? "plan.form.price.onetime_desc" : "plan.form.price.reset_desc", {
                        defaultValue: "",
                      })}
                      step="0.01"
                    />
                  ))}
                </div>
              </div>

              <PlanField
                labelVariant="default"
                label={t("plan.form.content.label", { defaultValue: "套餐说明" })}
                className="space-y-3"
                labelAction={
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        setForm({
                          ...form,
                          content: t("plan.form.content.template.content", { defaultValue: "" }),
                        })
                      }
                    >
                      <WandSparkles className="mr-2 h-3.5 w-3.5" />
                      {t("plan.form.content.template.button", { defaultValue: "使用模板" })}
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setPreview((v) => !v)}>
                      {preview ? <EyeOff className="mr-2 h-3.5 w-3.5" /> : <Eye className="mr-2 h-3.5 w-3.5" />}
                      {preview
                        ? t("plan.form.content.preview_button.hide", { defaultValue: "隐藏预览" })
                        : t("plan.form.content.preview_button.show", { defaultValue: "显示预览" })}
                    </Button>
                  </div>
                }
              >
                <div className={"grid gap-4 " + (preview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                  <MarkdownEditor
                    height={300}
                    value={form.content}
                    onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                  />
                  {preview ? (
                    <div
                      className="prose prose-sm dark:prose-invert h-[300px] max-w-none overflow-y-auto rounded-md border bg-muted/20 p-4"
                      dangerouslySetInnerHTML={{ __html: planMdParser.render(form.content || "") }}
                    />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("plan.form.content.description", { defaultValue: "支持 Markdown 格式" })}
                </p>
              </PlanField>
            </form>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isEdit ? (
                <label className="flex flex-row items-center space-x-2 space-y-0">
                  <Switch
                    checked={form.force_update}
                    onCheckedChange={(checked: boolean) => setForm({ ...form, force_update: checked })}
                  />
                  <span className="cursor-pointer select-none text-xs font-normal">
                    {t("plan.form.force_update.label", { defaultValue: "强制更新用户套餐" })}
                  </span>
                </label>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-4 text-xs font-bold"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                {t("plan.form.submit.cancel", { defaultValue: "取消" })}
              </Button>
              <Button
                type="button"
                className="h-8 px-8 text-xs font-bold"
                disabled={busy}
                onClick={() => void submit()}
              >
                {t("plan.form.submit.submit", { defaultValue: "提交" })}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FinancePlan() {
  const { t } = useTranslation(["subscribe", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ "drag-handle": false });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 20, pageIndex: 0 });
  const [isSortMode, setIsSortMode] = React.useState(false);

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["planList"],
    queryFn: async () => (await fetchPlans()).data,
  });

  const [rows, setRows] = useSyncedRows<PlanRow>(data);

  /* 原件 c6t 第二个 useEffect */
  React.useEffect(() => {
    setColumnVisibility({ "drag-handle": isSortMode });
    setPagination({ pageSize: isSortMode ? 99999 : 10, pageIndex: 0 });
  }, [isSortMode]);

  const saveOrder = async () => {
    if (!isSortMode) {
      setIsSortMode(true);
      return;
    }
    try {
      await sortPlans(rows.map((r) => r.id));
      toast.success(t("plan.sort.save", { defaultValue: "排序保存成功" }));
      setIsSortMode(false);
      refetch();
    } finally {
      setIsSortMode(false);
    }
  };

  const columns = React.useMemo<ColumnDef<PlanRow>[]>(
    () => [
      {
        id: "drag-handle",
        header: () => null,
        cell: () => (
          <div className="cursor-move">
            <GripVertical className="size-4" />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("plan.sort.edit", { defaultValue: "编辑排序" }) },
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.id", { defaultValue: "ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{row.original.id}</Badge>
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { label: t("plan.columns.id", { defaultValue: "ID" }) },
      },
      {
        accessorKey: "show",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.show", { defaultValue: "显示" })} />
        ),
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.show)}
            onCheckedChange={async (checked: boolean) => {
              await updatePlan({ id: row.original.id, show: checked });
              refetch();
            }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("plan.columns.show", { defaultValue: "显示" }) },
      },
      {
        accessorKey: "sell",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.sell", { defaultValue: "可购买" })} />
        ),
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.sell)}
            onCheckedChange={async (checked: boolean) => {
              await updatePlan({ id: row.original.id, sell: checked });
              refetch();
            }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("plan.columns.sell", { defaultValue: "可购买" }) },
      },
      {
        accessorKey: "renew",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.renew", { defaultValue: "可续费" })} />
        ),
        cell: ({ row }) => (
          <Switch
            checked={Boolean(row.original.renew)}
            onCheckedChange={async (checked: boolean) => {
              await updatePlan({ id: row.original.id, renew: checked });
              refetch();
            }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("plan.columns.renew", { defaultValue: "可续费" }) },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.name", { defaultValue: "名称" })} />
        ),
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">{row.original.name}</span>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 900,
        meta: { label: t("plan.columns.name", { defaultValue: "名称" }) },
      },
      {
        accessorKey: "users_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.stats", { defaultValue: "统计" })} />
        ),
        cell: ({ row }) => {
          const total = row.original.users_count ?? 0;
          const active = row.original.active_users_count ?? 0;
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-700">
                {total}
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {active}
              </Badge>
            </div>
          );
        },
        enableSorting: true,
        size: 120,
        meta: { label: t("plan.columns.stats", { defaultValue: "统计" }) },
      },
      {
        accessorKey: "group",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.group", { defaultValue: "权限组" })} />
        ),
        cell: ({ row }) => (
          <div className="flex max-w-[600px] flex-wrap items-center gap-1.5 text-nowrap">
            {row.original.group ? (
              <Badge variant="secondary" className="px-2 py-0.5 font-medium">
                {row.original.group.name}
              </Badge>
            ) : null}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("plan.columns.group", { defaultValue: "权限组" }) },
      },
      {
        accessorKey: "prices",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("plan.columns.price", { defaultValue: "价格" })} />
        ),
        cell: ({ row }) => {
          const prices = row.original.prices;
          if (!prices) {
            return (
              <Badge variant="outline" className="border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                {t("plan.columns.price_period.no_price", { defaultValue: "未设置价格" })}
              </Badge>
            );
          }
          return (
            <div className="flex flex-wrap items-center gap-2">
              {PRICE_FIELDS.map((field) => {
                const value = prices[field.key];
                if (value == null) return null;
                return (
                  <Badge key={field.key} variant="secondary" className="px-2 py-0.5 font-medium text-nowrap">
                    {t(`plan.columns.price_period.${field.key}`, { defaultValue: field.label })} ¥{value}
                  </Badge>
                );
              })}
            </div>
          );
        },
        enableSorting: false,
        size: 9000,
        meta: { label: t("plan.columns.price", { defaultValue: "价格" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title={t("plan.columns.actions", { defaultValue: "操作" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <PlanDialog
              refetch={refetch}
              defaultValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <ConfirmDialog
              title={t("common:delete", { defaultValue: "确认删除" })}
              description={t("common:delete.description", {
                defaultValue: "此操作将永久删除该套餐，删除后无法恢复。确定要继续吗？",
              })}
              confirmText={t("common:delete", { defaultValue: "删除" })}
              onConfirm={async () => {
                await dropPlan({ id: row.original.id });
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
        meta: { label: t("plan.columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<PlanRow>({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    enableRowSelection: true,
    onPaginationChange: setPagination,
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
    pageCount: isSortMode ? 1 : undefined,
  });

  const drag = useDragSort<PlanRow>({ enabled: isSortMode, rows, setRows });

  const toolbar = (tbl: typeof table) => {
    /* 原件 J3t（offset 6301222）：添加套餐 + 搜索 …… 排序模式切换；无重置、无 facet */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
          <PlanDialog
            refetch={refetch}
            trigger={
              <Button variant="outline" size="sm" className="space-x-2">
                <Plus className="h-4 w-4" />
                <div>{t("plan.add", { defaultValue: "添加套餐" })}</div>
              </Button>
            }
          />
          <Input
            placeholder={t("plan.search", { defaultValue: "搜索套餐..." })}
            value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => tbl.getColumn("name")?.setFilterValue(e.target.value)}
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
          />
        </div>
        {tbl.getRowCount() > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant={isSortMode ? "default" : "outline"} onClick={saveOrder} size="sm">
              {isSortMode
                ? t("plan.sort.save", { defaultValue: "保存排序" })
                : t("plan.sort.edit", { defaultValue: "编辑排序" })}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("plan.title", { defaultValue: "订阅套餐" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("plan.page.description", { defaultValue: "管理订阅套餐，包括添加、删除、编辑等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
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
  );
}
