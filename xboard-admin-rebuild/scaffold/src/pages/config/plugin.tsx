import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Loader2,
  Package,
  Pencil,
  Plug,
  Search,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { LangSwitch, ThemeSwitch, UserNav } from "@/components/layout/header-widgets";
import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

/**
 * 原件：`g1t`（offset 5,966,014）插件管理页 + `u1t`（插件卡）+ `bQt`（配置抽屉）+ `h1t`（骨架）。
 *
 * 已还原的端点（前缀 = window.settings.secure_path，全部来自 bundle 的 `ET` 对象；
 * 方法对齐 app/Http/Routes/V2/AdminRoute.php:271-288）：
 *  - GET  /plugin/types                       -> [{value,label,description,icon}]
 *  - GET  /plugin/getPlugins[?type=]          -> ditto [{code,name,version,description,author,type,
 *                                                 is_installed,is_enabled,is_protected,can_be_deleted,
 *                                                 config,readme,need_upgrade,admin_menus,admin_crud}]
 *  - POST /plugin/install|uninstall|enable|disable|upgrade|delete  -> { code }
 *  - POST /plugin/upload                      -> multipart file（.zip，≤10MB）
 *  - GET  /plugin/config?code=                -> { [key]: {type,label,placeholder,description,value,options} }
 *  - POST /plugin/config                      -> { code, config }
 *
 * 原件用卡片列表（u1t）呈现；本重建按任务要求改为表格 + 开关列，其余交互（安装/升级/卸载/文档/配置抽屉）保持一致。
 */

function securePath(): string {
  return window.settings?.secure_path ?? "";
}

interface PluginType {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface AdminMenuDecl {
  id: string;
  title: string;
  path: string;
  icon?: string;
  label?: string;
  description?: string;
}

interface PluginItem {
  code: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: string;
  is_installed: boolean;
  is_enabled: boolean;
  is_protected: boolean;
  can_be_deleted: boolean;
  config: Record<string, unknown>;
  readme: string;
  need_upgrade: boolean;
  admin_menus?: AdminMenuDecl[] | null;
  admin_crud?: Record<string, unknown> | null;
}

interface PluginConfigField {
  type?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  value?: unknown;
  options?: ReadonlyArray<{ value: string; label: string }>;
}

type PluginConfigMap = Record<string, PluginConfigField>;

type ConfigValue = string | number | boolean;

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

async function readData<T>(request: Promise<{ data: unknown }>): Promise<T> {
  const response = await request;
  const body = response.data as ApiEnvelope<T> | undefined;
  return (body?.data ?? null) as T;
}

/** 从后端 400 响应里取出 message（插件接口统一用 {message}） */
function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return fallback;
}

