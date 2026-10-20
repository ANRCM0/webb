import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  Check,
  CircleCheckBig,
  CircleOff,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  HardDrive,
  Layers3,
  Link2,
  Loader2,
  MemoryStick,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  Terminal,
  Trash2,
  TriangleAlert,
  Unlink,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  formatBytes,
  formatDateTime,
} from "@/pages/_b/shared";

/**
 * 原件 `/server/machine`：页面组件 B3t（offset 6286633）→ 专属组件 F3t（1477B）
 * 列工厂 h3t、工具栏 r3t、概览卡片 j3t（bundle 6185317 / 6245222 附近）。
 * 轮询：queryKey ["machineList"]，staleTime 3e4，refetchInterval 6e4，
 *       refetchOnMount/refetchOnWindowFocus 均为 "always"。
 */

interface LoadUsage {
  used?: number;
  total?: number;
}

export interface MachineLoadStatus {
  cpu?: number;
  mem?: LoadUsage;
  disk?: LoadUsage;
  /** 原件 L3t 读 load_status.net.in_speed / out_speed（fixture 目前未提供，缺失时整行隐藏） */
  net?: { in_speed?: number | null; out_speed?: number | null };
  updated_at?: number | null;
}

export interface MachineRow {
  id: number;
  name: string;
  notes?: string | null;
  is_active?: boolean | number;
  last_seen_at?: number | null;
  servers_count?: number;
  load_status?: MachineLoadStatus | null;
}

interface MachineForm {
  id: number | null;
  name: string;
  notes: string;
  is_active: boolean;
}

const emptyForm: MachineForm = { id: null, name: "", notes: "", is_active: true };

/* 端点（bundle 544247）：DT/TT/OT/MT/IT/RT/AT */
const fetchMachines = () => apiGet<{ data?: MachineRow[] }>(`${SECURE}/server/machine/fetch`);
const saveMachine = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/machine/save`, body);
const dropMachine = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/machine/drop`, body);

/** 原件 g5t：online / offline / inactive / never */
function machineStatus(machine: MachineRow): "online" | "offline" | "inactive" | "never" {
  if (!machine.is_active) return "inactive";
  if (!machine.last_seen_at) return "never";
  return Date.now() / 1000 - machine.last_seen_at < 300 ? "online" : "offline";
}

/** 原件 d5t 阈值 */
const THRESHOLDS = {
  cpu: { warn: 70, danger: 85 },
  mem: { warn: 75, danger: 90 },
  disk: { warn: 80, danger: 90 },
};

