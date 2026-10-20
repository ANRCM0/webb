import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, RotateCcw, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { gift_card } from "@/api";
import { http } from "@/lib/http";

/**
 * 原件：`s8t`（offset 6,401,827）礼品卡四段 Tabs 外壳
 *   + `Y6t` 模板（含 `K6t` 上下文 / `Z6t` 工具栏 / `q6t` 表单 / `U6t` 列）
 *   + `t8t` 兑换码（`J6t` 工具栏 / `Q6t` 生成弹窗 / `e8t` 列）
 *   + `i8t` 使用记录（`n8t` 列）+ `r8t` 统计卡片
 *
 * 端点（前缀 = window.settings.secure_path，方法对齐 AdminRoute.php:191-210）：
 *  - any  /gift-card/templates   ?type&status&page&per_page
 *  - any  /gift-card/codes       ?status&template_id&batch_id&page&per_page
 *  - any  /gift-card/usages      ?template_id&user_id&page&per_page
 *  - any  /gift-card/statistics  ?start_date&end_date
 *  - POST /gift-card/create-template | update-template | delete-template
 *  - POST /gift-card/generate-codes { template_id, count, prefix, expires_hours, max_usage, download_csv }
 *  - POST /gift-card/toggle-code   { id, action: "enable" | "disable" }
 *
 * 说明：后端 templates/codes/usages 只接受上列查询参数（不做关键字/排序），
 * 因此原件发送的 `filter`/`sort` 实际被忽略；本实现在客户端对当前页做关键字筛选。
 */

function securePath(): string {
  return window.settings?.secure_path ?? "";
}

interface Paginated<T> {
  data: T[];
  total: number;
  current_page?: number;
  per_page?: number;
  last_page?: number;
}

async function readPage<T>(request: Promise<{ data: unknown }>): Promise<Paginated<T>> {
  const response = await request;
  const body = response.data as Partial<Paginated<T>> | undefined;
  return { data: body?.data ?? [], total: body?.total ?? 0, current_page: body?.current_page, last_page: body?.last_page };
}

async function readData<T>(request: Promise<{ data: unknown }>): Promise<T | null> {
  const response = await request;
  return ((response.data as { data?: T }).data ?? null) as T | null;
}

type Rewards = Record<string, unknown>;

interface GiftCardTemplate {
  id: number;
  name: string;
  description?: string | null;
  type: number;
  type_name?: string;
  status: boolean | number;
  conditions?: Record<string, unknown> | null;
  rewards?: Rewards | null;
  limits?: Record<string, unknown> | null;
  special_config?: Record<string, unknown> | null;
  icon?: string | null;
  background_image?: string | null;
  theme_color?: string | null;
  sort: number;
  created_at: number;
  codes_count?: number;
  used_count?: number;
}

interface GiftCardCode {
  id: number;
  template_id: number;
  template_name: string;
  code: string;
  batch_id: string;
  status: number;
  status_name?: string;
  user_email?: string | null;
  used_at?: number | null;
  expires_at?: number | null;
  usage_count: number;
  max_usage: number;
  created_at: number;
}

interface GiftCardUsage {
  id: number;
  code: string;
  template_name: string;
  user_email: string;
  rewards_given?: Rewards | null;
  invite_rewards?: number | null;
  multiplier_applied?: number | null;
  created_at: number;
}

interface GiftCardStatistics {
  total_stats?: {
    templates_count?: number;
    active_templates_count?: number;
    codes_count?: number;
    used_codes_count?: number;
    usages_count?: number;
  };
  daily_usages?: ReadonlyArray<{ date: string; count: number }>;
  type_stats?: ReadonlyArray<{ template_id: number; template_name?: string; count: number }>;
}

/** 原件 SS：秒级时间戳按 UTC+8 渲染 */
function formatDateTime(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-";
  let seconds = Number(value);
  if (!Number.isFinite(seconds)) return "-";
  if (Math.floor(seconds).toString().length === 10) seconds = seconds * 1000;
  const shifted = new Date(seconds + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())} ${pad(
    shifted.getUTCHours(),
  )}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
}

function formatDate(value: number | null | undefined): string {
  const text = formatDateTime(value);
  return text === "-" ? text : text.slice(0, 10);
}

const TEMPLATE_TYPES = [1, 2, 3, 4] as const;

