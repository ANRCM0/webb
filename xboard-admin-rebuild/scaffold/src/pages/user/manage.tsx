import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
  type Table,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Ban,
  Calendar as CalendarIcon,
  Copy,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { FilterBuilder, type FilterField, type FilterRule } from "@/components/data-table/filter-builder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SECURE,
  apiGet,
  apiPost,
  apiPostBlob,
  formatBytes,
  formatDateTime,
  formatAmount,
  makeSelectColumn,
} from "@/pages/_b/shared";

/**
 * 原件 `/user/manage`：页面组件 Y8t（offset 6476931）→ 专属组件 G8t（940B）
 * 列工厂 H8t、工具栏 x8t、编辑抽屉 K8t（bundle 541707 附近）。
 * 服务端分页：queryKey ["userList", pagination, columnFilters, sorting]，
 * POST /user/fetch { pageSize, current, filter, sort }，响应 { data, total }。
 */

export interface UserGroupRef {
  id: number;
  name: string;
}

export interface UserPlanRef {
  id: number;
  name: string;
}

export interface UserRow {
  id: number;
  email: string;
  is_admin?: boolean | number;
  is_staff?: boolean | number;
  banned?: boolean | number;
  online_count?: number;
  plan_id?: number | null;
  group_id?: number | null;
  u?: number;
  d?: number;
  transfer_enable?: number;
  expired_at?: number | null;
  balance?: number;
  commission_balance?: number;
  created_at?: number;
  uuid?: string;
  token?: string;
}

interface UserPage {
  data?: UserRow[];
  total?: number;
}

interface GroupOption {
  id: number;
  name: string;
}

interface PlanOption {
  id: number;
  name: string;
}

/* 端点（bundle 541707）：oT/aT/lT/uT/hT/pT/mT/fT */
const fetchUsers = (body: Record<string, unknown>) => apiPost<UserPage>(`${SECURE}/user/fetch`, body);
const updateUser = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/user/update`, body);
const resetUserSecret = (id: number) => apiPost<{ data?: unknown }>(`${SECURE}/user/resetSecret`, { id });
const destroyUser = (id: number) => apiPost<{ data?: unknown }>(`${SECURE}/user/destroy`, { id });
const banUser = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/user/ban`, body);
const fetchGroups = () => apiGet<{ data?: GroupOption[] }>(`${SECURE}/server/group/fetch`);
const fetchPlans = () => apiGet<{ data?: PlanOption[] }>(`${SECURE}/plan/fetch`);
/* 原件 cT / gT / hT：创建用户（可导出 CSV）、导出用户 CSV、群发邮件 */
const generateUsersCsv = (body: Record<string, unknown>) => apiPostBlob(`${SECURE}/user/generate`, body);
const generateUsers = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/user/generate`, body);
const dumpUsersCsv = (body: Record<string, unknown>) => apiPostBlob(`${SECURE}/user/dumpCSV`, body);
const sendMailToUsers = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/user/sendMail`, body);

/** 原件 gT 的行为：blob → a[download] 触发下载 */
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

const GB = 1024 * 1024 * 1024;

/* 原件 o8t / a8t（bundle 6404395）：系统通知模板 */
const SYSTEM_NOTICE_SUBJECT = "【{{app.name}}】系统通知（{{now}}）";
const SYSTEM_NOTICE_CONTENT =
  "尊敬的用户 {{user.email}} 您好：\n\n这里是来自 {{app.name}} 的系统通知。\n\n如有问题请访问：{{app.url}}\n";

interface UserForm {
  id: number | null;
  email: string;
  transfer_enable: string;
  expired_at: string;
  banned: boolean;
  is_admin: boolean;
  is_staff: boolean;
}

const emptyForm: UserForm = {
  id: null,
  email: "",
  transfer_enable: "",
  expired_at: "",
  banned: false,
  is_admin: false,
  is_staff: false,
};