/** 原件 u5t：状态点 / 徽标 / 卡片三套配色 */
const MACHINE_TONE = {
  online: {
    dot: "bg-emerald-500",
    badge: "border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    card: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  offline: { dot: "bg-red-500", card: "bg-red-500/10 text-red-600 dark:text-red-400" },
  inactive: { dot: "bg-slate-400", card: "bg-muted text-muted-foreground" },
  never: { dot: "bg-slate-400", card: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
} as const;

/** 原件 p5t：负载百分比（cpu 直接用，mem/disk 按 used/total） */
function loadMetrics(machine: MachineRow): { cpu: number; mem: number; disk: number } {
  const load = machine.load_status;
  if (!load) return { cpu: 0, mem: 0, disk: 0 };
  return {
    cpu: load.cpu ?? 0,
    mem: (load.mem?.total ?? 0) > 0 ? ((load.mem?.used ?? 0) / (load.mem?.total ?? 1)) * 100 : 0,
    disk: (load.disk?.total ?? 0) > 0 ? ((load.disk?.used ?? 0) / (load.disk?.total ?? 1)) * 100 : 0,
  };
}

/** 原件 f5t：阈值分档 */
function loadTone(percent: number, threshold: { warn: number; danger: number }): "default" | "warn" | "danger" {
  if (percent >= threshold.danger) return "danger";
  if (percent >= threshold.warn) return "warn";
  return "default";
}

/** 原件 l3t：一行负载（标签 + 图标 + 百分比 + 进度条） */
function LoadRow({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "warn" | "danger";
}) {
  const bar = tone === "danger" ? "bg-red-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";
  const width = Math.min(Math.max(value, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <Icon className="size-3" />
          {label}
        </span>
        <span className="font-mono text-[10px] font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

/** 原件 a3t / o3t：状态点与状态徽标 */
function MachineStatusDot({ status }: { status: "online" | "offline" | "inactive" | "never" }) {
  return <span className={cn("size-2 shrink-0 rounded-full", MACHINE_TONE[status].dot)} />;
}

function MachineStatusBadge({ status, label }: { status: "online" | "offline" | "inactive" | "never"; label: string }) {
  switch (status) {
    case "inactive":
      return <Badge variant="secondary">{label}</Badge>;
    case "never":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {label}
        </Badge>
      );
    case "online":
      return <Badge className={MACHINE_TONE.online.badge}>{label}</Badge>;
    default:
      return <Badge variant="destructive">{label}</Badge>;
  }
}

function usagePercent(usage?: LoadUsage): number {
  if (!usage || !usage.total) return 0;
  return ((usage.used ?? 0) / usage.total) * 100;
}

function isHighLoad(machine: MachineRow): boolean {
  const load = machine.load_status;
  if (!load) return false;
  return (
    (load.cpu ?? 0) >= THRESHOLDS.cpu.danger ||
    usagePercent(load.mem) >= THRESHOLDS.mem.danger ||
    usagePercent(load.disk) >= THRESHOLDS.disk.danger
  );
}

/** 原件 h5t：相对时间 */
function relativeTime(ts?: number | null): string {
  if (!ts) return "-";
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function toneClass(percent: number, threshold: { warn: number; danger: number }): string {
  if (percent >= threshold.danger) return "bg-destructive/10 text-destructive";
  if (percent >= threshold.warn) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

function MachineDialog({
  refetch,
  defaultValues,
  trigger,
}: {
  refetch: () => void;
  defaultValues?: MachineRow;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["machine", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<MachineForm>(emptyForm);

  React.useEffect(() => {
    if (!open) return;
    setForm(
      defaultValues
        ? {
            id: defaultValues.id,
            name: defaultValues.name ?? "",
            notes: defaultValues.notes ?? "",
            is_active: Boolean(defaultValues.is_active),
          }
        : emptyForm,
    );
  }, [open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? t("form.edit", { defaultValue: "编辑服务器" }) : t("form.create", { defaultValue: "新建服务器" })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.name", { defaultValue: "服务器名称" })}
            </label>
            <Input
              value={form.name}
              placeholder={t("form.namePlaceholder", { defaultValue: "例如 HK-01" })}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("form.notes", { defaultValue: "备注" })}
            </label>
            <Textarea
              rows={3}
              value={form.notes}
              placeholder={t("form.notesPlaceholder", { defaultValue: "关于此服务器的可选备注" })}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v: boolean) => setForm({ ...form, is_active: v })} />
            <span className="text-sm">{t("form.isActive", { defaultValue: "启用服务器" })}</span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {t("form.cancel", { defaultValue: "取消" })}
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await saveMachine({ id: form.id, name: form.name, notes: form.notes, is_active: form.is_active ? 1 : 0 });
                toast.success(
                  defaultValues
                    ? t("messages.updateSuccess", { defaultValue: "服务器更新成功" })
                    : t("messages.createSuccess", { defaultValue: "服务器创建成功" }),
                );
                setOpen(false);
                refetch();
              } catch {
                toast.error(t("messages.saveFailed", { defaultValue: "保存服务器失败" }));
              } finally {
                setBusy(false);
              }
            }}
          >
            {defaultValues ? t("form.update", { defaultValue: "更新" }) : t("form.submit", { defaultValue: "提交" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ==================================================================== *
 * 二级功能（原件 A3t 详情弹窗，bundle char 6,281,124 → 6,283,706）
 *
 * 卡片顺序与原件一致：信息卡 → 负载趋势(E3t) + 负载卡(L3t) → Token 卡(I3t)
 *                     → 安装命令卡(R3t) → 承载节点卡(M3t，含 O3t 关联弹窗)
 * 入口：relation 列「服务器详情」按钮(u3t)、actions 列首个图标按钮(Bat=ExternalLink)
 *       以及 URL `?machine_id=<id>` 自动打开（原件 F3t 的 useEffect）。
 * 轮询：history 按所选区间 1h/6h/12h/24h → 12h 及以上 120s，否则 30s（原件 A3t）。
 * ==================================================================== */

/** 原件 c5t：负载趋势时间范围（label / hours→range_hours / limit） */
const HISTORY_RANGES = [
  { label: "1h", hours: 1, limit: 60 },
  { label: "6h", hours: 6, limit: 360 },
  { label: "12h", hours: 12, limit: 720 },
  { label: "24h", hours: 24, limit: 1440 },
] as const;

type HistoryRange = (typeof HISTORY_RANGES)[number];

/** 原件 S3t：曲线配色 / 渐变 */
const SERIES_META = {
  cpu: { label: "CPU", color: "hsl(var(--primary))", gradient: ["hsl(var(--primary))", 0.25] },
  mem: { label: "MEM", color: "#f59e0b", gradient: ["#f59e0b", 0.18] },
  disk: { label: "DISK", color: "#ef4444", gradient: ["#ef4444", 0.15] },
  netIn: { label: "↓ IN", color: "#10b981", gradient: ["#10b981", 0.2] },
  netOut: { label: "↑ OUT", color: "#3b82f6", gradient: ["#3b82f6", 0.15] },
} as const;

type SeriesKey = keyof typeof SERIES_META;

/** 原件 k3t / N3t */
const PERCENT_SERIES: SeriesKey[] = ["cpu", "mem", "disk"];
const NETWORK_SERIES: SeriesKey[] = ["netIn", "netOut"];

/** 原件 I3t：明文 Token 3 分钟后自动隐藏（180000ms） */
const TOKEN_AUTO_HIDE_SECONDS = 180;

/** 原件 `AT` / `$L` 返回的节点行；fixture 只给 `enable`，两者都接受（见报告） */
interface MachineNodeRow {
  id: number;
  name: string;
  type?: string | null;
  host?: string | null;
  port?: number | null;
  enabled?: boolean | number | null;
  enable?: boolean | number | null;
  machine_id?: number | null;
}

/** 原件 `PT` 返回的负载历史点（1000*recorded_at 为秒级时间戳） */
interface MachineHistoryRow {
  recorded_at?: number | null;
  cpu?: number | null;
  mem_used?: number | null;
  mem_total?: number | null;
  disk_used?: number | null;
  disk_total?: number | null;
  net_in_speed?: number | null;
  net_out_speed?: number | null;
}

interface HistoryPoint {
  time: string;
  cpu: number;
  mem: number;
  disk: number;
  netIn: number | null;
  netOut: number | null;
}

interface HistoryTooltipItem {
  dataKey?: string | number;
  value?: number | string | null;
}

interface HistoryTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<HistoryTooltipItem>;
  label?: string | number;
  hidden: ReadonlySet<SeriesKey>;
}

function nodeEnabled(node: MachineNodeRow): boolean {
  return Boolean(node.enabled ?? node.enable);
}

/** 原件复制交互：navigator.clipboard + 2s「已复制」态 */
function useCopyFeedback(): { copied: boolean; copy: (text: string) => Promise<boolean> } {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  return { copied, copy };
}

/** 原件内联倒计时 hook：active 时从 seconds 倒数到 0，归零回调 onExpire */
function useAutoHide(active: boolean, seconds: number, onExpire: () => void): number {
  const [remaining, setRemaining] = React.useState(0);
  const expireAt = React.useRef(0);
  React.useEffect(() => {
    if (!active) {
      setRemaining(0);
      return;
    }
    expireAt.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((expireAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) onExpire();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, seconds, onExpire]);
  return remaining;
}

/** 原件 T3t：秒 → m:ss */
function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * 原件趋势图的时间列：`_S(new Date(1000*recorded_at), pattern)`（date-fns format）。
 * 时间戳缺失/非法时 date-fns 抛 `RangeError: Invalid time value` —— 这里保持一致，
 * 便于复刻原件 error boundary 的表现（见报告「与原件差异」一节）。
 */
function formatHistoryTime(recordedAt: number | null | undefined, pattern: string): string {
  const date = new Date((recordedAt ?? Number.NaN) * 1000);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid time value");
  return formatDateTime(date.getTime() / 1000, pattern);
}

/** 原件 _5t：字节/秒 → 人类可读速率 */
function formatSpeed(value?: number | null): string {
  if (value == null || value < 0) return "-";
  if (value < 1024) return `${value.toFixed(0)} B/s`;
  if (value < 1048576) return `${(value / 1024).toFixed(1)} KB/s`;
  if (value < 1073741824) return `${(value / 1048576).toFixed(1)} MB/s`;
  return `${(value / 1073741824).toFixed(2)} GB/s`;
}

/** 原件 bKt（Progress）：值 → translateX 进度条，本工程未单独封装该组件 */
function UsageBar({
  value,
  indicatorClassName,
  className,
}: {
  value: number;
  indicatorClassName?: string;
  className?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}>
      <div
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  );
}

/** 原件 D3t：一条「图标 + 标签 + 数值 + 进度条」 */
function LoadMetric({
  icon: Icon,
  label,
  detail,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  value: number;
  tone: "default" | "warn" | "danger";
}) {
  const bar = tone === "danger" ? "bg-red-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-mono font-medium">{detail}</span>
      </div>
      <UsageBar value={value} className="h-2" indicatorClassName={bar} />
    </div>
  );
}

/** 原件 L3t：负载卡（CPU / 内存 / 磁盘 + 网络速率） */
function MachineLoadCard({ machine }: { machine: MachineRow }) {
  const { t } = useTranslation("machine");
  const load = machine.load_status;
  if (!load) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="size-4 text-muted-foreground" />
            {t("columns.load")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{t("columns.noData")}</p>
        </CardContent>
      </Card>
    );
  }
  const cpu = load.cpu ?? 0;
  const memUsed = load.mem?.used ?? 0;
  const memTotal = load.mem?.total ?? 0;
  const diskUsed = load.disk?.used ?? 0;
  const diskTotal = load.disk?.total ?? 0;
  const memPercent = memTotal > 0 ? (memUsed / memTotal) * 100 : 0;
  const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;
  const net = load.net;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="size-4 text-muted-foreground" />
          {t("columns.load")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <LoadMetric
            icon={Cpu}
            label={t("columns.cpu")}
            detail={`${cpu.toFixed(1)}%`}
            value={cpu}
            tone={loadTone(cpu, THRESHOLDS.cpu)}
          />
          <LoadMetric
            icon={MemoryStick}
            label={t("columns.memory")}
            detail={`${formatBytes(memUsed)} / ${formatBytes(memTotal)}`}
            value={memPercent}
            tone={loadTone(memPercent, THRESHOLDS.mem)}
          />
          <LoadMetric
            icon={HardDrive}
            label={t("columns.disk")}
            detail={`${formatBytes(diskUsed)} / ${formatBytes(diskTotal)}`}
            value={diskPercent}
            tone={loadTone(diskPercent, THRESHOLDS.disk)}
          />
          {net ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowDownUp className="h-3.5 w-3.5" /> {t("detail.networkTrend")}
                </span>
                <span className="font-mono font-medium">
                  ↓{formatSpeed(net.in_speed)} ↑{formatSpeed(net.out_speed)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** 原件 E3t 的 Tooltip 内容 */
function HistoryTooltip({ active, payload, label, hidden }: HistoryTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const visible = payload.filter((item) => !hidden.has(String(item.dataKey) as SeriesKey));
  if (visible.length === 0) return null;
  return (
    <div className="rounded-lg border bg-background p-2.5 text-xs shadow-sm">
      <div className="mb-1.5 font-medium">{label}</div>
      {visible.map((item) => {
        const key = String(item.dataKey) as SeriesKey;
        const isSpeed = NETWORK_SERIES.includes(key);
        return (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{SERIES_META[key].label}</span>
            <span className="font-mono">{isSpeed ? formatSpeed(Number(item.value ?? 0)) : `${item.value}%`}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 原件 E3t：负载趋势面积图（含图例开关与时间范围切换） */
function MachineHistoryChart({
  history,
  range,
  onRangeChange,
}: {
  history: MachineHistoryRow[];
  range: HistoryRange;
  onRangeChange: (range: HistoryRange) => void;
}) {
  const { t } = useTranslation("machine");
  const [hidden, setHidden] = React.useState<ReadonlySet<SeriesKey>>(() => new Set<SeriesKey>());

  const toggleSeries = (key: SeriesKey) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const points = React.useMemo<HistoryPoint[]>(() => {
    const pattern = range.hours <= 6 ? "HH:mm" : "MM/dd HH:mm";
    /* 原件 E3t：逐点映射，时间列走 date-fns format（非法时间戳会抛错） */
    return history.map((row) => {
      const memTotal = row.mem_total ?? 0;
      const diskTotal = row.disk_total ?? 0;
      return {
        time: formatHistoryTime(row.recorded_at, pattern),
        cpu: Number((row.cpu ?? 0).toFixed(1)),
        mem: memTotal > 0 ? Number((((row.mem_used ?? 0) / memTotal) * 100).toFixed(1)) : 0,
        disk: diskTotal > 0 ? Number((((row.disk_used ?? 0) / diskTotal) * 100).toFixed(1)) : 0,
        netIn: typeof row.net_in_speed === "number" ? row.net_in_speed : null,
        netOut: typeof row.net_out_speed === "number" ? row.net_out_speed : null,
      };
    });
  }, [history, range.hours]);

  const hasNetwork = points.some((point) => point.netIn != null);
  const showSpeedAxis = hasNetwork && NETWORK_SERIES.some((key) => !hidden.has(key));
  const legend: SeriesKey[] = hasNetwork ? [...PERCENT_SERIES, ...NETWORK_SERIES] : PERCENT_SERIES;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="size-4" />
            {t("detail.loadTrend")}
          </CardTitle>
          <div className="flex gap-1">
            {HISTORY_RANGES.map((item) => (
              <button
                key={item.label}
                onClick={() => onRangeChange(item)}
                className={
                  "rounded px-2 py-0.5 text-xs transition-colors " +
                  (range.label === item.label
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted")
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("detail.noHistory")}</p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {legend.map((key) => {
                const meta = SERIES_META[key];
                const off = hidden.has(key);
                const separator = hasNetwork && key === "netIn";
                return (
                  <span key={key} className="contents">
                    {separator ? <span className="text-border">|</span> : null}
                    <button
                      onClick={() => toggleSeries(key)}
                      className={
                        "inline-flex items-center gap-1 rounded px-1 py-0.5 transition-opacity hover:bg-muted " +
                        (off ? "opacity-30 line-through" : "opacity-100")
                      }
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-muted-foreground">{meta.label}</span>
                    </button>
                  </span>
                );
              })}
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points}>
                  <defs>
                    {legend
                      .filter((key) => !hidden.has(key))
                      .map((key) => {
                        const [color, stopOpacity] = SERIES_META[key].gradient;
                        return (
                          <linearGradient key={key} id={`${key}Fill`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={stopOpacity} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        );
                      })}
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis
                    yAxisId="pct"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    unit="%"
                    width={36}
                  />
                  {showSpeedAxis ? (
                    <YAxis
                      yAxisId="speed"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      tickFormatter={(value: number) => formatSpeed(value)}
                      width={56}
                    />
                  ) : null}
                  <Tooltip content={<HistoryTooltip hidden={hidden} />} />
                  {PERCENT_SERIES.filter((key) => !hidden.has(key)).map((key) => (
                    <Area
                      key={key}
                      yAxisId="pct"
                      type="monotone"
                      dataKey={key}
                      stroke={SERIES_META[key].color}
                      fill={`url(#${key}Fill)`}
                      strokeWidth={key === "cpu" ? 2 : key === "disk" ? 1 : 1.5}
                      strokeOpacity={key === "disk" ? 0.45 : 1}
                      fillOpacity={key === "disk" ? 0.35 : 1}
                    />
                  ))}
                  {hasNetwork
                    ? NETWORK_SERIES.filter((key) => !hidden.has(key)).map((key) => (
                        <Area
                          key={key}
                          yAxisId={showSpeedAxis ? "speed" : "pct"}
                          type="monotone"
                          dataKey={key}
                          stroke={SERIES_META[key].color}
                          fill={`url(#${key}Fill)`}
                          strokeWidth={1.5}
                          connectNulls={false}
                        />
                      ))
                    : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** 二级功能 1：原件 I3t —— 服务器 Token（getToken / resetToken + 显隐 + 自动隐藏） */
function MachineTokenCard({ machineId }: { machineId: number }) {
  const { t } = useTranslation("machine");
  const queryClient = useQueryClient();
  const [visible, setVisible] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const { copied, copy } = useCopyFeedback();

  const hide = React.useCallback(() => {
    setVisible(false);
    setToken(null);
  }, []);
  const remaining = useAutoHide(visible, TOKEN_AUTO_HIDE_SECONDS, hide);
  const urgent = remaining > 0 && remaining <= 30;

  const fetchToken = async () => {
    if (visible) {
      hide();
      return;
    }
    setFetching(true);
    try {
      const body = await apiGet<{ data?: { token?: string | null } }>(`${SECURE}/server/machine/getToken`, {
        id: machineId,
      });
      const next = body.data?.token ?? null;
      if (next) {
        setToken(next);
        setVisible(true);
      }
    } catch {
      toast.error(t("messages.tokenFetchFailed", { defaultValue: "获取令牌失败" }));
    } finally {
      setFetching(false);
    }
  };

  const resetToken = async () => {
    setResetting(true);
    try {
      const body = await apiPost<{ data?: { token?: string | null } }>(`${SECURE}/server/machine/resetToken`, {
        id: machineId,
      });
      const next = body.data?.token ?? null;
      if (next) {
        setToken(next);
        setVisible(true);
        queryClient.invalidateQueries({ queryKey: ["machineInstallCommand", machineId] });
        toast.success(t("token.resetSuccess", { defaultValue: "Token 已重置" }));
      }
    } catch {
      toast.error(t("messages.tokenResetFailed", { defaultValue: "重置令牌失败" }));
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="size-4 text-muted-foreground" />
            {t("token.title", { defaultValue: "服务器 Token" })}
          </CardTitle>
          {visible && remaining > 0 ? (
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                urgent ? "text-red-500 animate-pulse" : "text-muted-foreground",
              )}
              role="timer"
              aria-label={t("token.autoHide", { time: formatCountdown(remaining) })}
            >
              {formatCountdown(remaining)}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {t("token.description", { defaultValue: "此 Token 用于 xboard-node 向面板认证，请妥善保管。" })}
        </p>
        {visible && token ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="flex-1 break-all font-mono text-xs">{token}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label={t(copied ? "token.copiedInline" : "token.copy")}
              onClick={async () => {
                if (!token) return;
                if (!(await copy(token))) toast.error(t("token.copyFailed", { defaultValue: "复制失败，请手动复制" }));
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={fetchToken}
            disabled={fetching}
            aria-label={t(visible ? "token.hide" : "token.show")}
          >
            {fetching ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : visible ? (
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Eye className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t(visible ? "token.hide" : "token.show")}
          </Button>
          <ConfirmDialog
            title={t("token.resetConfirm", { defaultValue: "确认重置 Token？" })}
            description={t("token.resetDescription", {
              defaultValue: "旧 Token 将立即失效，xboard-node 需要重新配置新 Token。",
            })}
            confirmText={t("token.reset", { defaultValue: "重置 Token" })}
            onConfirm={resetToken}
          >
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              disabled={resetting}
              aria-label={t("token.reset", { defaultValue: "重置 Token" })}
            >
              {resetting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              {t("token.reset", { defaultValue: "重置 Token" })}
            </Button>
          </ConfirmDialog>
        </div>
      </CardContent>
    </Card>
  );
}

/** 二级功能 2：原件 R3t —— 一键安装命令（installCommand + 复制） */
function MachineInstallCard({ machineId, open }: { machineId: number; open: boolean }) {
  const { t } = useTranslation("machine");
  const [command, setCommand] = React.useState("");
  const { copied, copy } = useCopyFeedback();

  const { data, isLoading } = useQuery({
    queryKey: ["machineInstallCommand", machineId],
    queryFn: async () => {
      const body = await apiGet<{ data?: { command?: string | null } }>(`${SECURE}/server/machine/installCommand`, {
        id: machineId,
      });
      return { command: body.data?.command ?? "" };
    },
    enabled: open,
  });

  React.useEffect(() => {
    setCommand(data?.command ?? "");
  }, [data?.command]);

  const copyCommand = async () => {
    if (!command) return;
    if (!(await copy(command))) toast.error(t("install.copyFailed", { defaultValue: "复制失败" }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Terminal className="size-4 text-muted-foreground" />
          {t("install.title", { defaultValue: "安装 xboard-node" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {t("install.description", {
            defaultValue: "在目标服务器上执行此命令，即可用 machine mode 安装 xboard-node 并接入当前服务器记录。",
          })}
        </p>
        <div className="group relative rounded-lg border bg-muted/50 p-3">
          <code className="block whitespace-pre-wrap break-all pr-8 font-mono text-xs">
            {isLoading ? t("install.loading", { defaultValue: "正在生成命令..." }) : command || t("columns.noData")}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={copyCommand}
            disabled={isLoading || !command}
            aria-label={t(copied ? "install.copiedInline" : "install.copy")}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t("install.hint", { defaultValue: "需要 root 或 sudo 权限，且目标服务器需为支持 systemd 的 Linux。" })}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-mono text-xs"
            onClick={copyCommand}
            disabled={isLoading || !command}
            aria-label={t("install.copy", { defaultValue: "复制安装命令" })}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {t("install.copiedInline", { defaultValue: "已复制!" })}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t("install.copy", { defaultValue: "复制安装命令" })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** 原件 O3t：关联已有节点弹窗（getNodes 过滤未绑定 + batchUpdate） */
function BindNodesDialog({
  machineId,
  machineName,
  open,
  onOpenChange,
}: {
  machineId: number;
  machineName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("machine");
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<ReadonlySet<number>>(() => new Set<number>());
  const [busy, setBusy] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["allNodesForBind"],
    queryFn: async () => {
      const body = await apiGet<{ data?: MachineNodeRow[] }>(`${SECURE}/server/manage/getNodes`);
      return body.data ?? [];
    },
    enabled: open,
  });

  const unbound = React.useMemo(() => (data ?? []).filter((node) => node.machine_id == null || node.machine_id === 0), [data]);

  const filtered = React.useMemo(() => {
    if (!keyword.trim()) return unbound;
    const needle = keyword.toLowerCase();
    return unbound.filter(
      (node) =>
        node.name.toLowerCase().includes(needle) ||
        (node.host ?? "").toLowerCase().includes(needle) ||
        (node.type ?? "").toLowerCase().includes(needle) ||
        String(node.id).includes(needle),
    );
  }, [unbound, keyword]);

  const close = () => {
    if (busy) return;
    setSelected(new Set<number>());
    setKeyword("");
    onOpenChange(false);
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await apiPost(`${SECURE}/server/manage/batchUpdate`, {
        ids: Array.from(selected),
        machine_id: machineId,
        enabled: true,
      });
      toast.success(
        t("detail.bindSuccess", { count: selected.size, name: machineName, defaultValue: "成功关联 {{count}} 个节点" }),
      );
      queryClient.invalidateQueries({ queryKey: ["machineNodes", machineId] });
      queryClient.invalidateQueries({ queryKey: ["allNodesForBind"] });
      setSelected(new Set<number>());
      onOpenChange(false);
    } catch {
      toast.error(t("detail.bindFailed", { defaultValue: "关联失败" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-sm">
            <Link2 className="size-4" />
            {t("detail.bindExistingTitle", { defaultValue: "关联已有节点" })}
          </DialogTitle>
          <p className="font-mono text-xs text-muted-foreground">
            {t("detail.bindExistingDescription", { name: machineName, defaultValue: "选择要关联到「{{name}}」的节点" })}
          </p>
        </DialogHeader>
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("detail.bindSearchPlaceholder", { defaultValue: "搜索节点名称、地址、类型..." })}
              className="h-9 pl-8 font-mono text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
              <div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
              <div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-muted-foreground">
              {unbound.length === 0
                ? t("detail.noUnboundNodes", { defaultValue: "没有未绑定的节点" })
                : t("detail.noSearchResults", { defaultValue: "没有匹配的节点" })}
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted/50"
                onClick={() => {
                  if (selected.size === filtered.length) setSelected(new Set<number>());
                  else setSelected(new Set(filtered.map((node) => node.id)));
                }}
              >
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  className="size-4"
                  aria-label="select all"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {t("detail.selectAll", { count: filtered.length, defaultValue: "全选（共 {{count}} 个）" })}
                </span>
              </button>
              {filtered.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/50"
                  onClick={() => toggle(node.id)}
                >
                  <Checkbox checked={selected.has(node.id)} className="size-4" aria-label={node.name} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate font-mono text-xs font-medium">
                        <span className="text-muted-foreground">#{node.id}</span>
                        {node.name}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {node.host}:{node.port}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                      {node.type}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="border-t px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {t("detail.selectedCount", { count: selected.size, defaultValue: "已选 {{count}} 个" })}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={close} disabled={busy} className="h-8 font-mono text-xs">
                {t("detail.cancel", { defaultValue: "取消" })}
              </Button>
              <Button size="sm" onClick={submit} disabled={busy || selected.size === 0} className="h-8 font-mono text-xs">
                {busy
                  ? t("detail.binding", { defaultValue: "关联中..." })
                  : t("detail.bindConfirm", { count: selected.size, defaultValue: "关联 {{count}} 个节点" })}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 二级功能 4：原件 M3t —— 承载节点列表（nodes + 启停/解绑 + 跳转节点管理） */
function MachineNodesCard({
  machineId,
  machineName,
  open,
  onNavigate,
}: {
  machineId: number;
  machineName: string;
  open: boolean;
  onNavigate: (path: string) => void;
}) {
  const { t } = useTranslation("machine");
  const queryClient = useQueryClient();
  const [busy, setBusy] = React.useState<ReadonlySet<number>>(() => new Set<number>());
  const [bindOpen, setBindOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["machineNodes", machineId],
    queryFn: async () => {
      const body = await apiGet<{ data?: MachineNodeRow[] }>(`${SECURE}/server/machine/nodes`, {
        machine_id: machineId,
      });
      return body.data ?? [];
    },
    enabled: open,
  });

  const nodes = data ?? [];
  const enabledCount = nodes.filter(nodeEnabled).length;

  const markBusy = (id: number, active: boolean) => {
    setBusy((prev) => {
      const next = new Set(prev);
      if (active) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleEnabled = async (node: MachineNodeRow) => {
    markBusy(node.id, true);
    try {
      await apiPost(`${SECURE}/server/manage/update`, {
        id: node.id,
        type: node.type,
        enabled: !nodeEnabled(node),
      });
      await queryClient.invalidateQueries({ queryKey: ["machineNodes", machineId] });
    } catch {
      toast.error(t("detail.toggleEnabledError", { defaultValue: "切换节点状态失败" }));
    } finally {
      markBusy(node.id, false);
    }
  };

  const unbind = async (node: MachineNodeRow) => {
    markBusy(node.id, true);
    try {
      await apiPost(`${SECURE}/server/manage/update`, { id: node.id, type: node.type, machine_id: null, enabled: false });
      await queryClient.invalidateQueries({ queryKey: ["machineNodes", machineId] });
      toast.success(t("detail.unbindSuccess", { name: node.name, defaultValue: "已取消「{{name}}」的关联" }));
    } catch {
      toast.error(t("detail.unbindFailed", { defaultValue: "取消关联失败" }));
    } finally {
      markBusy(node.id, false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">{t("detail.associatedNodes", { defaultValue: "关联节点" })}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {t("detail.nodeCount", { count: nodes.length, defaultValue: "{{count}} 个节点" })}
            </Badge>
            <Badge variant="outline">
              {t("detail.nodeEnabledCount", { count: enabledCount, defaultValue: "{{count}} 个已激活" })}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setBindOpen(true)}
              aria-label={t("detail.bindExistingTitle", { defaultValue: "关联已有节点" })}
            >
              <Link2 className="size-3.5" />
              {t("detail.bindExistingButton", { defaultValue: "关联已有节点" })}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onNavigate(`/server/manage?machine_id=${machineId}`)}
              aria-label={t("detail.openNodeManage", { defaultValue: "前往节点管理" })}
            >
              {t("detail.openNodeManage", { defaultValue: "前往节点管理" })}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-full animate-pulse rounded-md bg-primary/10" />
            <div className="h-8 w-full animate-pulse rounded-md bg-primary/10" />
            <div className="h-8 w-full animate-pulse rounded-md bg-primary/10" />
          </div>
        ) : nodes.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[480px] text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-3 py-2 text-left font-mono font-medium">
                    {t("detail.nodeName", { defaultValue: "名称" })}
                  </th>
                  <th className="px-3 py-2 text-left font-mono font-medium">
                    {t("detail.nodeType", { defaultValue: "类型" })}
                  </th>
                  <th className="px-3 py-2 text-left font-mono font-medium">
                    {t("detail.nodeHost", { defaultValue: "地址" })}
                  </th>
                  <th className="px-3 py-2 text-center font-mono font-medium">
                    {t("detail.nodeEnabled", { defaultValue: "已激活" })}
                  </th>
                  <th className="w-10 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left text-primary hover:underline"
                        onClick={() => onNavigate(`/server/manage?machine_id=${machineId}`)}
                      >
                        <span className="text-muted-foreground">#{node.id}</span>
                        {node.name}
                        <ExternalLink className="size-3" />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {node.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {node.host}:{node.port}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={nodeEnabled(node)}
                        disabled={busy.has(node.id)}
                        onCheckedChange={() => toggleEnabled(node)}
                        aria-label={nodeEnabled(node) ? "Enabled" : "Disabled"}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        disabled={busy.has(node.id)}
                        onClick={() => unbind(node)}
                        title={t("detail.unbindNode", { defaultValue: "取消关联" })}
                        aria-label={t("detail.unbindNode", { defaultValue: "取消关联" })}
                      >
                        <Unlink className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="rounded-full bg-muted p-3">
              <Server className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("detail.noNodes", { defaultValue: "暂无绑定节点。" })}</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onNavigate(`/server/manage?machine_id=${machineId}&open_create=1`)}
            >
              <ArrowRight className="size-3.5" />
              {t("detail.addNodeToServer", { defaultValue: "新增节点到此服务器" })}
            </Button>
          </div>
        )}
        <BindNodesDialog
          machineId={machineId}
          machineName={machineName}
          open={bindOpen}
          onOpenChange={setBindOpen}
        />
      </CardContent>
    </Card>
  );
}

/** 原件 C3t：详情弹窗内的 error boundary（Chart 数据异常时替换整块内容） */
interface MachineDetailBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface MachineDetailBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MachineDetailBoundary extends React.Component<MachineDetailBoundaryProps, MachineDetailBoundaryState> {
  state: MachineDetailBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): MachineDetailBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8">
          <TriangleAlert className="h-8 w-8 text-destructive" />
          <div className="text-center">
            <p className="text-sm font-medium">{this.props.fallbackMessage ?? "Something went wrong"}</p>
            {this.state.error?.message ? (
              <p className="mt-1 font-mono text-xs text-muted-foreground">{this.state.error.message}</p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** 二级功能 3 的宿主：原件 A3t —— 服务器详情（右侧抽屉，承载 4 张卡） */
function MachineDetailDialog({
  machine,
  open,
  onOpenChange,
}: {
  machine: MachineRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("machine");
  const navigate = useNavigate();
  const [range, setRange] = React.useState<HistoryRange>(HISTORY_RANGES[1]);
  const refetchInterval = range.hours >= 12 ? 120000 : 30000;

  const { data, isLoading } = useQuery({
    queryKey: ["machineHistory", machine?.id, range.label],
    queryFn: async () => {
      if (!machine) return [];
      const body = await apiGet<{ data?: MachineHistoryRow[] }>(`${SECURE}/server/machine/history`, {
        machine_id: machine.id,
        limit: range.limit,
        range_hours: range.hours,
      });
      return body.data ?? [];
    },
    enabled: open && Boolean(machine),
    refetchInterval: open ? refetchInterval : false,
  });

  const go = React.useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange],
  );

  if (!machine) return null;

  const history = data ?? [];
  const status = machineStatus(machine);
  const cpu = loadMetrics(machine).cpu;
  const cpuTone = loadTone(cpu, THRESHOLDS.cpu);
  const cpuDotStatus: "online" | "offline" | "never" = cpuTone === "danger" ? "offline" : cpuTone === "warn" ? "never" : "online";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 原件 v3t（Sheet, side="right"）：右侧抽屉 + overflow-y-scroll，宽度 sm:max-w-2xl md:max-w-4xl */}
      <DialogContent className="left-auto right-0 top-0 grid h-full w-full max-w-full translate-x-0 translate-y-0 content-start gap-0 overflow-y-scroll border-0 border-l border-border p-6 outline-none focus:outline-none sm:max-w-2xl sm:rounded-none md:max-w-4xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 font-mono leading-7 tracking-normal">
            <Server className="h-5 w-5" />
            {machine.name}
          </DialogTitle>
        </DialogHeader>
        <MachineDetailBoundary>
          <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      SID:{machine.id}
                    </Badge>
                    <MachineStatusBadge
                      status={status}
                      label={t(`columns.${status}`, { defaultValue: status })}
                    />
                    <MachineStatusDot status={cpuDotStatus} />
                    <span className="font-mono text-xs text-muted-foreground">CPU {cpu.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {t("columns.lastSeen", { defaultValue: "最后心跳" })}: {relativeTime(machine.last_seen_at)}
                    </span>
                    <span>•</span>
                    <span>
                      {t("columns.nodes", { defaultValue: "节点数" })}: {machine.servers_count ?? 0}
                    </span>
                  </div>
                  {machine.notes ? (
                    <p className="max-w-[520px] text-sm text-muted-foreground">{machine.notes}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => go(`/server/manage?machine_id=${machine.id}&open_create=1`)}
                    aria-label={t("detail.addNodeToServer", { defaultValue: "新增节点到此服务器" })}
                  >
                    {t("detail.addNodeToServer", { defaultValue: "新增节点到此服务器" })}
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => go(`/server/manage?machine_id=${machine.id}`)}
                    aria-label={t("detail.openNodeManage", { defaultValue: "前往节点管理" })}
                  >
                    {t("detail.openNodeManage", { defaultValue: "前往节点管理" })}
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            {isLoading ? (
              <Card>
                <CardContent className="p-4">
                  <div className="h-52 w-full animate-pulse rounded-md bg-primary/10" />
                </CardContent>
              </Card>
            ) : (
              <MachineHistoryChart history={history} range={range} onRangeChange={setRange} />
            )}
            <MachineLoadCard machine={machine} />
          </div>

          <MachineTokenCard machineId={machine.id} />
          <MachineInstallCard machineId={machine.id} open={open} />
          <MachineNodesCard machineId={machine.id} machineName={machine.name} open={open} onNavigate={go} />
          </div>
        </MachineDetailBoundary>
      </DialogContent>
    </Dialog>
  );
}

export default function ServerMachine() {
  const { t } = useTranslation(["machine", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ node_state: false });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 10, pageIndex: 0 });

  /* 原件 F3t：详情弹窗状态 + URL `machine_id` 同步（深链可复现弹窗态） */
  const [detailMachine, setDetailMachine] = React.useState<MachineRow | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["machineList"],
    queryFn: async () => (await fetchMachines()).data ?? [],
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const machines = data ?? [];

  const openDetail = React.useCallback(
    (machine: MachineRow) => {
      setDetailMachine(machine);
      setDetailOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("machine_id", String(machine.id));
        return next;
      });
    },
    [setSearchParams],
  );

  const handleDetailOpenChange = React.useCallback(
    (open: boolean) => {
      setDetailOpen(open);
      if (open) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("machine_id");
        return next;
      });
    },
    [setSearchParams],
  );

  React.useEffect(() => {
    const id = searchParams.get("machine_id");
    if (!id || !data?.length) return;
    const found = data.find((machine) => String(machine.id) === id);
    if (found) {
      setDetailMachine(found);
      setDetailOpen(true);
    }
  }, [searchParams, data]);

  const columns = React.useMemo<ColumnDef<MachineRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.name", { defaultValue: "服务器名称" })} />
        ),
        cell: ({ row }) => {
          const machine = row.original;
          const status = machineStatus(machine);
          return (
            <div className="flex min-w-[260px] items-start gap-3">
              <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
                <Server className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-w-[220px] truncate font-medium">{machine.name}</span>
                  <MachineStatusDot status={status} />
                  <Badge variant="outline" className="font-mono text-[10px]">
                    SID:{machine.id}
                  </Badge>
                  {isHighLoad(machine) ? (
                    <Badge variant="secondary" className="border-0 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {t("overview.high_load", { defaultValue: "高负载" })}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <MachineStatusBadge
                    status={status}
                    label={t(`columns.${status}`, { defaultValue: status })}
                  />
                  <span>
                    {t("columns.lastSeen", { defaultValue: "最后心跳" })}: {relativeTime(machine.last_seen_at)}
                  </span>
                  <span>•</span>
                  <span>
                    {t("columns.nodes", { defaultValue: "节点数" })}: {machine.servers_count ?? 0}
                  </span>
                </div>
                {machine.notes ? (
                  <p className="max-w-[420px] truncate text-xs text-muted-foreground">{machine.notes}</p>
                ) : null}
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value) => {
          const keyword = String(value ?? "")
            .trim()
            .toLowerCase();
          if (!keyword) return true;
          const machine = row.original;
          return [machine.name, machine.notes ?? "", `sid:${machine.id}`, String(machine.id)]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
        },
        size: 360,
        meta: { label: t("columns.name", { defaultValue: "服务器名称" }) },
      },
      {
        id: "status",
        accessorFn: (row) => machineStatus(row),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.status", { defaultValue: "状态" })} />
        ),
        /* 原件 s3t → o3t：inactive=secondary / never=outline / online=绿底 / offline=destructive */
        cell: ({ row }) => {
          const status = machineStatus(row.original);
          return <MachineStatusBadge status={status} label={t(`columns.${status}`, { defaultValue: status })} />;
        },
        filterFn: (row, _id, value) => {
          const values = Array.isArray(value) ? value : [];
          return values.length === 0 || values.includes(machineStatus(row.original));
        },
        size: 110,
        enableHiding: true,
        meta: { label: t("columns.status", { defaultValue: "状态" }) },
      },
      {
        id: "node_state",
        accessorFn: (row) => {
          const states = [(row.servers_count ?? 0) > 0 ? "with_nodes" : "idle_nodes"];
          if (isHighLoad(row)) states.push("high_load");
          return states;
        },
        header: () => null,
        cell: () => null,
        filterFn: (row, _id, value) => {
          const values = Array.isArray(value) ? value : [];
          if (values.length === 0) return true;
          const states: string[] = [(row.original.servers_count ?? 0) > 0 ? "with_nodes" : "idle_nodes"];
          if (isHighLoad(row.original)) states.push("high_load");
          return values.some((v) => states.includes(String(v)));
        },
        enableHiding: true,
        meta: { label: t("toolbar.nodes", { defaultValue: "节点" }) },
      },
      {
        id: "load",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.load", { defaultValue: "负载" })} />
        ),
        /* 原件 d3t：CPU/MEM 两行「标签+百分比+进度条」，第三行是 DISK 的 used/total 文本 */
        cell: ({ row }) => {
          const load = row.original.load_status;
          if (!load) {
            return <span className="text-xs text-muted-foreground">{t("columns.noData", { defaultValue: "暂无负载数据" })}</span>;
          }
          const metrics = loadMetrics(row.original);
          return (
            <div className="w-[180px] space-y-2">
              <LoadRow label="CPU" value={metrics.cpu} icon={Cpu} tone={loadTone(metrics.cpu, THRESHOLDS.cpu)} />
              <LoadRow label="MEM" value={metrics.mem} icon={MemoryStick} tone={loadTone(metrics.mem, THRESHOLDS.mem)} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="size-3" /> DISK
                </span>
                <span className="font-mono">
                  {formatBytes(load.disk?.used)} / {formatBytes(load.disk?.total)}
                </span>
              </div>
            </div>
          );
        },
        size: 210,
        meta: { label: t("columns.load", { defaultValue: "负载" }) },
      },
      {
        id: "relation",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.nodes", { defaultValue: "节点数" })} />
        ),
        /* 原件 u3t：上行「数量 + 已承载节点」，下行「服务器详情」按钮 */
        cell: ({ row }) => {
          const count = row.original.servers_count ?? 0;
          return (
            <div className="min-w-[140px] space-y-2">
              <div className="flex items-center gap-2">
                <div className="font-mono text-base font-semibold">{count}</div>
                <div className="text-xs text-muted-foreground">
                  {count > 0
                    ? t("columns.nodesHosted", { defaultValue: "已承载节点" })
                    : t("columns.nodesIdle", { defaultValue: "暂无承载" })}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={() => openDetail(row.original)}
              >
                <Eye className="size-3.5" />
                {t("detail.title", { defaultValue: "服务器详情" })}
              </Button>
            </div>
          );
        },
        size: 220,
        meta: { label: t("columns.nodes", { defaultValue: "节点数" }) },
      },
      {
        id: "last_seen",
        accessorFn: (row) => row.last_seen_at ?? 0,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.lastSeen", { defaultValue: "最后心跳" })} />
        ),
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div className="font-medium">{relativeTime(row.original.last_seen_at)}</div>
            <div className="text-muted-foreground">
              {row.original.load_status?.updated_at
                ? `${t("columns.lastReport", { defaultValue: "负载上报" })}: ${relativeTime(row.original.load_status.updated_at)}`
                : t("columns.noData", { defaultValue: "暂无负载数据" })}
            </div>
          </div>
        ),
        size: 140,
        enableHiding: true,
        meta: { label: t("columns.lastSeen", { defaultValue: "最后心跳" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.actions", { defaultValue: "操作" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("detail.title", { defaultValue: "服务器详情" })}
              onClick={() => openDetail(row.original)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <MachineDialog
              refetch={refetch}
              defaultValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("form.edit", { defaultValue: "编辑服务器" })}>
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <ConfirmDialog
              title={t("messages.deleteConfirm", { defaultValue: "确认删除服务器？" })}
              description={t("messages.deleteDescription", {
                defaultValue: "关联节点将自动解绑（不会被删除），此操作不可撤销。",
              })}
              confirmText={t("messages.deleteButton", { defaultValue: "删除" })}
              onConfirm={async () => {
                try {
                  await dropMachine({ id: row.original.id });
                  toast.success(t("messages.deleteSuccess", { defaultValue: "服务器删除成功" }));
                  refetch();
                } catch {
                  toast.error(t("messages.deleteFailed", { defaultValue: "删除服务器失败" }));
                }
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label={t("messages.deleteButton", { defaultValue: "删除" })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 132,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t, openDetail],
  );

  const table = useReactTable<MachineRow>({
    data: machines,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
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

  const onlineCount = machines.filter((m) => machineStatus(m) === "online").length;
  const highLoadCount = machines.filter(isHighLoad).length;

  /* 原件 j3t（offset 6283800）：概览统计条，5 张卡（总数/在线/离线失效/高负载/承载节点） */
  const offlineCount = machines.filter((m) => {
    const status = machineStatus(m);
    return status === "offline" || status === "never";
  }).length;
  const hostedNodeCount = machines.reduce((sum, m) => sum + (m.servers_count ?? 0), 0);
  const overviewStats: {
    key: string;
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }[] = [
    {
      key: "total",
      label: t("overview.total", { defaultValue: "服务器总数" }),
      value: machines.length,
      icon: Server,
      tone: "bg-primary/10 text-primary",
    },
    {
      key: "online",
      label: t("overview.online", { defaultValue: "在线服务器" }),
      value: onlineCount,
      icon: CircleCheckBig,
      tone: MACHINE_TONE.online.card,
    },
    {
      key: "offline",
      label: t("overview.offline", { defaultValue: "离线/失联" }),
      value: offlineCount,
      icon: CircleOff,
      tone: MACHINE_TONE[offlineCount > 0 ? "offline" : "online"].card,
    },
    {
      key: "highLoad",
      label: t("overview.high_load", { defaultValue: "高负载" }),
      value: highLoadCount,
      icon: TriangleAlert,
      tone: highLoadCount > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground",
    },
    {
      key: "hostedNodes",
      label: t("columns.nodes", { defaultValue: "节点数" }),
      value: hostedNodeCount,
      icon: Layers3,
      tone: "bg-muted text-muted-foreground",
    },
  ];

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 r3t（offset 6250303）：新增 + 搜索 + 状态/节点 facet + 条件重置 …… 在线率与高负载统计 + 说明 */
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <MachineDialog
              refetch={refetch}
              trigger={
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <div>{t("form.add", { defaultValue: "添加服务器" })}</div>
                </Button>
              }
            />
            <Input
              placeholder={t("toolbar.search", { defaultValue: "搜索服务器名称、备注或 SID..." })}
              value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => tbl.getColumn("name")?.setFilterValue(e.target.value)}
              className={cn(
                "h-9 w-full min-w-[180px] sm:w-[220px] lg:w-[280px]",
                filtersActive && "border-primary/50 ring-primary/20",
              )}
            />
            {tbl.getColumn("status") && (
              <FacetedFilter
                column={tbl.getColumn("status")}
                title={t("toolbar.status", { defaultValue: "状态" })}
                options={[
                  { label: t("columns.online", { defaultValue: "在线" }), value: "online" },
                  { label: t("columns.offline", { defaultValue: "离线" }), value: "offline" },
                  { label: t("columns.inactive", { defaultValue: "已禁用" }), value: "inactive" },
                  { label: t("columns.never", { defaultValue: "从未上报" }), value: "never" },
                ]}
              />
            )}
            {tbl.getColumn("node_state") && (
              <FacetedFilter
                column={tbl.getColumn("node_state")}
                title={t("toolbar.nodes", { defaultValue: "节点" })}
                options={[
                  { label: t("toolbar.with_nodes", { defaultValue: "已承载节点" }), value: "with_nodes" },
                  { label: t("toolbar.idle_nodes", { defaultValue: "空闲服务器" }), value: "idle_nodes" },
                  { label: t("toolbar.high_load", { defaultValue: "高负载" }), value: "high_load" },
                ]}
              />
            )}
            {filtersActive && (
              <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-9 px-2 lg:px-3">
                {t("toolbar.reset", { defaultValue: "重置" })}
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border bg-muted/40 px-2.5 py-1 font-mono">
              {t("toolbar.online_ratio", { defaultValue: "在线" })}: {onlineCount}/{machines.length}
            </span>
            <span className="rounded-md border bg-muted/40 px-2.5 py-1 font-mono">
              {t("toolbar.high_load_count", { defaultValue: "高负载" })}: {highLoadCount}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("toolbar.tip", { defaultValue: "适合集中查看服务器在线情况、承载节点数量与资源压力。" })}
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "服务器管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("description", {
              defaultValue: "用于查看服务器健康、负载与承载节点，并从运维视角快捷发起节点操作。",
            })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <div className="space-y-3">
          {/* 原件 j3t：统计条位于表格之上、与 DataTable 同处 space-y-3 容器 */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2.5 shadow-sm">
            {overviewStats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex min-w-[130px] flex-1 items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <div className="mt-1 text-xl font-semibold leading-none">{item.value}</div>
                  </div>
                  <Badge variant="secondary" className={cn("border-0 px-2 py-1", item.tone)}>
                    <Icon className="size-3.5" />
                  </Badge>
                </div>
              );
            })}
          </div>
          <DataTable
            table={table}
            toolbar={toolbar}
            isLoading={isFetching}
            mobilePrimaryField="name"
          />
        </div>
        {/* 原件 F3t：详情弹窗与页面同级（承载 4 个二级功能） */}
        <MachineDetailDialog machine={detailMachine} open={detailOpen} onOpenChange={handleDetailOpenChange} />
      </LayoutBody>
    </Layout>
  );
}