export default function ConfigPlugin() {
  const { t } = useTranslation(["plugin", "common"]);
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [typeTab, setTypeTab] = React.useState("all");
  const [installFilter, setInstallFilter] = React.useState<"all" | "installed" | "available">("all");
  const [pendingCode, setPendingCode] = React.useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [readme, setReadme] = React.useState<{ title: string; body: string } | null>(null);
  const [configCode, setConfigCode] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{ code: string; action: "uninstall" | "delete" } | null>(
    null,
  );

  const { data: types } = useQuery<PluginType[]>({
    queryKey: ["pluginTypes"],
    queryFn: () => readData<PluginType[]>(http.get(`${securePath()}/plugin/types`)),
  });

  const { data: plugins, isLoading, refetch } = useQuery<PluginItem[]>({
    queryKey: ["pluginList"],
    queryFn: () => readData<PluginItem[]>(http.get(`${securePath()}/plugin/getPlugins`)),
  });

  const refreshAll = React.useCallback(async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["pluginList"] });
  }, [queryClient, refetch]);

  const filtered = React.useMemo(() => {
    const list = plugins ?? [];
    const needle = search.trim().toLowerCase();
    return list.filter((plugin) => {
      const matchesSearch =
        !needle ||
        plugin.name.toLowerCase().includes(needle) ||
        plugin.description.toLowerCase().includes(needle) ||
        plugin.code.toLowerCase().includes(needle);
      const matchesType = typeTab === "all" || plugin.type === typeTab;
      const matchesInstalled =
        installFilter === "all" ? true : installFilter === "installed" ? plugin.is_installed : !plugin.is_installed;
      return matchesSearch && matchesType && matchesInstalled;
    });
  }, [plugins, search, typeTab, installFilter]);

  function typeLabel(type: string): string {
    return types?.find((item) => item.value === type)?.label ?? type;
  }

  /** 原件 O/M/A/P/V：install / upgrade / uninstall / enable-disable / delete */
  async function runMutation(code: string, action: "install" | "upgrade" | "uninstall" | "enable" | "disable" | "delete") {
    setPendingCode(code);
    try {
      await http.post(`${securePath()}/plugin/${action}`, { code });
      const key = `${action}Success` as keyof typeof MESSAGES;
      toast.success(t(`messages.${key}`, { defaultValue: MESSAGES[key] }));
      await refreshAll();
    } catch (error) {
      const key = `${action}Error` as keyof typeof MESSAGES;
      toast.error(errorMessage(error, t(`messages.${key}`, { defaultValue: MESSAGES[key] })));
    } finally {
      setPendingCode(null);
    }
  }

  async function uploadPlugin(file: File) {
    if (!file.name.endsWith(".zip")) {
      toast.error(t("upload.error.format"));
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await http.post(`${securePath()}/plugin/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("messages.uploadSuccess"));
      setUploadOpen(false);
      await refreshAll();
    } catch (error) {
      toast.error(errorMessage(error, t("messages.uploadError")));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDrag(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") setDragging(true);
    else if (event.type === "dragleave") setDragging(false);
  }

  const configPlugin = plugins?.find((plugin) => plugin.code === configCode) ?? null;

  return (
    <Layout>
      <LayoutHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Plug className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeSwitch />
          <LangSwitch />
          <UserNav />
        </div>
      </LayoutHeader>
      <LayoutBody>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("search.placeholder")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={installFilter}
                onValueChange={(value) => setInstallFilter(value as "all" | "installed" | "available")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("status.filter_placeholder", { defaultValue: "安装状态" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("status.all", { defaultValue: "全部状态" })}</SelectItem>
                  <SelectItem value="installed">{t("status.installed", { defaultValue: "已安装" })}</SelectItem>
                  <SelectItem value="available">{t("status.available", { defaultValue: "可安装" })}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="shrink-0"
                size="sm"
                onClick={() => {
                  window.location.hash = "#/config/plugin/crud-demo";
                }}
              >
                <Wrench className="mr-2 h-4 w-4" />
                {t("button.crudDemo", { defaultValue: "CRUD 演示" })}
              </Button>
              <Button
                variant="outline"
                className="shrink-0"
                size="sm"
                onClick={() => {
                  window.location.hash = "#/config/plugin/menu-demo";
                }}
              >
                <Wrench className="mr-2 h-4 w-4" />
                {t("button.menuDemo")}
              </Button>
              <Button variant="outline" className="shrink-0" size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                {t("upload.button")}
              </Button>
            </div>
          </div>

          <Tabs value={typeTab} onValueChange={setTypeTab} className="w-full">
            <TabsList>
              {(types ?? []).map((type) => (
                <TabsTrigger key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon && <span>{type.icon}</span>}
                    <span>{type.label}</span>
                  </div>
                </TabsTrigger>
              ))}
              <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">{t("columns.name", { defaultValue: "插件" })}</TableHead>
                <TableHead>{t("type.placeholder", { defaultValue: "类型" })}</TableHead>
                <TableHead>{t("columns.version", { defaultValue: "版本" })}</TableHead>
                <TableHead className="min-w-[240px]">{t("columns.description", { defaultValue: "描述" })}</TableHead>
                <TableHead className="w-[110px]">{t("status.filter_placeholder", { defaultValue: "状态" })}</TableHead>
                <TableHead className="w-[260px] text-right">{t("columns.actions", { defaultValue: "操作" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("common:loading")}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("common:table.noData")}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((plugin) => {
                const busy = pendingCode === plugin.code;
                return (
                  <TableRow key={plugin.code}>
                    <TableCell>
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{plugin.name}</span>
                          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                            {typeLabel(plugin.type)}
                          </Badge>
                          {plugin.is_protected && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              {t("status.protected")}
                            </Badge>
                          )}
                        </div>
                        <code className="w-fit rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">
                          {plugin.code}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {t("author")}: {plugin.author}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{plugin.type}</TableCell>
                    <TableCell className="text-sm">
                      v{plugin.version}
                      {plugin.need_upgrade && (
                        <Badge variant="destructive" className="ml-2 text-[10px]">
                          {t("button.upgrade")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p
                        className="overflow-hidden text-sm text-muted-foreground"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                      >
                        {plugin.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {plugin.is_installed ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plugin.is_enabled}
                            disabled={busy}
                            aria-label={plugin.is_enabled ? t("button.disable") : t("button.enable")}
                            onCheckedChange={(checked) =>
                              void runMutation(plugin.code, checked ? "enable" : "disable")
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {plugin.is_enabled ? t("status.enabled") : t("status.disabled")}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground/30 bg-muted/30 text-muted-foreground">
                          {t("status.not_installed")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {plugin.readme && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={t("button.readme")}
                            onClick={() => setReadme({ title: plugin.name, body: plugin.readme })}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        )}
                        {plugin.is_installed && Object.keys(plugin.config ?? {}).length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={t("button.config")}
                            onClick={() => setConfigCode(plugin.code)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {plugin.is_installed ? (
                          plugin.need_upgrade && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => void runMutation(plugin.code, "upgrade")}
                            >
                              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                              {t("button.upgrade")}
                            </Button>
                          )
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => void runMutation(plugin.code, "install")}
                          >
                            {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                            {t("button.install")}
                          </Button>
                        )}
                        {plugin.is_installed && !plugin.is_protected && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title={t("button.uninstall")}
                            disabled={busy}
                            onClick={() => setConfirmAction({ code: plugin.code, action: "uninstall" })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {plugin.can_be_deleted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title={t("delete.button")}
                            disabled={busy}
                            onClick={() => setConfirmAction({ code: plugin.code, action: "delete" })}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </LayoutBody>

      {/* 上传插件（原件 htt + 拖拽区，accept=.zip） */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("upload.title")}</DialogTitle>
            <DialogDescription>{t("upload.description")}</DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "relative mt-4 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-10 text-center transition-colors",
              dragging && "border-primary/50 bg-muted/50",
            )}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void uploadPlugin(file);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".zip"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPlugin(file);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
                <div className="text-sm text-muted-foreground">{t("upload.uploading")}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full border-2 border-muted-foreground/25 p-3">
                  <Upload className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {t("upload.dragText")}{" "}
                    <button
                      type="button"
                      className="mx-1 text-primary hover:underline"
                      onClick={() => fileRef.current?.click()}
                    >
                      {t("upload.clickText")}
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">{t("upload.supportText")}</div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 插件文档（原件 markdown-body 渲染；此处以等宽文本展示源码） */}
      <Dialog open={readme !== null} onOpenChange={(open) => !open && setReadme(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("readme.title", { defaultValue: "插件文档" })}</DialogTitle>
            <DialogDescription>{readme?.title}</DialogDescription>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-xs leading-relaxed">
            {readme?.body}
          </pre>
        </DialogContent>
      </Dialog>

      {/* 原件 hQt：卸载/删除确认 */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "delete" ? t("delete.title") : t("uninstall.title")}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "delete" ? t("delete.description") : t("uninstall.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t("config.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const pending = confirmAction;
                setConfirmAction(null);
                if (pending) void runMutation(pending.code, pending.action);
              }}
            >
              {confirmAction?.action === "delete" ? t("delete.button") : t("uninstall.button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PluginConfigDrawer
        code={configCode}
        plugin={configPlugin}
        onClose={() => setConfigCode(null)}
        onSaved={() => {
          void refreshAll();
        }}
      />
    </Layout>
  );
}

/** 原件 bQt：配置抽屉（按 /plugin/config 返回的 {type,label,value,options} 渲染字段） */
function PluginConfigDrawer({
  code,
  plugin,
  onClose,
  onSaved,
}: {
  code: string | null;
  plugin: PluginItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation(["plugin", "common"]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [schema, setSchema] = React.useState<PluginConfigMap>({});
  const [values, setValues] = React.useState<Record<string, ConfigValue>>({});

  React.useEffect(() => {
    if (!code) return;
    let alive = true;
    setLoading(true);
    readData<PluginConfigMap>(http.get(`${securePath()}/plugin/config`, { params: { code } }))
      .then((config) => {
        if (!alive) return;
        const next = config ?? {};
        setSchema(next);
        const initial: Record<string, ConfigValue> = {};
        for (const [key, field] of Object.entries(next)) {
          const value = field?.value;
          initial[key] =
            typeof value === "number" || typeof value === "boolean" ? value : typeof value === "string" ? value : "";
        }
        setValues(initial);
      })
      .catch(() => {
        if (alive) toast.error(t("messages.configLoadError"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // t 只用于错误文案
  }, [code, t]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code) return;
    setSaving(true);
    try {
      await http.post(`${securePath()}/plugin/config`, { code, config: values });
      toast.success(t("messages.configSaveSuccess"));
      onSaved();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, t("messages.configSaveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={code !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="right-0 top-0 h-svh max-h-svh translate-x-0 translate-y-0 gap-4 overflow-y-auto rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {plugin?.name} {t("config.title")}
          </DialogTitle>
          <DialogDescription>{t("config.description")}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={save} className="flex h-full flex-col">
            <div className="flex-1 space-y-4">
              {Object.keys(schema).length === 0 && (
                <p className="text-sm text-muted-foreground">{t("common:table.noData")}</p>
              )}
              {Object.entries(schema).map(([key, field]) => {
                const inputId = `plugin-config-${key}`;
                const value = values[key];
                const label = field.label || key;
                if (field.type === "boolean") {
                  return (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div>
                        <Label htmlFor={inputId}>{label}</Label>
                        {field.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>
                        )}
                      </div>
                      <Switch
                        id={inputId}
                        checked={value === true}
                        onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [key]: checked }))}
                      />
                    </div>
                  );
                }
                if (field.type === "select" && Array.isArray(field.options) && field.options.length > 0) {
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={inputId}>{label}</Label>
                      <Select
                        value={String(value ?? "")}
                        onValueChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
                      >
                        <SelectTrigger id={inputId}>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                    </div>
                  );
                }
                if (field.type === "text" || field.type === "textarea") {
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={inputId}>{label}</Label>
                      <Textarea
                        id={inputId}
                        rows={3}
                        placeholder={field.placeholder}
                        value={String(value ?? "")}
                        onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))}
                      />
                      {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                    </div>
                  );
                }
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={inputId}>{label}</Label>
                    <Input
                      id={inputId}
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [key]: field.type === "number" ? Number(event.target.value) : event.target.value,
                        }))
                      }
                    />
                    {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                  </div>
                );
              })}
            </div>
            <DialogFooter className="mt-6 border-t pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                {t("config.cancel")}
              </Button>
              <Button type="submit" disabled={saving || loading}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? t("config.saving", { defaultValue: "保存中..." }) : t("config.save")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** i18n 缺失时的中文兜底（plugin 命名空间没有 runtime/messages 全部键） */
const MESSAGES = {
  installSuccess: "插件安装成功",
  installError: "插件安装失败",
  upgradeSuccess: "插件升级成功",
  upgradeError: "插件升级失败",
  uninstallSuccess: "插件卸载成功",
  uninstallError: "插件卸载失败",
  enableSuccess: "插件启用成功",
  enableError: "插件启用失败",
  disableSuccess: "插件禁用成功",
  disableError: "插件禁用失败",
  deleteSuccess: "插件删除成功",
  deleteError: "插件删除失败",
} as const;

/** 供卡片视图复用（原件 h1t 骨架，此处未使用但保留结构说明） */
export function PluginCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 py-6">
        <div className="h-6 w-[200px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-[100px] animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}
