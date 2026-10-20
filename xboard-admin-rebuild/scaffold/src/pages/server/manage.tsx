import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
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
  type ColumnSizingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { IconArrowsRight } from "@tabler/icons-react";
import {
  Copy,
  Eye,
  EyeOff,
  Info,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Check,
  ChevronsUpDown,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Server,
  Settings2,
  ShieldOff,
  Trash2,
  WandSparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FacetedFilter,
  SECURE,
  apiGet,
  apiPost,
  boolFilter,
  formatBytes,
  makeSelectColumn,
  useDragSort,
  useSyncedRows,
} from "@/pages/_b/shared";

/**
 * 原件 `/server/manage`：页面组件 J5t（offset 6242245）→ 专属组件 X5t（2431B）
 * 列工厂 Z5t、工具栏 x5t/Q5t、行操作 B5t（bundle 539833 / 6206391 附近）。
 * 轮询：refetchInterval = !isSortMode && 3e4（原件 `refetchInterval:!g&&3e4`）。
 */

export interface NodeGroupRef {
  id: number;
  name: string;
}

export interface MachineRow {
  id: number;
  name: string;
  notes?: string | null;
  is_active?: boolean | number;
  last_seen_at?: number | null;
  servers_count?: number;
  load_status?: { updated_at?: number | null } | null;
}

export interface GroupRow {
  id: number;
  name: string;
  users_count?: number;
  server_count?: number;
}

/** 原件 `aD` 的路由组行（`/server/route/fetch`），弹窗「路由组」多选用 */
export interface RouteRow {
  id: number;
  remarks?: string | null;
  match?: string[];
  action?: string;
  action_value?: string | null;
}

export interface NodeRow {
  id: number;
  code?: string | null;
  name: string;
  type: string;
  host: string;
  port?: number | string;
  server_port?: number;
  rate?: number;
  online?: number;
  u?: number;
  d?: number;
  transfer_enable?: number;
  banned?: boolean | number;
  show?: boolean | number;
  machine_id?: number | null;
  sort?: number;
  groups?: NodeGroupRef[];
  /** 原件 name 列状态点（V5t 下标：0 异常 / 1 警告 / 2 正常） */
  available_status?: number;
  /** 原件 deployment 列的「节点停用」徽标取自 !enabled */
  enabled?: boolean | number;
  /* 以下为编辑弹窗回填所需字段（原件 `editingServer` 直接 spread 进表单） */
  group_ids?: number[];
  tags?: string[];
  route_ids?: number[];
  parent_id?: number | null;
  specific_key?: string | null;
  listen_address?: string | null;
  rate_time_enable?: boolean | number | null;
  rate_time_ranges?: unknown;
  protocol_settings?: unknown;
  excludes?: string[];
  ips?: string[];
  custom_outbounds?: unknown[];
  custom_routes?: unknown[];
}

/* 端点（bundle 539833） */
const fetchNodes = () => apiGet<{ data?: NodeRow[] }>(`${SECURE}/server/manage/getNodes`);
const fetchGroups = () => apiGet<{ data?: GroupRow[] }>(`${SECURE}/server/group/fetch`);
const fetchRoutes = () => apiGet<{ data?: RouteRow[] }>(`${SECURE}/server/route/fetch`);
/** 原件 `tD`（bundle 539,993；唯一调用点 6,092,427 = ECH 面板） */
const generateEchKey = () =>
  apiGet<{ data?: { key?: string; config?: string } }>(`${SECURE}/server/manage/generateEchKey`);
const fetchMachines = () => apiGet<{ data?: MachineRow[] }>(`${SECURE}/server/machine/fetch`);
const saveNode = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/manage/save`, body);
const dropNode = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/manage/drop`, body);
const copyNode = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/manage/copy`, body);
const updateNode = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/update`, body);
const sortNodes = (payload: Array<{ id: number; order: number }>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/sort`, payload);
const resetNodeTraffic = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/resetTraffic`, body);
const batchDeleteNodes = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/batchDelete`, body);
const batchResetTraffic = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/batchResetTraffic`, body);
const batchUpdateNodes = (body: Record<string, unknown>) =>
  apiPost<{ data?: unknown }>(`${SECURE}/server/manage/batchUpdate`, body);

/** 原件 iqt 协议枚举 */
const NODE_TYPES = [
  { value: "shadowsocks", label: "Shadowsocks", color: "#489851" },
  { value: "vmess", label: "VMess", color: "#CB3180" },
  { value: "trojan", label: "Trojan", color: "#EBB749" },
  { value: "hysteria", label: "Hysteria", color: "#5684e6" },
  { value: "vless", label: "VLess", color: "#1a1a1a" },
  { value: "tuic", label: "TUIC", color: "#00C853" },
  { value: "socks", label: "SOCKS", color: "#2196F3" },
  { value: "naive", label: "Naive", color: "#9C27B0" },
  { value: "http", label: "HTTP", color: "#FF5722" },
  { value: "mieru", label: "Mieru", color: "#4CAF50" },
  { value: "anytls", label: "AnyTLS", color: "#7E57C2" },
];

/**
 * 原件 V5t（bundle offset 6218988）：节点可用状态点配色，索引 = `available_status`。
 * 数据里缺该字段时下标为 -1，类名不生效（圆点透明），与原件 `V5t[undefined]` 一致。
 */
const AVAILABLE_STATUS: Record<number, string> = {
  0: "bg-destructive/80 shadow-sm shadow-destructive/50",
  1: "bg-yellow-500/80 shadow-sm shadow-yellow-500/50",
  2: "bg-emerald-500/80 shadow-sm shadow-emerald-500/50",
};

/** 原件 g5t（bundle offset 6185628）：服务器在线状态推导 */
function machineStatus(machine: MachineRow): "online" | "offline" | "inactive" | "never" {
  if (!machine.is_active) return "inactive";
  if (!machine.last_seen_at) return "never";
  return Date.now() / 1000 - machine.last_seen_at < 300 ? "online" : "offline";
}

/** 原件 u5t（bundle offset 6185017）：状态点配色 */
const MACHINE_STATUS: Record<string, { dot: string }> = {
  online: { dot: "bg-emerald-500" },
  offline: { dot: "bg-red-500" },
  inactive: { dot: "bg-slate-400" },
  never: { dot: "bg-slate-400" },
};

