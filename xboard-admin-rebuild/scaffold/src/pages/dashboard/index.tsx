import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from "recharts";
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  Eye,
  ListChecks,
  Loader2,
  RefreshCw,
  Server,
  Ticket,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

/**
 * 原件：`$Gt`（offset 5,748,402，仪表盘外壳）
 *   块 1 `uqt`（offset 5,645,272）：8 张统计卡 ← GET /stat/getStats，refetchInterval 300000
 *   块 2 `$$t`（offset 5,635,969）：收入概览 + recharts ← GET /stat/getOrder，refetchInterval 30000
 *   块 3 `eKt`（offset 5,662,236）：节点/用户流量榜 ← GET /stat/getTrafficRank，refetchInterval 30000
 *   块 4 `UGt`（offset 5,738,141）：队列作业监控 ← GET /system/getQueueStats，refetchInterval 30000
 *                                      失败任务表 ← GET /system/getHorizonFailedJobs
 *
 * 轮询/阈值等均按原件：统计卡 5 分钟、概览/流量榜/队列 30 秒；会话外不再额外轮询。
 * 格式化函数还原自 `TS`（分→元）、`RS`（字节→人类可读）、`Jqt`（字节→GB）。
 */

function securePath(): string {
  return window.settings?.secure_path ?? "";
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

async function readData<T>(request: Promise<{ data: unknown }>): Promise<T | null> {
  const response = await request;
  return ((response.data as ApiEnvelope<T>).data ?? null) as T | null;
}

/** 原件 TS：分 -> ¥x.xx */
function formatMoney(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "¥0.00";
  const value = typeof cents === "string" ? Number.parseFloat(cents) : cents;
  if (!Number.isFinite(value)) return "¥0.00";
  return `¥${(value / 100).toFixed(2)}`;
}

/** 原件 H$t：分 -> x.xx（不带货币符号） */
function formatYuan(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "0.00";
  const value = typeof cents === "string" ? Number.parseFloat(cents) : cents;
  if (!Number.isFinite(value)) return "0.00";
  return (value / 100).toFixed(2);
}

/** 原件 RS：字节 -> 人类可读 */
function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = Math.floor(Math.log(bytes) / Math.log(1024));
  if (index < 0) index = 0;
  if (index >= units.length) index = units.length - 1;
  return `${Number.parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
}

/** 原件 Jqt：字节 -> GB */
function formatGb(bytes: number | null | undefined): string {
  const value = bytes ?? 0;
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** 原件 _S + ES：以 UTC+8 呈现时间戳 */
function formatTimestamp(value: number | string | null | undefined, withTime = true): string {
  if (value === null || value === undefined || value === "") return "";
  let ms = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(ms)) return String(value);
  if (Math.floor(ms).toString().length === 10) ms = ms * 1000;
  const date = new Date(ms + 8 * 3600 * 1000);
  const day = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  if (!withTime) return day;
  return `${day} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
}

/** 原件 _S(date,'yyyy-MM-dd')，用于请求参数 */
function formatDateParam(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/* ------------------------------------------------------------------ 数据形状 */

interface TrafficBucket {
  upload: number;
  download: number;
  total: number;
}

/** GET /stat/getStats（app/Http/Controllers/V2/Admin/StatController.php:258） */
interface DashboardStats {
  todayIncome: number;
  dayIncomeGrowth: number;
  currentMonthIncome: number;
  lastMonthIncome: number;
  monthIncomeGrowth: number;
  currentMonthCommissionPayout: number;
  commissionPendingTotal: number;
  currentMonthNewUsers: number;
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  onlineUsers: number;
  onlineDevices: number;
  ticketPendingTotal: number;
  onlineNodes: number;
  todayTraffic: TrafficBucket;
  monthTraffic: TrafficBucket;
  totalTraffic: TrafficBucket;
}

/** GET /stat/getOrder（StatController.php:113） */
interface OrderStatSummary {
  paid_total: number;
  paid_count: number;
  commission_total: number;
  commission_count: number;
  avg_paid_amount: number;
  commission_rate: number;
  start_date: string;
  end_date: string;
}

interface OrderStatDay {
  date: string;
  paid_total: number;
  paid_count: number;
  commission_total: number;
  commission_count: number;
  avg_order_amount?: number;
  avg_commission_amount?: number;
}

interface OrderStat {
  summary?: OrderStatSummary;
  list?: OrderStatDay[];
}

/** GET /stat/getTrafficRank（StatController.php:430） */
interface TrafficRankItem {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
}

/** GET /system/getQueueStats（app/Http/Controllers/V2/Admin/SystemController.php:51） */
interface QueueStats {
  failedJobs: number;
  jobsPerMinute: number;
  pausedMasters: number;
  periods: { failedJobs: number; recentJobs: number };
  processes: number;
  queueWithMaxRuntime: { name: string; runtime: number } | null;
  queueWithMaxThroughput: { name: string; throughput: number } | null;
  recentJobs: number;
  status: boolean;
  wait: Record<string, number>;
}

/** GET /system/getHorizonFailedJobs */
interface FailedJob {
  id: string | number;
  failed_at: string | number;
  queue: string;
  name: string;
  exception: string;
  payload: string;
  connection?: string;
}

/* ------------------------------------------------------------------ 页面外壳 */

export default function Dashboard() {
  const { t } = useTranslation("dashboard");

  return (
    <Layout>
      <LayoutHeader inline>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
      </LayoutHeader>
      <LayoutBody>
        <div className="space-y-6">
          <div className="grid gap-6">
            <StatsCards />
            <RevenueOverview />
            <TrafficRank />
            <QueueMonitor />
          </div>
        </div>
      </LayoutBody>
    </Layout>
  );
}

/* ------------------------------------------------------------------ 块 1：统计卡（uqt） */

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trend?: { value: number; label: string; isPositive: boolean };
  description?: string;
  onClick?: () => void;
  highlight?: boolean;
}

