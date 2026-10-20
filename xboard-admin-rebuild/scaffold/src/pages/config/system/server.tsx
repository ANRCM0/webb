import { Info, RefreshCw } from "lucide-react";
import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { SettingsSection, useConfig } from "@/components/settings/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  asBoolean,
  asNumber,
  asString,
  useSectionConfig,
  useSettingsT,
  type SectionValues,
} from "./system-shared";

/**
 * 原件 `/config/system/server` 的字段是堆叠布局：标签(16px) / 控件整行 / 说明(text-sm muted)，行距约 111px。
 */
function StackedField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      {children}
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/**
 * `/config/system/server` —— 节点配置。
 *
 * 原件：
 * - `IZt`（bundle offset 5797645，411B）：`h3 settings:server.title` + `p settings:server.description` + `$f`
 * - `TZt`（offset 5793458，4181B）：表单体
 * - schema `LZt`（offset 5793123）/ 默认值 `DZt`（offset 5793333）
 *
 * 原件行为细节：
 * - `server_token` 右侧有「随机生成」幽灵按钮（长度 16–32 的字母数字串）+ tooltip；
 * - `server_ws_url` 留空时回填站点网址（`site.site_url`），placeholder 也用站点网址；
 * - 表单底部有一条蓝色提示条（`server.server_ws_enable.supported_clients`）；
 * - schema 里的 `device_limit_mode` 原件表单体未渲染，此处同样不渲染。
 */

function randomToken(): string {
  
/** 原件 `/config/system/server` 的字段是堆叠布局：标签(16px) / 控件(整行) / 说明(text-sm muted)，行距 111px。 */
function StackedField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      {children}
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

const length = Math.floor(Math.random() * 17) + 16;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let index = 0; index < length; index += 1) {
    token += alphabet.charAt(Math.floor(Math.random() * 62));
  }
  return token;
}

/** 站点网址（原件 `o?.data?.site?.site_url`，用于 server_ws_url 兜底） */
function useSiteUrl(): string {
  const { data } = useConfig<{ site?: Record<string, unknown> }>("site");
  const site = data?.site;
  return typeof site?.site_url === "string" ? site.site_url : "";
}

function withSiteUrlFallback(siteUrl: string) {
  return (remote: SectionValues): SectionValues => {
    if (!remote.server_ws_url && siteUrl) return { ...remote, server_ws_url: siteUrl };
    return remote;
  };
}

export default function ConfigSystemServer() {
  const t = useSettingsT();
  const siteUrl = useSiteUrl();
  const form = useSectionConfig("server", { hydrate: withSiteUrlFallback(siteUrl) });
  const values = form.values;
  const wsEnabled = asBoolean(values.server_ws_enable);

  return (
    <>
                <SettingsSection title={t("server.title")} description={t("server.description")}>
                  <div className="space-y-8">
                    <StackedField label={t("server.server_token.title")} description={t("server.server_token.description")}>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          placeholder={t("server.server_token.placeholder")}
                          value={asString(values.server_token)}
                          onChange={(event) => form.setValue("server_token", event.target.value)}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={(event) => {
                                  event.preventDefault();
                                  form.setValue("server_token", randomToken());
                                }}
                              >
                                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("server.server_token.generate_tooltip")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </StackedField>
                    <StackedField label={t("server.server_pull_interval.title")} description={t("server.server_pull_interval.description")}>
                        <Input
                          placeholder={t("server.server_pull_interval.placeholder")}
                          value={asString(values.server_pull_interval)}
                          onChange={(event) => form.setValue("server_pull_interval", asNumber(event.target.value))}
                          type="number"
                        />
                      </StackedField>
                    <StackedField label={t("server.server_push_interval.title")} description={t("server.server_push_interval.description")}>
                        <Input
                          placeholder={t("server.server_push_interval.placeholder")}
                          value={asString(values.server_push_interval)}
                          onChange={(event) => form.setValue("server_push_interval", asNumber(event.target.value))}
                          type="number"
                        />
                      </StackedField>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t("server.server_ws_enable.title")}</Label>
                        <p className="text-xs text-muted-foreground">{t("server.server_ws_enable.description")}</p>
                      </div>
                      <Switch
                        checked={wsEnabled}
                        onCheckedChange={(checked) => form.setValue("server_ws_enable", checked)}
                      />
                    </div>
                    {wsEnabled && (
                      <StackedField
                        label={t("server.server_ws_url.title")}
                        description={t("server.server_ws_url.description")}
                      >
                        <Input
                          placeholder={siteUrl || t("server.server_ws_url.placeholder")}
                          value={asString(values.server_ws_url)}
                          onChange={(event) => form.setValue("server_ws_url", event.target.value)}
                        />
                      </StackedField>
                    )}
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{t("server.server_ws_enable.supported_clients")}</span>
                    </div>
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">{t("server.saving", { defaultValue: "保存中..." })}</div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}
