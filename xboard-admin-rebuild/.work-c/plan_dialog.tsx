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
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
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

/** 原件 c4t 的极简版：表单里「添加分组」链接弹出的新建分组弹窗（POST /server/group/save） */
function PlanGroupDialog({ refetch, trigger }: { refetch: () => void; trigger: React.ReactElement }) {
  const { t } = useTranslation(["subscribe", "common"]);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) setName("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-sm flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl">
        <DialogHeader className="flex-shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-lg tracking-tight">
            {t("plan.form.group.add", { defaultValue: "添加分组" })}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 py-4 text-sm">
            <PlanField label={t("plan.form.group.label", { defaultValue: "服务器分组" })}>
              <Input
                className="h-9 font-mono text-xs"
                value={name}
                placeholder={t("plan.form.group.placeholder", { defaultValue: "请选择服务器分组" })}
                onChange={(event) => setName(event.target.value)}
              />
            </PlanField>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <div className="flex w-full items-center justify-end gap-3">
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
              disabled={busy || !name.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  await apiPost(`${SECURE}/server/group/save`, { id: null, name });
                  setOpen(false);
                  setName("");
                  refetch();
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t("plan.form.submit.submit", { defaultValue: "提交" })}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原件 l6t（bundle ≈6,310,320）：添加 / 编辑套餐弹窗 */
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
  const [showPreview, setShowPreview] = React.useState(false);
  const [nameError, setNameError] = React.useState("");
  const isEdit = Boolean(defaultValues);

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
    const source = defaultValues.prices;
    for (const period of PRICE_PERIODS) {
      const raw = source?.[period.key as keyof PlanPrices];
      prices[period.key] = raw == null ? "" : String(raw);
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
      force_update: Boolean(defaultValues.force_update),
      prices,
    });
    setNameError("");
  }, [open, defaultValues, loadGroups]);

  /* 原件：基础价 × 月数 × 折扣，toFixed(2) 填入全部周期（含 onetime / reset_traffic） */
  const applyBasePrice = (raw: string) => {
    const base = parseFloat(raw);
    if (Number.isNaN(base)) return;
    const next = emptyPrices();
    for (const period of PRICE_PERIODS) {
      next[period.key] = (base * period.months * period.discount).toFixed(2);
    }
    setForm((prev) => ({ ...prev, prices: next }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setNameError(t("plan.form.name.label", { defaultValue: "套餐名称" }) + " *");
      return;
    }
    setNameError("");
    setBusy(true);
    try {
      const prices: Record<string, number | null> = {};
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
      {/* 原件 XXt 桌面分支：max-w-xl / p-0 / 头 px-6 pt-6 pb-4 / 体 px-6 py-4 / 脚 px-6 py-4 */}
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
              {/* 1. 名称 + 标签 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanField
                  label={t("plan.form.name.label", { defaultValue: "套餐名称" })}
                  required
                  error={nameError}
                >
                  <Input
                    value={form.name}
                    placeholder={t("plan.form.name.placeholder", { defaultValue: "请输入套餐名称" })}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="h-9 font-mono text-xs transition-all focus-visible:ring-1"
                  />
                </PlanField>
                <PlanField label={t("plan.form.tags.label", { defaultValue: "标签" })}>
                  <PlanTagsInput
                    value={form.tags}
                    onChange={(tags) => setForm({ ...form, tags })}
                    placeholder={t("plan.form.tags.placeholder", { defaultValue: "输入标签后按回车确认" })}
                  />
                </PlanField>
              </div>

              {/* 2. 权限组（含「添加分组」链接）+ 流量 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanField
                  label={t("plan.form.group.label", { defaultValue: "服务器分组" })}
                  required
                >
                  <div className="-mt-1 flex items-center justify-between">
                    <span className="sr-only">{t("plan.form.group.label", { defaultValue: "服务器分组" })}</span>
                    <PlanGroupDialog
                      refetch={loadGroups}
                      trigger={
                        <Button variant="link" size="sm" className="ml-auto h-auto p-0 text-xs">
                          {t("plan.form.group.add", { defaultValue: "添加分组" })}
                        </Button>
                      }
                    />
                  </div>
                  <Select value={form.group_id} onValueChange={(value: string) => setForm({ ...form, group_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("plan.form.group.placeholder", { defaultValue: "请选择服务器分组" })} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={String(group.id)}>
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

              {/* 3. 速度 + 设备 */}
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

              {/* 4. 容量 + 流量重置方式 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PlanNumberField
                  label={t("plan.form.capacity.label", { defaultValue: "容量限制" })}
                  value={form.capacity_limit}
                  onChange={(value) => setForm({ ...form, capacity_limit: value })}
                  placeholder={t("plan.form.capacity.placeholder", { defaultValue: "请输入容量限制" })}
                  unit={t("plan.form.capacity.unit", { defaultValue: "人" })}
                />
                <PlanField label={t("plan.form.reset_method.label", { defaultValue: "流量重置方式" })}>
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
                        <SelectItem key={method.value} value={method.value}>
                          {t(`plan.form.reset_method.options.${method.label}`, { defaultValue: method.label })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PlanField>
              </div>

              {/* 5. 价格设置 */}
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
                      className="h-8 px-2"
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
                      onChange={(value) => setForm({ ...form, prices: { ...form.prices, [period.key]: value } })}
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
                      onChange={(value) => setForm({ ...form, prices: { ...form.prices, [period.key]: value } })}
                      hint={t(
                        period.key === "onetime" ? "plan.form.price.onetime_desc" : "plan.form.price.reset_desc",
                        { defaultValue: "" },
                      )}
                      step="0.01"
                    />
                  ))}
                </div>
              </div>

              {/* 6. 套餐说明（markdown + 预览） */}
              <PlanField label={t("plan.form.content.label", { defaultValue: "套餐说明" })} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="sr-only">{t("plan.form.content.label", { defaultValue: "套餐说明" })}</span>
                  <div className="ml-auto flex items-center gap-2">
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setShowPreview((prev) => !prev)}
                    >
                      {showPreview ? (
                        <EyeOff className="mr-2 h-3.5 w-3.5" />
                      ) : (
                        <Eye className="mr-2 h-3.5 w-3.5" />
                      )}
                      {showPreview
                        ? t("plan.form.content.preview_button.hide", { defaultValue: "隐藏预览" })
                        : t("plan.form.content.preview_button.show", { defaultValue: "显示预览" })}
                    </Button>
                  </div>
                </div>
                <div className={"grid gap-4 " + (showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                  <MarkdownEditor
                    height={300}
                    value={form.content}
                    onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                  />
                  {showPreview ? (
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