/** 奖励摘要（原件 U6t 的 rewards 单元格） */
function rewardSummary(rewards: Rewards | null | undefined): string[] {
  if (!rewards) return [];
  const parts: string[] = [];
  const balance = rewards.balance;
  if (typeof balance === "number" && balance > 0) parts.push(`余额 ¥${(balance / 100).toFixed(2)}`);
  const transfer = rewards.transfer ?? rewards.transfer_enable;
  if (typeof transfer === "number" && transfer > 0) {
    parts.push(`流量 ${(transfer / 1024 / 1024 / 1024).toFixed(2)} GB`);
  }
  const days = rewards.expire_days ?? rewards.days;
  if (typeof days === "number" && days > 0) parts.push(`有效期 ${days} 天`);
  const device = rewards.device_limit;
  if (typeof device === "number" && device > 0) parts.push(`设备 ${device}`);
  const plan = rewards.plan_id;
  if (typeof plan === "number" && plan > 0) parts.push(`套餐 #${plan}`);
  if (rewards.reset_package === true) parts.push("重置当月流量");
  if (parts.length === 0) parts.push("—");
  return parts;
}

export default function FinanceGiftCard() {
  const { t } = useTranslation(["giftCard", "common"]);
  const [tab, setTab] = React.useState("templates");

  const headings: Record<string, { title: string; description: string }> = {
    templates: { title: t("template.title"), description: t("template.description") },
    codes: { title: t("code.title"), description: t("code.description") },
    usages: { title: t("usage.title"), description: t("usage.description") },
    statistics: { title: t("statistics.title"), description: t("statistics.description") } };

  return (
    <Layout>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-6 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">{t("tabs.templates")}</TabsTrigger>
            <TabsTrigger value="codes">{t("tabs.codes")}</TabsTrigger>
            <TabsTrigger value="usages">{t("tabs.usages")}</TabsTrigger>
            <TabsTrigger value="statistics">{t("tabs.statistics")}</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{headings.templates.title}</h3>
                  <p className="text-sm text-muted-foreground">{headings.templates.description}</p>
                </div>
              </div>
              <TemplatesPanel />
            </div>
          </TabsContent>

          <TabsContent value="codes" className="mt-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{headings.codes.title}</h3>
                  <p className="text-sm text-muted-foreground">{headings.codes.description}</p>
                </div>
              </div>
              <CodesPanel />
            </div>
          </TabsContent>

          <TabsContent value="usages" className="mt-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{headings.usages.title}</h3>
                  <p className="text-sm text-muted-foreground">{headings.usages.description}</p>
                </div>
              </div>
              <UsagesPanel />
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{headings.statistics.title}</h3>
                  <p className="text-sm text-muted-foreground">{headings.statistics.description}</p>
                </div>
              </div>
              <StatisticsPanel />
            </div>
          </TabsContent>
        </Tabs>
      </LayoutBody>
    </Layout>
  );
}

/** 简易分页器（原件复用 DataTablePagination） */
function Paginator({
  page,
  pageSize,
  total,
  onChange }: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation("common");
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between px-1 py-2 text-sm text-muted-foreground">
      <span>{t("table.pagination.pageOf", { total: lastPage })}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {t("table.pagination.previousPage")}
        </Button>
        <span>
          {page} / {lastPage}
        </span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
          {t("table.pagination.nextPage")}
        </Button>
      </div>
    </div>
  );
}

