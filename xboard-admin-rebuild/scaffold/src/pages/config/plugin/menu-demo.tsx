import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  CreditCard,
  FileText,
  Package,
  Plus,
  Settings,
  Shield,
  Trash2,
  Users,
  type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { cn } from "@/lib/utils";

/**
 * 原件：`f1t`（offset 5,974,389）—— 插件菜单 CRUD 演示页。
 *
 * 全部为本地状态演示，不触网：
 *  - 种子插件 `p1t`（code=traffic-analytics，2 个 admin_menus）；
 *  - 新增项由 `m1t(i)` 生成 `{id:"menu-<i>", title:"", path:"", icon:"settings", label:"", description:""}`；
 *  - 预览侧边栏由 `Zlt([plugin])` 构建：只保留 is_installed && is_enabled 的插件，
 *    菜单项 href = `Glt(code, Klt(path))` = `/plugins/<code>/<去首尾斜杠的 path>`，
 *    空 path 的菜单不会出现在侧边栏；分组按插件 name 排序。
 */

interface AdminMenu {
  id: string;
  title: string;
  path: string;
  icon: string;
  label?: string;
  description?: string;
}

interface DemoPlugin {
  code: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: string;
  is_installed: boolean;
  is_enabled: boolean;
  config: Record<string, unknown>;
  readme: string;
  admin_menus: AdminMenu[];
}

/** 原件 p1t：本地演示插件 */
const DEMO_PLUGIN: DemoPlugin = {
  code: "traffic-analytics",
  name: "Traffic Analytics",
  version: "1.2.0",
  description: "Demonstrates opt-in plugin menu contributions.",
  author: "XBoard Labs",
  type: "feature",
  is_installed: true,
  is_enabled: true,
  config: { refresh_interval: 15 },
  readme: "# Traffic Analytics\n\nThis is a local demo for plugin admin menus.",
  admin_menus: [
    {
      id: "overview",
      title: "Overview",
      path: "overview",
      icon: "dashboard",
      label: "default",
      description: "Plugin landing page" },
    {
      id: "reports",
      title: "Reports",
      path: "reports",
      icon: "bar-chart-3",
      description: "Traffic reporting center" },
  ] };

/** 原件 m1t */
function createMenu(index: number): AdminMenu {
  return { id: `menu-${index}`, title: "", path: "", icon: "settings", label: "", description: "" };
}

/** 原件 Klt：去掉首尾斜杠 */
function normalizePath(path: string): string {
  return path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

/** 原件 Glt：插件菜单的最终路由 */
function pluginMenuHref(code: string, path: string): string {
  const normalized = normalizePath(path);
  return normalized ? `/plugins/${code}/${normalized}` : `/plugins/${code}`;
}

/** 原件 $lt：菜单可选图标（value 与 lucide 图标名一致） */
const ICON_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "dashboard", label: "Dashboard" },
  { value: "bar-chart-3", label: "Bar Chart" },
  { value: "credit-card", label: "Credit Card" },
  { value: "file-text", label: "File Text" },
  { value: "package", label: "Package" },
  { value: "settings", label: "Settings" },
  { value: "shield", label: "Shield" },
  { value: "users", label: "Users" },
];

const ICONS: Record<string, LucideIcon> = {
  dashboard: Package,
  "bar-chart-3": BarChart3,
  "credit-card": CreditCard,
  "file-text": FileText,
  package: Package,
  settings: Settings,
  shield: Shield,
  users: Users };

function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) return Settings;
  return ICONS[name] ?? Settings;
}

/** 原件 Zlt 里按 type 选插件分组图标 */
function pluginTypeIcon(type: string): LucideIcon {
  switch (type) {
    case "payment":
      return CreditCard;
    case "theme":
      return Package;
    case "feature":
      return Package;
    default:
      return Package;
  }
}