/** 原件 dqt */
function StatCard({ title, value, icon, trend, description, onClick, highlight }: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50",
        highlight && "border-primary/50",
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <div className="flex items-center pt-1">
            <TrendingUp className={cn("h-4 w-4", trend.isPositive ? "text-emerald-500" : "text-red-500")} />
            <span className={cn("ml-1 text-xs", trend.isPositive ? "text-emerald-500" : "text-red-500")}>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-xs text-muted-foreground">{trend.label}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

/** 原件 G$t：加载骨架 */
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2">
            <div className="h-4 w-[120px] animate-pulse rounded-md bg-muted" />
            <div className="h-7 w-[80px] animate-pulse rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-3 w-[100px] animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** 原件 uqt */
function StatsCards() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<DashboardStats | null>({
    queryKey: ["dashboardStats"],
    queryFn: () => readData<DashboardStats>(http.get(`${securePath()}/stat/getStats`)),
    refetchInterval: 300000 });

  if (isLoading || !data) return <StatsCardsSkeleton />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("stats.todayIncome")}
        value={formatMoney(data.todayIncome)}
        icon={<Wallet className="h-4 w-4 text-emerald-500" />}
        trend={{ value: data.dayIncomeGrowth, label: t("stats.vsYesterday"), isPositive: data.dayIncomeGrowth > 0 }}
      />
      <StatCard
        title={t("stats.monthlyIncome")}
        value={formatMoney(data.currentMonthIncome)}
        icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
        trend={{
          value: data.monthIncomeGrowth,
          label: t("stats.vsLastMonth"),
          isPositive: data.monthIncomeGrowth > 0 }}
      />
      <StatCard
        title={t("stats.pendingTickets")}
        value={data.ticketPendingTotal}
        icon={
          <Ticket
            className={cn("h-4 w-4", data.ticketPendingTotal > 0 ? "text-orange-500" : "text-muted-foreground")}
          />
        }
        description={data.ticketPendingTotal > 0 ? t("stats.hasPendingTickets") : t("stats.noPendingTickets")}
        onClick={() => navigate("/user/ticket")}
        highlight={data.ticketPendingTotal > 0}
      />
      <StatCard
        title={t("stats.pendingCommission")}
        value={data.commissionPendingTotal}
        icon={
          <Wallet
            className={cn("h-4 w-4", data.commissionPendingTotal > 0 ? "text-blue-500" : "text-muted-foreground")}
          />
        }
        description={
          data.commissionPendingTotal > 0 ? t("stats.hasPendingCommission") : t("stats.noPendingCommission")
        }
        onClick={() => {
          const params = new URLSearchParams();
          params.set("commission_status", "0");
          params.set("status", "3");
          params.set("commission_balance", "gt:0");
          navigate(`/finance/order?${params.toString()}`);
        }}
        highlight={data.commissionPendingTotal > 0}
      />
      <StatCard
        title={t("stats.monthlyNewUsers")}
        value={data.currentMonthNewUsers}
        icon={<Users className="h-4 w-4 text-blue-500" />}
        trend={{ value: data.userGrowth, label: t("stats.vsLastMonth"), isPositive: data.userGrowth > 0 }}
      />
      <StatCard
        title={t("stats.totalUsers")}
        value={data.totalUsers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description={t("stats.activeUsers", { count: data.activeUsers })}
      />
      <StatCard
        title={t("stats.monthlyUpload")}
        value={formatBytes(data.monthTraffic.upload)}
        icon={<Upload className="h-4 w-4 text-emerald-500" />}
        description={t("stats.todayTraffic", { value: formatBytes(data.todayTraffic.upload) })}
      />
      <StatCard
        title={t("stats.monthlyDownload")}
        value={formatBytes(data.monthTraffic.download)}
        icon={<Download className="h-4 w-4 text-blue-500" />}
        description={t("stats.todayTraffic", { value: formatBytes(data.todayTraffic.download) })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ 块 2：收入概览（$$t） */

type OverviewType = "amount" | "count";

const OVERVIEW_RANGES = [
  { value: "7d", label: "overview.last7Days" },
  { value: "30d", label: "overview.last30Days" },
  { value: "90d", label: "overview.last90Days" },
  { value: "180d", label: "overview.last180Days" },
  { value: "365d", label: "overview.lastYear" },
  { value: "custom", label: "overview.customRange" },
] as const;

interface ChartTooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<ChartTooltipPayloadItem>;
  label?: string | number;
}

function RevenueTooltip({ active, payload, label }: ChartTooltipProps) {
  const { t } = useTranslation("dashboard");
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="mb-2 text-sm font-medium">{label}</div>
      {payload.map((item, index) => {
        const name = String(item.name ?? "");
        const isAmount = name.includes(t("overview.amount"));
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{name}:</span>
            <span className="font-medium">
              {isAmount
                ? `¥${formatYuan(Number(item.value ?? 0))}`
                : t("overview.transactions", { count: Number(item.value ?? 0) })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 原件 $$t */
function RevenueOverview() {
  const { t } = useTranslation("dashboard");
  const [type, setType] = React.useState<OverviewType>("amount");
  const [range, setRange] = React.useState<string>("30d");
  const [customFrom, setCustomFrom] = React.useState(() => formatDateParam(addDays(new Date(), -7)));
  const [customTo, setCustomTo] = React.useState(() => formatDateParam(new Date()));

  const { startDate, endDate } = React.useMemo(() => {
    const today = startOfDay(new Date());
    if (range === "custom") {
      return { startDate: customFrom, endDate: customTo };
    }
    const days = Number.parseInt(range, 10) || 30;
    return { startDate: formatDateParam(addDays(today, -days)), endDate: formatDateParam(today) };
  }, [range, customFrom, customTo]);

  const { data } = useQuery<OrderStat | null>({
    queryKey: ["orderStat", startDate, endDate],
    queryFn: () => readData<OrderStat>(http.get(`${securePath()}/stat/getOrder`, { params: { start_date: startDate, end_date: endDate } })),
    refetchInterval: 30000 });

  const summary = data?.summary;
  const list = data?.list ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("overview.title")}</CardTitle>
            <CardDescription>
              {summary?.start_date} {t("overview.to")} {summary?.end_date}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("overview.selectTimeRange")} />
                </SelectTrigger>
                <SelectContent>
                  {OVERVIEW_RANGES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {t(item.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {range === "custom" && (
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    aria-label={t("overview.selectDate")}
                    value={customFrom}
                    max={customTo}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <input
                    type="date"
                    aria-label={t("overview.selectDate")}
                    value={customTo}
                    min={customFrom}
                    onChange={(event) => setCustomTo(event.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  />
                </div>
              )}
            </div>
            <Tabs value={type} onValueChange={(value) => setType(value === "count" ? "count" : "amount")}>
              <TabsList>
                <TabsTrigger value="amount">{t("overview.amount")}</TabsTrigger>
                <TabsTrigger value="count">{t("overview.count")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{t("overview.totalIncome")}</div>
            <div className="text-2xl font-bold">¥{formatYuan(summary?.paid_total ?? 0)}</div>
            <div className="text-xs text-muted-foreground">
              {t("overview.totalTransactions", { count: summary?.paid_count ?? 0 })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("overview.avgOrderAmount")} ¥{formatYuan(summary?.avg_paid_amount ?? 0)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{t("overview.totalCommission")}</div>
            <div className="text-2xl font-bold">¥{formatYuan(summary?.commission_total ?? 0)}</div>
            <div className="text-xs text-muted-foreground">
              {t("overview.totalTransactions", { count: summary?.commission_count ?? 0 })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("overview.commissionRate")} {(summary?.commission_rate ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "amount" ? (
              <AreaChart data={list} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value: string) => (value ? value.slice(5) : "")}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value: number) => `¥${formatYuan(value)}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="paid_total"
                  name={t("overview.orderAmount")}
                  stroke="hsl(var(--primary))"
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="commission_total"
                  name={t("overview.commissionAmount")}
                  stroke="hsl(var(--secondary))"
                  fill="url(#commissionGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <BarChart data={list} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value: string) => (value ? value.slice(5) : "")}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value: number) => t("overview.transactions", { count: value })}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar
                  dataKey="paid_count"
                  name={t("overview.orderCount")}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="commission_count"
                  name={t("overview.commissionCount")}
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ 块 3：流量榜（eKt） */

type TrafficRangeKey = "today" | "last7days" | "last30days" | "custom";

const TRAFFIC_RANGES: ReadonlyArray<{ value: TrafficRangeKey; label: string }> = [
  { value: "today", label: "trafficRank.today" },
  { value: "last7days", label: "trafficRank.last7days" },
  { value: "last30days", label: "trafficRank.last30days" },
  { value: "custom", label: "trafficRank.customRange" },
];

/** 原件 Xqt：时间区间计算（秒） */
function trafficRange(range: TrafficRangeKey, from: string, to: string): { start: number; end: number } {
  const today = startOfDay(new Date());
  switch (range) {
    case "today": {
      const start = today;
      const end = addDays(today, 1);
      return { start: Math.floor(start.getTime() / 1000), end: Math.floor(end.getTime() / 1000) };
    }
    case "last7days":
      return { start: Math.floor(addDays(today, -7).getTime() / 1000), end: Math.floor(today.getTime() / 1000) };
    case "last30days":
      return { start: Math.floor(addDays(today, -30).getTime() / 1000), end: Math.floor(today.getTime() / 1000) };
    default: {
      const parsedFrom = from ? new Date(`${from}T00:00:00`) : addDays(today, -7);
      const parsedTo = to ? new Date(`${to}T00:00:00`) : today;
      return {
        start: Math.floor(startOfDay(parsedFrom).getTime() / 1000),
        end: Math.floor(addDays(startOfDay(parsedTo), 1).getTime() / 1000) };
    }
  }
}

interface TrafficRankCardProps {
  title: string;
  icon: React.ReactNode;
  variant: "node" | "user";
}

function TrafficRankCard({ title, icon, variant }: TrafficRankCardProps) {
  const { t } = useTranslation(["dashboard", "common"]);
  const [range, setRange] = React.useState<TrafficRangeKey>("today");
  const [from, setFrom] = React.useState(() => formatDateParam(addDays(new Date(), -7)));
  const [to, setTo] = React.useState(() => formatDateParam(new Date()));

  const bounds = React.useMemo(() => trafficRange(range, from, to), [range, from, to]);

  const { data } = useQuery<TrafficRankItem[]>({
    queryKey: ["trafficRank", variant, bounds.start, bounds.end],
    queryFn: async () => {
      const payload = await readData<TrafficRankItem[]>(
        http.get(`${securePath()}/stat/getTrafficRank`, {
          params: { type: variant, start_time: bounds.start, end_time: bounds.end } }),
      );
      // 原件 Yqt：兼容数组与 {data:[...]} 两种返回形态
      return Array.isArray(payload) ? payload : [];
    },
    refetchInterval: 30000 });

  const items = data ?? [];
  const max = items[0]?.value || 1;

  return (
    <Card>
      <CardHeader className="flex-none pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center text-base font-medium">
            <span className="mr-2">{icon}</span>
            {title}
          </CardTitle>
          <div className="flex min-w-0 items-center gap-1">
            <Select value={range} onValueChange={(value) => setRange(value as TrafficRangeKey)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("dashboard:trafficRank.selectTimeRange")} />
              </SelectTrigger>
              <SelectContent className="z-50">
                {TRAFFIC_RANGES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(`dashboard:${item.label}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {range === "custom" && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  aria-label={t("dashboard:trafficRank.selectDateRange")}
                  value={from}
                  max={to}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                />
                <span className="text-sm text-muted-foreground">-</span>
                <input
                  type="date"
                  aria-label={t("dashboard:trafficRank.selectDateRange")}
                  value={to}
                  min={from}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length ? (
          <div className="h-[400px] overflow-y-auto pr-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  title={`${t("dashboard:trafficRank.currentTraffic")}：${formatGb(item.value)} / ${t(
                    "dashboard:trafficRank.previousTraffic",
                  )}：${formatGb(item.previousValue)} / ${t("dashboard:trafficRank.changeRate")}：${
                    item.change >= 0 ? "+" : ""
                  }${item.change}%`}
                  className="flex cursor-pointer items-center justify-between space-x-2 rounded-lg bg-muted/50 p-2 transition-colors hover:bg-muted/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{item.name}</span>
                      <span
                        className={cn(
                          "ml-2 flex items-center text-xs font-medium",
                          item.change >= 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {item.change >= 0 ? (
                          <ArrowUp className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(item.value / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{formatGb(item.value)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <div className="animate-pulse">{t("common:loading")}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** 原件 eKt */
function TrafficRank() {
  const { t } = useTranslation("dashboard");
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TrafficRankCard title={t("trafficRank.nodeTrafficRank")} icon={<Server className="h-4 w-4" />} variant="node" />
      <TrafficRankCard title={t("trafficRank.userTrafficRank")} icon={<Users className="h-4 w-4" />} variant="user" />
    </div>
  );
}

/* ------------------------------------------------------------------ 块 4：队列监控（UGt） */

function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** 原件 UGt */
function QueueMonitor() {
  const { t } = useTranslation("dashboard");
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const [detail, setDetail] = React.useState<FailedJob | null>(null);

  const {
    data: queue,
    isLoading,
    isRefetching,
    refetch: refetchQueue } = useQuery<QueueStats | null>({
    queryKey: ["queueStats"],
    queryFn: () => readData<QueueStats>(http.get(`${securePath()}/system/getQueueStats`)),
    refetchInterval: 30000 });

  const { data: failed } = useQuery<{ data: FailedJob[]; total: number }>({
    queryKey: ["failedJobs", page, pageSize],
    queryFn: async () => {
      const response = await http.get(`${securePath()}/system/getHorizonFailedJobs`, {
        params: { current: page, page_size: pageSize } });
      const body = (response.data ?? {}) as { data?: FailedJob[]; total?: number };
      return { data: body.data ?? [], total: body.total ?? 0 };
    },
    enabled: failedOpen });

  const failedRows = failed?.data ?? [];
  const failedTotal = failed?.total ?? 0;

  const columns = React.useMemo<ColumnDef<FailedJob>[]>(
    () => [
      {
        id: "failed_at",
        header: () => t("queue.details.time"),
        cell: ({ row }) => formatTimestamp(row.original.failed_at) },
      {
        id: "queue",
        header: () => t("queue.details.queue"),
        cell: ({ row }) => row.original.queue },
      {
        id: "name",
        header: () => t("queue.details.name"),
        cell: ({ row }) => (
          <span className="inline-block max-w-[150px] truncate" title={row.original.name}>
            {row.original.name}
          </span>
        ) },
      {
        id: "exception",
        header: () => t("queue.details.exception"),
        cell: ({ row }) => (
          <span
            className="inline-block max-w-[200px] truncate"
            title={row.original.exception}
          >
            {(row.original.exception ?? "").split("\n")[0]}
          </span>
        ) },
      {
        id: "actions",
        header: () => t("queue.details.action"),
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("queue.details.viewDetail")}
            onClick={() => setDetail(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) },
    ],
    [t],
  );

  const table = useReactTable<FailedJob>({
    data: failedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(failedTotal / pageSize),
    state: { pagination: { pageIndex: page - 1, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex: page - 1, pageSize });
        setPage(next.pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    } });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const waitSeconds = queue?.wait?.default ?? Object.values(queue?.wait ?? {})[0] ?? 0;
  const statusOk = queue?.status ?? false;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                {t("queue.title")}
              </CardTitle>
              <CardDescription>{t("queue.status.description")}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={isRefetching}
              aria-label={t("common.refresh")}
              onClick={() => {
                void refetchQueue();
              }}
            >
              <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusOk ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">{t("queue.status.running")}</span>
                  </div>
                  <Badge variant={statusOk ? "secondary" : "destructive"}>
                    {t(statusOk ? "queue.status.normal" : "queue.status.abnormal")}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("queue.status.waitTime", { seconds: waitSeconds })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 rounded-lg bg-muted/50 p-3" title={t("queue.details.statisticsPeriod", { hours: queue?.periods?.recentJobs ?? 0 })}>
                  <p className="text-sm text-muted-foreground">{t("queue.details.recentJobs")}</p>
                  <p className="text-2xl font-bold">{queue?.recentJobs ?? 0}</p>
                  <ProgressBar value={((queue?.recentJobs ?? 0) / (queue?.periods?.recentJobs || 1)) * 100} />
                </div>
                <div
                  className="space-y-2 rounded-lg bg-muted/50 p-3"
                  title={t("queue.details.maxThroughput", { value: queue?.queueWithMaxThroughput?.throughput ?? 0 })}
                >
                  <p className="text-sm text-muted-foreground">{t("queue.details.jobsPerMinute")}</p>
                  <p className="text-2xl font-bold">{queue?.jobsPerMinute ?? 0}</p>
                  <ProgressBar
                    value={((queue?.jobsPerMinute ?? 0) / (queue?.queueWithMaxThroughput?.throughput || 1)) * 100}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("queue.jobDetails")}
            </CardTitle>
            <CardDescription>{t("queue.details.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">{t("queue.details.failedJobs7Days")}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer text-2xl font-bold text-destructive hover:underline"
                      title={t("queue.details.viewFailedJobs")}
                      role="button"
                      tabIndex={0}
                      onClick={() => setFailedOpen(true)}
                      onKeyDown={(event) => event.key === "Enter" && setFailedOpen(true)}
                      style={{ userSelect: "none" }}
                    >
                      {queue?.failedJobs ?? 0}
                    </span>
                    <Eye
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label={t("queue.details.viewFailedJobs")}
                      onClick={() => setFailedOpen(true)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("queue.details.retentionPeriod", { hours: queue?.periods?.failedJobs ?? 0 })}
                  </div>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">{t("queue.details.longestRunningQueue")}</p>
                  <p className="text-2xl font-bold">{queue?.queueWithMaxRuntime?.runtime ?? 0}s</p>
                  <div className="truncate text-xs text-muted-foreground">
                    {queue?.queueWithMaxRuntime?.name ?? "N/A"}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("queue.details.activeProcesses")}</span>
                  <span className="font-medium">
                    {queue?.processes ?? 0} / {(queue?.processes ?? 0) + (queue?.pausedMasters ?? 0)}
                  </span>
                </div>
                <ProgressBar
                  className="mt-2 h-1"
                  value={
                    ((queue?.processes ?? 0) / ((queue?.processes ?? 0) + (queue?.pausedMasters ?? 0) || 1)) * 100
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 失败任务详情弹窗 */}
      <Dialog open={failedOpen} onOpenChange={setFailedOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("queue.details.failedJobsDetailTitle")}</DialogTitle>
            <DialogDescription>{t("queue.details.description")}</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <DataTable table={table} showPagination isLoading={false} />
            {failedRows.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">{t("queue.details.noFailedJobs")}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailedOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单条失败任务详情 */}
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("queue.details.jobDetailTitle")}</DialogTitle>
            <DialogDescription>{t("queue.details.description")}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.id")}</h3>
                  <p className="break-all rounded-md bg-muted/50 p-2 text-sm">{detail.id}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.time")}</h3>
                  <p className="rounded-md bg-muted/50 p-2 text-sm">{formatTimestamp(detail.failed_at)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.queue")}</h3>
                  <p className="rounded-md bg-muted/50 p-2 text-sm">{detail.queue}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.connection")}</h3>
                  <p className="rounded-md bg-muted/50 p-2 text-sm">{detail.connection ?? "—"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.name")}</h3>
                <p className="break-all rounded-md bg-muted/50 p-2 text-sm">{detail.name}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.exception")}</h3>
                <div className="max-h-[200px] overflow-y-auto rounded-md bg-red-50 p-3 dark:bg-red-950/30">
                  <pre className="whitespace-pre-wrap text-xs text-red-700 dark:text-red-300">{detail.exception}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t("queue.details.payload")}</h3>
                <div className="max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-3">
                  <pre className="whitespace-pre-wrap break-all text-xs">{prettyJson(detail.payload)}</pre>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 原件 job detail 的 payload 美化（try JSON.parse / 原样） */
function prettyJson(payload: string | null | undefined): string {
  if (!payload) return "";
  try {
    const parsed: unknown = JSON.parse(payload);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return payload;
  }
}