function TemplatesPanel() {
  const { t } = useTranslation(["giftCard", "common"]);
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [editing, setEditing] = React.useState<GiftCardTemplate | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<GiftCardTemplate | null>(null);

  const { data, isLoading, refetch } = useQuery<Paginated<GiftCardTemplate>>({
    queryKey: ["giftCardTemplates", page, typeFilter, statusFilter],
    queryFn: () =>
      readPage<GiftCardTemplate>(
        gift_card.templates({
          page,
          per_page: pageSize,
          ...(typeFilter === "all" ? {} : { type: Number(typeFilter) }),
          ...(statusFilter === "all" ? {} : { status: statusFilter === "enabled" ? 1 : 0 }) }),
      ) });

  const rows = React.useMemo(() => {
    const list = data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => item.name.toLowerCase().includes(needle));
  }, [data, search]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await gift_card.delete_template({ id });
    },
    onSuccess: async () => {
      toast.success(t("messages.templateDeleted"));
      await queryClient.invalidateQueries({ queryKey: ["giftCardTemplates"] });
    },
    onError: () => toast.error(t("messages.deleteTemplateFailed")) });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
            placeholder={t("common.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder={t("template.table.columns.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("template.table.columns.type")}</SelectItem>
              {TEMPLATE_TYPES.map((type) => (
                <SelectItem key={type} value={String(type)}>
                  {t(`types.${type}`, { defaultValue: `类型 ${type}` })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder={t("template.table.columns.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("template.table.columns.status")}</SelectItem>
              <SelectItem value="enabled">{t("common.enabled")}</SelectItem>
              <SelectItem value="disabled">{t("common.disabled")}</SelectItem>
            </SelectContent>
          </Select>
          {(search || typeFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              className="h-8 px-2 lg:px-3"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              {t("common.reset")}
              <RotateCcw className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("template.form.add")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">{t("template.table.columns.id")}</TableHead>
              <TableHead>{t("template.table.columns.name")}</TableHead>
              <TableHead>{t("template.table.columns.type")}</TableHead>
              <TableHead>{t("template.table.columns.status")}</TableHead>
              <TableHead className="w-[80px]">{t("template.table.columns.sort")}</TableHead>
              <TableHead>{t("template.table.columns.rewards")}</TableHead>
              <TableHead>{t("template.table.columns.created_at")}</TableHead>
              <TableHead className="text-right">{t("template.table.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((item) => {
              const rewards = rewardSummary(item.rewards);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.id}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.type_name ?? t(`types.${item.type}`, { defaultValue: `类型 ${item.type}` })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status ? "secondary" : "outline"}>
                      {item.status ? t("common.enabled") : t("common.disabled")}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{item.sort}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rewards.map((part) => (
                        <Badge key={part} variant="outline" className="text-[10px]">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={t("template.actions.edit")}
                        onClick={() => {
                          setEditing(item);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label={t("template.actions.delete")}
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Paginator page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />

      <TemplateFormDialog
        open={formOpen}
        template={editing}
        onOpenChange={setFormOpen}
        onSaved={() => {
          void refetch();
        }}
      />

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("template.actions.deleteConfirm.title")}</DialogTitle>
            <DialogDescription>{t("template.actions.deleteConfirm.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) deleteMutation.mutate(target.id);
              }}
            >
              {t("template.actions.deleteConfirm.confirmText")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 原件 q6t：模板新增/编辑表单（字段集合与 defaultValues 一致） */
function TemplateFormDialog({
  open,
  template,
  onOpenChange,
  onSaved }: {
  open: boolean;
  template: GiftCardTemplate | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation(["giftCard", "common"]);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("1");
  const [status, setStatus] = React.useState(true);
  const [sort, setSort] = React.useState("0");
  const [icon, setIcon] = React.useState("");
  const [backgroundImage, setBackgroundImage] = React.useState("");
  const [themeColor, setThemeColor] = React.useState("#1890ff");
  const [balance, setBalance] = React.useState("");
  const [transferGb, setTransferGb] = React.useState("");
  const [expireDays, setExpireDays] = React.useState("");
  const [deviceLimit, setDeviceLimit] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setType(String(template?.type ?? 1));
    setStatus(Boolean(template?.status ?? true));
    setSort(String(template?.sort ?? 0));
    setIcon(template?.icon ?? "");
    setBackgroundImage(template?.background_image ?? "");
    setThemeColor(template?.theme_color ?? "#1890ff");
    const rewards = template?.rewards ?? {};
    setBalance(typeof rewards.balance === "number" ? String(rewards.balance / 100) : "");
    const transfer = rewards.transfer ?? rewards.transfer_enable;
    setTransferGb(typeof transfer === "number" ? String(transfer / 1024 / 1024 / 1024) : "");
    const days = rewards.expire_days ?? rewards.days;
    setExpireDays(typeof days === "number" ? String(days) : "");
    setDeviceLimit(typeof rewards.device_limit === "number" ? String(rewards.device_limit) : "");
  }, [open, template]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error(t("template.form.name.required"));
      return;
    }
    const rewards: Rewards = {};
    if (balance !== "" && Number(balance) > 0) rewards.balance = Math.round(Number(balance) * 100);
    if (transferGb !== "" && Number(transferGb) > 0) {
      rewards.transfer_enable = Math.round(Number(transferGb) * 1024 * 1024 * 1024);
    }
    if (expireDays !== "" && Number(expireDays) > 0) rewards.expire_days = Number(expireDays);
    if (deviceLimit !== "" && Number(deviceLimit) > 0) rewards.device_limit = Number(deviceLimit);

    const payload = {
      name: name.trim(),
      description: description || null,
      type: Number(type),
      status,
      sort: Number(sort) || 0,
      icon: icon || null,
      background_image: backgroundImage || null,
      theme_color: themeColor,
      conditions: template?.conditions ?? {},
      limits: template?.limits ?? {},
      rewards,
      special_config: template?.special_config ?? {} };

    setSaving(true);
    try {
      if (template) {
        await gift_card.update_template({ id: template.id, ...payload });
        toast.success(t("messages.templateUpdated"));
      } else {
        await gift_card.create_template(payload);
        toast.success(t("messages.templateCreated"));
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error(t(template ? "messages.updateTemplateFailed" : "messages.createTemplateFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? t("template.form.edit") : t("template.form.add")}</DialogTitle>
          <DialogDescription>{t("template.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-name">{t("template.form.name.label")}</Label>
              <Input
                id="template-name"
                value={name}
                placeholder={t("template.form.name.placeholder")}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-sort">{t("template.form.sort.label")}</Label>
              <Input
                id="template-sort"
                type="number"
                min={0}
                value={sort}
                placeholder={t("template.form.sort.placeholder")}
                onChange={(event) => setSort(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-type">{t("template.form.type.label")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="template-type">
                  <SelectValue placeholder={t("template.form.type.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {t(`types.${value}`, { defaultValue: `类型 ${value}` })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-color">{t("template.form.theme_color.label")}</Label>
              <Input
                id="template-color"
                type="color"
                className="h-9 w-full"
                value={themeColor}
                onChange={(event) => setThemeColor(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">{t("template.form.description.label")}</Label>
            <Input
              id="template-description"
              value={description}
              placeholder={t("template.form.description.placeholder")}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-icon">{t("template.form.icon.label")}</Label>
              <Input
                id="template-icon"
                value={icon}
                placeholder={t("template.form.icon.placeholder")}
                onChange={(event) => setIcon(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-background">{t("template.form.background_image.label")}</Label>
              <Input
                id="template-background"
                value={backgroundImage}
                placeholder={t("template.form.background_image.placeholder")}
                onChange={(event) => setBackgroundImage(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="template-status">{t("template.form.status.label")}</Label>
              <p className="mt-1 text-xs text-muted-foreground">{t("template.form.status.description")}</p>
            </div>
            <Switch id="template-status" checked={status} onCheckedChange={setStatus} />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <h4 className="text-sm font-medium">{t("template.form.rewards.title")}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-balance">{t("template.form.rewards.balance.label")}</Label>
                <Input
                  id="reward-balance"
                  type="number"
                  min={0}
                  step="0.01"
                  value={balance}
                  placeholder={t("template.form.rewards.balance.placeholder")}
                  onChange={(event) => setBalance(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-traffic">{t("template.form.rewards.transfer_enable.label")}</Label>
                <Input
                  id="reward-traffic"
                  type="number"
                  min={0}
                  step="0.01"
                  value={transferGb}
                  placeholder={t("template.form.rewards.transfer_enable.placeholder")}
                  onChange={(event) => setTransferGb(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-days">{t("template.form.rewards.expire_days.label")}</Label>
                <Input
                  id="reward-days"
                  type="number"
                  min={0}
                  value={expireDays}
                  placeholder={t("template.form.rewards.expire_days.placeholder")}
                  onChange={(event) => setExpireDays(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-device">{t("template.form.rewards.device_limit.label")}</Label>
                <Input
                  id="reward-device"
                  type="number"
                  min={0}
                  value={deviceLimit}
                  placeholder={t("template.form.rewards.device_limit.placeholder")}
                  onChange={(event) => setDeviceLimit(event.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? t("template.form.submit.saving") : t("template.form.submit.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CodesPanel() {
  const { t } = useTranslation(["giftCard", "common"]);
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [generateOpen, setGenerateOpen] = React.useState(false);

  const { data, isLoading, refetch } = useQuery<Paginated<GiftCardCode>>({
    queryKey: ["giftCardCodes", page, statusFilter],
    queryFn: () =>
      readPage<GiftCardCode>(
        gift_card.codes({
          page,
          per_page: pageSize,
          ...(statusFilter === "all" ? {} : { status: Number(statusFilter) }) }),
      ) });

  const { data: templates } = useQuery<Paginated<GiftCardTemplate>>({
    queryKey: ["giftCardTemplatesForSelect"],
    queryFn: () => readPage<GiftCardTemplate>(gift_card.templates({ page: 1, per_page: 1000 })) });

  const rows = React.useMemo(() => {
    const list = data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => item.code.toLowerCase().includes(needle));
  }, [data, search]);

  const toggleMutation = useMutation({
    mutationFn: async (payload: { id: number; action: "enable" | "disable" }) => {
      await gift_card.toggle_code(payload);
    },
    onSuccess: async () => {
      toast.success(t("messages.codeStatusUpdated"));
      await queryClient.invalidateQueries({ queryKey: ["giftCardCodes"] });
    },
    onError: () => toast.error(t("messages.updateCodeStatusFailed")) });

  function statusLabel(code: GiftCardCode): string {
    if (code.status_name) return code.status_name;
    return t(`code.status.${code.status}`, { defaultValue: String(code.status) });
  }

  function statusVariant(code: GiftCardCode): "default" | "secondary" | "destructive" | "outline" {
    switch (code.status) {
      case 0:
        return "secondary";
      case 1:
        return "default";
      case 3:
        return "destructive";
      default:
        return "outline";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
            placeholder={t("common.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder={t("code.table.columns.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("code.table.columns.status")}</SelectItem>
              {[0, 1, 2, 3].map((status) => (
                <SelectItem key={status} value={String(status)}>
                  {t(`code.status.${status}`, { defaultValue: String(status) })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            {t("common.reset")}
            <RotateCcw className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("code.form.generate")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">{t("code.table.columns.id")}</TableHead>
              <TableHead>{t("code.table.columns.code")}</TableHead>
              <TableHead>{t("code.table.columns.template_name")}</TableHead>
              <TableHead>{t("code.table.columns.status")}</TableHead>
              <TableHead>{t("code.table.columns.expires_at")}</TableHead>
              <TableHead className="w-[110px]">{t("code.table.columns.usage_count")}</TableHead>
              <TableHead>{t("code.table.columns.created_at")}</TableHead>
              <TableHead className="text-right">{t("template.table.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((code) => (
              <TableRow key={code.id}>
                <TableCell>
                  <Badge variant="outline">{code.id}</Badge>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{code.code}</code>
                </TableCell>
                <TableCell className="text-sm">{code.template_name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(code)}>{statusLabel(code)}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {code.expires_at ? formatDateTime(code.expires_at) : "—"}
                </TableCell>
                <TableCell className="tabular-nums text-sm">
                  {code.usage_count} / {code.max_usage}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(code.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toggleMutation.isPending}
                      onClick={() =>
                        toggleMutation.mutate({
                          id: code.id,
                          action: code.status === 3 ? "enable" : "disable" })
                      }
                    >
                      {code.status === 3 ? t("code.actions.enable") : t("code.actions.disable")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Paginator page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />

      <GenerateCodesDialog
        open={generateOpen}
        templates={templates?.data ?? []}
        onOpenChange={setGenerateOpen}
        onGenerated={() => {
          void refetch();
        }}
      />
    </div>
  );
}

/** 原件 Q6t：生成兑换码弹窗（template_id/count/prefix/expires_hours/max_usage/download_csv） */
function GenerateCodesDialog({
  open,
  templates,
  onOpenChange,
  onGenerated }: {
  open: boolean;
  templates: GiftCardTemplate[];
  onOpenChange: (open: boolean) => void;
  onGenerated: () => void;
}) {
  const { t } = useTranslation(["giftCard", "common"]);
  const [templateId, setTemplateId] = React.useState("");
  const [count, setCount] = React.useState("10");
  const [prefix, setPrefix] = React.useState("");
  const [expiresHours, setExpiresHours] = React.useState("720");
  const [maxUsage, setMaxUsage] = React.useState("1");
  const [downloadCsv, setDownloadCsv] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateId) {
      toast.error(t("code.form.template_id.placeholder"));
      return;
    }
    setSubmitting(true);
    try {
      const response = await http.post(`${securePath()}/gift-card/generate-codes`, {
        template_id: Number(templateId),
        count: Number(count) || 1,
        prefix: prefix || undefined,
        expires_hours: Number(expiresHours) || undefined,
        max_usage: Number(maxUsage) || 1,
        download_csv: downloadCsv });
      if (downloadCsv) {
        const blob = new Blob([response.data as BlobPart], { type: "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `gift_codes_${Date.now()}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
      }
      toast.success(t("messages.codesGenerated"));
      onOpenChange(false);
      onGenerated();
    } catch {
      toast.error(t("messages.generateCodeFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("code.form.generate")}</DialogTitle>
          <DialogDescription>{t("code.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generate-template">{t("code.form.template_id.label")}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="generate-template">
                <SelectValue placeholder={t("code.form.template_id.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={String(template.id)}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generate-count">{t("code.form.count.label")}</Label>
              <Input
                id="generate-count"
                type="number"
                min={1}
                max={10000}
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generate-prefix">{t("code.form.prefix.label")}</Label>
              <Input
                id="generate-prefix"
                value={prefix}
                placeholder="GC"
                onChange={(event) => setPrefix(event.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generate-expires">{t("code.form.expires_hours.label")}</Label>
              <Input
                id="generate-expires"
                type="number"
                min={1}
                value={expiresHours}
                onChange={(event) => setExpiresHours(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generate-max-usage">{t("code.form.max_usage.label")}</Label>
              <Input
                id="generate-max-usage"
                type="number"
                min={1}
                max={1000}
                value={maxUsage}
                onChange={(event) => setMaxUsage(event.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="generate-csv">{t("code.form.download_csv")}</Label>
            <Switch id="generate-csv" checked={downloadCsv} onCheckedChange={setDownloadCsv} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? t("code.form.submit.generating") : t("code.form.submit.generate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsagesPanel() {
  const { t } = useTranslation(["giftCard", "common"]);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery<Paginated<GiftCardUsage>>({
    queryKey: ["giftCardUsages", page],
    queryFn: () => readPage<GiftCardUsage>(gift_card.usages({ page, per_page: pageSize })) });

  const rows = React.useMemo(() => {
    const list = data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => (item.user_email ?? "").toLowerCase().includes(needle));
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
          placeholder="搜索用户邮箱..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">{t("usage.table.columns.id")}</TableHead>
              <TableHead>{t("usage.table.columns.code")}</TableHead>
              <TableHead>{t("usage.table.columns.template_name")}</TableHead>
              <TableHead>{t("usage.table.columns.user_email")}</TableHead>
              <TableHead>{t("usage.table.columns.rewards_given")}</TableHead>
              <TableHead>{t("usage.table.columns.invite_rewards")}</TableHead>
              <TableHead>{t("usage.table.columns.multiplier_applied")}</TableHead>
              <TableHead>{t("usage.table.columns.created_at")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((usage) => (
              <TableRow key={usage.id}>
                <TableCell>
                  <Badge variant="outline">{usage.id}</Badge>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{usage.code}</code>
                </TableCell>
                <TableCell className="text-sm">{usage.template_name}</TableCell>
                <TableCell className="text-sm">{usage.user_email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rewardSummary(usage.rewards_given).map((part) => (
                      <Badge key={part} variant="outline" className="text-[10px]">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {typeof usage.invite_rewards === "number" ? `¥${(usage.invite_rewards / 100).toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {typeof usage.multiplier_applied === "number" ? `${usage.multiplier_applied}x` : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDateTime(usage.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Paginator page={page} pageSize={pageSize} total={data?.total ?? 0} onChange={setPage} />
    </div>
  );
}

function StatisticsPanel() {
  const { t } = useTranslation(["giftCard", "common"]);
  const { data, isLoading } = useQuery<GiftCardStatistics | null>({
    queryKey: ["giftCardStats"],
    queryFn: () => readData<GiftCardStatistics>(gift_card.statistics({})) });

  const totalStats = data?.total_stats;
  const cards = [
    { title: t("statistics.total.templates_count"), value: totalStats?.templates_count },
    { title: t("statistics.total.active_templates_count"), value: totalStats?.active_templates_count },
    { title: t("statistics.total.codes_count"), value: totalStats?.codes_count },
    { title: t("statistics.total.used_codes_count"), value: totalStats?.used_codes_count },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{card.value ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Ticket className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{t("statistics.total.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("statistics.total.usages_count")}：{isLoading ? "…" : (totalStats?.usages_count ?? 0)}
        </CardContent>
      </Card>
    </div>
  );
}