/** 原件 K5t（bundle offset 6230971）：状态徽标配色 */
const MACHINE_STATUS_CLASS: Record<string, string> = {
  online: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  inactive: "border-border bg-muted/50 text-muted-foreground",
  offline: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  never: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

/* ------------------------------------------------------------------ *
 * 新建 / 编辑节点弹窗 —— 原件 `v5t`（bundle 6,186,234–6,204,476）
 * 段落、类名、文案键、提交体逐段对齐原件；schema 见原件 `py({...})`（6,186,4xx）。
 * ------------------------------------------------------------------ */

/** 原件 schema 的 `rate_time_ranges` 项（动态倍率规则） */
export interface NodeRateRule {
  start: string;
  end: string;
  rate: string;
}

/** 原件 schema `n` 的字段集合；提交体 = 本对象去掉 `transfer_enable_gb`，再补 `type` / `transfer_enable` */
export interface NodeFormValues {
  id: number | null;
  specific_key: string | null;
  code: string;
  show: boolean | number | null;
  name: string;
  rate: string;
  rate_time_enable: boolean;
  rate_time_ranges: NodeRateRule[];
  tags: string[];
  transfer_enable_gb: string;
  banned: boolean | number;
  excludes: string[];
  ips: string[];
  group_ids: Array<string | number>;
  host: string;
  port: string;
  server_port: string;
  parent_id: string | null;
  route_ids: Array<string | number>;
  custom_outbounds: SettingsValue[];
  custom_routes: SettingsValue[];
  protocol_settings: ProtocolSettings | null;
  listen_address: string;
  machine_id: number | null;
  enabled: boolean | null;
}

/** 原件 `i`（defaultValues，6,186,9xx） */
function emptyNodeForm(): NodeFormValues {
  return {
    id: null,
    specific_key: null,
    code: "",
    show: false,
    name: "",
    rate: "1",
    rate_time_enable: false,
    rate_time_ranges: [],
    tags: [],
    transfer_enable_gb: "",
    banned: false,
    excludes: [],
    ips: [],
    group_ids: [],
    host: "",
    port: "",
    server_port: "",
    parent_id: "0",
    route_ids: [],
    custom_outbounds: [],
    custom_routes: [],
    protocol_settings: {},
    listen_address: "",
    machine_id: null,
    enabled: null,
  };
}

/** 原件 FormItem（`cn("space-y-2", className)`） */
function FieldShell({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

/** 原件 FormMessage：无错误时不渲染，默认 `text-[0.8rem] font-medium text-destructive` */
function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return <p className={cn("text-[0.8rem] font-medium text-destructive", className)}>{message}</p>;
}

interface MultiSelectOption {
  label: string;
  value: string;
}

/**
 * 原件 `a4t`（MultipleSelector，bundle 6,073,341）的等效实现：
 * 闭合态 = `rounded-md border border-input` 盒子 + 已选徽标 + 输入框（原件同样带搜索输入框），
 * 展开态改用 Popover + 复选行（重建工程没有 cmdk 版 MultipleSelector）。
 */
function MultiSelect({
  value,
  options,
  placeholder,
  emptyText,
  onChange,
  className,
}: {
  value: Array<string | number>;
  options: MultiSelectOption[];
  placeholder: string;
  emptyText: string;
  onChange: (next: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selected = value
    .map((item) => options.find((option) => option.value === item))
    .filter((option): option is MultiSelectOption => Boolean(option));
  const filtered = options.filter((option) => option.label.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (next: string) => {
    const strings = value.filter((item): item is string => typeof item === "string");
    onChange(value.includes(next) ? strings.filter((item) => item !== next) : [...strings, next]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex w-full cursor-text flex-wrap items-center gap-1 rounded-md border border-input text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring",
            selected.length === 0 ? undefined : "px-3 py-2",
            className,
          )}
        >
          {selected.map((option) => (
            <Badge key={option.value} className="gap-1 font-mono">
              {option.label}
              <button
                type="button"
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggle(option.value);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(true);
            }}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
              selected.length === 0 ? "px-3 py-2" : "ml-1 pr-6",
            )}
          />
          {selected.length > 0 ? (
            <button
              type="button"
              aria-label="clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-accent"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange([]);
              }}
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-center font-mono text-xs leading-10 text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={value.includes(option.value)}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                onClick={() => toggle(option.value)}
              >
                <Checkbox checked={value.includes(option.value)} className="pointer-events-none" />
                <span className="font-mono text-xs">{option.label}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ================================================================== *
 * 协议专属设置面板 + 「高级设置」弹窗
 * 原件：o5t(6,171,396) 渲染器、s5t(6,170,609) 协议表、l5t(6,178,032) 高级设置、
 *       a5t(6,172,273) TLS/证书面板、w4t(6,094,216) 多路复用、x4t(6,091,627) ECH、
 *       y4t(6,090,202) uTLS、m4t(6,086,016) 网络配置 JSON 弹窗
 * ================================================================== */

/** 协议设置是自由 JSON（原件 `protocol_settings` 由 zod 逐协议校验，类型不固定） */
type SettingsValue = string | number | boolean | null | SettingsValue[] | { [key: string]: SettingsValue };
type ProtocolSettings = { [key: string]: SettingsValue };

function settingGet(source: ProtocolSettings, path: string): unknown {
  let cursor: unknown = source;
  for (const key of path.split(".")) {
    if (cursor == null || typeof cursor !== "object" || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}

function settingSet(source: ProtocolSettings, path: string, value: SettingsValue): ProtocolSettings {
  const keys = path.split(".");
  const write = (node: ProtocolSettings, index: number): ProtocolSettings => {
    const key = keys[index];
    if (index === keys.length - 1) return { ...node, [key]: value };
    const child = node[key];
    const nextChild =
      child && typeof child === "object" && !Array.isArray(child) ? (child as ProtocolSettings) : {};
    return { ...node, [key]: write(nextChild, index + 1) };
  };
  return write(source, 0);
}

/** 原件 zod `.default()` 的等价物：把稀疏对象补齐 */
function mergeSettings(base: ProtocolSettings, override: unknown): ProtocolSettings {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const next: ProtocolSettings = { ...base };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const current = next[key];
    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      next[key] = mergeSettings(current as ProtocolSettings, value);
    } else {
      next[key] = value as SettingsValue;
    }
  }
  return next;
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
const asNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return 0;
};
const asBool = (value: unknown): boolean => value === true || value === 1 || value === "1";
const asTextList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const asSettingsList = (value: unknown): SettingsValue[] => (Array.isArray(value) ? (value as SettingsValue[]) : []);
/** 原件 Select 的 value 一律取 `?.toString()`：非字符串值（如历史对象）会渲染成空显示而非 placeholder */
const asSelectValue = (value: unknown): string | undefined => (value == null ? undefined : String(value));

/* ---------------------------- 原件选项表 ---------------------------- */

/** 原件 `g4t` */
const SS_CIPHERS = [
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
  "chacha20-ietf-poly1305",
  "2022-blake3-aes-128-gcm",
  "2022-blake3-aes-256-gcm",
  "2022-blake3-chacha20-poly1305",
];
const SS_PLUGINS = [
  { value: "none", label: "None" },
  { value: "obfs", label: "Simple Obfs" },
  { value: "v2ray-plugin", label: "V2Ray Plugin" },
  { value: "gost-plugin", label: "Gost Plugin" },
  { value: "shadow-tls", label: "Shadow TLS" },
  { value: "restls", label: "ReSTLS" },
  { value: "kcptun", label: "KCPTun" },
];
const SS_FINGERPRINTS = [
  { value: "chrome", label: "Chrome" },
  { value: "firefox", label: "Firefox" },
  { value: "safari", label: "Safari" },
  { value: "ios", label: "iOS" },
];
/** 原件 `b4t` */
const UTLS_FINGERPRINTS = [...SS_FINGERPRINTS, { value: "edge", label: "Edge" }, { value: "random", label: "Random" }];
/** 原件 `S4t`（vmess）/ `P4t`（vless）/ `H4t`（trojan） */
const NET_OPTIONS_VMESS = [
  { value: "tcp", label: "TCP" },
  { value: "ws", label: "Websocket" },
  { value: "grpc", label: "gRPC" },
  { value: "h2", label: "HTTP/2" },
  { value: "httpupgrade", label: "HttpUpgrade" },
  { value: "xhttp", label: "XHTTP" },
];
const NET_OPTIONS_VLESS = [
  { value: "tcp", label: "TCP" },
  { value: "ws", label: "Websocket" },
  { value: "grpc", label: "gRPC" },
  { value: "h2", label: "HTTP/2" },
  { value: "kcp", label: "mKCP" },
  { value: "httpupgrade", label: "HttpUpgrade" },
  { value: "xhttp", label: "XHTTP" },
];
const VLESS_FLOWS = ["none", "xtls-rprx-direct", "xtls-rprx-splice", "xtls-rprx-vision"];
/** 原件 `B4t` / `$4t` / `i5t` */
const HYSTERIA_VERSIONS = ["1", "2"];
const HYSTERIA_ALPN = ["hysteria", "http/1.1", "h2", "h3"];
const TUIC_VERSIONS = ["5", "4"];
const TUIC_CONGESTION = ["bbr", "cubic", "new_reno"];
const TUIC_ALPN = [
  { value: "h3", label: "HTTP/3" },
  { value: "h2", label: "HTTP/2" },
  { value: "http/1.1", label: "HTTP/1.1" },
];
const TUIC_UDP_RELAY = [
  { value: "native", label: "Native" },
  { value: "quic", label: "QUIC" },
];
const MIERU_TRANSPORT = [
  { value: "TCP", label: "TCP" },
  { value: "UDP", label: "UDP" },
];
/** 原件 `G4t`（anytls 默认填充方案） */
const ANYTLS_DEFAULT_PADDING = [
  "stop=8",
  "0=30-30",
  "1=100-400",
  "2=400-500,c,500-1000,c,500-1000,c,500-1000,c,500-1000",
  "3=9-9,500-1000",
  "4=500-1000",
  "5=500-1000",
  "6=500-1000",
  "7=500-1000",
];
/** 原件 `m4t` 内置的 network_settings 模板 */
const NETWORK_TEMPLATES: Record<string, { label: string; content: SettingsValue }> = {
  tcp: { label: "TCP", content: { acceptProxyProtocol: false, header: { type: "none" } } },
  "tcp-http": {
    label: "TCP + HTTP",
    content: {
      acceptProxyProtocol: false,
      header: {
        type: "http",
        request: { version: "1.1", method: "GET", path: ["/"], headers: { Host: ["www.example.com"] } },
        response: { version: "1.1", status: "200", reason: "OK" },
      },
    },
  },
  grpc: { label: "gRPC", content: { serviceName: "GunService" } },
  ws: { label: "WebSocket", content: { path: "/", headers: { Host: "v2ray.com" } } },
  h2: { label: "HTTP/2", content: { path: "/", host: ["www.google.com"] } },
  httpupgrade: {
    label: "HttpUpgrade",
    content: { acceptProxyProtocol: false, path: "/", host: "xray.com", headers: { key: "value" } },
  },
  xhttp: {
    label: "XHTTP",
    content: {
      host: "example.com",
      path: "/yourpath",
      mode: "auto",
      extra: {
        headers: {},
        xPaddingBytes: "100-1000",
        noGRPCHeader: false,
        noSSEHeader: false,
        scMaxEachPostBytes: 1000000,
        scMinPostsIntervalMs: 30,
        scMaxBufferedPosts: 30,
        xmux: {
          maxConcurrency: "16-32",
          maxConnections: 0,
          cMaxReuseTimes: "64-128",
          cMaxLifetimeMs: 0,
          hMaxRequestTimes: "800-900",
          hKeepAlivePeriod: 0,
        },
        downloadSettings: {
          address: "",
          port: 443,
          network: "xhttp",
          security: "tls",
          tlsSettings: {},
          xhttpSettings: { path: "/yourpath" },
          sockopt: {},
        },
      },
    },
  },
};

function networkTemplateKeys(type: string): string[] {
  switch (type) {
    case "tcp":
      return ["tcp", "tcp-http"];
    case "grpc":
      return ["grpc"];
    case "ws":
      return ["ws"];
    case "h2":
      return ["h2"];
    case "httpupgrade":
      return ["httpupgrade"];
    case "xhttp":
      return ["xhttp"];
    default:
      return [];
  }
}

/** 原件各协议 `py({...})` 的 `.default()` 展开值 */
function protocolDefaults(type: string): ProtocolSettings {
  const certConfig: ProtocolSettings = {
    cert_mode: "none",
    domain: "",
    email: "",
    dns_provider: "",
    dns_env: {},
    http_port: 80,
    cert_content: "",
    key_content: "",
  };
  const ech = { enabled: false, config: "", query_server_name: "", key: "" };
  const tlsSettings = { server_name: "", allow_insecure: false, ech };
  const utls = { enabled: false, fingerprint: "chrome" };
  const multiplex = {
    enabled: false,
    protocol: "smux",
    max_connections: 4,
    padding: false,
    brutal: { enabled: false, up_mbps: 100, down_mbps: 100 },
  };
  const routing: ProtocolSettings = {};
  switch (type) {
    case "shadowsocks":
      return { cipher: "aes-128-gcm", plugin: "", plugin_opts: "", client_fingerprint: "chrome", routing };
    case "vmess":
      return {
        tls: 0,
        tls_settings: tlsSettings,
        utls,
        cert_config: certConfig,
        network: "tcp",
        network_settings: {},
        multiplex,
        routing,
      };
    case "vless":
      return {
        tls: 0,
        tls_settings: tlsSettings,
        utls,
        cert_config: certConfig,
        reality_settings: {
          server_port: 443,
          server_name: "",
          allow_insecure: false,
          public_key: "",
          private_key: "",
          short_id: "",
          fingerprint: "chrome",
        },
        network: "tcp",
        network_settings: {},
        flow: "",
        multiplex,
        routing,
        encryption: { enabled: false, encryption: "", decryption: "" },
      };
    case "trojan":
      return {
        tls: 1,
        tls_settings: tlsSettings,
        server_name: "",
        allow_insecure: false,
        reality_settings: {
          server_port: 443,
          server_name: "",
          allow_insecure: false,
          public_key: "",
          private_key: "",
          short_id: "",
        },
        utls,
        network: "tcp",
        network_settings: {},
        cert_config: certConfig,
        multiplex,
        routing,
      };
    case "hysteria":
      return {
        version: 2,
        alpn: "h2",
        obfs: { open: false, type: "salamander", password: "" },
        tls: tlsSettings,
        cert_config: certConfig,
        bandwidth: { up: "", down: "" },
        routing,
      };
    case "tuic":
      return {
        version: 5,
        congestion_control: "bbr",
        alpn: ["h3"],
        udp_relay_mode: "native",
        tls: tlsSettings,
        cert_config: certConfig,
        routing,
      };
    case "anytls":
      return { padding_scheme: [], tls: tlsSettings, cert_config: certConfig, routing };
    case "socks":
      return { routing };
    case "http":
    case "naive":
      return { tls: 0, tls_settings: tlsSettings, cert_config: certConfig, routing };
    case "mieru":
      return { transport: "TCP", traffic_pattern: "", routing };
    default:
      return {};
  }
}

/** 原件 `cert_path` / `has_multiplex`：`"cert_config" in s5t[type].schema.shape` */
const CERT_CONFIG_PROTOCOLS = ["vmess", "vless", "trojan", "hysteria", "tuic", "anytls", "http", "naive"];
const MULTIPLEX_PROTOCOLS = ["vmess", "vless", "trojan"];

/* ---------------------------- 面板基础件 ---------------------------- */

function PanelItem({
  className,
  label,
  children,
}: {
  className?: string;
  label: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label}
      {children}
    </div>
  );
}

function PanelLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Label className={cn("font-mono text-[12px] text-foreground/80", className)}>{children}</Label>;
}

/** 原件 FormDescription：`cn("text-[0.8rem] text-muted-foreground", className)` */
function PanelDesc({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <p className={cn("text-[0.8rem] text-muted-foreground", className)}>{children}</p>;
}

interface PanelOption {
  value: string;
  label: string;
}

function PanelSelect({
  value,
  onChange,
  placeholder,
  options,
  triggerClassName,
  itemClassName,
  className,
}: {
  value: string | undefined;
  onChange: (next: string) => void;
  placeholder?: string;
  options: Array<string | PanelOption>;
  triggerClassName?: string;
  itemClassName?: string;
  className?: string;
}) {
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("font-mono text-xs", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className={itemClassName}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** 面板字段读写 API（对应原件 RHF form 实例的 watch / setValue） */
interface PanelApi {
  get: (path: string) => unknown;
  /** 函数式写入：同一事件里连续 set 多个路径不会互相覆盖 */
  set: (path: string, value: SettingsValue) => void;
}
type SettingsMutator = (current: ProtocolSettings) => ProtocolSettings;

/* ------------------------ 公共块：uTLS / ECH ------------------------ */

/** 原件 `y4t` */
function UtlsBlock({ api, prefix = "utls" }: { api: PanelApi; prefix?: string }) {
  const { t } = useTranslation(["server", "common"]);
  const enabled = asBool(api.get(`${prefix}.enabled`));
  return (
    <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
      <PanelItem
        className="flex flex-row items-center justify-between"
        label={
          <div className="space-y-0.5">
            <Label className="text-[13px] font-mono font-bold">uTLS</Label>
            <PanelDesc className="text-[11px] font-mono opacity-70">
              {t("dynamic_form.shadowsocks.client_fingerprint_description", { defaultValue: "" })}
            </PanelDesc>
          </div>
        }
      >
        <Switch
          checked={enabled}
          onCheckedChange={(checked: boolean) => {
            api.set(`${prefix}.enabled`, checked);
            if (checked && !api.get(`${prefix}.fingerprint`)) api.set(`${prefix}.fingerprint`, "chrome");
          }}
        />
      </PanelItem>
      {enabled ? (
        <div className="border-t border-dashed pt-2">
          <PanelItem
            label={
              <PanelLabel>
                {t("dynamic_form.shadowsocks.client_fingerprint", { defaultValue: "客户端指纹" })} (uTLS)
              </PanelLabel>
            }
          >
            <PanelSelect
              value={asText(api.get(`${prefix}.fingerprint`)) || "chrome"}
              onChange={(next) => api.set(`${prefix}.fingerprint`, next)}
              placeholder={t("dynamic_form.shadowsocks.client_fingerprint_placeholder", { defaultValue: "" })}
              options={UTLS_FINGERPRINTS}
              triggerClassName="h-8 text-xs font-mono"
              itemClassName="text-xs font-mono"
            />
          </PanelItem>
        </div>
      ) : null}
    </div>
  );
}

/** 原件 `x4t`：ECH（「生成 ECH 密钥」= `/server/manage/generateEchKey`，bundle 6,092,427 唯一调用点） */
function EchBlock({ api, prefix = "ech" }: { api: PanelApi; prefix?: string }) {
  const { t } = useTranslation(["server", "common"]);
  const enabled = asBool(api.get(`${prefix}.enabled`));
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
      <PanelItem
        className="flex flex-row items-center justify-between"
        label={
          <div className="space-y-0.5">
            <Label className="text-[13px] font-mono font-bold">ECH</Label>
            <PanelDesc className="text-[11px] font-mono opacity-70">
              {t("dynamic_form.ech.description", { defaultValue: "" })}
            </PanelDesc>
          </div>
        }
      >
        <Switch checked={enabled} onCheckedChange={(checked: boolean) => api.set(`${prefix}.enabled`, checked)} />
      </PanelItem>
      {enabled ? (
        <div className="space-y-4 border-t border-dashed pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            className="w-full font-mono text-xs"
            onClick={async () => {
              setBusy(true);
              try {
                const body = await generateEchKey();
                if (body.data) {
                  api.set(`${prefix}.key`, asText(body.data.key));
                  api.set(`${prefix}.config`, asText(body.data.config));
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? (
              <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <WandSparkles className="mr-2 h-3.5 w-3.5" />
            )}
            {t("dynamic_form.ech.generate", { defaultValue: "自动生成 ECH 密钥对" })}
          </Button>
          <PanelItem
            label={<PanelLabel>{t("dynamic_form.ech.config.label", { defaultValue: "ECH 配置 (PEM)" })}</PanelLabel>}
          >
            <Textarea
              className="min-h-[120px] resize-y font-mono text-xs"
              value={asText(api.get(`${prefix}.config`))}
              onChange={(event) => api.set(`${prefix}.config`, event.target.value)}
              placeholder={t("dynamic_form.ech.config.placeholder", { defaultValue: "" })}
            />
            <PanelDesc className="text-[10px] font-mono opacity-70">
              {t("dynamic_form.ech.config.description", { defaultValue: "" })}
            </PanelDesc>
          </PanelItem>
          <PanelItem label={<PanelLabel>{t("dynamic_form.ech.key.label", { defaultValue: "ECH Key" })}</PanelLabel>}>
            <Textarea
              className="min-h-[100px] resize-y font-mono text-xs"
              value={asText(api.get(`${prefix}.key`))}
              onChange={(event) => api.set(`${prefix}.key`, event.target.value)}
              placeholder={t("dynamic_form.ech.key.placeholder", { defaultValue: "" })}
            />
            <PanelDesc className="text-[10px] font-mono opacity-70">
              {t("dynamic_form.ech.key.description", { defaultValue: "" })}
            </PanelDesc>
          </PanelItem>
          <PanelItem
            label={
              <PanelLabel>{t("dynamic_form.ech.query_server_name.label", { defaultValue: "ECH 查询域名" })}</PanelLabel>
            }
          >
            <Input
              className="h-8 font-mono text-xs"
              value={asText(api.get(`${prefix}.query_server_name`))}
              onChange={(event) => api.set(`${prefix}.query_server_name`, event.target.value)}
              placeholder={t("dynamic_form.ech.query_server_name.placeholder", { defaultValue: "" })}
            />
            <PanelDesc className="text-[10px] font-mono opacity-70">
              {t("dynamic_form.ech.query_server_name.description", { defaultValue: "" })}
            </PanelDesc>
          </PanelItem>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------- 公共块：网络类型 + JSON 配置 --------------------- */

/** 原件 `m4t`：网络配置 JSON 弹窗 */
function NetworkJsonDialog({
  value,
  templateType,
  onSave,
}: {
  value: unknown;
  templateType: string;
  onSave: (next: ProtocolSettings | null) => void;
}) {
  const { t } = useTranslation(["server", "common"]);
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const format = (source: unknown): string => {
    if (!source || typeof source !== "object" || Object.keys(source as Record<string, unknown>).length === 0) return "";
    try {
      return JSON.stringify(source, null, 2);
    } catch {
      return "";
    }
  };

  React.useEffect(() => {
    if (open) setText(format(value));
    // 仅在打开时同步一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = (raw: string): string | null => {
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed !== "object" || parsed === null
        ? t("network_settings.validation.must_be_object", { defaultValue: "配置必须是一个JSON对象" })
        : null;
    } catch {
      return t("network_settings.validation.invalid_json", { defaultValue: "无效的JSON格式" });
    }
  };

  const save = () => {
    const message = validate(text);
    if (message) {
      toast.error(message);
      return;
    }
    if (!text) {
      onSave(null);
      setOpen(false);
      return;
    }
    try {
      onSave(JSON.parse(text) as ProtocolSettings);
      setOpen(false);
    } catch {
      toast.error(t("network_settings.errors.save_failed", { defaultValue: "保存时发生错误" }));
    }
  };

  const templates = networkTemplateKeys(templateType);

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next && open) save();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="link">
          {t("network_settings.edit_protocol", { defaultValue: "编辑协议" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("network_settings.edit_protocol_config", { defaultValue: "编辑协议配置" })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {templates.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {templates.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setText(JSON.stringify(NETWORK_TEMPLATES[key].content, null, 2));
                    setError(null);
                  }}
                >
                  {t("network_settings.use_template", {
                    defaultValue: "使用{{template}}模板",
                    template: NETWORK_TEMPLATES[key].label,
                  })}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="space-y-2">
            <Textarea
              className={cn("min-h-[200px] font-mono text-sm", error && "border-red-500 focus-visible:ring-red-500")}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setError(null);
              }}
              placeholder={
                templates.length > 0
                  ? t("network_settings.json_config_placeholder_with_template", {
                      defaultValue: "请输入JSON配置或选择上方模板",
                    })
                  : t("network_settings.json_config_placeholder", { defaultValue: "请输入JSON配置" })
              }
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel", { defaultValue: "取消" })}
          </Button>
          <Button type="button" onClick={save} disabled={Boolean(error)}>
            {t("common.save", { defaultValue: "Save" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 网络类型字段（原件 `network` + 标题里的模板入口） */
function NetworkField({
  api,
  options,
  defaultTemplateType,
}: {
  api: PanelApi;
  options: PanelOption[];
  defaultTemplateType?: string;
}) {
  const { t } = useTranslation(["server", "common"]);
  return (
    <PanelItem
      label={
        <PanelLabel>
          {t("dynamic_form.vmess.network.label", { defaultValue: "传输协议" })}
          <NetworkJsonDialog
            value={api.get("network_settings")}
            templateType={asText(api.get("network")) || (defaultTemplateType ?? "")}
            onSave={(next) => api.set("network_settings", next ?? {})}
          />
        </PanelLabel>
      }
    >
      <PanelSelect
        value={asText(api.get("network"))}
        onChange={(next) => api.set("network", next)}
        placeholder={t("dynamic_form.vmess.network.placeholder", { defaultValue: "" })}
        options={options}
        itemClassName="cursor-pointer"
      />
    </PanelItem>
  );
}

/* ------------------------- reality 密钥工具 ------------------------- */

/** base64url（原件 `R4t`：`+`→`-`，`/`→`_`，去掉 `=`） */
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const X25519_P = 2n ** 255n - 19n;
const x25519Mod = (value: bigint): bigint => ((value % X25519_P) + X25519_P) % X25519_P;
const x25519Pow = (base: bigint, exponent: bigint): bigint => {
  let result = 1n;
  let factor = x25519Mod(base);
  let power = exponent;
  while (power > 0n) {
    if (power & 1n) result = x25519Mod(result * factor);
    factor = x25519Mod(factor * factor);
    power >>= 1n;
  }
  return result;
};

/** RFC 7748 X25519（原件用 tweetnacl `box.keyPair()`，这里用 BigInt 等价实现，零依赖） */
function x25519(scalarBytes: Uint8Array, uBytes: Uint8Array): Uint8Array {
  const scalar = new Uint8Array(scalarBytes);
  scalar[0] &= 248;
  scalar[31] &= 127;
  scalar[31] |= 64;
  let k = 0n;
  for (let index = 31; index >= 0; index -= 1) k = (k << 8n) | BigInt(scalar[index]);
  const u = new Uint8Array(uBytes);
  u[31] &= 127;
  let x1 = 0n;
  for (let index = 31; index >= 0; index -= 1) x1 = (x1 << 8n) | BigInt(u[index]);

  let x2 = 1n;
  let z2 = 0n;
  let x3 = x1;
  let z3 = 1n;
  let swap = 0n;
  for (let bit = 254; bit >= 0; bit -= 1) {
    const current = (k >> BigInt(bit)) & 1n;
    swap ^= current;
    if (swap === 1n) {
      [x2, x3] = [x3, x2];
      [z2, z3] = [z3, z2];
    }
    swap = current;
    const a = x25519Mod(x2 + z2);
    const aa = x25519Mod(a * a);
    const b = x25519Mod(x2 - z2);
    const bb = x25519Mod(b * b);
    const e = x25519Mod(aa - bb);
    const c = x25519Mod(x3 + z3);
    const d = x25519Mod(x3 - z3);
    const da = x25519Mod(d * a);
    const cb = x25519Mod(c * b);
    x3 = x25519Mod((da + cb) * (da + cb));
    z3 = x25519Mod(x1 * x25519Mod((da - cb) * (da - cb)));
    x2 = x25519Mod(aa * bb);
    z2 = x25519Mod(e * x25519Mod(aa + 121665n * e));
  }
  if (swap === 1n) {
    [x2, x3] = [x3, x2];
    [z2, z3] = [z3, z2];
  }
  let result = x25519Mod(x2 * x25519Pow(z2, X25519_P - 2n));
  const out = new Uint8Array(32);
  for (let index = 0; index < 32; index += 1) {
    out[index] = Number(result & 255n);
    result >>= 8n;
  }
  return out;
}

function x25519KeyPair(): { privateKey: string; publicKey: string } {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  const base = new Uint8Array(32);
  base[0] = 9;
  return { privateKey: toBase64Url(secret), publicKey: toBase64Url(x25519(secret, base)) };
}

/** 原件 mieru 流量特征生成器（`r5t` 内联实现：varint + protobuf 包裹 + base64） */
function mieruTrafficPattern(): string {
  const encodeVarint = (value: number): number[] => {
    const out: number[] = [];
    let rest = value;
    while (rest >= 128) {
      out.push((127 & rest) | 128);
      rest >>>= 7;
    }
    out.push(rest);
    return out;
  };
  const minLength = Math.floor(101 * Math.random()) + 100;
  const maxLength = Math.floor(201 * Math.random()) + 400;
  const body = [8, ...encodeVarint(minLength), 16, ...encodeVarint(maxLength)];
  const payload = [10, ...encodeVarint(body.length), ...body];
  let text = "";
  for (const byte of payload) text += String.fromCharCode(byte);
  return btoa(text);
}

/** 原件 `M4t`：`2 * floor(8 * random) + 2` 位十六进制 short id */
function randomShortId(): string {
  const length = 2 * Math.floor(8 * Math.random()) + 2;
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length);
}

/* --------------------------- 协议专属面板 --------------------------- */

/** 原件 vless / trojan 的 reality 字段组 */
function RealityFields({ api, prefix = "reality_settings" }: { api: PanelApi; prefix?: string }) {
  const { t } = useTranslation(["server", "common"]);
  return (
    <>
      <div className="flex gap-2">
        <PanelItem
          className="flex-[2]"
          label={
            <PanelLabel>{t("dynamic_form.vless.reality_settings.server_name.label", { defaultValue: "目标域名" })}</PanelLabel>
          }
        >
          <Input
            className="font-mono text-xs"
            placeholder={t("dynamic_form.vless.reality_settings.server_name.placeholder", { defaultValue: "" })}
            value={asText(api.get(`${prefix}.server_name`))}
            onChange={(event) => api.set(`${prefix}.server_name`, event.target.value)}
          />
        </PanelItem>
        <PanelItem
          className="flex-1"
          label={
            <PanelLabel>{t("dynamic_form.vless.reality_settings.server_port.label", { defaultValue: "目标端口" })}</PanelLabel>
          }
        >
          <Input
            className="font-mono text-xs"
            placeholder={t("dynamic_form.vless.reality_settings.server_port.placeholder", { defaultValue: "" })}
            value={asText(api.get(`${prefix}.server_port`))}
            onChange={(event) => api.set(`${prefix}.server_port`, event.target.value)}
          />
        </PanelItem>
        <PanelItem label={<PanelLabel>{t("dynamic_form.vless.reality_settings.allow_insecure", { defaultValue: "允许不安全" })}</PanelLabel>}>
          <div className="py-2 text-center">
            <Switch
              checked={asBool(api.get(`${prefix}.allow_insecure`))}
              onCheckedChange={(checked: boolean) => api.set(`${prefix}.allow_insecure`, checked)}
            />
          </div>
        </PanelItem>
      </div>
      <div className="flex items-end gap-2">
        <PanelItem
          className="flex-1"
          label={
            <PanelLabel>{t("dynamic_form.vless.reality_settings.private_key.label", { defaultValue: "私钥" })}</PanelLabel>
          }
        >
          <div className="relative">
            <Input
              className="pr-9 font-mono text-xs"
              value={asText(api.get(`${prefix}.private_key`))}
              onChange={(event) => api.set(`${prefix}.private_key`, event.target.value)}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-2 transition-transform duration-150 active:scale-90"
                  onClick={() => {
                    try {
                      const pair = x25519KeyPair();
                      api.set(`${prefix}.private_key`, pair.privateKey);
                      api.set(`${prefix}.public_key`, pair.publicKey);
                      toast.success(t("dynamic_form.vless.reality_settings.key_pair.success", { defaultValue: "密钥对已生成" }));
                    } catch {
                      toast.error(t("dynamic_form.vless.reality_settings.key_pair.error", { defaultValue: "生成失败" }));
                    }
                  }}
                >
                  <KeyRound className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("dynamic_form.vless.reality_settings.key_pair.generate", { defaultValue: "生成密钥对" })}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </PanelItem>
      </div>
      <PanelItem
        label={
          <PanelLabel>{t("dynamic_form.vless.reality_settings.public_key.label", { defaultValue: "公钥" })}</PanelLabel>
        }
      >
        <Input
          className="font-mono text-xs"
          value={asText(api.get(`${prefix}.public_key`))}
          onChange={(event) => api.set(`${prefix}.public_key`, event.target.value)}
        />
      </PanelItem>
      <PanelItem
        label={
          <PanelLabel>{t("dynamic_form.vless.reality_settings.short_id.label", { defaultValue: "Short ID" })}</PanelLabel>
        }
      >
        <div className="relative">
          <Input
            className="pr-9 font-mono text-xs"
            placeholder={t("dynamic_form.vless.reality_settings.short_id.placeholder", { defaultValue: "" })}
            value={asText(api.get(`${prefix}.short_id`))}
            onChange={(event) => api.set(`${prefix}.short_id`, event.target.value)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 transition-transform duration-150 active:scale-90"
                onClick={() => {
                  api.set(`${prefix}.short_id`, randomShortId());
                  toast.success(t("dynamic_form.vless.reality_settings.short_id.success", { defaultValue: "已生成" }));
                }}
              >
                <RefreshCw className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("dynamic_form.vless.reality_settings.short_id.generate", { defaultValue: "随机生成" })}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <PanelDesc className="font-mono text-[11px] text-xs text-foreground/80 opacity-70">
          {t("dynamic_form.vless.reality_settings.short_id.description", { defaultValue: "" })}
        </PanelDesc>
      </PanelItem>
    </>
  );
}

/** 原件 `P$t`/`j$t`/`B$t`：shadowsocks 加密方式下拉（可搜索 + 自定义） */
function CipherCombobox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const { t } = useTranslation(["server", "common"]);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const keyword = search.trim().toLowerCase();
  const filtered = SS_CIPHERS.filter((cipher) => cipher.toLowerCase().includes(keyword));
  const custom = search.trim() && !SS_CIPHERS.includes(search.trim()) ? search.trim() : "";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-mono text-xs", !value && "text-foreground/80")}
        >
          {value || t("dynamic_form.shadowsocks.cipher.placeholder", { defaultValue: "选择加密方式" })}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="border-b p-2">
          <Input
            className="h-8 font-mono text-xs"
            placeholder={t("dynamic_form.shadowsocks.cipher.search_placeholder", { defaultValue: "搜索…" })}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-foreground/80">
              <p>{t("dynamic_form.shadowsocks.cipher.no_results", { defaultValue: "未找到结果" })}</p>
              <p className="mt-1 text-xs">{t("dynamic_form.shadowsocks.cipher.custom_hint", { defaultValue: "" })}</p>
            </div>
          ) : (
            filtered.map((cipher) => (
              <div
                key={cipher}
                role="option"
                aria-selected={cipher === value}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 font-mono text-xs hover:bg-accent"
                onClick={() => {
                  onChange(cipher);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", cipher === value ? "opacity-100" : "opacity-0")} />
                {cipher}
              </div>
            ))
          )}
          {custom ? (
            <div
              className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 hover:bg-accent"
              onClick={() => {
                onChange(custom);
                setOpen(false);
              }}
            >
              <Check className="mr-2 h-4 w-4 opacity-0" />
              <span className="font-medium text-blue-600">
                {t("dynamic_form.shadowsocks.cipher.use_custom", { defaultValue: "使用自定义" })}
              </span>
              <span className="ml-2 text-xs text-foreground/80">{custom}</span>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ShadowsocksPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  const plugin = asText(api.get("plugin"));
  const pluginHint =
    plugin === "obfs"
      ? t("dynamic_form.shadowsocks.plugin.obfs_hint", { defaultValue: "" })
      : plugin === "v2ray-plugin"
        ? t("dynamic_form.shadowsocks.plugin.v2ray_hint", { defaultValue: "" })
        : plugin === "gost-plugin"
          ? t("dynamic_form.shadowsocks.plugin.gost_hint", { defaultValue: "" })
          : plugin === "shadow-tls"
            ? t("dynamic_form.shadowsocks.plugin.shadow_tls_hint", { defaultValue: "" })
            : plugin === "restls"
              ? t("dynamic_form.shadowsocks.plugin.restls_hint", { defaultValue: "" })
              : plugin === "kcptun"
                ? t("dynamic_form.shadowsocks.plugin.kcptun_hint", { defaultValue: "" })
                : "";
  return (
    <>
      <PanelItem label={<PanelLabel>{t("dynamic_form.shadowsocks.cipher.label", { defaultValue: "加密方式" })}</PanelLabel>}>
        <CipherCombobox value={asText(api.get("cipher"))} onChange={(next) => api.set("cipher", next)} />
        <PanelDesc className="font-mono text-[11px] opacity-70">
          {t("dynamic_form.shadowsocks.cipher.description", { defaultValue: "" })}
        </PanelDesc>
      </PanelItem>
      <PanelItem label={<PanelLabel>{t("dynamic_form.shadowsocks.plugin.label", { defaultValue: "插件" })}</PanelLabel>}>
        <PanelSelect
          value={plugin === "" ? "none" : plugin || "none"}
          onChange={(next) => api.set("plugin", next === "none" ? "" : next)}
          placeholder={t("dynamic_form.shadowsocks.plugin.placeholder", { defaultValue: "" })}
          options={SS_PLUGINS}
        />
        <PanelDesc className="font-mono text-[11px] opacity-70">
          {plugin && plugin !== "none" ? pluginHint : null}
        </PanelDesc>
      </PanelItem>
      {plugin && plugin !== "none" && plugin !== "" ? (
        <PanelItem
          label={<PanelLabel>{t("dynamic_form.shadowsocks.plugin_opts.label", { defaultValue: "插件参数" })}</PanelLabel>}
        >
          <PanelDesc className="font-mono text-[11px] opacity-70">
            {t("dynamic_form.shadowsocks.plugin_opts.description", { defaultValue: "" })}
          </PanelDesc>
          <Input
            className="font-mono text-xs"
            type="text"
            placeholder={t("dynamic_form.shadowsocks.plugin_opts.placeholder", { defaultValue: "" })}
            value={asText(api.get("plugin_opts"))}
            onChange={(event) => api.set("plugin_opts", event.target.value)}
          />
        </PanelItem>
      ) : null}
      {plugin === "shadow-tls" || plugin === "restls" ? (
        <PanelItem
          label={<PanelLabel>{t("dynamic_form.shadowsocks.client_fingerprint", { defaultValue: "客户端指纹" })}</PanelLabel>}
        >
          <PanelSelect
            value={asText(api.get("client_fingerprint")) || "chrome"}
            onChange={(next) => api.set("client_fingerprint", next)}
            placeholder={t("dynamic_form.shadowsocks.client_fingerprint_placeholder", { defaultValue: "" })}
            options={SS_FINGERPRINTS}
          />
          <PanelDesc className="font-mono text-[11px] opacity-70">
            {t("dynamic_form.shadowsocks.client_fingerprint_description", { defaultValue: "" })}
          </PanelDesc>
        </PanelItem>
      ) : null}
    </>
  );
}

/** 原件 TLS 级别选择（vmess 用字面量 None/TLS，vless 用文案键，http/naive 用 disabled/enabled） */
function TlsLevelField({
  api,
  options,
  placeholder,
  label,
}: {
  api: PanelApi;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  label: string;
}) {
  return (
    <PanelItem label={<PanelLabel>{label}</PanelLabel>}>
      <PanelSelect
        value={asSelectValue(api.get("tls"))}
        onChange={(next) => api.set("tls", Number(next))}
        placeholder={placeholder}
        options={options}
      />
    </PanelItem>
  );
}

/** vmess / vless / http / naive 共用的 TLS=1 字段组 */
function TlsSettingsRow({ api, i18nPrefix }: { api: PanelApi; i18nPrefix: string }) {
  const { t } = useTranslation(["server", "common"]);
  const prefix = "tls_settings";
  return (
    <div className="flex gap-2">
      <PanelItem
        className="flex-[2]"
        label={
          <PanelLabel>{t(`${i18nPrefix}.tls_settings.server_name.label`, { defaultValue: "SNI" })}</PanelLabel>
        }
      >
        <Input
          className="font-mono text-xs"
          placeholder={t(`${i18nPrefix}.tls_settings.server_name.placeholder`, { defaultValue: "" })}
          value={asText(api.get(`${prefix}.server_name`))}
          onChange={(event) => api.set(`${prefix}.server_name`, event.target.value)}
        />
      </PanelItem>
      <PanelItem
        label={
          <PanelLabel>{t(`${i18nPrefix}.tls_settings.allow_insecure`, { defaultValue: "允许不安全" })}</PanelLabel>
        }
      >
        <div className="py-2 text-center">
          <Switch
            checked={asBool(api.get(`${prefix}.allow_insecure`))}
            onCheckedChange={(checked: boolean) => api.set(`${prefix}.allow_insecure`, checked)}
          />
        </div>
      </PanelItem>
    </div>
  );
}

function VmessPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  const tls = asNumber(api.get("tls"));
  return (
    <>
      <TlsLevelField
        api={api}
        label={t("dynamic_form.vmess.tls.label", { defaultValue: "TLS" })}
        placeholder={t("dynamic_form.vmess.tls.placeholder", { defaultValue: "" })}
        options={[
          { value: "0", label: "None" },
          { value: "1", label: "TLS" },
        ]}
      />
      {tls === 1 ? (
        <>
          <TlsSettingsRow api={api} i18nPrefix="dynamic_form.vmess" />
          <div className="mt-2 space-y-2">
            <UtlsBlock api={api} />
            <EchBlock api={api} prefix="tls_settings.ech" />
          </div>
        </>
      ) : null}
      <NetworkField api={api} options={NET_OPTIONS_VMESS} />
    </>
  );
}

function VlessPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  const tls = asNumber(api.get("tls"));
  const encryptionEnabled = asBool(api.get("encryption.enabled"));
  return (
    <>
      <TlsLevelField
        api={api}
        label={t("dynamic_form.vless.tls.label", { defaultValue: "TLS" })}
        placeholder={t("dynamic_form.vless.tls.placeholder", { defaultValue: "" })}
        options={[
          { value: "0", label: t("dynamic_form.vless.tls.none", { defaultValue: "None" }) },
          { value: "1", label: t("dynamic_form.vless.tls.tls", { defaultValue: "TLS" }) },
          { value: "2", label: t("dynamic_form.vless.tls.reality", { defaultValue: "Reality" }) },
        ]}
      />
      {tls === 1 ? (
        <>
          <TlsSettingsRow api={api} i18nPrefix="dynamic_form.vless" />
          <div className="mt-2 space-y-2">
            <UtlsBlock api={api} />
            <EchBlock api={api} prefix="tls_settings.ech" />
          </div>
        </>
      ) : null}
      {tls === 2 ? (
        <>
          <RealityFields api={api} />
          <div className="mt-2 space-y-2">
            <UtlsBlock api={api} />
          </div>
        </>
      ) : null}
      <NetworkField api={api} options={NET_OPTIONS_VLESS} />
      <PanelItem label={<PanelLabel>{t("dynamic_form.vless.flow.label", { defaultValue: "流控" })}</PanelLabel>}>
        <PanelSelect
          value={asText(api.get("flow")) || "none"}
          onChange={(next) => api.set("flow", next === "none" ? null : next)}
          placeholder={t("dynamic_form.vless.flow.placeholder", { defaultValue: "" })}
          options={VLESS_FLOWS}
        />
      </PanelItem>
      <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
        <PanelItem
          className="flex flex-row items-center justify-between"
          label={
            <div className="space-y-0.5">
              <Label className="font-mono text-[13px] font-bold">
                {t("dynamic_form.vless.encryption.label", { defaultValue: "VLESS 加密" })}
              </Label>
              <PanelDesc className="font-mono text-[11px] opacity-70">
                {t("dynamic_form.vless.encryption.description", { defaultValue: "" })}
              </PanelDesc>
            </div>
          }
        >
          <Switch
            checked={encryptionEnabled}
            onCheckedChange={(checked: boolean) => api.set("encryption.enabled", checked)}
          />
        </PanelItem>
        {encryptionEnabled ? (
          <div className="space-y-4 border-t border-dashed pt-2">
            <PanelItem
              label={
                <PanelLabel className="font-mono text-[11px] text-foreground/60">
                  {t("dynamic_form.vless.encryption.server_label", { defaultValue: "服务端解密" })}
                </PanelLabel>
              }
            >
              <Input
                className="font-mono text-xs"
                placeholder={t("dynamic_form.vless.encryption.server_placeholder", { defaultValue: "" })}
                value={asText(api.get("encryption.decryption"))}
                onChange={(event) => api.set("encryption.decryption", event.target.value)}
              />
              <PanelDesc className="font-mono text-[10px] text-foreground/60 opacity-70">
                {t("dynamic_form.vless.encryption.server_description", { defaultValue: "" })}
              </PanelDesc>
            </PanelItem>
            <PanelItem
              label={
                <PanelLabel className="font-mono text-[11px] text-foreground/60">
                  {t("dynamic_form.vless.encryption.client_label", { defaultValue: "客户端加密" })}
                </PanelLabel>
              }
            >
              <Input
                className="font-mono text-xs"
                placeholder={t("dynamic_form.vless.encryption.client_placeholder", { defaultValue: "" })}
                value={asText(api.get("encryption.encryption"))}
                onChange={(event) => api.set("encryption.encryption", event.target.value)}
              />
              <PanelDesc className="font-mono text-[10px] text-foreground/60 opacity-70">
                {t("dynamic_form.vless.encryption.client_description", { defaultValue: "" })}
              </PanelDesc>
            </PanelItem>
            <p className="px-1 font-mono text-[10px] italic leading-relaxed text-primary/70">
              * {t("dynamic_form.vless.encryption.generate_hint", { defaultValue: "" })}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

function TrojanPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  const tls = asNumber(api.get("tls"));
  return (
    <>
      <TlsLevelField
        api={api}
        label={t("dynamic_form.vless.tls.label", { defaultValue: "TLS" })}
        placeholder={t("dynamic_form.vless.tls.placeholder", { defaultValue: "" })}
        options={[
          { value: "1", label: t("dynamic_form.vless.tls.tls", { defaultValue: "TLS" }) },
          { value: "2", label: t("dynamic_form.vless.tls.reality", { defaultValue: "Reality" }) },
        ]}
      />
      {tls === 1 ? (
        <div className="flex gap-2">
          <PanelItem
            className="flex-[2]"
            label={<PanelLabel>{t("dynamic_form.trojan.server_name.label", { defaultValue: "SNI" })}</PanelLabel>}
          >
            <Input
              className="font-mono text-xs"
              placeholder={t("dynamic_form.trojan.server_name.placeholder", { defaultValue: "" })}
              value={asText(api.get("server_name"))}
              onChange={(event) => api.set("server_name", event.target.value)}
            />
          </PanelItem>
          <PanelItem label={<PanelLabel>{t("dynamic_form.trojan.allow_insecure", { defaultValue: "允许不安全" })}</PanelLabel>}>
            <div className="py-2 text-center">
              <Switch
                checked={asBool(api.get("allow_insecure"))}
                onCheckedChange={(checked: boolean) => api.set("allow_insecure", checked)}
              />
            </div>
          </PanelItem>
        </div>
      ) : null}
      {tls === 2 ? <RealityFields api={api} /> : null}
      {/* 原件 z4t：uTLS + ECH 在两级 TLS 之外始终渲染（`div.mb-4.space-y-4`） */}
      <div className="mb-4 space-y-4">
        <UtlsBlock api={api} />
        <EchBlock api={api} prefix="tls_settings.ech" />
      </div>
      <NetworkField api={api} options={NET_OPTIONS_VMESS} defaultTemplateType="tcp" />
    </>
  );
}

function HysteriaPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  const version = asNumber(api.get("version")) || 2;
  const obfsOpen = asBool(api.get("obfs.open"));
  return (
    <>
      <div className="flex gap-2">
        <PanelItem
          className="flex-1"
          label={<PanelLabel>{t("dynamic_form.hysteria.version.label", { defaultValue: "版本" })}</PanelLabel>}
        >
          <PanelSelect
            value={asSelectValue(asNumber(api.get("version")) || 2)}
            onChange={(next) => api.set("version", Number(next))}
            placeholder={t("dynamic_form.hysteria.version.placeholder", { defaultValue: "" })}
            options={HYSTERIA_VERSIONS.map((value) => ({ value, label: `V${value}` }))}
            itemClassName="cursor-pointer"
          />
        </PanelItem>
        {version === 1 ? (
          <PanelItem
            className="flex-[2]"
            label={<PanelLabel>{t("dynamic_form.hysteria.alpn.label", { defaultValue: "ALPN" })}</PanelLabel>}
          >
            <PanelSelect
              value={asText(api.get("alpn")) || "h2"}
              onChange={(next) => api.set("alpn", next)}
              placeholder={t("dynamic_form.hysteria.alpn.placeholder", { defaultValue: "" })}
              options={HYSTERIA_ALPN}
            />
          </PanelItem>
        ) : null}
      </div>
      <div className="flex gap-2">
        <PanelItem label={<PanelLabel>{t("dynamic_form.hysteria.obfs.label", { defaultValue: "混淆" })}</PanelLabel>}>
          <div className="py-2 text-center">
            <Switch
              checked={obfsOpen}
              onCheckedChange={(checked: boolean) => api.set("obfs.open", checked)}
            />
          </div>
        </PanelItem>
        {obfsOpen ? (
          <>
            <PanelItem
              className="flex-1"
              label={<PanelLabel>{t("dynamic_form.hysteria.obfs.type.label", { defaultValue: "混淆类型" })}</PanelLabel>}
            >
              <PanelSelect
                value={asText(api.get("obfs.type")) || "salamander"}
                onChange={(next) => api.set("obfs.type", next)}
                placeholder={t("dynamic_form.hysteria.obfs.type.placeholder", { defaultValue: "" })}
                options={[{ value: "salamander", label: t("dynamic_form.hysteria.obfs.type.salamander", { defaultValue: "Salamander" }) }]}
              />
            </PanelItem>
            <PanelItem
              className={version === 2 ? "w-full" : "flex-[2]"}
              label={<PanelLabel>{t("dynamic_form.hysteria.obfs.password.label", { defaultValue: "混淆密码" })}</PanelLabel>}
            >
              <div className="relative">
                <Input
                  className="font-mono text-xs pr-9"
                  placeholder={t("dynamic_form.hysteria.obfs.password.placeholder", { defaultValue: "" })}
                  value={asText(api.get("obfs.password"))}
                  onChange={(event) => api.set("obfs.password", event.target.value)}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 transition-transform duration-150 active:scale-90"
                      onClick={() => {
                        const bytes = new Uint8Array(16);
                        crypto.getRandomValues(bytes);
                        api.set(
                          "obfs.password",
                          Array.from(bytes)
                            .map((byte) => byte.toString(16).padStart(2, "0"))
                            .join(""),
                        );
                        toast.success(t("dynamic_form.hysteria.obfs.password.generate_success", { defaultValue: "已生成" }));
                      }}
                    >
                      <RefreshCw className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("dynamic_form.hysteria.obfs.password.label", { defaultValue: "混淆密码" })}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </PanelItem>
          </>
        ) : null}
      </div>
      <div className="flex gap-2">
        <PanelItem
          className="flex-[2]"
          label={<PanelLabel>{t("dynamic_form.hysteria.tls.server_name.label", { defaultValue: "SNI" })}</PanelLabel>}
        >
          <Input
            className="font-mono text-xs"
            placeholder={t("dynamic_form.hysteria.tls.server_name.placeholder", { defaultValue: "" })}
            value={asText(api.get("tls.server_name"))}
            onChange={(event) => api.set("tls.server_name", event.target.value)}
          />
        </PanelItem>
        <PanelItem label={<PanelLabel>{t("dynamic_form.hysteria.tls.allow_insecure", { defaultValue: "允许不安全" })}</PanelLabel>}>
          <div className="py-2 text-center">
            <Switch
              checked={asBool(api.get("tls.allow_insecure"))}
              onCheckedChange={(checked: boolean) => api.set("tls.allow_insecure", checked)}
            />
          </div>
        </PanelItem>
      </div>
      <EchBlock api={api} prefix="tls.ech" />
      <PanelItem label={<PanelLabel>{t("dynamic_form.hysteria.bandwidth.up.label", { defaultValue: "上行带宽" })}</PanelLabel>}>
        <div className="relative flex">
          <Input
            className="font-mono text-xs rounded-br-none rounded-tr-none"
            type="number"
            placeholder={
              t("dynamic_form.hysteria.bandwidth.up.placeholder", { defaultValue: "" }) +
              (version === 2 ? t("dynamic_form.hysteria.bandwidth.up.bbr_tip", { defaultValue: "" }) : "")
            }
            value={asText(api.get("bandwidth.up"))}
            onChange={(event) => api.set("bandwidth.up", event.target.value)}
          />
          <div className="pointer-events-none z-[-1] flex items-center rounded-md rounded-bl-none rounded-tl-none border border-l-0 border-input px-3 shadow-sm">
            <span className="text-gray-500">{t("dynamic_form.hysteria.bandwidth.up.suffix", { defaultValue: "" })}</span>
          </div>
        </div>
      </PanelItem>
      <PanelItem label={<PanelLabel>{t("dynamic_form.hysteria.bandwidth.down.label", { defaultValue: "下行带宽" })}</PanelLabel>}>
        <div className="relative flex">
          <Input
            className="font-mono text-xs rounded-br-none rounded-tr-none"
            type="number"
            placeholder={
              t("dynamic_form.hysteria.bandwidth.down.placeholder", { defaultValue: "" }) +
              (version === 2 ? t("dynamic_form.hysteria.bandwidth.down.bbr_tip", { defaultValue: "" }) : "")
            }
            value={asText(api.get("bandwidth.down"))}
            onChange={(event) => api.set("bandwidth.down", event.target.value)}
          />
          <div className="pointer-events-none z-[-1] flex items-center rounded-md rounded-bl-none rounded-tl-none border border-l-0 border-input px-3 shadow-sm">
            <span className="text-gray-500">{t("dynamic_form.hysteria.bandwidth.down.suffix", { defaultValue: "" })}</span>
          </div>
        </div>
      </PanelItem>
      <PanelItem label={<PanelLabel>{t("dynamic_form.hysteria.hop_interval.label", { defaultValue: "Hop 间隔 (秒)" })}</PanelLabel>}>
        <Input
          className="font-mono text-xs"
          type="number"
          placeholder={t("dynamic_form.hysteria.hop_interval.placeholder", { defaultValue: "例如: 30" })}
          value={asText(api.get("hop_interval"))}
          onChange={(event) => api.set("hop_interval", event.target.value ? Number.parseInt(event.target.value, 10) : null)}
        />
        <PanelDesc className="text-[11px] font-mono opacity-70">
          {t("dynamic_form.hysteria.hop_interval.description", { defaultValue: "Hop 间隔时间，单位为秒" })}
        </PanelDesc>
      </PanelItem>
    </>
  );
}

function TuicPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  return (
    <>
      <PanelItem label={<PanelLabel>{t("dynamic_form.tuic.version.label", { defaultValue: "版本" })}</PanelLabel>}>
        <PanelSelect
          value={asSelectValue(api.get("version"))}
          onChange={(next) => api.set("version", Number(next))}
          placeholder={t("dynamic_form.tuic.version.placeholder", { defaultValue: "" })}
          options={TUIC_VERSIONS.map((value) => ({ value, label: `V${value}` }))}
        />
      </PanelItem>
      <PanelItem
        label={<PanelLabel>{t("dynamic_form.tuic.congestion_control.label", { defaultValue: "拥塞控制" })}</PanelLabel>}
      >
        <PanelSelect
          value={asText(api.get("congestion_control"))}
          onChange={(next) => api.set("congestion_control", next)}
          placeholder={t("dynamic_form.tuic.congestion_control.placeholder", { defaultValue: "" })}
          options={TUIC_CONGESTION.map((value) => ({ value, label: value.toUpperCase() }))}
        />
      </PanelItem>
      <div className="flex gap-2">
        <PanelItem
          className="flex-[2]"
          label={<PanelLabel>{t("dynamic_form.tuic.tls.server_name.label", { defaultValue: "SNI" })}</PanelLabel>}
        >
          <Input
            className="font-mono text-xs"
            placeholder={t("dynamic_form.tuic.tls.server_name.placeholder", { defaultValue: "" })}
            value={asText(api.get("tls.server_name"))}
            onChange={(event) => api.set("tls.server_name", event.target.value)}
          />
        </PanelItem>
        <PanelItem label={<PanelLabel>{t("dynamic_form.tuic.tls.allow_insecure", { defaultValue: "允许不安全" })}</PanelLabel>}>
          <div className="py-2 text-center">
            <Switch
              checked={asBool(api.get("tls.allow_insecure"))}
              onCheckedChange={(checked: boolean) => api.set("tls.allow_insecure", checked)}
            />
          </div>
        </PanelItem>
      </div>
      <EchBlock api={api} prefix="tls.ech" />
      <PanelItem label={<PanelLabel>{t("dynamic_form.tuic.tls.alpn.label", { defaultValue: "ALPN" })}</PanelLabel>}>
        <MultiSelect
          value={asTextList(api.get("alpn"))}
          options={TUIC_ALPN}
          placeholder={t("dynamic_form.tuic.tls.alpn.placeholder", { defaultValue: "" })}
          emptyText={t("dynamic_form.tuic.tls.alpn.empty", { defaultValue: "未找到结果" })}
          onChange={(next) => api.set("alpn", next)}
          className="font-mono text-xs"
        />
      </PanelItem>
      <PanelItem
        label={<PanelLabel>{t("dynamic_form.tuic.udp_relay_mode.label", { defaultValue: "UDP 中继模式" })}</PanelLabel>}
      >
        <PanelSelect
          value={asText(api.get("udp_relay_mode"))}
          onChange={(next) => api.set("udp_relay_mode", next)}
          placeholder={t("dynamic_form.tuic.udp_relay_mode.placeholder", { defaultValue: "" })}
          options={TUIC_UDP_RELAY}
        />
      </PanelItem>
    </>
  );
}

function AnytlsPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  return (
    <>
      <div className="flex gap-2">
        <PanelItem
          className="flex-[2]"
          label={<PanelLabel>{t("dynamic_form.anytls.tls.server_name.label", { defaultValue: "SNI" })}</PanelLabel>}
        >
          <Input
            className="font-mono text-xs"
            placeholder={t("dynamic_form.anytls.tls.server_name.placeholder", { defaultValue: "" })}
            value={asText(api.get("tls.server_name"))}
            onChange={(event) => api.set("tls.server_name", event.target.value)}
          />
        </PanelItem>
        <PanelItem label={<PanelLabel>{t("dynamic_form.anytls.tls.allow_insecure", { defaultValue: "允许不安全" })}</PanelLabel>}>
          <div className="py-2 text-center">
            <Switch
              checked={asBool(api.get("tls.allow_insecure"))}
              onCheckedChange={(checked: boolean) => api.set("tls.allow_insecure", checked)}
            />
          </div>
        </PanelItem>
      </div>
      <EchBlock api={api} prefix="tls.ech" />
      <PanelItem
        label={
          <div className="flex items-center justify-between">
            <PanelLabel>{t("dynamic_form.anytls.padding_scheme.label", { defaultValue: "填充方案" })}</PanelLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={() => api.set("padding_scheme", ANYTLS_DEFAULT_PADDING)}
            >
              {t("dynamic_form.anytls.padding_scheme.use_default", { defaultValue: "使用默认值" })}
            </Button>
          </div>
        }
      >
        <div className="mb-1 text-[10px] text-muted-foreground font-mono">
          {t("dynamic_form.anytls.padding_scheme.description", { defaultValue: "" })}
        </div>
        <Textarea
          className="font-mono text-xs min-h-[120px] resize-y"
          value={asTextList(api.get("padding_scheme")).join("\n")}
          onChange={(event) => {
            api.set(
              "padding_scheme",
              event.target.value.split("\n").filter((line) => line.trim() !== ""),
            );
          }}
          placeholder={t("dynamic_form.anytls.padding_scheme.placeholder", { defaultValue: "" })}
        />
      </PanelItem>
    </>
  );
}

function HttpLikePanel({ api, type }: { api: PanelApi; type: "http" | "naive" }) {
  const { t } = useTranslation(["server", "common"]);
  const tls = asNumber(api.get("tls"));
  return (
    <>
      <TlsLevelField
        api={api}
        label={t(`dynamic_form.${type}.tls.label`, { defaultValue: "TLS" })}
        placeholder={t(`dynamic_form.${type}.tls.placeholder`, { defaultValue: "" })}
        options={[
          { value: "0", label: t(`dynamic_form.${type}.tls.disabled`, { defaultValue: "关闭" }) },
          { value: "1", label: t(`dynamic_form.${type}.tls.enabled`, { defaultValue: "开启" }) },
        ]}
      />
      {tls === 1 ? (
        <>
          <TlsSettingsRow api={api} i18nPrefix={`dynamic_form.${type}`} />
          <EchBlock api={api} prefix="tls_settings.ech" />
        </>
      ) : null}
    </>
  );
}

function MieruPanel({ api }: { api: PanelApi }) {
  const { t } = useTranslation(["server", "common"]);
  return (
    <>
      <PanelItem label={<PanelLabel>{t("dynamic_form.mieru.transport.label", { defaultValue: "传输协议" })}</PanelLabel>}>
        <PanelSelect
          value={asText(api.get("transport"))}
          onChange={(next) => api.set("transport", next)}
          placeholder={t("dynamic_form.mieru.transport.placeholder", { defaultValue: "" })}
          options={MIERU_TRANSPORT}
        />
      </PanelItem>
      <PanelItem
        label={<PanelLabel>{t("dynamic_form.mieru.traffic_pattern.label", { defaultValue: "流量特征" })}</PanelLabel>}
      >
        <div className="relative">
          <Input
            className="font-mono text-xs pr-9"
            placeholder={t("dynamic_form.mieru.traffic_pattern.placeholder", { defaultValue: "" })}
            value={asText(api.get("traffic_pattern"))}
            onChange={(event) => api.set("traffic_pattern", event.target.value)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 transition-transform duration-150 active:scale-90"
                onClick={() => {
                  api.set("traffic_pattern", mieruTrafficPattern());
                  toast.success(t("dynamic_form.mieru.traffic_pattern.success", { defaultValue: "已生成" }));
                }}
              >
                <RotateCw className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("dynamic_form.mieru.traffic_pattern.label", { defaultValue: "流量特征" })}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </PanelItem>
    </>
  );
}

/** 原件 `o5t`：按协议分发（未选/未支持时给占位提示） */
function ProtocolSettingsPanel({
  type,
  settings,
  update,
}: {
  type: string;
  settings: ProtocolSettings;
  update: (mutate: SettingsMutator) => void;
}) {
  const { t } = useTranslation(["server", "common"]);
  const api: PanelApi = {
    get: (path: string) => settingGet(settings, path),
    set: (path: string, value: SettingsValue) => update((current) => settingSet(current, path, value)),
  };
  switch (type) {
    case "shadowsocks":
      return <ShadowsocksPanel api={api} />;
    case "vmess":
      return <VmessPanel api={api} />;
    case "vless":
      return <VlessPanel api={api} />;
    case "trojan":
      return <TrojanPanel api={api} />;
    case "hysteria":
      return <HysteriaPanel api={api} />;
    case "tuic":
      return <TuicPanel api={api} />;
    case "anytls":
      return <AnytlsPanel api={api} />;
    case "http":
      return <HttpLikePanel api={api} type="http" />;
    case "naive":
      return <HttpLikePanel api={api} type="naive" />;
    case "mieru":
      return <MieruPanel api={api} />;
    case "socks":
      /* 原件 `X4t` 返回 null：socks 只有 routing 占位，无专属字段 */
      return null;
    default:
      return (
        <div className="py-8 text-center font-mono text-sm text-muted-foreground">
          {t("form.type.not_supported", { defaultValue: "请选择协议类型" })}
        </div>
      );
  }
}

/* ------------------------- 高级设置：三个面板 ------------------------- */

/** 原件 `a5t`：TLS / 证书面板（certPath 为 `cert_config` 或空） */
function TlsCertPanel({
  api,
  prefix,
  dnsEnvText,
  onDnsEnvTextChange,
}: {
  api: PanelApi;
  prefix: string;
  dnsEnvText: string;
  onDnsEnvTextChange: (next: string) => void;
}) {
  const { t } = useTranslation(["server", "common"]);
  const mode = asText(api.get(`${prefix}.cert_mode`)) || "none";
  const labelClass = "font-mono text-[11px] text-muted-foreground";
  const descClass = "font-mono text-[11px]";
  const textareaClass =
    "min-h-[100px] border-border/50 bg-muted/30 font-mono text-xs focus-visible:border-border focus-visible:ring-0";
  return (
    <>
      <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.cert_mode.label", { defaultValue: "证书模式" })}</PanelLabel>}>
        <PanelSelect
          value={mode}
          onChange={(next) => api.set(`${prefix}.cert_mode`, next)}
          placeholder="none"
          options={[
            { value: "none", label: "none" },
            { value: "http", label: "http-01 (ACME)" },
            { value: "dns", label: "dns-01 (ACME)" },
            { value: "self", label: "self-signed" },
            { value: "content", label: "content (Cert Push)" },
          ]}
        />
        <PanelDesc className={descClass}>
          {mode === "self" ? t("dynamic_form.shadowsocks.cert_config.cert_mode.self_description", { defaultValue: "" }) : null}
          {mode === "http" ? t("dynamic_form.shadowsocks.cert_config.cert_mode.http_description", { defaultValue: "" }) : null}
          {mode === "dns" ? t("dynamic_form.shadowsocks.cert_config.cert_mode.dns_description", { defaultValue: "" }) : null}
          {mode === "content" ? t("dynamic_form.shadowsocks.cert_config.cert_mode.content_description", { defaultValue: "" }) : null}
          {mode === "none" ? t("dynamic_form.shadowsocks.cert_config.cert_mode.description", { defaultValue: "" }) : null}
        </PanelDesc>
      </PanelItem>
      {mode === "http" || mode === "dns" || mode === "self" || mode === "content" ? (
        <>
          <Separator className="opacity-40" />
          <div className="grid grid-cols-2 gap-4">
            <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.domain.label", { defaultValue: "域名" })}</PanelLabel>}>
              <Input
                placeholder="example.com"
                className="font-mono text-xs"
                value={asText(api.get(`${prefix}.domain`))}
                onChange={(event) => api.set(`${prefix}.domain`, event.target.value)}
              />
            </PanelItem>
            {mode === "http" || mode === "dns" ? (
              <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.email.label", { defaultValue: "邮箱" })}</PanelLabel>}>
                <Input
                  placeholder="admin@example.com"
                  className="font-mono text-xs"
                  value={asText(api.get(`${prefix}.email`))}
                  onChange={(event) => api.set(`${prefix}.email`, event.target.value)}
                />
              </PanelItem>
            ) : null}
          </div>
        </>
      ) : null}
      {mode === "http" ? (
        <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.http_port.label", { defaultValue: "HTTP 端口" })}</PanelLabel>}>
          <Input
            type="number"
            className="font-mono text-xs"
            value={asText(api.get(`${prefix}.http_port`))}
            onChange={(event) => api.set(`${prefix}.http_port`, Number(event.target.value))}
          />
          <PanelDesc className={descClass}>
            {t("dynamic_form.shadowsocks.cert_config.http_port.description", { defaultValue: "" })}
          </PanelDesc>
        </PanelItem>
      ) : null}
      {mode === "dns" ? (
        <div className="space-y-4">
          <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.dns_provider.label", { defaultValue: "DNS Provider" })}</PanelLabel>}>
            <Input
              placeholder="cloudflare / alidns / dnspod"
              className="font-mono text-xs"
              value={asText(api.get(`${prefix}.dns_provider`))}
              onChange={(event) => api.set(`${prefix}.dns_provider`, event.target.value)}
            />
            <PanelDesc className="flex items-center gap-1 font-mono text-[11px]">
              <a
                href="https://go-acme.github.io/lego/dns/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {t("dynamic_form.shadowsocks.cert_config.dns_provider.doc_link", { defaultValue: "文档" })}
                <ExternalLink className="h-3 w-3" />
              </a>
            </PanelDesc>
          </PanelItem>
          <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.dns_env.label", { defaultValue: "DNS 环境变量" })}</PanelLabel>}>
            <Textarea
              placeholder={"CF_API_TOKEN=xxxxxx\nALIDNS_ACCESS_KEY_ID=xxxx"}
              value={dnsEnvText}
              onChange={(event) => {
                const next = event.target.value;
                onDnsEnvTextChange(next);
                const parsed: ProtocolSettings = {};
                next.split("\n").forEach((line) => {
                  const index = line.indexOf("=");
                  if (index <= 0) return;
                  const key = line.slice(0, index).trim();
                  if (key) parsed[key] = line.slice(index + 1).trim();
                });
                api.set(`${prefix}.dns_env`, parsed);
              }}
              className={textareaClass}
              spellCheck={false}
            />
            <PanelDesc className={descClass}>
              {t("dynamic_form.shadowsocks.cert_config.dns_env.description_short", { defaultValue: "" })}
            </PanelDesc>
          </PanelItem>
        </div>
      ) : null}
      {mode === "content" ? (
        <div className="space-y-4">
          <Separator className="opacity-40" />
          <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.cert_content.label", { defaultValue: "证书内容" })}</PanelLabel>}>
            <Textarea
              placeholder={"-----BEGIN CERTIFICATE-----\n..."}
              className={textareaClass}
              spellCheck={false}
              value={asText(api.get(`${prefix}.cert_content`))}
              onChange={(event) => api.set(`${prefix}.cert_content`, event.target.value)}
            />
          </PanelItem>
          <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.shadowsocks.cert_config.key_content.label", { defaultValue: "私钥内容" })}</PanelLabel>}>
            <Textarea
              placeholder={"-----BEGIN RSA PRIVATE KEY-----\n..."}
              className={textareaClass}
              spellCheck={false}
              value={asText(api.get(`${prefix}.key_content`))}
              onChange={(event) => api.set(`${prefix}.key_content`, event.target.value)}
            />
          </PanelItem>
        </div>
      ) : null}
      {mode === "none" ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldOff className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {t("dynamic_form.shadowsocks.cert_config.none_desc", { defaultValue: "未启用 TLS 证书配置" })}
          </p>
        </div>
      ) : null}
    </>
  );
}

/** 原件 `w4t`：多路复用面板 */
function MultiplexPanel({ api, prefix }: { api: PanelApi; prefix: string }) {
  const { t } = useTranslation(["server", "common"]);
  const enabled = asBool(api.get(`${prefix}.enabled`));
  const brutalEnabled = asBool(api.get(`${prefix}.brutal.enabled`));
  const labelClass = "font-mono text-[12px] text-foreground/80";
  const numberClass =
    "h-8 font-mono text-xs text-[12px]";
  return (
    <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
      <PanelItem
        className="flex flex-row items-center justify-between"
        label={
          <div className="space-y-0.5">
            <PanelLabel className="text-[13px] font-mono font-bold">
              {t("dynamic_form.multiplex.enabled.label", { defaultValue: "启用多路复用" })}
            </PanelLabel>
            <PanelDesc className="text-[11px]">
              {t("dynamic_form.multiplex.enabled.description", { defaultValue: "" })}
            </PanelDesc>
          </div>
        }
      >
        <Switch checked={enabled} onCheckedChange={(checked: boolean) => api.set(`${prefix}.enabled`, checked)} />
      </PanelItem>
      {enabled ? (
        <div className="space-y-4 border-t border-dashed pt-2">
          <div className="grid grid-cols-2 gap-4">
            <PanelItem label={<PanelLabel className="font-mono text-[12px] text-foreground/80">{t("dynamic_form.multiplex.protocol.label", { defaultValue: "协议" })}</PanelLabel>}>
              <PanelSelect
                value={asText(api.get(`${prefix}.protocol`))}
                onChange={(next) => api.set(`${prefix}.protocol`, next)}
                options={[
                  { value: "smux", label: "smux" },
                  { value: "yamux", label: "yamux" },
                  { value: "h2mux", label: "h2mux" },
                ]}
                triggerClassName="h-8 text-xs font-mono"
                itemClassName="text-xs font-mono"
              />
              <PanelDesc className="text-[10px] opacity-70">
                {asText(api.get(`${prefix}.protocol`)) === "h2mux"
                  ? "适合高延迟、大带宽且不需要 Brutal 的环境"
                  : "通用模式，兼容性最好"}
              </PanelDesc>
            </PanelItem>
            <PanelItem label={<PanelLabel className={labelClass}>{t("dynamic_form.multiplex.max_connections.label", { defaultValue: "最大连接数" })}</PanelLabel>}>
              <Input
                type="number"
                className={cn(numberClass, "text-xs")}
                value={asText(api.get(`${prefix}.max_connections`))}
                onChange={(event) => api.set(`${prefix}.max_connections`, Number(event.target.value))}
              />
              <PanelDesc className="text-[10px] opacity-70">最大建立的物理 TCP 数量</PanelDesc>
            </PanelItem>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PanelItem
              className="flex flex-row items-center justify-between space-y-0 rounded-md border bg-muted/5 p-2"
              label={
                <div className="space-y-0.5">
                  <PanelLabel className={labelClass}>{t("dynamic_form.multiplex.padding.label", { defaultValue: "填充" })}</PanelLabel>
                  <PanelDesc className="text-[10px] leading-tight">填充数据包以对抗流量特征分析</PanelDesc>
                </div>
              }
            >
              <Switch
                checked={asBool(api.get(`${prefix}.padding`))}
                onCheckedChange={(checked: boolean) => api.set(`${prefix}.padding`, checked)}
                className="scale-75"
              />
            </PanelItem>
          </div>
          <div className="mt-2 space-y-3 rounded bg-primary/5 p-3">
            <PanelItem
              className="flex flex-row items-center justify-between"
              label={
                <div className="space-y-0.5">
                  <PanelLabel className="text-[12px] font-mono font-medium text-primary">
                    {t("dynamic_form.multiplex.brutal.enabled.label", { defaultValue: "启用 Brutal" })}
                  </PanelLabel>
                </div>
              }
            >
              <Switch
                checked={brutalEnabled}
                onCheckedChange={(checked: boolean) => api.set(`${prefix}.brutal.enabled`, checked)}
              />
            </PanelItem>
            {brutalEnabled ? (
              <div className="grid grid-cols-1 gap-3 animate-in fade-in zoom-in duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <PanelItem label={<PanelLabel className="text-[11px] font-mono text-foreground/70">{t("dynamic_form.multiplex.brutal.up_mbps.label", { defaultValue: "上行 Mbps" })}</PanelLabel>}>
                    <div className="relative">
                      <Input
                        type="number"
                        className="h-8 text-xs font-mono pr-12"
                        value={asText(api.get(`${prefix}.brutal.up_mbps`))}
                        onChange={(event) => api.set(`${prefix}.brutal.up_mbps`, Number(event.target.value))}
                      />
                      <span className="absolute right-2 top-2 text-[9px] text-muted-foreground font-mono">Mbps</span>
                    </div>
                  </PanelItem>
                  <PanelItem label={<PanelLabel className="text-[11px] font-mono text-foreground/70">{t("dynamic_form.multiplex.brutal.down_mbps.label", { defaultValue: "下行 Mbps" })}</PanelLabel>}>
                    <div className="relative">
                      <Input
                        type="number"
                        className="h-8 text-xs font-mono pr-12"
                        value={asText(api.get(`${prefix}.brutal.down_mbps`))}
                        onChange={(event) => api.set(`${prefix}.brutal.down_mbps`, Number(event.target.value))}
                      />
                      <span className="absolute right-2 top-2 text-[9px] text-muted-foreground font-mono">Mbps</span>
                    </div>
                  </PanelItem>
                </div>
                <p className="text-[10px] text-primary/70 leading-relaxed font-mono italic px-1">
                  * {t("dynamic_form.multiplex.brutal.description", { defaultValue: "" })}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** 原件 `l5t`：高级设置弹窗（TLS / 多路复用 / Outbounds / Routes） */
function AdvancedSettingsDialog({
  open,
  onOpenChange,
  protocolType,
  settings,
  updateSettings,
  outbounds,
  routes,
  onCustomChange,
  initialTab,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  protocolType: string;
  settings: ProtocolSettings;
  updateSettings: (mutate: SettingsMutator) => void;
  outbounds: SettingsValue[];
  routes: SettingsValue[];
  onCustomChange: (next: { outbounds: SettingsValue[]; routes: SettingsValue[] }) => void;
  initialTab: string;
}) {
  const { t } = useTranslation(["server", "common"]);
  const hasCert = CERT_CONFIG_PROTOCOLS.includes(protocolType);
  const hasMultiplex = MULTIPLEX_PROTOCOLS.includes(protocolType);
  const certPath = hasCert ? "cert_config" : "";
  const [tab, setTab] = React.useState(initialTab);
  const [outboundText, setOutboundText] = React.useState("");
  const [routeText, setRouteText] = React.useState("");
  const [outboundError, setOutboundError] = React.useState<string | null>(null);
  const [routeError, setRouteError] = React.useState<string | null>(null);
  const [dnsEnvText, setDnsEnvText] = React.useState("");

  const stringifyList = (list: SettingsValue[]): string => (list.length > 0 ? JSON.stringify(list, null, 2) : "");
  const dnsEnvToText = (value: unknown): string => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return typeof value === "string" ? value : "";
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}=${item == null ? "" : String(item)}`)
      .join("\n");
  };

  React.useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setOutboundText(stringifyList(outbounds));
    setRouteText(stringifyList(routes));
    setOutboundError(null);
    setRouteError(null);
    setDnsEnvText(dnsEnvToText(settingGet(settings, `${certPath || "tls"}.dns_env`)));
    // 仅在打开时同步一次，避免面板输入被回写覆盖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const api: PanelApi = {
    get: (path: string) => settingGet(settings, path),
    set: (path: string, value: SettingsValue) => updateSettings((current) => settingSet(current, path, value)),
  };

  const save = () => {
    let failed = false;
    let nextOutbounds = outbounds;
    let nextRoutes = routes;
    if (outboundText.trim()) {
      try {
        const parsed: unknown = JSON.parse(outboundText);
        if (Array.isArray(parsed)) nextOutbounds = parsed as SettingsValue[];
        else {
          setOutboundError(t("dynamic_form.routing.error.must_be_array", { defaultValue: "必须是 JSON 数组" }));
          failed = true;
        }
      } catch {
        setOutboundError(t("dynamic_form.routing.error.invalid_json", { defaultValue: "JSON 格式错误" }));
        failed = true;
      }
    } else {
      nextOutbounds = [];
    }
    if (routeText.trim()) {
      try {
        const parsed: unknown = JSON.parse(routeText);
        if (Array.isArray(parsed)) nextRoutes = parsed as SettingsValue[];
        else {
          setRouteError(t("dynamic_form.routing.error.must_be_array", { defaultValue: "必须是 JSON 数组" }));
          failed = true;
        }
      } catch {
        setRouteError(t("dynamic_form.routing.error.invalid_json", { defaultValue: "JSON 格式错误" }));
        failed = true;
      }
    } else {
      nextRoutes = [];
    }
    onCustomChange({ outbounds: nextOutbounds, routes: nextRoutes });
    if (!failed) onOpenChange(false);
  };

  const tabs = [
    ...(hasCert ? [{ value: "cert", label: t("dynamic_form.advanced.tls_tab", { defaultValue: "TLS" }) }] : []),
    ...(hasMultiplex
      ? [{ value: "multiplex", label: t("dynamic_form.advanced.multiplex_tab", { defaultValue: "多路复用" }) }]
      : []),
    { value: "outbounds", label: t("dynamic_form.routing.outbounds_tab", { defaultValue: "Outbounds" }) },
    { value: "routes", label: t("dynamic_form.routing.routes_tab", { defaultValue: "Routes" }) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <DialogHeader className="px-6 pb-2 pt-6">
            <div className="mb-2 flex items-center justify-between">
              <DialogTitle className="font-mono text-sm tracking-wide">
                {t("dynamic_form.advanced.dialog_title", { defaultValue: "高级协议配置" })}
              </DialogTitle>
            </div>
            <TabsList
              className="grid w-full rounded-lg bg-muted/50 p-1"
              style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
              {tabs.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DialogHeader>
          <div className="max-h-[60vh] min-h-[350px] overflow-y-auto px-6 py-4">
            {hasMultiplex ? (
              <TabsContent value="multiplex" className="mt-0 space-y-4 duration-200 animate-in fade-in-50">
                <MultiplexPanel api={api} prefix="multiplex" />
              </TabsContent>
            ) : null}
            {hasCert ? (
              <TabsContent value="cert" className="mt-0 space-y-4 duration-200 animate-in fade-in-50">
                <TlsCertPanel
                  api={api}
                  prefix="cert_config"
                  dnsEnvText={dnsEnvText}
                  onDnsEnvTextChange={setDnsEnvText}
                />
              </TabsContent>
            ) : null}
            <TabsContent value="outbounds" className="mt-0 duration-200 animate-in fade-in-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] italic text-muted-foreground">
                    {t("dynamic_form.routing.outbounds", { defaultValue: "自定义Outbounds (JSON)" })}
                  </label>
                </div>
                <Textarea
                  value={outboundText}
                  onChange={(event) => {
                    setOutboundText(event.target.value);
                    setOutboundError(null);
                  }}
                  className={cn(
                    "min-h-[300px] border-border/50 bg-muted/30 font-mono text-[11px] focus-visible:border-border focus-visible:ring-0",
                    outboundError && "border-destructive",
                  )}
                  placeholder={'[{"tag": "proxy", "protocol": "shadowsocks", ...}]'}
                  spellCheck={false}
                />
                {outboundError ? <p className="font-mono text-[10px] text-destructive">{outboundError}</p> : null}
              </div>
            </TabsContent>
            <TabsContent value="routes" className="mt-0 duration-200 animate-in fade-in-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] italic text-muted-foreground">
                    {t("dynamic_form.routing.routes", { defaultValue: "自定义Routes (JSON)" })}
                  </label>
                </div>
                <Textarea
                  value={routeText}
                  onChange={(event) => {
                    setRouteText(event.target.value);
                    setRouteError(null);
                  }}
                  className={cn(
                    "min-h-[300px] border-border/50 bg-muted/30 font-mono text-[11px] focus-visible:border-border focus-visible:ring-0",
                    routeError && "border-destructive",
                  )}
                  placeholder={'[{"outboundTag": "proxy", "domain": ["domain:google.com"], ...}]'}
                  spellCheck={false}
                />
                {routeError ? <p className="font-mono text-[10px] text-destructive">{routeError}</p> : null}
              </div>
            </TabsContent>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-mono text-xs">
              {t("common.cancel", { defaultValue: "取消" })}
            </Button>
            <Button type="button" onClick={save} className="px-8 font-mono text-xs">
              {/* 原件 `i("common.save","Save")`：server 命名空间里没有该键，回退英文 "Save" */}
              {t("common.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function NodeDialog({
  refetch,
  machines,
  defaultFormValues,
  presetMachineId,
  trigger,
}: {
  refetch: () => void;
  machines: MachineRow[];
  defaultFormValues?: NodeRow;
  /** 原件 Q5t 的「新增节点到此服务器」：以 machine_id / enabled 预填表单 */
  presetMachineId?: number;
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["server", "common"]);
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<NodeFormValues>(emptyNodeForm);
  /** 原件 serverType（弹窗内协议类型，独立于表单 schema） */
  const [protocolType, setProtocolType] = React.useState<string>("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  /** 原件 `l5t` 高级设置弹窗 */
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [advancedTab, setAdvancedTab] = React.useState("cert");
  /** 原件 `C = useRef(new Map())`：按协议缓存 protocol_settings */
  const protocolCache = React.useRef<Map<string, Record<string, unknown>>>(new Map());
  const submitting = React.useRef(false);

  /* 原件 S：打开时并发拉取 分组 / 路由组 / 节点 / 服务器；服务器由列表页传入 */
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => (await fetchGroups()).data,
    enabled: open,
  });
  const { data: routes } = useQuery({
    queryKey: ["routeList"],
    queryFn: async () => (await fetchRoutes()).data,
    enabled: open,
  });
  const { data: nodes } = useQuery({
    queryKey: ["nodeList"],
    queryFn: async () => (await fetchNodes()).data,
    enabled: open,
  });

  const groupOptions = React.useMemo<MultiSelectOption[]>(
    () => (groups ?? []).filter((group) => group.id).map((group) => ({ label: group.name || "", value: group.id.toString() })),
    [groups],
  );
  const routeOptions = React.useMemo<MultiSelectOption[]>(
    () => (routes ?? []).filter((route) => route.id).map((route) => ({ label: route.remarks || "", value: route.id.toString() })),
    [routes],
  );
  /** 原件 k：顶层（parent_id 0/null）、同协议、排除自身 */
  const parentCandidates = React.useMemo(
    () =>
      (nodes ?? []).filter(
        (node) => (node.parent_id === 0 || node.parent_id == null) && node.type === protocolType && node.id !== values.id,
      ),
    [nodes, protocolType, values.id],
  );
  /** 原件 `(i2.data || []).filter(e => false !== e.is_active)` */
  const activeMachines = React.useMemo(() => machines.filter((machine) => false !== machine.is_active), [machines]);

  /* 原件 reset：编辑回填 / 新增用 preset */
  React.useEffect(() => {
    if (!open) return;
    if (defaultFormValues) {
      const raw = defaultFormValues.protocol_settings;
      let settings: ProtocolSettings = {};
      if (typeof raw === "string") {
        try {
          settings = raw ? (JSON.parse(raw) as ProtocolSettings) : {};
        } catch {
          settings = {};
        }
      } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        settings = raw as ProtocolSettings;
      }
      const transferEnable = defaultFormValues.transfer_enable || 0;
      const groupIds =
        defaultFormValues.group_ids ?? (defaultFormValues.groups ?? []).map((group) => group.id);
      setValues({
        id: defaultFormValues.id,
        specific_key: defaultFormValues.specific_key ?? null,
        code: defaultFormValues.code ?? "",
        show: defaultFormValues.show ?? false,
        name: defaultFormValues.name ?? "",
        rate: defaultFormValues.rate != null ? String(defaultFormValues.rate) : "1",
        rate_time_enable: Boolean(defaultFormValues.rate_time_enable ?? false),
        rate_time_ranges: Array.isArray(defaultFormValues.rate_time_ranges)
          ? (defaultFormValues.rate_time_ranges as NodeRateRule[])
          : [],
        tags: defaultFormValues.tags ?? [],
        transfer_enable_gb: transferEnable ? (transferEnable / 1073741824).toFixed(2) : "0",
        banned: defaultFormValues.banned ?? false,
        excludes: defaultFormValues.excludes ?? [],
        ips: defaultFormValues.ips ?? [],
        group_ids: groupIds,
        host: defaultFormValues.host ?? "",
        port: defaultFormValues.port != null ? String(defaultFormValues.port) : "",
        server_port: defaultFormValues.server_port != null ? String(defaultFormValues.server_port) : "",
        parent_id: defaultFormValues.parent_id != null ? String(defaultFormValues.parent_id) : "0",
        route_ids: defaultFormValues.route_ids ?? [],
        custom_outbounds: asSettingsList(defaultFormValues.custom_outbounds),
        custom_routes: asSettingsList(defaultFormValues.custom_routes),
        protocol_settings: defaultFormValues.type
          ? mergeSettings(protocolDefaults(defaultFormValues.type), settings)
          : settings,
        listen_address: defaultFormValues.listen_address ?? "",
        machine_id: defaultFormValues.machine_id ?? null,
        enabled: defaultFormValues.enabled != null ? Boolean(defaultFormValues.enabled) : null,
      });
      if (defaultFormValues.type) {
        protocolCache.current.set(defaultFormValues.type, settings);
        setProtocolType(defaultFormValues.type);
      } else {
        setProtocolType("");
      }
    } else {
      protocolCache.current.clear();
      setProtocolType("");
      setValues({
        ...emptyNodeForm(),
        machine_id: presetMachineId ?? null,
        enabled: null,
      });
    }
    setTouched({});
    setSubmitted(false);
  }, [open, defaultFormValues, presetMachineId]);

  const setValue = <K extends keyof NodeFormValues>(key: K, next: NodeFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: next }));
    setTouched((prev) => (prev[key as string] ? prev : { ...prev, [key as string]: true }));
  };
  const markTouched = (key: string) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  /** 原件 Zod schema 的校验规则与提示键 */
  const validate = React.useCallback(
    (current: NodeFormValues): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!current.name) errors.name = t("form.name.error", { defaultValue: "请输入有效的节点名称" });
      if (!current.rate) {
        errors.rate = t("form.rate.error", { defaultValue: "基础倍率不能为空" });
      } else if (!isFinite(Number(current.rate)) || isNaN(parseFloat(current.rate))) {
        errors.rate = t("form.rate.error_numeric", { defaultValue: "基础倍率必须是数字" });
      } else if (parseFloat(current.rate) < 0) {
        errors.rate = t("form.rate.error_gte_zero", { defaultValue: "基础倍率必须大于或等于0" });
      }
      if (!current.host) errors.host = t("form.host.error", { defaultValue: "节点地址不能为空" });
      if (!current.port) errors.port = t("form.port.error", { defaultValue: "连接端口不能为空" });
      if (!current.server_port) errors.server_port = t("form.server_port.error", { defaultValue: "服务端口不能为空" });
      current.rate_time_ranges.forEach((rule, index) => {
        if (!rule.start) {
          errors[`rate_time_ranges.${index}.start`] = t("form.dynamic_rate.start_time_error", {
            defaultValue: "开始时间不能为空",
          });
        }
        if (!rule.end) {
          errors[`rate_time_ranges.${index}.end`] = t("form.dynamic_rate.end_time_error", {
            defaultValue: "结束时间不能为空",
          });
        }
        if (!rule.rate) {
          errors[`rate_time_ranges.${index}.rate`] = t("form.dynamic_rate.multiplier_error", {
            defaultValue: "倍率乘数不能为空",
          });
        } else if (!isFinite(Number(rule.rate)) || isNaN(parseFloat(rule.rate))) {
          errors[`rate_time_ranges.${index}.rate`] = t("form.dynamic_rate.multiplier_error_numeric", {
            defaultValue: "倍率乘数必须是数字",
          });
        } else if (parseFloat(rule.rate) < 0) {
          errors[`rate_time_ranges.${index}.rate`] = t("form.dynamic_rate.multiplier_error_gte_zero", {
            defaultValue: "倍率乘数必须大于或等于0",
          });
        }
      });
      return errors;
    },
    [t],
  );

  const errors = React.useMemo(() => validate(values), [validate, values]);
  const showError = (field: string) => (submitted || touched[field] ? errors[field] : undefined);

  const isChild = values.parent_id !== null && values.parent_id !== "0";

  /** 原件协议切换：缓存旧协议 settings → 取新协议缓存 → 用 schema 默认值补齐（`safeParse({})`） */
  const handleProtocolChange = (next: string) => {
    if (protocolType) protocolCache.current.set(protocolType, values.protocol_settings ?? {});
    const cached = protocolCache.current.get(next) ?? {};
    setValues((prev) => ({ ...prev, protocol_settings: mergeSettings(protocolDefaults(next), cached) }));
    setProtocolType(next);
  };

  /** 函数式写入 protocol_settings（原件 `x.setValue("protocol_settings", ...)`） */
  const updateProtocolSettings = (mutate: SettingsMutator) =>
    setValues((prev) => ({
      ...prev,
      protocol_settings: mutate(prev.protocol_settings ?? protocolDefaults(protocolType)),
    }));

  const openAdvanced = (tab: string) => {
    setAdvancedTab(tab);
    setAdvancedOpen(true);
  };
  /** 页脚圆点：cert_mode / multiplex.enabled（原件 `C` / `N`，保留原始 truthiness，
   *  原件 `{cond && <div/>}` 在 `multiplex.enabled === 0` 时会把这个 0 直接渲染成文本 "0"） */
  const advancedSettings = values.protocol_settings ?? (protocolType ? protocolDefaults(protocolType) : {});
  const advancedCertMode = asText(settingGet(advancedSettings, "cert_config.cert_mode"));
  const multiplexRaw = settingGet(advancedSettings, "multiplex.enabled");
  const advancedMultiplex: boolean | number = typeof multiplexRaw === "number" ? multiplexRaw : Boolean(multiplexRaw);
  const advancedDots: boolean | number =
    (advancedCertMode !== "" && advancedCertMode !== "none") ||
    values.custom_outbounds.length > 0 ||
    values.custom_routes.length > 0 ||
    advancedMultiplex;

  const close = () => {
    setOpen(false);
    setAdvancedOpen(false);
    setValues(emptyNodeForm());
    setProtocolType("");
    setTouched({});
    setSubmitted(false);
  };

  const submit = async () => {
    if (submitting.current) return;
    if (!protocolType) {
      toast.error(t("form.type.select_error", { defaultValue: "请先选择协议类型" }));
      return;
    }
    setSubmitted(true);
    if (Object.keys(validate(values)).length > 0) return;
    submitting.current = true;
    try {
      /* 原件：transfer_enable_gb → 字节；其余字段原样提交，另补 type */
      const { transfer_enable_gb, ...rest } = values;
      const gb = parseFloat(transfer_enable_gb || "0");
      const transferEnable = gb > 0 ? Math.round(1024 * gb * 1024 * 1024) : 0;
      const body = await saveNode({ ...rest, type: protocolType, transfer_enable: transferEnable });
      if (body.data) {
        close();
        toast.success(t("form.success", { defaultValue: "提交成功" }));
        refetch();
      }
    } finally {
      submitting.current = false;
    }
  };

  const protocolColor = NODE_TYPES.find((item) => item.value === protocolType)?.color;
  const protocolLabel = NODE_TYPES.find((item) => item.value === protocolType)?.label ?? protocolType;
  const selectedMachine = activeMachines.find((machine) => machine.id === values.machine_id);
  const selectedMachineStatus = selectedMachine
    ? machineStatus(selectedMachine) === "never"
      ? "offline"
      : machineStatus(selectedMachine)
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (next) setOpen(true);
        else close();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b bg-muted/20 px-6 pb-4 pt-6">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-mono text-lg tracking-tight">
                {defaultFormValues
                  ? t("form.edit_node", { defaultValue: "编辑节点" })
                  : t("form.new_node", { defaultValue: "新建节点" })}
              </DialogTitle>
              {protocolType ? (
                <span className="rounded px-2 py-0.5 font-mono text-xs text-white" style={{ background: protocolColor }}>
                  {protocolLabel}
                </span>
              ) : null}
            </div>
            <Select value={protocolType} onValueChange={handleProtocolChange}>
              <SelectTrigger className="h-8 w-[150px] border-2 font-mono text-xs">
                <SelectValue placeholder={t("form.type.placeholder", { defaultValue: "选择协议类型" })} />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="cursor-pointer font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: type.color }} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogDescription className="font-mono text-xs opacity-70">
            {t("manage.description", { defaultValue: "管理所有节点，包括添加、删除、编辑等操作。" })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[75vh] min-h-[500px] flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            {/* 节点名称 + 基础倍率（子节点禁用） */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <FieldShell className="flex-[2]">
                  <Label className="font-mono text-[12px] text-foreground/80">
                    {t("form.name.label", { defaultValue: "节点名称" })}
                  </Label>
                  <Input
                    placeholder={t("form.name.placeholder", { defaultValue: "请输入节点名称" })}
                    className="h-9 font-mono text-xs"
                    value={values.name}
                    onChange={(event) => setValue("name", event.target.value)}
                  />
                  <FieldError message={showError("name")} />
                </FieldShell>
                <FieldShell className="flex-[1]">
                  <div className="relative">
                    <Label className="font-mono text-[12px] text-foreground/80">
                      {t("form.rate.label", { defaultValue: "基础倍率" })}
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      disabled={isChild}
                      className={cn("h-9 pr-8 font-mono text-xs", isChild && "cursor-not-allowed bg-muted/50")}
                      value={values.rate}
                      onChange={(event) => setValue("rate", event.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                      x
                    </span>
                    {isChild ? (
                      <div className="absolute right-2 top-1/2 hidden -translate-y-1/2">
                        <Lock className="size-4 text-muted-foreground/60" />
                      </div>
                    ) : null}
                  </div>
                  <FieldError message={showError("rate")} />
                </FieldShell>
              </div>
              {isChild ? (
                <div className="ml-auto flex w-fit items-center gap-1 text-xs text-muted-foreground">
                  <Info className="size-3" />
                  {t("form.rate.child_node_note", { defaultValue: "子节点倍率继承自父节点" })}
                </div>
              ) : null}
            </div>

            {/* 启用动态倍率 */}
            <FieldShell>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-mono text-[12px] text-foreground/80">
                    {t("form.dynamic_rate.enable_label", { defaultValue: "启用动态倍率" })}
                  </Label>
                  <div className="font-mono text-[11px] opacity-70">
                    {t("form.dynamic_rate.enable_description", { defaultValue: "根据时间段设置不同的倍率乘数" })}
                  </div>
                </div>
                <Switch
                  checked={values.rate_time_enable}
                  onCheckedChange={(checked: boolean) => setValue("rate_time_enable", checked)}
                  className="scale-90"
                />
              </div>
            </FieldShell>

            {/* 时间段规则表 */}
            {values.rate_time_enable ? (
              <div className="space-y-3 rounded-xl border bg-muted/5 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-[12px] text-foreground/80">
                    {t("form.dynamic_rate.rules_label", { defaultValue: "时间段规则" })}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 font-mono text-[10px]"
                    onClick={() =>
                      setValue("rate_time_ranges", [
                        ...values.rate_time_ranges,
                        { start: "00:00", end: "23:59", rate: "1" },
                      ])
                    }
                  >
                    <Plus className="mr-1 size-3" />
                    {t("form.dynamic_rate.add_rule", { defaultValue: "添加规则" })}
                  </Button>
                </div>
                {values.rate_time_ranges.map((rule, index) => (
                  <div key={index} className="space-y-3 rounded-lg border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold">
                        {t("form.dynamic_rate.rule_title", { index: index + 1, defaultValue: "规则 {{index}}" })}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setValue(
                            "rate_time_ranges",
                            values.rate_time_ranges.filter((_, position) => position !== index),
                          )
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <FieldShell>
                        <Label className="font-mono text-[11px] text-foreground/80">
                          {t("form.dynamic_rate.start_time", { defaultValue: "开始时间" })}
                        </Label>
                        <Input
                          type="time"
                          className="h-8 px-2 font-mono text-xs"
                          value={rule.start}
                          onChange={(event) => {
                            setValue(
                              "rate_time_ranges",
                              values.rate_time_ranges.map((item, position) =>
                                position === index ? { ...item, start: event.target.value } : item,
                              ),
                            );
                            markTouched(`rate_time_ranges.${index}.start`);
                          }}
                        />
                        <FieldError message={showError(`rate_time_ranges.${index}.start`)} />
                      </FieldShell>
                      <FieldShell>
                        <Label className="font-mono text-[11px] text-foreground/80">
                          {t("form.dynamic_rate.end_time", { defaultValue: "结束时间" })}
                        </Label>
                        <Input
                          type="time"
                          className="h-8 px-2 font-mono text-xs"
                          value={rule.end}
                          onChange={(event) => {
                            setValue(
                              "rate_time_ranges",
                              values.rate_time_ranges.map((item, position) =>
                                position === index ? { ...item, end: event.target.value } : item,
                              ),
                            );
                            markTouched(`rate_time_ranges.${index}.end`);
                          }}
                        />
                        <FieldError message={showError(`rate_time_ranges.${index}.end`)} />
                      </FieldShell>
                      <FieldShell>
                        <Label className="font-mono text-[11px] text-foreground/80">
                          {t("form.dynamic_rate.multiplier", { defaultValue: "倍率乘数" })}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="1.0"
                          className="h-8 px-2 font-mono text-xs"
                          value={rule.rate}
                          onChange={(event) => {
                            setValue(
                              "rate_time_ranges",
                              values.rate_time_ranges.map((item, position) =>
                                position === index ? { ...item, rate: event.target.value } : item,
                              ),
                            );
                            markTouched(`rate_time_ranges.${index}.rate`);
                          }}
                        />
                        <FieldError message={showError(`rate_time_ranges.${index}.rate`)} />
                      </FieldShell>
                    </div>
                  </div>
                ))}
                {values.rate_time_ranges.length === 0 ? (
                  <div className="py-4 text-center font-mono text-[10px] italic text-muted-foreground">
                    {t("form.dynamic_rate.no_rules", { defaultValue: "暂无规则，点击上方按钮添加" })}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* 流量限制（GB） + 自定义节点ID */}
            <div className="flex gap-3">
              <FieldShell className="flex-1 space-y-1">
                <Label className="font-mono text-[11px] text-muted-foreground">
                  {t("form.traffic_limit.label", { defaultValue: "流量限制" })}
                  <span className="ml-1 text-[9px]">(GB)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("form.traffic_limit.placeholder", { defaultValue: "0 表示不限制" })}
                  className="h-8 font-mono text-xs"
                  value={values.transfer_enable_gb || ""}
                  onChange={(event) => setValue("transfer_enable_gb", event.target.value)}
                />
                <FieldError message={showError("transfer_enable_gb")} className="text-[10px]" />
              </FieldShell>
              <FieldShell className="flex-1 space-y-1">
                <Label className="font-mono text-[11px] text-muted-foreground">
                  {t("form.code.label", { defaultValue: "自定义节点ID" })}
                  <span className="ml-1 text-[9px]">
                    ({t("form.code.optional", { defaultValue: "(选填)" })})
                  </span>
                </Label>
                <Input
                  placeholder={t("form.code.placeholder", { defaultValue: "请输入自定义节点ID" })}
                  className="h-8 font-mono text-xs"
                  value={values.code || ""}
                  onChange={(event) => setValue("code", event.target.value)}
                />
                <FieldError message={showError("code")} className="text-[10px]" />
              </FieldShell>
            </div>

            {/* 节点标签 */}
            <FieldShell>
              <Label className="font-mono text-[12px] text-foreground/80">
                {t("form.tags.label", { defaultValue: "节点标签" })}
              </Label>
              <TagInput
                value={values.tags}
                onChange={(next) => setValue("tags", next)}
                placeholder={t("form.tags.placeholder", { defaultValue: "输入后回车添加标签" })}
                className="min-h-9 w-full font-mono text-xs"
              />
              <FieldError message={showError("tags")} />
            </FieldShell>

            {/* 权限组（多选） */}
            <FieldShell>
              <Label className="flex items-center justify-between font-mono text-[12px] text-foreground/80">
                {t("form.groups.label", { defaultValue: "权限组" })}
                {/*
                  原件这里是 `c4t`（内联「新建权限组」弹窗，保存后 refetch 分组）；
                  重建工程暂未复刻该弹窗，按任务约定改为 toast 提示，引导到 /server/group 新增。
                */}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 font-mono text-[11px]"
                  onClick={() => toast.info("新增权限组请前往 /server/group 页面")}
                >
                  {t("form.groups.add", { defaultValue: "添加权限组" })}
                </Button>
              </Label>
              <MultiSelect
                value={values.group_ids}
                options={groupOptions}
                onChange={(next) => {
                  setValue("group_ids", next);
                  markTouched("group_ids");
                }}
                placeholder={t("form.groups.placeholder", { defaultValue: "请选择权限组" })}
                emptyText={t("form.groups.empty", { defaultValue: "未找到结果" })}
                className="font-mono text-xs"
              />
              <FieldError message={showError("group_ids")} />
            </FieldShell>

            {/* 节点地址 / 连接端口 / 服务端口 */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <FieldShell className="flex-1">
                  <Label className="font-mono text-[12px] text-foreground/80">
                    {t("form.host.label", { defaultValue: "节点地址" })}
                  </Label>
                  <Input
                    placeholder={t("form.host.placeholder", { defaultValue: "请输入节点域名或者IP" })}
                    className="h-9 font-mono text-xs"
                    value={values.host}
                    onChange={(event) => setValue("host", event.target.value)}
                  />
                  <FieldError message={showError("host")} />
                </FieldShell>
              </div>
              <div className="flex space-x-2">
                <FieldShell className="flex-1">
                  <Label className="flex items-center gap-1.5 font-mono text-[12px] text-foreground/80">
                    {t("form.port.label", { defaultValue: "连接端口" })}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 cursor-help opacity-70" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8} className="max-w-80 p-3 font-mono text-[11px]">
                        <p>{t("form.port.tooltip", { defaultValue: "" })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder={t("form.port.placeholder", { defaultValue: "用户连接端口" })}
                      className="h-9 font-mono text-xs"
                      value={values.port}
                      onChange={(event) => setValue("port", event.target.value)}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 text-muted-foreground/50 hover:text-muted-foreground [&_svg]:size-3"
                          onClick={() => {
                            if (values.port) setValue("server_port", values.port);
                          }}
                        >
                          <IconArrowsRight className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-mono text-[11px]">
                        <p>{t("form.port.sync", { defaultValue: "同步到服务端口" })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FieldError message={showError("port")} />
                </FieldShell>
                <FieldShell className="flex-1">
                  <Label className="flex items-center gap-1.5 font-mono text-[12px] text-foreground/80">
                    {t("form.server_port.label", { defaultValue: "服务端口" })}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 cursor-help opacity-70" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8} className="max-w-80 p-3 font-mono text-[11px]">
                        <p>{t("form.server_port.tooltip", { defaultValue: "" })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    placeholder={t("form.server_port.placeholder", { defaultValue: "请输入服务端口" })}
                    className="h-9 font-mono text-xs"
                    value={values.server_port}
                    onChange={(event) => setValue("server_port", event.target.value)}
                  />
                  <FieldError message={showError("server_port")} />
                </FieldShell>
              </div>
            </div>

            {/* 协议专属设置面板（原件 `o5t` + `s5t`，未选协议时是 1:1 占位提示） */}
            {protocolType ? (
              <ProtocolSettingsPanel
                type={protocolType}
                settings={values.protocol_settings ?? protocolDefaults(protocolType)}
                update={updateProtocolSettings}
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Info className="mx-auto mb-2 size-8 opacity-50" />
                  <p className="font-mono text-sm">{t("form.type.select_prompt", { defaultValue: "请先选择协议类型" })}</p>
                </div>
              </div>
            )}

            {/* 父级节点 */}
            <FieldShell>
              <Label className="font-mono text-[12px] text-foreground/80">
                {t("form.parent.label", { defaultValue: "父级节点" })}
              </Label>
              <Select value={values.parent_id?.toString() || "0"} onValueChange={(next: string) => setValue("parent_id", next)}>
                <SelectTrigger className="h-9 font-mono text-xs">
                  <SelectValue placeholder={t("form.parent.placeholder", { defaultValue: "选择父节点" })} />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs">
                  <SelectItem value="0" className="text-xs">
                    {t("form.parent.none", { defaultValue: "无" })}
                  </SelectItem>
                  {parentCandidates.map((node) => (
                    <SelectItem key={node.id} value={node.id.toString()} className="cursor-pointer text-xs">
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={showError("parent_id")} />
            </FieldShell>

            {/* 路由组（多选） */}
            <FieldShell>
              <Label className="font-mono text-[12px] text-foreground/80">
                {t("form.route.label", { defaultValue: "路由组" })}
              </Label>
              <MultiSelect
                value={values.route_ids}
                options={routeOptions}
                onChange={(next) => {
                  setValue("route_ids", next);
                  markTouched("route_ids");
                }}
                placeholder={t("form.route.placeholder", { defaultValue: "选择路由组" })}
                emptyText={t("form.route.empty", { defaultValue: "未找到结果" })}
                className="font-mono text-xs"
              />
              <FieldError message={showError("route_ids")} />
            </FieldShell>

            {/* 绑定服务器 */}
            <FieldShell>
              <Label className="font-mono text-[12px] text-foreground/80">
                {t("form.machine.label", { defaultValue: "绑定服务器" })}
              </Label>
              <Select
                value={values.machine_id != null ? String(values.machine_id) : "__none__"}
                onValueChange={(next: string) => {
                  const machineId = next === "__none__" ? null : Number(next);
                  setValues((prev) => ({
                    ...prev,
                    machine_id: machineId,
                    enabled: machineId == null ? null : (prev.enabled ?? true),
                  }));
                }}
              >
                <SelectTrigger className="h-9 font-mono text-xs">
                  <SelectValue placeholder={t("form.machine.placeholder", { defaultValue: "选择服务器（可选）" })} />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs">
                  <SelectItem value="__none__" className="text-xs">
                    {t("form.machine.none", { defaultValue: "独立部署" })}
                  </SelectItem>
                  {activeMachines.map((machine) => {
                    const status = machineStatus(machine);
                    const key = status === "never" ? "offline" : status;
                    return (
                      <SelectItem key={machine.id} value={String(machine.id)} className="cursor-pointer text-xs">
                        <span className="flex items-center gap-2">
                          <span className={cn("size-2 shrink-0 rounded-full", MACHINE_STATUS[key].dot)} />
                          {machine.name}
                          <span className="text-muted-foreground">SID:{machine.id}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {values.machine_id != null ? (
                <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-medium">
                      {selectedMachineStatus ? (
                        <span className={cn("size-2 shrink-0 rounded-full", MACHINE_STATUS[selectedMachineStatus].dot)} />
                      ) : null}
                      {selectedMachine?.name ?? `#${values.machine_id}`}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {t("form.machine.enabled_hint", { defaultValue: "选择是否由此服务器管理该节点" })}
                    </div>
                  </div>
                  <Switch
                    checked={values.enabled ?? true}
                    onCheckedChange={(checked: boolean) => setValue("enabled", checked)}
                  />
                </div>
              ) : null}
              <FieldError message={showError("machine_id")} />
            </FieldShell>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between border-t bg-muted/20 px-6 py-4 sm:space-x-0">
          {/* 原件 `l5t`「高级设置」触发器：协议选了才出现，带 TLS / MUX / RT 状态圆点 */}
          <div className="flex items-center gap-2">
            {protocolType ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex h-7 items-center gap-2 rounded-md border border-border/50 bg-muted/50 px-2.5 font-mono text-[11px] transition-all hover:bg-muted"
                onClick={() =>
                  openAdvanced(
                    CERT_CONFIG_PROTOCOLS.includes(protocolType)
                      ? "cert"
                      : MULTIPLEX_PROTOCOLS.includes(protocolType)
                        ? "multiplex"
                        : "outbounds",
                  )
                }
              >
                <Settings2 className="h-3 w-3 text-muted-foreground" />
                <span className="opacity-80">
                  {t("dynamic_form.advanced.trigger_label", { defaultValue: "高级设置" })}
                </span>
                {advancedDots && (
                  <div className="ml-1 flex items-center gap-1.5 border-l border-border/60 pl-2">
                    {advancedCertMode && advancedCertMode !== "none" && (
                      <div className="group/item flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-primary shadow-[0_0_4px_rgba(var(--primary),0.5)]" />
                        <span className="text-[9px] font-bold tracking-tighter text-primary">TLS</span>
                      </div>
                    )}
                    {advancedMultiplex && (
                      <div
                        className="group/item flex cursor-pointer items-center gap-1 hover:opacity-70"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAdvanced("multiplex");
                        }}
                      >
                        <div className="h-1 w-1 rounded-full bg-primary shadow-[0_0_4px_rgba(var(--primary),0.5)]" />
                        <span className="text-[9px] font-bold tracking-tighter text-primary">MUX</span>
                      </div>
                    )}
                    {(values.custom_outbounds.length > 0 || values.custom_routes.length > 0) && (
                      <div
                        className="group/item flex cursor-pointer items-center gap-1 hover:opacity-70"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAdvanced("outbounds");
                        }}
                      >
                        <div className="h-1 w-1 rounded-full bg-primary shadow-[0_0_4px_rgba(var(--primary),0.5)]" />
                        <span className="text-[9px] font-bold tracking-tighter text-primary">RT</span>
                      </div>
                    )}
                  </div>
                )}
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              className="h-8 px-4 font-mono text-xs font-bold"
            >
              {t("form.cancel", { defaultValue: "取消" })}
            </Button>
            <Button
              type="button"
              onClick={submit}
              className="h-8 bg-primary px-8 font-mono text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              {t("form.submit", { defaultValue: "提交" })}
            </Button>
          </div>
        </DialogFooter>
        <AdvancedSettingsDialog
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          protocolType={protocolType}
          settings={advancedSettings}
          updateSettings={updateProtocolSettings}
          outbounds={values.custom_outbounds}
          routes={values.custom_routes}
          onCustomChange={({ outbounds, routes }) =>
            setValues((prev) => ({ ...prev, custom_outbounds: outbounds, custom_routes: routes }))
          }
          initialTab={advancedTab}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function ServerManage() {
  const { t } = useTranslation(["server", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ "drag-handle": false });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 500, pageIndex: 0 });
  /** 原件 isSortMode */
  const [isSortMode, setIsSortMode] = React.useState(false);

  /* 原件：16 个节点的轮询，排序模式暂停 */
  const { refetch, data, isFetching } = useQuery({
    queryKey: ["nodeList"],
    queryFn: async () => (await fetchNodes()).data,
    refetchInterval: isSortMode ? false : 30000,
  });

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => (await fetchGroups()).data,
  });

  const { data: machines } = useQuery({
    queryKey: ["machineList"],
    queryFn: async () => (await fetchMachines()).data,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const machineList = machines ?? [];
  const groupList = groups ?? [];

  const [rows, setRows] = useSyncedRows<NodeRow>(data, !isSortMode);

  /* 原件：排序模式下的列可见性 / 列宽 / 分页 */
  React.useEffect(() => {
    setColumnVisibility({
      "drag-handle": isSortMode,
      show: !isSortMode,
      host: !isSortMode,
      machine: !isSortMode,
      online: !isSortMode,
      rate: !isSortMode,
      group_ids: !isSortMode,
      type: false,
      actions: !isSortMode,
    });
    setColumnSizing({ name: isSortMode ? 2000 : 200 });
    setPagination({ pageSize: isSortMode ? 99999 : 500, pageIndex: 0 });
  }, [isSortMode]);

  /* 原件：URL ?machine_id= 作为 machine 列筛选 */
  const machineIdParam = searchParams.get("machine_id");
  React.useEffect(() => {
    if (!machineIdParam) return;
    setColumnFilters((prev) => [
      ...prev.filter((f) => f.id !== "machine"),
      { id: "machine", value: [machineIdParam] },
    ]);
  }, [machineIdParam]);

  const saveOrder = async () => {
    if (!isSortMode) {
      setIsSortMode(true);
      return;
    }
    const payload = rows.map((row, index) => ({ id: row.id, order: index + 1 }));
    try {
      await sortNodes(payload);
      toast.success(t("toolbar.sort.success", { defaultValue: "排序保存成功" }));
      await refetch();
    } finally {
      setIsSortMode(false);
    }
  };

  const columns = React.useMemo<ColumnDef<NodeRow>[]>(
    () => [
      makeSelectColumn<NodeRow>(),
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.nodeId", { defaultValue: "节点ID" })} />
        ),
        /* 原件 H5t：单行徽标（类型色边框 + Server 图标 + code||id + 复制按钮），
           不是「id 徽标 + code 徽标」两行堆叠（后者会把行高顶到 89px）。 */
        cell: ({ row }) => (
          <div className="group/id flex items-center space-x-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-2 font-medium transition-all duration-200 hover:opacity-80"
              style={{ borderColor: NODE_TYPES.find((item) => item.value === row.original.type)?.color }}
            >
              <Server className="size-3" />
              <span className="flex items-center gap-0.5">{row.original.code ?? row.original.id}</span>
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 text-muted-foreground/40 opacity-0 transition-all duration-200 hover:text-muted-foreground group-hover/id:opacity-100"
              onClick={async (event) => {
                event.stopPropagation();
                try {
                  await navigator.clipboard.writeText(String(row.original.code ?? row.original.id));
                  toast.success(t("columns.actions_dropdown.copy_success", { defaultValue: "复制成功" }));
                } catch {
                  /* 剪贴板不可用时静默，与原件 IS() 的失败分支一致 */
                }
              }}
            >
              <Copy className="size-3" />
            </Button>
          </div>
        ),
        size: 50,
        enableSorting: true,
        meta: { label: t("columns.nodeId", { defaultValue: "节点ID" }) },
      },
      {
        accessorKey: "show",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.show", { defaultValue: "显隐" })} />
        ),
        /* 原件 F5t（offset 6216626）：开关的选中色是「节点类型色」`sqt[type]`，不是主题 primary */
        cell: ({ row }) => {
          const enabled = Boolean(row.original.show);
          return (
            <Switch
              checked={enabled}
              style={{
                backgroundColor: enabled
                  ? NODE_TYPES.find((item) => item.value === row.original.type)?.color
                  : undefined,
              }}
              onCheckedChange={async (checked: boolean) => {
                await updateNode({ id: row.original.id, show: checked ? 1 : 0 });
                refetch();
              }}
            />
          );
        },
        size: 50,
        enableSorting: false,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("columns.show", { defaultValue: "显隐" }) },
      },
      {
        accessorKey: "name",
        /* 原件 Z5t：表头 title + 三色状态图例 tooltip（V5t[0..2] 与 columns.status.N） */
        header: ({ column }) => (
          <div className="flex items-center">
            <DataTableColumnHeader
              column={column}
              title={t("columns.node", { defaultValue: "节点" })}
              tooltip={
                <div className="grid grid-cols-1 gap-3 p-2">
                  {[0, 1, 2].map((status) => (
                    <div key={status} className="flex items-center space-x-2.5">
                      <span className={cn("h-2.5 w-2.5 rounded-full", AVAILABLE_STATUS[status])} />
                      <span className="text-sm font-medium">
                        {t(`columns.status.${status}`, { defaultValue: String(status) })}
                      </span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        ),
        /* 原件 U5t：状态点 + 名字，单行；host:port 属于「地址」列，不在这里换行。 */
        cell: ({ row }) => (
          <div className="flex items-center space-x-2.5 outline-none">
            <span
              className={cn(
                "size-2.5 flex-shrink-0 cursor-pointer rounded-full transition-all duration-200",
                AVAILABLE_STATUS[row.original.available_status ?? -1],
              )}
            />
            <span className="cursor-default text-left font-medium transition-colors hover:text-primary">
              {row.original.name}
            </span>
          </div>
        ),
        enableSorting: false,
        size: 260,
        meta: { label: t("columns.node", { defaultValue: "节点" }) },
      },
      {
        id: "machine",
        accessorFn: (row) => row.machine_id ?? "__standalone__",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.deployment.title", { defaultValue: "部署方式" })}
            tooltip={t("columns.deployment.tooltip", { defaultValue: "" })}
          />
        ),
        /* 原件 G5t：状态点 + 服务器名（truncate）+ 部署状态徽标 + 节点停用徽标。 */
        cell: ({ row }) => {
          const machine = machineList.find((m) => m.id === row.original.machine_id) ?? null;
          if (!machine) {
            return (
              <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1">
                <Server className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs font-medium text-foreground">
                  {t("columns.deployment.standalone", { defaultValue: "独立部署" })}
                </span>
              </div>
            );
          }
          const status = machineStatus(machine);
          return (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1 text-xs">
              <span className={cn("size-2 shrink-0 rounded-full", MACHINE_STATUS[status].dot)} />
              <span className="min-w-0 truncate text-xs font-medium">{machine.name}</span>
              <Badge
                variant="outline"
                className={cn("shrink-0 px-1.5 py-0 text-[10px] font-normal", MACHINE_STATUS_CLASS[status])}
              >
                {t(`columns.deployment.${status}`, { defaultValue: status })}
              </Badge>
              {!row.original.enabled && (
                <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] font-normal">
                  {t("columns.deployment.disabled", { defaultValue: "节点停用" })}
                </Badge>
              )}
            </div>
          );
        },
        filterFn: (row, _id, value) => {
          if (!Array.isArray(value) || value.length === 0) return true;
          const machineId = row.original.machine_id;
          return value.some((v) =>
            v === "__standalone__" ? machineId == null : String(machineId) === String(v),
          );
        },
        enableSorting: false,
        size: 200,
        meta: { label: t("columns.deployment.title", { defaultValue: "部署方式" }) },
      },
      {
        accessorKey: "host",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.address", { defaultValue: "地址" })} />
        ),
        /* 原件 $5t：`host:port` 一行（font-mono text-sm font-medium）+ 端口不同时
           追加 `(内部端口 N)` 第二行；整块 min-w-0 flex-wrap，允许在窄列内折行。 */
        cell: ({ row }) => {
          const node = row.original;
          const port = node.port ?? "";
          const internalPort = node.server_port != null && String(node.server_port) !== String(port);
          return (
            <div className="group relative flex min-w-0 items-start">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 pr-7">
                <div className="flex items-center">
                  <span className="font-mono text-sm font-medium text-foreground/90">
                    {node.host}:{port}
                  </span>
                </div>
                {internalPort && (
                  <span className="whitespace-nowrap text-[0.7rem] tracking-tight text-muted-foreground/40">
                    ({t("columns.internalPort", { defaultValue: "内部端口" })} {node.server_port})
                  </span>
                )}
              </div>
              <div className="absolute right-0 top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground/40 opacity-0 transition-all duration-200 hover:bg-muted/50 hover:text-muted-foreground group-hover:opacity-100"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`${node.host}:${port}`);
                      toast.success(t("columns.actions_dropdown.copy_success", { defaultValue: "复制成功" }));
                    } catch {
                      /* 剪贴板不可用时保持静默，与原件 IS() 的失败分支一致 */
                    }
                  }}
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: true,
        meta: { label: t("columns.address", { defaultValue: "地址" }) },
      },
      {
        accessorKey: "online",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.onlineUsers.title", { defaultValue: "在线人数" })}
            tooltip={t("columns.onlineUsers.tooltip", { defaultValue: "" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 px-4">
            <Users className="size-4" />
            <span className="font-medium">{row.original.online ?? 0}</span>
          </div>
        ),
        size: 80,
        enableSorting: true,
        enableHiding: true,
        meta: { label: t("columns.onlineUsers.title", { defaultValue: "在线人数" }) },
      },
      {
        accessorKey: "rate",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.rate.title", { defaultValue: "倍率" })}
            tooltip={t("columns.rate.tooltip", { defaultValue: "" })}
          />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.rate ?? 1} x
          </Badge>
        ),
        size: 80,
        enableSorting: false,
        enableHiding: true,
        meta: { label: t("columns.rate.title", { defaultValue: "倍率" }) },
      },
      {
        accessorKey: "group_ids",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.groups.title", { defaultValue: "权限组" })}
            tooltip={t("columns.groups.tooltip", { defaultValue: "" })}
          />
        ),
        cell: ({ row }) => {
          const nodeGroups = row.original.groups ?? [];
          return (
            <div className="flex flex-wrap gap-1.5">
              {nodeGroups.map((group) => (
                <Badge
                  key={group.id}
                  variant="secondary"
                  className="flex cursor-default select-none items-center gap-1.5 border border-border/50 bg-secondary/50 px-2 py-0.5 font-medium transition-all duration-200 hover:bg-secondary/70"
                >
                  {group.name}
                </Badge>
              ))}
              {nodeGroups.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {t("columns.groups.empty", { defaultValue: "--" })}
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
        filterFn: (row, id, value) => {
          const ids = row.getValue<number[] | undefined>(id);
          return Array.isArray(ids) && Array.isArray(value) && value.some((v) => ids.includes(Number(v)));
        },
        meta: { label: t("columns.groups.title", { defaultValue: "权限组" }) },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.type", { defaultValue: "类型" })} />
        ),
        cell: ({ row }) => {
          const type = NODE_TYPES.find((item) => item.value === row.original.type);
          return (
            <Badge variant="outline" className="border-2 font-medium" style={{ borderColor: type?.color }}>
              {row.original.type}
            </Badge>
          );
        },
        enableSorting: false,
        enableHiding: true,
        /* 原件 x5t 的类型 facet 写入 string[]，列筛选按「包含」匹配 */
        filterFn: (row, id, value) => {
          if (!Array.isArray(value) || value.length === 0) return true;
          return value.includes(String(row.getValue(id)));
        },
        size: 100,
        meta: { label: t("columns.type", { defaultValue: "类型" }) },
      },
      {
        id: "traffic",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("columns.traffic.title", { defaultValue: "流量使用" })}
            tooltip={t("columns.traffic.tooltip", { defaultValue: "" })}
          />
        ),
        cell: ({ row }) => {
          const used = (row.original.u ?? 0) + (row.original.d ?? 0);
          const total = row.original.transfer_enable ?? 0;
          const banned = Boolean(row.original.banned);
          const usedText = formatBytes(used);
          const totalText = formatBytes(total);
          if (total <= 0) return <div className="text-sm text-muted-foreground">{usedText}</div>;
          const percent = Math.min((used / total) * 100, 100);
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 rounded-full bg-secondary">
                    <div
                      className={
                        banned || percent > 90 ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-primary"
                      }
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{usedText}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="space-y-1 text-sm">
                  <p>
                    {t("columns.traffic.used", { defaultValue: "已用" })}: {usedText}
                  </p>
                  <p>
                    {t("columns.traffic.total", { defaultValue: "总流量" })}: {totalText}
                  </p>
                  <p>
                    {t("columns.traffic.percentage", { defaultValue: "使用率" })}: {percent.toFixed(1)}%
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        },
        size: 120,
        enableSorting: false,
        enableHiding: true,
        meta: { label: t("columns.traffic.title", { defaultValue: "流量使用" }) },
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
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" aria-label={t("columns.actions", { defaultValue: "操作" })}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <NodeDialog
                    refetch={refetch}
                    machines={machineList}
                    defaultFormValues={row.original}
                    trigger={
                      <div className="flex w-full items-center">
                        <Pencil className="mr-2 size-4" />
                        {t("columns.actions_dropdown.edit", { defaultValue: "编辑" })}
                      </div>
                    }
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    const body = await copyNode({ id: row.original.id });
                    if (body.data) {
                      toast.success(t("columns.actions_dropdown.copy_success", { defaultValue: "复制成功" }));
                      refetch();
                    }
                  }}
                >
                  <Copy className="mr-2 size-4" />
                  {t("columns.actions_dropdown.copy", { defaultValue: "复制" })}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <ConfirmDialog
                    title={t("columns.actions_dropdown.reset_traffic.title", { defaultValue: "确认重置流量" })}
                    description={t("columns.actions_dropdown.reset_traffic.description", {
                      defaultValue: "此操作将清零该节点的上传和下载流量，并解除禁用状态。确定要继续吗？",
                    })}
                    confirmText={t("columns.actions_dropdown.reset_traffic.confirm", { defaultValue: "重置流量" })}
                    onConfirm={async () => {
                      await resetNodeTraffic({ id: row.original.id });
                      toast.success(
                        t("columns.actions_dropdown.reset_traffic_success", { defaultValue: "流量重置成功" }),
                      );
                      refetch();
                    }}
                  >
                    <div className="flex w-full items-center">
                      <RotateCcw className="mr-2 size-4" />
                      {t("columns.actions_dropdown.reset_traffic.confirm", { defaultValue: "重置流量" })}
                    </div>
                  </ConfirmDialog>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                  <ConfirmDialog
                    title={t("columns.actions_dropdown.delete.title", { defaultValue: "确认删除" })}
                    description={t("columns.actions_dropdown.delete.description", {
                      defaultValue: "此操作将永久删除该节点，删除后无法恢复。确定要继续吗？",
                    })}
                    confirmText={t("columns.actions_dropdown.delete.confirm", { defaultValue: "删除" })}
                    onConfirm={async () => {
                      await dropNode({ id: row.original.id });
                      toast.success(t("columns.actions_dropdown.delete_success", { defaultValue: "删除成功" }));
                      refetch();
                    }}
                  >
                    <div className="flex w-full items-center">
                      <Trash2 className="mr-2 size-4" />
                      {t("columns.actions_dropdown.delete.confirm", { defaultValue: "删除" })}
                    </div>
                  </ConfirmDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [isSortMode, machineList, refetch, t],
  );

  const table = useReactTable<NodeRow>({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, columnSizing, pagination },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const selectedMachine = machineList.find((m) => String(m.id) === machineIdParam) ?? null;

  const drag = useDragSort<NodeRow>({
    enabled: isSortMode,
    rows,
    setRows,
    keyMode: "id",
    getKey: (row) => row.id,
  });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    const ids = tbl.getSelectedRowModel().rows.map((r) => r.original.id);

    const batch = async (body: Record<string, unknown>, successText: string, errorText: string) => {
      try {
        const res = await batchUpdateNodes(body);
        if (res.data) {
          toast.success(successText);
          tbl.resetRowSelection();
          refetch();
        } else {
          toast.error(errorText);
        }
      } catch {
        toast.error(errorText);
      }
    };

    const actionsMenu = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            {t("toolbar.actions", { defaultValue: "操作" })}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            disabled={ids.length === 0}
            onSelect={() =>
              batch(
                { ids, show: 1 },
                t("toolbar.batch_show_success", { defaultValue: "成功显示 {{count}} 个节点", count: ids.length }),
                t("toolbar.batch_show_error", { defaultValue: "批量显示失败" }),
              )
            }
          >
            <Eye className="mr-2 size-4" />
            {t("toolbar.batch_show.menu", { defaultValue: "显示节点" })}
            {ids.length > 0 && <span className="ml-auto font-mono text-[10px] text-muted-foreground">({ids.length})</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={ids.length === 0}
            onSelect={() =>
              batch(
                { ids, show: 0 },
                t("toolbar.batch_hide_success", { defaultValue: "成功隐藏 {{count}} 个节点", count: ids.length }),
                t("toolbar.batch_hide_error", { defaultValue: "批量隐藏失败" }),
              )
            }
          >
            <EyeOff className="mr-2 size-4" />
            {t("toolbar.batch_hide.menu", { defaultValue: "隐藏节点" })}
            {ids.length > 0 && <span className="ml-auto font-mono text-[10px] text-muted-foreground">({ids.length})</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={ids.length === 0}
            onSelect={() =>
              batch(
                { ids, enabled: true },
                t("toolbar.batch_enable_success", { defaultValue: "成功启用 {{count}} 个节点", count: ids.length }),
                t("toolbar.batch_enable_error", { defaultValue: "批量启用失败" }),
              )
            }
          >
            <Power className="mr-2 size-4" />
            {t("toolbar.batch_enable.menu", { defaultValue: "启用节点" })}
            {ids.length > 0 && <span className="ml-auto font-mono text-[10px] text-muted-foreground">({ids.length})</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={ids.length === 0}
            onSelect={() =>
              batch(
                { ids, enabled: false },
                t("toolbar.batch_disable_success", { defaultValue: "成功禁用 {{count}} 个节点", count: ids.length }),
                t("toolbar.batch_disable_error", { defaultValue: "批量禁用失败" }),
              )
            }
          >
            <PowerOff className="mr-2 size-4" />
            {t("toolbar.batch_disable.menu", { defaultValue: "禁用节点" })}
            {ids.length > 0 && <span className="ml-auto font-mono text-[10px] text-muted-foreground">({ids.length})</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={ids.length === 0}>
            <ConfirmDialog
              title={t("toolbar.batch_reset_traffic.title", { defaultValue: "确认批量重置流量" })}
              description={t("toolbar.batch_reset_traffic.description", {
                defaultValue: "确定要重置选中的 {{count}} 个节点的流量吗？此操作将清零流量并解除禁用状态。",
                count: ids.length,
              })}
              confirmText={t("toolbar.batch_reset_traffic.confirm", { defaultValue: "确认重置" })}
              onConfirm={async () => {
                try {
                  const res = await batchResetTraffic({ ids });
                  if (res.data) {
                    toast.success(
                      t("toolbar.batch_reset_traffic_success", {
                        defaultValue: "成功重置 {{count}} 个节点的流量",
                        count: ids.length,
                      }),
                    );
                    tbl.resetRowSelection();
                    refetch();
                  } else {
                    toast.error(t("toolbar.batch_reset_traffic_error", { defaultValue: "批量重置流量失败" }));
                  }
                } catch {
                  toast.error(t("toolbar.batch_reset_traffic_error", { defaultValue: "批量重置流量失败" }));
                }
              }}
            >
              <div className="flex w-full items-center">
                <RotateCcw className="mr-2 size-4" />
                {t("toolbar.batch_reset_traffic.menu", { defaultValue: "重置流量" })}
              </div>
            </ConfirmDialog>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={ids.length === 0} className="text-destructive focus:text-destructive">
            <ConfirmDialog
              title={t("toolbar.batch_delete.title", { defaultValue: "确认批量删除" })}
              description={t("toolbar.batch_delete.description", {
                defaultValue: "确定要删除选中的 {{count}} 个节点吗？此操作不可恢复。",
                count: ids.length,
              })}
              confirmText={t("toolbar.batch_delete.confirm", { defaultValue: "确认删除" })}
              onConfirm={async () => {
                try {
                  const res = await batchDeleteNodes({ ids });
                  if (res.data) {
                    toast.success(
                      t("toolbar.batch_delete_success", {
                        defaultValue: "成功删除 {{count}} 个节点",
                        count: ids.length,
                      }),
                    );
                    tbl.resetRowSelection();
                    refetch();
                  } else {
                    toast.error(t("toolbar.batch_delete_error", { defaultValue: "批量删除失败" }));
                  }
                } catch {
                  toast.error(t("toolbar.batch_delete_error", { defaultValue: "批量删除失败" }));
                }
              }}
            >
              <div className="flex w-full items-center">
                <Trash2 className="mr-2 size-4" />
                {t("toolbar.batch_delete.menu", { defaultValue: "删除节点" })}
              </div>
            </ConfirmDialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (isSortMode) {
      return (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("toolbar.sort.tip", { defaultValue: "拖拽节点进行排序，完成后点击保存" })}
          </p>
          <Button variant="default" onClick={saveOrder} size="sm">
            {t("toolbar.sort.save", { defaultValue: "保存排序" })}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {selectedMachine && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {t("manage.filtered_by_server", {
                  defaultValue: "当前正在查看服务器 {{server}} (SID:{{id}}) 下的节点",
                  server: selectedMachine.name,
                  id: selectedMachine.id,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("manage.filtered_by_server_description", {
                  defaultValue: "在这里新增节点时，可以直接复用当前服务器作为部署目标。",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                SID:{selectedMachine.id}
              </Badge>
              <NodeDialog
                refetch={refetch}
                machines={machineList}
                presetMachineId={selectedMachine.id}
                trigger={
                  <Button variant="outline" size="sm">
                    {t("manage.add_node_to_server", { defaultValue: "新增节点到此服务器" })}
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete("machine_id");
                  next.delete("open_create");
                  setSearchParams(next);
                  tbl.getColumn("machine")?.setFilterValue(undefined);
                }}
              >
                {t("manage.clear_server_filter", { defaultValue: "清除服务器筛选" })}
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <NodeDialog
              refetch={refetch}
              machines={machineList}
              trigger={
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <div>{t("form.add_node", { defaultValue: "添加节点" })}</div>
                </Button>
              }
            />
            <Input
              placeholder={t("toolbar.search", { defaultValue: "搜索节点..." })}
              value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => tbl.getColumn("name")?.setFilterValue(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <div className="flex flex-wrap gap-x-2 gap-y-2">
              {tbl.getColumn("type") && (
                <FacetedFilter
                  column={tbl.getColumn("type")}
                  title={t("toolbar.type", { defaultValue: "类型" })}
                  options={NODE_TYPES.map((type) => ({ label: type.label, value: type.value }))}
                />
              )}
              {tbl.getColumn("machine") && (
                <FacetedFilter
                  column={tbl.getColumn("machine")}
                  title={t("toolbar.server", { defaultValue: "服务器" })}
                  options={[
                    { label: t("columns.deployment.standalone", { defaultValue: "独立部署" }), value: "__standalone__" },
                    ...machineList.map((machine) => ({
                      label: `${machine.name} · SID:${machine.id}`,
                      value: machine.id.toString(),
                    })),
                  ]}
                />
              )}
              {tbl.getColumn("group_ids") && (
                <FacetedFilter
                  column={tbl.getColumn("group_ids")}
                  title={t("columns.groups.title", { defaultValue: "权限组" })}
                  options={groupList.map((group) => ({ label: group.name, value: group.id.toString() }))}
                />
              )}
            </div>
            {filtersActive && (
              <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                {t("toolbar.reset", { defaultValue: "重置" })}
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
            {actionsMenu}
          </div>
          {tbl.getRowCount() > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="outline" onClick={saveOrder} size="sm">
                {t("toolbar.sort.edit", { defaultValue: "编辑排序" })}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
        <Layout>
        <LayoutHeader>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("manage.title", { defaultValue: "节点管理" })}</h2>
            <p className="text-muted-foreground mt-2">
              {t("manage.description", { defaultValue: "管理所有节点，包括添加、删除、编辑等操作。" })}
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
    </TooltipProvider>
  );
}
