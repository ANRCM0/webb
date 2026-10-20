import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { http } from "@/lib/http";

/**
 * 原件：`r4t`（offset 6,066,003）—— `/plugins/:pluginCode/*` 插件运行时页面。
 *
 * 已还原的分支（`s` = 通配段去斜杠，`h` = 命中的 admin_menus 声明，`g` = admin_crud[s]，`d` = 插件有配置）：
 *  - 插件不存在                     -> "插件不存在" 卡片 + 返回插件管理
 *  - 插件未启用                     -> "插件已禁用" 卡片 + 返回插件管理
 *  - g（admin_crud 命中）           -> 该段由插件 CRUD schema 驱动（当前版本未实现，占位）
 *  - h（admin_menus 命中）          -> 占位卡片：plugin:runtime.pluginMenuPageDescription
 *                                      + 插件名 + 真实 href + 返回插件概览
 *  - 仅存在但未命中任何声明          -> "插件页面不存在" 卡片
 *  - 否则（无通配段 / 仅 settings） -> Tabs：概览（元数据 / 菜单声明 / README）+ 设置（JSON 配置）
 *
 * 端点：GET /plugin/getPlugins（bundle 的 `Ult()`）、GET|POST /plugin/config。
 */

function securePath(): string {
  return window.settings?.secure_path ?? "";
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
  config: Record<string, unknown>;
  readme: string;
  admin_menus?: AdminMenuDecl[] | null;
  admin_crud?: Record<string, unknown> | null;
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

/** 原件 Klt */
function normalizePath(path: string): string {
  return path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

/** 原件 Glt */
function pluginMenuHref(code: string, path: string): string {
  const normalized = normalizePath(path);
  return normalized ? `/plugins/${code}/${normalized}` : `/plugins/${code}`;
}

export default function PluginPage() {
  const params = useParams<{ pluginCode?: string; "*"?: string }>();
  const pluginCode = params.pluginCode ?? "";
  const section = (params["*"] ?? "").replace(/^\/+/, "");

  const { t } = useTranslation(["plugin", "common"]);

  const { data: plugins, isLoading } = useQuery<PluginItem[]>({
    queryKey: ["pluginList"],
    queryFn: async () => {
      const response = await http.get(`${securePath()}/plugin/getPlugins`);
      return ((response.data as ApiEnvelope<PluginItem[]>).data ?? []) as PluginItem[];
    } });

  const plugin = plugins?.find((item) => item.code === pluginCode) ?? null;
  const hasConfig = Boolean(plugin?.config) && Object.keys(plugin?.config ?? {}).length > 0;

  const menu = React.useMemo(() => {
    if (!plugin || !section) return null;
    return (plugin.admin_menus ?? []).find((decl) => normalizePath(decl.path) === normalizePath(section)) ?? null;
  }, [plugin, section]);

  const crud = plugin?.admin_crud && section ? (plugin.admin_crud[normalizePath(section)] ?? null) : null;

  const title = menu?.title ?? plugin?.name ?? pluginCode ?? t("title");
  const description =
    menu?.description ??
    plugin?.description ??
    t("runtime.pageDescription", { defaultValue: "查看插件元数据、文档与配置。" });

  return (
    <Layout>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {plugin?.version && <Badge variant="outline">v{plugin.version}</Badge>}
              {menu?.label && <Badge variant="outline">{menu.label}</Badge>}
            </div>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
              <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : !plugin ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("runtime.notFoundTitle", { defaultValue: "插件不存在" })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("runtime.notFoundDescription", {
                    defaultValue: "请求的插件不存在或已不可用。" })}
                </p>
                <Button asChild>
                  <Link to="/config/plugin">{t("runtime.backToManager", { defaultValue: "返回插件管理" })}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : !plugin.is_enabled ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("runtime.disabledTitle", { defaultValue: "插件已禁用" })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("runtime.disabledDescription", {
                    defaultValue: "请先在插件管理中启用该插件，再访问它的后台页面。" })}
                </p>
                <Button asChild>
                  <Link to="/config/plugin">{t("runtime.backToManager", { defaultValue: "返回插件管理" })}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : crud ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("runtime.crudPageTitle", { defaultValue: "插件 CRUD 页面" })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("runtime.pluginCrudPageDescription", {
                    defaultValue: "该页面的字段与行为由插件声明的 CRUD schema 决定，当前版本以占位形式呈现。" })}
                </p>
                <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-4 text-xs leading-relaxed">
                  {JSON.stringify(crud, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : menu ? (
            <Card>
              <CardHeader>
                <CardTitle>{menu.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("runtime.pluginMenuPageDescription", {
                    defaultValue: "该页面由插件提供，自定义渲染将在后续版本支持。" })}
                </p>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <div className="space-y-1 text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Plugin:</span> {plugin.name}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Path:</span>{" "}
                      <code>{pluginMenuHref(plugin.code, menu.path)}</code>
                    </div>
                  </div>
                </div>
                <Button asChild>
                  <Link to={`/plugins/${plugin.code}`}>
                    {t("runtime.backToOverview", { defaultValue: "返回插件概览" })}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : section && section !== "settings" ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("runtime.pageNotFoundTitle", { defaultValue: "插件页面不存在" })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("runtime.pageNotFoundDescription", {
                    defaultValue: "当前运行模式下没有该插件页面。" })}
                </p>
                <Button asChild>
                  <Link to={`/plugins/${plugin.code}`}>
                    {t("runtime.backToOverview", { defaultValue: "返回插件概览" })}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PluginOverview plugin={plugin} hasConfig={hasConfig} section={section} />
          )}
        </div>
      </LayoutBody>
    </Layout>
  );
}