export default function ConfigPluginMenuDemo() {
  const { t } = useTranslation("plugin");
  const [plugin, setPlugin] = React.useState<DemoPlugin>(DEMO_PLUGIN);

  const patchMenu = React.useCallback((id: string, patch: Partial<AdminMenu>) => {
    setPlugin((prev) => ({
      ...prev,
      admin_menus: prev.admin_menus.map((menu) => (menu.id === id ? { ...menu, ...patch } : menu)) }));
  }, []);

  /** 原件 Zlt([plugin])：构建侧边栏预览项 */
  const previewItems = React.useMemo(
    () =>
      plugin.admin_menus
        .filter((menu) => normalizePath(menu.path) !== "")
        .map((menu) => ({
          id: menu.id,
          title: menu.title || t("runtime.unnamedMenu", { defaultValue: "未命名菜单" }),
          label: menu.label,
          href: pluginMenuHref(plugin.code, menu.path),
          Icon: resolveIcon(menu.icon) })),
    [plugin, t],
  );

  const GroupIcon = pluginTypeIcon(plugin.type);
  const hasMenus = plugin.admin_menus.length > 0;

  return (
    <Layout>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("runtime.menuCrudTitle", { defaultValue: "插件菜单 CRUD 演示" })}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("runtime.menuCrudDescription", {
                defaultValue: "只有插件在 admin_menus 中声明的菜单才会渲染进侧边栏，可在此编辑并预览最终效果。" })}
            </p>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>{t("runtime.menuCrudTitle", { defaultValue: "菜单项" })}</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setPlugin((prev) => ({
                      ...prev,
                      admin_menus: [...prev.admin_menus, createMenu(prev.admin_menus.length + 1)] }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("runtime.addMenu", { defaultValue: "添加菜单" })}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasMenus ? (
                  plugin.admin_menus.map((menu, index) => (
                    <Card key={menu.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">
                              {menu.title || t("runtime.unnamedMenu", { defaultValue: `菜单 ${index + 1}` })}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {pluginMenuHref(plugin.code, menu.path)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("delete.button", { defaultValue: "删除" })}
                            onClick={() =>
                              setPlugin((prev) => ({
                                ...prev,
                                admin_menus: prev.admin_menus.filter((item) => item.id !== menu.id) }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("runtime.menuTitle", { defaultValue: "标题" })}
                          </label>
                          <Input
                            value={menu.title}
                            onChange={(e) => patchMenu(menu.id, { title: e.target.value })}
                            placeholder="Reports"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("runtime.menuPath", { defaultValue: "路径" })}
                          </label>
                          <Input
                            value={menu.path}
                            onChange={(e) => patchMenu(menu.id, { path: e.target.value })}
                            placeholder="reports"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("runtime.menuIcon", { defaultValue: "图标" })}
                          </label>
                          <Select
                            value={menu.icon || "settings"}
                            onValueChange={(value) => patchMenu(menu.id, { icon: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t("runtime.menuLabel", { defaultValue: "徽标" })}
                          </label>
                          <Input
                            value={menu.label ?? ""}
                            onChange={(e) => patchMenu(menu.id, { label: e.target.value })}
                            placeholder="beta"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    {t("runtime.noDeclaredMenus", {
                      defaultValue: "该插件未声明任何后台菜单，因此不会出现在侧边栏中。" })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("runtime.sidebarPreviewTitle", { defaultValue: "侧边栏预览" })}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("runtime.sidebarPreviewDescription", {
                    defaultValue: "预览与运行时使用同一套菜单构建逻辑，因此与最终侧边栏一致。" })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewItems.length ? (
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div>
                        <GroupIcon className="h-4 w-4" />
                      </div>
                      <div className="font-medium">{plugin.name}</div>
                      {plugin.version && <Badge variant="outline">v{plugin.version}</Badge>}
                    </div>
                    <div className="space-y-2">
                      {previewItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <item.Icon className="h-4 w-4" />
                            </div>
                            <span>{item.title}</span>
                          </div>
                          <span className={cn("flex items-center gap-2")}>
                            {item.label && <Badge variant="outline">{item.label}</Badge>}
                            <code className="text-xs text-muted-foreground">{item.href}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    {t("runtime.previewEmpty", { defaultValue: "该插件不会渲染任何侧边栏条目。" })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  );
}