function UserDialog({
  refetch,
  defaultValues,
  trigger,
}: {
  refetch: () => void;
  defaultValues: UserRow;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["user", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<UserForm>(emptyForm);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      id: defaultValues.id,
      email: defaultValues.email ?? "",
      transfer_enable: defaultValues.transfer_enable
        ? (defaultValues.transfer_enable / GB).toFixed(2)
        : "",
      expired_at: defaultValues.expired_at ? String(defaultValues.expired_at) : "",
      banned: Boolean(defaultValues.banned),
      is_admin: Boolean(defaultValues.is_admin),
      is_staff: Boolean(defaultValues.is_staff),
    });
  }, [open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("columns.actions_menu.edit", { defaultValue: "编辑用户" })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("columns.email", { defaultValue: "邮箱" })}
            </label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("columns.total_traffic", { defaultValue: "总流量" })} (GB)
            </label>
            <Input
              type="number"
              value={form.transfer_enable}
              onChange={(e) => setForm({ ...form, transfer_enable: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.banned} onCheckedChange={(v: boolean) => setForm({ ...form, banned: v })} />
              <span className="text-sm">{t("columns.status_text.banned", { defaultValue: "禁用" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_admin} onCheckedChange={(v: boolean) => setForm({ ...form, is_admin: v })} />
              <span className="text-sm">{t("columns.is_admin", { defaultValue: "管理员" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_staff} onCheckedChange={(v: boolean) => setForm({ ...form, is_staff: v })} />
              <span className="text-sm">{t("columns.is_staff", { defaultValue: "员工" })}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {t("common:cancel", { defaultValue: "取消" })}
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await updateUser({
                  id: form.id,
                  email: form.email,
                  transfer_enable: form.transfer_enable ? Math.round(Number(form.transfer_enable) * GB) : 0,
                  banned: form.banned ? 1 : 0,
                  is_admin: form.is_admin ? 1 : 0,
                  is_staff: form.is_staff ? 1 : 0,
                });
                toast.success(t("messages.success", { defaultValue: "操作成功" }));
                setOpen(false);
                refetch();
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("common:submit", { defaultValue: "提交" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 原件 `XXt`（bundle offset ≈5,850,469）：表单弹层外壳的桌面分支。
 * DialogContent 为 `flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl`，
 * 头部 `flex-shrink-0 border-b px-6 pb-4 pt-6`，正文 `min-h-0 flex-1 overflow-y-auto` > `space-y-4 px-6 py-4 text-sm`，
 * 页脚 `flex-shrink-0 border-t px-6 py-4` > 左右两组按钮（ghost `h-8 px-4 text-xs font-bold` / 主按钮 `h-8 px-8 text-xs font-bold`）。
 */
function FormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  submitIcon,
  footerLeft,
  className,
  contentClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 触发元素；外部受控打开时可省略（原件 l8t 由工具栏 Actions 打开） */
  trigger?: React.ReactElement;
  title: string;
  description?: string;
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitIcon?: React.ReactNode;
  footerLeft?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden border-border/50 p-0 shadow-none sm:rounded-xl",
          className,
        )}
      >
        <DialogHeader className="flex-shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-lg tracking-tight">{title}</DialogTitle>
          {description ? <DialogDescription className="text-xs opacity-70">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>
          <div className="space-y-4 px-6 py-4 text-sm">{children}</div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">{footerLeft}</div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-4 text-xs font-bold"
                disabled={isSubmitting}
                onClick={onCancel}
              >
                {cancelLabel ?? "取消"}
              </Button>
              <Button
                type={onSubmit ? "submit" : "button"}
                className="h-8 px-8 text-xs font-bold"
                disabled={isSubmitting}
                onClick={onSubmit}
              >
                {submitIcon}
                {submitLabel ?? "确认"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 原件 `TYt`（FormField）：Item `space-y-1.5` + Label `text-[11px] font-semibold uppercase tracking-wider`（必填带红 `*`），
 * 控件区 `div.relative`（`extra` 走 `flex min-h-9 w-full items-center`），说明 `font-mono text-[10px] leading-relaxed`，
 * 错误 `font-mono text-[10px] uppercase tracking-tight text-destructive`。
 */
function FormField({
  label,
  required,
  className,
  description,
  error,
  extra,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  className?: string;
  description?: React.ReactNode;
  error?: string;
  /** 原件 TYt 的 `extra`：自定义控件区（会包一层 `flex min-h-9 w-full items-center`） */
  extra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      <div className="relative">
        {extra ? <div className="flex min-h-9 w-full items-center">{extra}</div> : children}
      </div>
      {description ? <p className="font-mono text-[10px] leading-relaxed">{description}</p> : null}
      {error ? <p className="font-mono text-[10px] uppercase tracking-tight text-destructive">{error}</p> : null}
    </div>
  );
}

interface GenerateForm {
  email_prefix: string;
  email_suffix: string;
  password: string;
  expired_at: number | null;
  plan_id: number | null;
  generate_count: string;
  download_csv: boolean;
}

const emptyGenerateForm: GenerateForm = {
  email_prefix: "",
  email_suffix: "",
  password: "",
  expired_at: null,
  plan_id: null,
  generate_count: "",
  download_csv: false,
};

/** 原件 u8t：创建用户（支持批量生成并导出 CSV） */
function GenerateUsersDialog({ refetch, plans }: { refetch: () => void; plans: PlanOption[] }) {
  const { t } = useTranslation(["user", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<GenerateForm>(emptyGenerateForm);

  /* 原件 c8t：email_suffix 必填；未填 generate_count 时 email_prefix 必填 */
  const submit = async () => {
    const generateCount = form.generate_count ? Number(form.generate_count) : null;
    if (!form.email_suffix.trim()) {
      setError("String must contain at least 1 character(s)");
      return;
    }
    if (generateCount === null && !form.email_prefix.trim()) {
      setError("Email prefix is required when generate_count is null");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const body = {
        email_prefix: form.email_prefix,
        email_suffix: form.email_suffix,
        password: form.password,
        expired_at: form.expired_at,
        plan_id: form.plan_id,
        generate_count: generateCount,
        download_csv: form.download_csv,
      };
      if (form.download_csv) {
        const blob = await generateUsersCsv(body);
        triggerBlobDownload(blob, `users_${Date.now()}.csv`);
      } else {
        const response = await generateUsers(body);
        if (!response.data) return;
      }
      toast.success(t("generate.form.success", { defaultValue: "生成成功" }));
      setForm(emptyGenerateForm);
      setOpen(false);
      refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) {
          setError("");
          setForm(emptyGenerateForm);
        }
      }}
      trigger={
        <Button size="sm" variant="outline" className="gap-0 space-x-2">
          <Plus className="h-4 w-4" />
          <div>{t("generate.button", { defaultValue: "创建用户" })}</div>
        </Button>
      }
      title={t("generate.title", { defaultValue: "创建用户" })}
        onCancel={() => setOpen(false)}
        onSubmit={() => {
          void submit();
        }}
        isSubmitting={busy}
        submitLabel="确认"
        cancelLabel="取消"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
        <FormField
          label={t("generate.form.email", { defaultValue: "邮箱" })}
          required
          error={error || undefined}
          extra={
          <div className="flex w-full items-center gap-0">
            {!form.generate_count && (
              <input
                className="h-9 flex-[5] rounded-l-md border border-input bg-background px-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={t("generate.form.email_prefix", { defaultValue: "帐号(批量生成请留空)" })}
                value={form.email_prefix}
                onChange={(e) => setForm({ ...form, email_prefix: e.target.value })}
              />
            )}
            <div
              className={cn(
                "flex h-9 items-center border-y border-input bg-muted/30 px-3 font-mono text-xs text-muted-foreground",
                form.generate_count ? "rounded-l-md border-l" : "border-l-0",
              )}
            >
              @
            </div>
            <input
              className="h-9 flex-[4] rounded-r-md border border-l-0 border-input bg-background px-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={t("generate.form.email_domain", { defaultValue: "域" })}
              value={form.email_suffix}
              onChange={(e) => setForm({ ...form, email_suffix: e.target.value })}
            />
          </div>
          }
        />
        <FormField label={t("generate.form.password", { defaultValue: "密码" })}>
          <Input
            className="h-9 font-mono text-xs transition-all focus-visible:ring-1"
            placeholder={t("generate.form.password_placeholder", { defaultValue: "留空则密码与邮件相同" })}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={t("generate.form.expire_time", { defaultValue: "到期时间" })}
            extra={
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-full px-3 text-left font-mono text-xs font-normal",
                    !form.expired_at && "text-muted-foreground",
                  )}
                >
                  {form.expired_at ? (
                    formatDateTime(form.expired_at)
                  ) : (
                    <span>
                      {t("generate.form.expire_time_placeholder", {
                        defaultValue: "请选择用户到期日期，留空为长期有效",
                      })}
                    </span>
                  )}
                  <CalendarIcon className="ml-auto opacity-50" style={{ width: 14, height: 14 }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
                <Button
                  variant="outline"
                  className="h-8 w-full font-mono text-xs"
                  onClick={() => {
                    setForm({ ...form, expired_at: null });
                    setCalendarOpen(false);
                  }}
                >
                  {t("generate.form.permanent", { defaultValue: "长期有效" })}
                </Button>
                <div className="rounded-md border">
                  <Calendar
                    mode="single"
                    selected={form.expired_at ? new Date(form.expired_at * 1000) : undefined}
                    onSelect={(date?: Date) => {
                      if (!date) return;
                      setForm({ ...form, expired_at: Math.floor(date.getTime() / 1000) });
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
            }
          />
          <FormField
            label={t("generate.form.subscription", { defaultValue: "订阅计划" })}
            extra={
            <Select
              value={form.plan_id !== null ? String(form.plan_id) : "null"}
              onValueChange={(value) =>
                setForm({ ...form, plan_id: value === "null" ? null : parseInt(value, 10) })
              }
            >
              <SelectTrigger className="h-9 font-mono text-xs">
                <SelectValue placeholder={t("generate.form.subscription_none", { defaultValue: "无" })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null" className="font-mono text-xs">
                  {t("generate.form.subscription_none", { defaultValue: "无" })}
                </SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()} className="font-mono text-xs">
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            }
          />
        </div>
        {!form.email_prefix && (
          <FormField label={t("generate.form.generate_count", { defaultValue: "生成数量" })}>
            <Input
              type="number"
              className="h-9 font-mono text-xs transition-all focus-visible:ring-1"
              placeholder={t("generate.form.generate_count_placeholder", {
                defaultValue: "如果为批量生产请输入生成数量",
              })}
              value={form.generate_count}
              onChange={(e) => setForm({ ...form, generate_count: e.target.value })}
            />
          </FormField>
        )}
        {form.generate_count && (
          <FormField
            label={t("generate.form.download_csv", { defaultValue: "导出为 CSV 文件" })}
            className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4"
            extra={
              <Switch
                checked={form.download_csv}
                onCheckedChange={(checked: boolean) => setForm({ ...form, download_csv: checked })}
              />
            }
          />
        )}
        </form>
    </FormDialog>
  );
}

/** 原件 l8t：按范围群发邮件（XXt 外壳 + 占位符说明 + 系统通知模板 + 可用变量清单） */
function SendMailDialog({
  open,
  onOpenChange,
  table,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<UserRow>;
}) {
  const { t } = useTranslation(["user", "common"]);
  const [busy, setBusy] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [content, setContent] = React.useState("");
  const [scope, setScope] = React.useState<"selected" | "filtered" | "all">("all");

  const selectedCount = table.getSelectedRowModel().rows.length;
  const filtersActive = table.getState().columnFilters.length > 0;
  const defaultScope = selectedCount > 0 ? "selected" : filtersActive ? "filtered" : "all";

  React.useEffect(() => {
    if (open) setScope(defaultScope);
  }, [open, defaultScope]);

  const submit = async () => {
    if (!subject || !content) {
      toast.error(t("messages.send_mail.required_fields", { defaultValue: "请填写所有必填字段" }));
      return;
    }
    setBusy(true);
    try {
      const sort = table.getState().sorting[0];
      const sortType = sort?.desc ? "DESC" : "ASC";
      if (scope === "selected") {
        const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
        if (ids.length === 0) {
          toast.error(t("messages.send_mail.required_selected", { defaultValue: "请先选择用户" }));
          return;
        }
        for (const id of ids) {
          await sendMailToUsers({ subject, content, filter: [{ id: "id", value: `eq:${id}` }] });
        }
      } else if (scope === "filtered") {
        await sendMailToUsers({
          subject,
          content,
          filter: table.getState().columnFilters,
          sort: sort?.id,
          sort_type: sortType,
        });
      } else {
        await sendMailToUsers({ subject, content });
      }
      toast.success(t("messages.send_mail.success", { defaultValue: "邮件发送成功" }));
      onOpenChange(false);
      setSubject("");
      setContent("");
    } catch {
      toast.error(t("messages.send_mail.failed", { defaultValue: "邮件发送失败" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("send_mail.title", { defaultValue: "发送邮件" })}
      description={t("send_mail.description", { defaultValue: "向所选或已筛选的用户发送邮件" })}
      onCancel={() => onOpenChange(false)}
      onSubmit={() => {
        void submit();
      }}
      isSubmitting={busy}
      submitLabel={
        busy ? t("send_mail.sending", { defaultValue: "发送中..." }) : t("send_mail.send", { defaultValue: "发送" })
      }
      submitIcon={<Send className="h-4 w-4" />}
      className="max-w-2xl"
      contentClassName="bg-background"
    >
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("send_mail.scope", { defaultValue: "发送范围" })}
        </label>
        <Select value={scope} onValueChange={(value) => setScope(value as "selected" | "filtered" | "all")}>
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selected" disabled={selectedCount === 0}>
              {`仅选中（${selectedCount}）`}
            </SelectItem>
            <SelectItem value="filtered" disabled={!filtersActive}>
              筛选后的用户
            </SelectItem>
            <SelectItem value="all">全部用户</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("send_mail.subject", { defaultValue: "主题" })}
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("send_mail.subject_placeholder", { defaultValue: "例如：系统通知（支持占位符）" })}
          className="h-9 font-mono text-xs"
        />
        <p className="font-mono text-[10px] leading-relaxed opacity-70">
          支持占位符：{"{{key}}"} 或 {"{{key|默认值}}"}（未知变量会原样保留）
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="content" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("send_mail.content", { defaultValue: "内容" })}
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 font-mono text-[10px]"
            disabled={busy}
            onClick={() => {
              setSubject(SYSTEM_NOTICE_SUBJECT);
              setContent(SYSTEM_NOTICE_CONTENT);
            }}
          >
            填入系统通知模板
          </Button>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[220px] font-mono text-xs"
          placeholder={t("send_mail.content_placeholder", { defaultValue: "请输入邮件正文（可使用占位符）" })}
        />
        <p className="font-mono text-[10px] leading-relaxed opacity-70">
          content 默认按纯文本处理（会转义），不支持 HTML 富文本。
        </p>
      </div>
      <div className="rounded-md border bg-muted/10 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("send_mail.available_vars", { defaultValue: "可用变量" })}
        </div>
        <div className="mt-2 font-mono text-[10px] leading-relaxed opacity-80">
          {"{{app.name}}"} {"{{app.url}}"} {"{{now}}"} {"{{user.id}}"} {"{{user.email}}"} {"{{user.uuid}}"}{" "}
          {"{{user.plan_name}}"} {"{{user.expired_at}}"} {"{{user.transfer_enable}}"} {"{{user.transfer_used}}"}{" "}
          {"{{user.transfer_left}}"}
        </div>
      </div>
    </FormDialog>
  );
}

export default function UserManage() {
  const { t } = useTranslation(["user", "common"]);
  const [searchParams] = useSearchParams();

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  /* 原件 H8t 页面（offset 6476010 附近）：columnVisibility 初值只有 {is_admin:!1,is_staff:!1}，
     订阅/佣金/注册时间三列默认可见（我们原来多隐藏了，导致少 3 列、表格窄 400+px）。 */
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    is_admin: false,
    is_staff: false,
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [rules, setRules] = React.useState<FilterRule[]>([]);
  const [mailOpen, setMailOpen] = React.useState(false);

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["userList", pagination, columnFilters, sorting],
    queryFn: () =>
      fetchUsers({
        pageSize: pagination.pageSize,
        current: pagination.pageIndex + 1,
        filter: columnFilters,
        sort: sorting,
      }),
  });

  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: async () => (await fetchGroups()).data });
  const { data: plans } = useQuery({ queryKey: ["planList"], queryFn: async () => (await fetchPlans()).data });

  /* 原件：?email= 直接作为 email 列筛选 */
  const emailParam = searchParams.get("email");
  React.useEffect(() => {
    if (!emailParam) return;
    setColumnFilters((prev) => (prev.some((f) => f.id === "email") ? prev : [...prev, { id: "email", value: emailParam }]));
  }, [emailParam]);

  const columns = React.useMemo<ColumnDef<UserRow>[]>(
    () => [
      makeSelectColumn<UserRow>(),
      {
        accessorKey: "is_admin",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.is_admin", { defaultValue: "管理员" })} />
        ),
        cell: ({ row }) => (row.original.is_admin ? <Badge variant="default">admin</Badge> : null),
        enableSorting: false,
        size: 0,
        meta: { label: t("columns.is_admin", { defaultValue: "管理员" }) },
      },
      {
        accessorKey: "is_staff",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.is_staff", { defaultValue: "员工" })} />
        ),
        cell: ({ row }) => (row.original.is_staff ? <Badge variant="secondary">staff</Badge> : null),
        enableSorting: false,
        size: 0,
        meta: { label: t("columns.is_staff", { defaultValue: "员工" }) },
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.id", { defaultValue: "用户ID" })} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.original.id}
          </Badge>
        ),
        enableSorting: true,
        meta: { label: t("columns.id", { defaultValue: "用户ID" }) },
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.email", { defaultValue: "邮箱" })} />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-[200px] items-center gap-2">
            <span className="truncate font-medium">{row.original.email}</span>
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.email", { defaultValue: "邮箱" }) },
      },
      {
        accessorKey: "online_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.online_count", { defaultValue: "在线设备" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.online_count ?? 0}</span>
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.online_count", { defaultValue: "在线设备" }) },
      },
      {
        accessorKey: "banned",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.status", { defaultValue: "状态" })} />
        ),
        /* 原件 H8t：`div.flex.justify-center` + Badge `min-w-20 justify-center`，
           徽标最小宽度把它撑到 ~104px（否则 60px 内「正常」会折成两行）。 */
        cell: ({ row }) => {
          const banned = Boolean(row.original.banned);
          return (
            <div className="flex justify-center">
              <Badge
                className={cn(
                  "min-w-20 justify-center transition-colors",
                  banned
                    ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                    : "bg-success/15 text-success hover:bg-success/25",
                )}
              >
                {banned
                  ? t("columns.status_text.banned", { defaultValue: "禁用" })
                  : t("columns.status_text.normal", { defaultValue: "正常" })}
              </Badge>
            </div>
          );
        },
        enableSorting: false,
        meta: { label: t("columns.status", { defaultValue: "状态" }) },
      },
      {
        accessorKey: "plan_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.subscription", { defaultValue: "订阅" })} />
        ),
        /* 原件 H8t：`div.min-w-[10em] break-all`（列宽 156px 即由此而来）；
           原件读 `original.plan.name`，我们的 UserRow 无该关联字段，用 plans 列表按 plan_id 查。 */
        cell: ({ row }) => {
          const plan = (plans ?? []).find((p) => p.id === row.original.plan_id);
          return <div className="min-w-[10em] break-all">{plan?.name || "-"}</div>;
        },
        enableSorting: false,
        meta: { label: t("columns.subscription", { defaultValue: "订阅" }) },
      },
      {
        accessorKey: "group_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.group", { defaultValue: "权限组" })} />
        ),
        /* 原件 H8t：`div.flex.flex-wrap.gap-1` + outline 徽标（whitespace-nowrap） */
        cell: ({ row }) => {
          const group = (groups ?? []).find((g) => g.id === row.original.group_id);
          return (
            <div className="flex flex-wrap gap-1">
              {group ? (
                <Badge
                  variant="outline"
                  className="flex cursor-default select-none items-center gap-1.5 whitespace-nowrap border border-border/50 bg-secondary/50 px-2 py-0.5 font-medium transition-all duration-200 hover:bg-secondary/70"
                >
                  {group.name}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          );
        },
        enableSorting: false,
        meta: { label: t("columns.group", { defaultValue: "权限组" }) },
      },
      {
        accessorKey: "total_used",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.used_traffic", { defaultValue: "已用流量" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center font-mono text-sm">
            {formatBytes((row.original.u ?? 0) + (row.original.d ?? 0))}
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.used_traffic", { defaultValue: "已用流量" }) },
      },
      {
        accessorKey: "transfer_enable",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.total_traffic", { defaultValue: "总流量" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center font-mono text-sm">{formatBytes(row.original.transfer_enable)}</div>
        ),
        enableSorting: true,
        meta: { label: t("columns.total_traffic", { defaultValue: "总流量" }) },
      },
      {
        accessorKey: "expired_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.expire_time", { defaultValue: "到期时间" })} />
        ),
        cell: ({ row }) => (
          <div className="text-nowrap text-sm">
            {row.original.expired_at
              ? formatDateTime(row.original.expired_at, "yyyy-MM-dd HH:mm")
              : t("columns.expire_status.permanent", { defaultValue: "长期有效" })}
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.expire_time", { defaultValue: "到期时间" }) },
      },
      {
        accessorKey: "balance",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.balance", { defaultValue: "余额" })} />
        ),
        cell: ({ row }) => <div className="font-mono text-sm">¥{formatAmount(row.original.balance)}</div>,
        enableSorting: true,
        meta: { label: t("columns.balance", { defaultValue: "余额" }) },
      },
      {
        accessorKey: "commission_balance",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.commission", { defaultValue: "佣金" })} />
        ),
        cell: ({ row }) => <div className="font-mono text-sm">¥{formatAmount(row.original.commission_balance)}</div>,
        enableSorting: true,
        meta: { label: t("columns.commission", { defaultValue: "佣金" }) },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.register_time", { defaultValue: "注册时间" })} />
        ),
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {formatDateTime(row.original.created_at, "yyyy-MM-dd HH:mm")}
          </div>
        ),
        enableSorting: true,
        size: 1000,
        meta: { label: t("columns.register_time", { defaultValue: "注册时间" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title={t("columns.actions", { defaultValue: "操作" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UserDialog
                    refetch={refetch}
                    defaultValues={row.original}
                    trigger={
                      <div className="flex w-full items-center">
                        <Pencil className="mr-2 size-4" />
                        {t("columns.actions_menu.edit", { defaultValue: "编辑" })}
                      </div>
                    }
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(row.original.uuid ?? "");
                      toast.success(t("columns.actions_menu.copy_url", { defaultValue: "复制订阅链接" }));
                    } catch {
                      /* 剪贴板不可用，与原件 IS() 失败分支一致 */
                    }
                  }}
                >
                  <Copy className="mr-2 size-4" />
                  {t("columns.actions_menu.copy_url", { defaultValue: "复制订阅链接" })}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await resetUserSecret(row.original.id);
                    toast.success(t("messages.success", { defaultValue: "操作成功" }));
                    refetch();
                  }}
                >
                  <KeyRound className="mr-2 size-4" />
                  {t("columns.actions_menu.reset_secret", { defaultValue: "重置订阅信息" })}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <ConfirmDialog
                    title={t("columns.actions_menu.delete_confirm_title", { defaultValue: "确认删除" })}
                    description={t("columns.actions_menu.delete_confirm_description", {
                      defaultValue: "此操作将永久删除该用户，删除后无法恢复。",
                    })}
                    confirmText={t("columns.actions_menu.delete", { defaultValue: "删除" })}
                    onConfirm={async () => {
                      await destroyUser(row.original.id);
                      toast.success(t("messages.success", { defaultValue: "操作成功" }));
                      refetch();
                    }}
                  >
                    <div className="flex w-full items-center">
                      <Trash2 className="mr-2 size-4" />
                      {t("columns.actions_menu.delete", { defaultValue: "删除" })}
                    </div>
                  </ConfirmDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [groups, plans, refetch, t],
  );

  const table = useReactTable<UserRow>({
    data: data?.data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => String(row.id),
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

  /* 原件 x8t 的字段集合：email/id/plan_id/transfer_enable/total_used/online_count/expired_at/uuid/token/banned/remarks/invite_user.email/invite_user_id/is_admin/is_staff */
  const filterFields: FilterField[] = [
    {
      value: "email",
      label: t("filter.fields.email", { defaultValue: "邮箱" }),
      type: "text",
      operators: [
        { label: t("filter.operators.contains", { defaultValue: "包含" }), value: "contains" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "id",
      label: t("filter.fields.id", { defaultValue: "用户ID" }),
      type: "number",
      operators: [
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
        { label: t("filter.operators.gt", { defaultValue: "大于" }), value: "gt" },
        { label: t("filter.operators.lt", { defaultValue: "小于" }), value: "lt" },
      ],
    },
    {
      value: "plan_id",
      label: t("filter.fields.plan_id", { defaultValue: "订阅" }),
      type: "select",
      options: (plans ?? []).map((plan) => ({ label: plan.name, value: String(plan.id) })),
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "transfer_enable",
      label: t("filter.fields.transfer_enable", { defaultValue: "流量" }),
      type: "number",
      unit: "GB",
      operators: [
        { label: t("filter.operators.gt", { defaultValue: "大于" }), value: "gt" },
        { label: t("filter.operators.lt", { defaultValue: "小于" }), value: "lt" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "total_used",
      label: t("filter.fields.total_used", { defaultValue: "已用流量" }),
      type: "number",
      unit: "GB",
      operators: [
        { label: t("filter.operators.gt", { defaultValue: "大于" }), value: "gt" },
        { label: t("filter.operators.lt", { defaultValue: "小于" }), value: "lt" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "online_count",
      label: t("filter.fields.online_count", { defaultValue: "在线设备" }),
      type: "number",
      operators: [
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
        { label: t("filter.operators.gt", { defaultValue: "大于" }), value: "gt" },
        { label: t("filter.operators.lt", { defaultValue: "小于" }), value: "lt" },
      ],
    },
    {
      value: "expired_at",
      label: t("filter.fields.expired_at", { defaultValue: "到期时间" }),
      type: "date",
      operators: [
        { label: t("filter.operators.lt", { defaultValue: "小于" }), value: "lt" },
        { label: t("filter.operators.gt", { defaultValue: "大于" }), value: "gt" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "uuid",
      label: t("filter.fields.uuid", { defaultValue: "UUID" }),
      type: "text",
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "token",
      label: t("filter.fields.token", { defaultValue: "Token" }),
      type: "text",
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "banned",
      label: t("filter.fields.banned", { defaultValue: "账号状态" }),
      type: "select",
      options: [
        { label: t("filter.status.normal", { defaultValue: "正常" }), value: "0" },
        { label: t("filter.status.banned", { defaultValue: "禁用" }), value: "1" },
      ],
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "remarks",
      label: t("filter.fields.remark", { defaultValue: "备注" }),
      type: "text",
      operators: [
        { label: t("filter.operators.contains", { defaultValue: "包含" }), value: "contains" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "invite_user.email",
      label: t("filter.fields.inviter_email", { defaultValue: "邀请人邮箱" }),
      type: "text",
      operators: [
        { label: t("filter.operators.contains", { defaultValue: "包含" }), value: "contains" },
        { label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" },
      ],
    },
    {
      value: "invite_user_id",
      label: t("filter.fields.invite_user_id", { defaultValue: "邀请人ID" }),
      type: "number",
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "is_admin",
      label: t("filter.fields.is_admin", { defaultValue: "管理员" }),
      type: "boolean",
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
    {
      value: "is_staff",
      label: t("filter.fields.is_staff", { defaultValue: "员工" }),
      type: "boolean",
      operators: [{ label: t("filter.operators.eq", { defaultValue: "等于" }), value: "eq" }],
    },
  ];

  /** 原件：contains 直接取值，其余 "op:value"；GB 字段换算字节，date 换算 Unix 秒，boolean → 1/0 */
  const applyUserRules = (next: FilterRule[]) => {
    setRules(next);
    const filters: ColumnFiltersState = [];
    for (const rule of next) {
      if (!rule.field || rule.value === "") continue;
      if (rule.operator === "contains") {
        filters.push({ id: rule.field, value: rule.value });
        continue;
      }
      let value: string | number = rule.value;
      if (rule.field === "transfer_enable" || rule.field === "total_used") {
        value = Math.round(Number(rule.value) * GB);
      } else if (rule.field === "expired_at") {
        const date = new Date(rule.value);
        value = Number.isNaN(date.getTime()) ? rule.value : Math.floor(date.getTime() / 1000);
      } else if (rule.field === "is_admin" || rule.field === "is_staff") {
        value = rule.value === "true" || rule.value === "1" ? 1 : 0;
      }
      filters.push({ id: rule.field, value: `${rule.operator}:${value}` });
    }
    table.setColumnFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    const ids = tbl.getSelectedRowModel().rows.map((r) => r.original.id);
    const selectedCount = ids.length;
    /* 原件 x8t 的作用域：有选中 → selected，有筛选 → filtered，否则 all */
    const scope: "selected" | "filtered" | "all" = selectedCount > 0 ? "selected" : filtersActive ? "filtered" : "all";
    const scopeSuffix =
      scope === "selected"
        ? `(${selectedCount})`
        : scope === "filtered"
          ? `(${t("actions.scope.filtered_suffix", { defaultValue: "筛选" })})`
          : `(${t("actions.scope.all_suffix", { defaultValue: "全部" })})`;

    const ban = async (target: "selected" | "filtered" | "all") => {
      const body: Record<string, unknown> =
        target === "selected"
          ? { scope: target, user_ids: ids }
          : target === "filtered"
            ? {
                scope: target,
                filter: tbl.getState().columnFilters,
                sort: tbl.getState().sorting[0]?.id,
                sort_type: tbl.getState().sorting[0]?.desc ? "DESC" : "ASC",
              }
            : { scope: target };
      try {
        await banUser(body);
        toast.success(t("messages.batch_ban.success", { defaultValue: "封禁成功" }));
        tbl.resetRowSelection();
        refetch();
      } catch {
        toast.error(t("messages.batch_ban.failed", { defaultValue: "封禁失败" }));
      }
    };

    const exportCsv = async () => {
      try {
        const body: Record<string, unknown> =
          scope === "selected"
            ? { scope, user_ids: ids }
            : scope === "filtered"
              ? {
                  scope,
                  filter: tbl.getState().columnFilters,
                  sort: tbl.getState().sorting[0]?.id,
                  sort_type: tbl.getState().sorting[0]?.desc ? "DESC" : "ASC",
                }
              : { scope };
        const blob = await dumpUsersCsv(body);
        triggerBlobDownload(blob, `users_${new Date().toISOString()}.csv`);
        toast.success(t("messages.success", { defaultValue: "成功" }), {
          description: t("messages.export.success", { defaultValue: "导出成功" }),
        });
      } catch {
        toast.error(t("messages.error", { defaultValue: "错误" }), {
          description: t("messages.export.failed", { defaultValue: "导出失败" }),
        });
      }
    };

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <GenerateUsersDialog refetch={refetch} plans={plans ?? []} />
          <Input
            placeholder={t("filter.email_search", { defaultValue: "搜索用户邮箱..." })}
            value={(tbl.getColumn("email")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => {
              tbl.getColumn("email")?.setFilterValue(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-8 min-w-[150px] flex-1 sm:w-[150px] lg:w-[250px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterBuilder fields={filterFields} rules={rules} onRulesChange={applyUserRules} onApply={() => applyUserRules(rules)} />
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                tbl.resetColumnFilters();
                setRules([]);
              }}
              className="h-8 px-2 lg:px-3"
            >
              {t("filter.sheet.reset", { defaultValue: "重置" })}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                {t("actions.title", { defaultValue: "操作" })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setMailOpen(true)}>
                {t("actions.send_email", { defaultValue: "发送邮件" })}
                <span className="ml-2 font-mono text-[10px] opacity-80">{scopeSuffix}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void exportCsv()}>
                {t("actions.export_csv", { defaultValue: "导出 CSV" })}
                <span className="ml-2 font-mono text-[10px] opacity-80">{scopeSuffix}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                <ConfirmDialog
                  title={t("actions.confirm_ban.title", { defaultValue: "确认批量封禁" })}
                  description={
                    scope === "selected"
                      ? t("actions.confirm_ban.selected_description", {
                          defaultValue: "将对选中的 {{count}} 个用户执行封禁",
                          count: selectedCount,
                        })
                      : scope === "filtered"
                        ? t("actions.confirm_ban.filtered_description", {
                            defaultValue: "此操作将封禁所有符合当前筛选条件的用户。此操作无法撤销。",
                          })
                        : t("actions.confirm_ban.all_description", {
                            defaultValue: "此操作将封禁系统中的所有用户。此操作无法撤销。",
                          })
                  }
                  confirmText={t("actions.confirm_ban.confirm", { defaultValue: "确认封禁" })}
                  onConfirm={() => ban(scope)}
                >
                  <div className="flex w-full items-center">
                    <Ban className="mr-2 size-4" />
                    {t("actions.batch_ban", { defaultValue: "批量封禁" })}
                    <span className="ml-2 font-mono text-[10px] opacity-80">{scopeSuffix}</span>
                  </div>
                </ConfirmDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("manage.title", { defaultValue: "用户管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("manage.description", { defaultValue: "在这里可以管理用户，包括增加、删除、编辑、查询等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <DataTable table={table} toolbar={toolbar} isLoading={isFetching} mobilePrimaryField="email" />
        <SendMailDialog open={mailOpen} onOpenChange={setMailOpen} table={table} />
      </LayoutBody>
    </Layout>
  );
}