/** 概览 / 设置 两个 Tab（原件 r4t 的非 menu 分支） */
function PluginOverview({
  plugin,
  hasConfig,
  section }: {
  plugin: PluginItem;
  hasConfig: boolean;
  section: string;
}) {
  const { t } = useTranslation(["plugin", "common"]);
  const navigate = useNavigate();

  return (
    <Tabs
      value={section === "settings" && hasConfig ? "settings" : "overview"}
      onValueChange={(value) => navigate(value === "settings" ? `/plugins/${plugin.code}/settings` : `/plugins/${plugin.code}`)}
      className="space-y-6"
    >
      <TabsList>
        <TabsTrigger value="overview">{t("runtime.overview", { defaultValue: "概览" })}</TabsTrigger>
        {hasConfig && <TabsTrigger value="settings">{t("runtime.settings", { defaultValue: "设置" })}</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("runtime.metadataTitle", { defaultValue: "插件元数据" })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium">{t("author", { defaultValue: "作者" })}:</span> {plugin.author}
            </div>
            <div>
              <span className="font-medium">Code:</span> <code>{plugin.code}</code>
            </div>
            <div>
              <span className="font-medium">{t("runtime.version", { defaultValue: "版本" })}:</span> {plugin.version}
            </div>
            <div>
              <span className="font-medium">{t("runtime.status", { defaultValue: "状态" })}:</span>{" "}
              {plugin.is_enabled
                ? t("status.enabled", { defaultValue: "已启用" })
                : t("status.disabled", { defaultValue: "已禁用" })}
            </div>
          </CardContent>
        </Card>

        {plugin.admin_menus && plugin.admin_menus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("runtime.menuDeclarationTitle", { defaultValue: "已声明的插件菜单" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plugin.admin_menus.map((decl) => (
                <div key={decl.id} className="rounded-lg border bg-muted/20 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{decl.title}</span>
                    {decl.label && <Badge variant="outline">{decl.label}</Badge>}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    <code>{pluginMenuHref(plugin.code, decl.path)}</code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("readme.title", { defaultValue: "插件文档" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {plugin.readme ? (
              <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-xs leading-relaxed">
                {plugin.readme}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("runtime.noReadme", { defaultValue: "该插件没有提供运行时文档。" })}
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {hasConfig && (
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("config.title", { defaultValue: "配置" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <PluginConfigEditor code={plugin.code} onSaved={() => navigate(`/plugins/${plugin.code}`)} />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}

/** 设置 Tab：以 JSON 形式回写 /plugin/config（原件 bQt 的简化实现） */
function PluginConfigEditor({ code, onSaved }: { code: string; onSaved: () => void }) {
  const { t } = useTranslation(["plugin", "common"]);
  const [text, setText] = React.useState("{}");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    void http
      .get(`${securePath()}/plugin/config`, { params: { code } })
      .then((response) => {
        if (!alive) return;
        const config = ((response.data as ApiEnvelope<Record<string, { value?: unknown }>>).data ?? {}) as Record<
          string,
          { value?: unknown }
        >;
        const values: Record<string, unknown> = {};
        for (const [key, field] of Object.entries(config)) values[key] = field?.value ?? null;
        setText(JSON.stringify(values, null, 2));
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
  }, [code, t]);

  async function save() {
    let parsed: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(text);
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        toast.error("配置必须是 JSON 对象");
        return;
      }
      parsed = value as Record<string, unknown>;
    } catch {
      toast.error("JSON 解析失败");
      return;
    }
    setSaving(true);
    try {
      await http.post(`${securePath()}/plugin/config`, { code, config: parsed });
      toast.success(t("messages.configSaveSuccess"));
      onSaved();
    } catch {
      toast.error(t("messages.configSaveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        className="min-h-[240px] font-mono text-xs"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onSaved} disabled={saving}>
          {t("config.cancel", { defaultValue: "取消" })}
        </Button>
        <Button onClick={() => void save()} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("config.save", { defaultValue: "保存" })}
        </Button>
      </div>
    </div>
  );
}
