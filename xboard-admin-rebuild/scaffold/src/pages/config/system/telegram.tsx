import { ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SettingsSection, SwitchField } from "@/components/settings/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { http } from "@/lib/http";
import { asBoolean, asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/telegram` —— Telegram 设置。
 *
 * 原件：
 * - `kYt`（bundle offset 5823422，415B）：`h3 settings:telegram.title` + `p settings:telegram.description` + `$f`
 * - `SYt`（offset 5819571，3845B）：表单体
 * - schema `wYt`（offset 5819315）/ 默认值 `CYt`（offset 5819471）
 *
 * 原件行为：填了 `telegram_bot_token` 才出现 Webhook 区块；
 * 「一键设置」调用 `POST ${secure_path}/config/setTelegramWebhook`，
 * 成功 toast 里带 `webhook_url` / `webhook_base_url` 调试信息（duration 6000）。
 */

const SECURE = window.settings?.secure_path ?? "";

type WebhookResult = { webhook_url?: string; webhook_base_url?: string };

type WebhookResponse = { data?: WebhookResult };

export default function ConfigSystemTelegram() {
  const t = useSettingsT();
  const form = useSectionConfig("telegram");
  const values = form.values;

  const webhookMutation = useMutation({
    mutationFn: async (): Promise<WebhookResult | null> => {
      const response = await http.post<WebhookResponse>(`${SECURE}/config/setTelegramWebhook`);
      return response.data?.data ?? null;
    },
    onSuccess: (result) => {
      if (!result) return;
      const rows = [
        { label: t("telegram.webhook.debug.url"), value: result.webhook_url ?? "" },
        { label: t("telegram.webhook.debug.baseUrl"), value: result.webhook_base_url ?? "" },
      ];
      toast.success(t("telegram.webhook.success"), {
        duration: 6000,
        description: (
          <div className="mt-2 grid gap-2">
            {rows.map((row) => (
              <div key={row.label} className="rounded-md border border-border/60 bg-background/60 px-3 py-2.5">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {row.label}
                </div>
                <div className="mt-1 break-all font-mono text-[11px] leading-5 text-foreground/90">{row.value}</div>
              </div>
            ))}
          </div>
        ),
      });
    },
    onError: () => toast.error(t("common.saveFailed", { defaultValue: "设置失败" })),
  });

  const botToken = asString(values.telegram_bot_token);
  const webhookUrl = asString(values.telegram_webhook_url);
  const webhookTarget = webhookUrl.trim()
    ? t("telegram.webhook.target_custom", { url: webhookUrl.trim() })
    : t("telegram.webhook.target_default");

  return (
    <>
                <SettingsSection title={t("telegram.title")} description={t("telegram.description")}>
                  <div className="space-y-4">
                    <InputField
                      label={t("telegram.bot_token.title")}
                      placeholder={t("telegram.bot_token.placeholder")}
                      description={t("telegram.bot_token.description")}
                      value={botToken}
                      onChange={(value) => form.setValue("telegram_bot_token", value)}
                    />
                    {Boolean(botToken) && (
                      <div className="space-y-2 py-3">
                        <Label className="text-base">{t("telegram.webhook_url.title")}</Label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <Input
                            className="sm:flex-1"
                            placeholder={t("telegram.webhook_url.placeholder")}
                            value={webhookUrl}
                            onChange={(event) => form.setValue("telegram_webhook_url", event.target.value)}
                          />
                          <Button
                            type="button"
                            className="sm:shrink-0"
                            disabled={webhookMutation.isPending}
                            onClick={() => webhookMutation.mutate()}
                          >
                            {t(webhookMutation.isPending ? "telegram.webhook.setting" : "telegram.webhook.button")}
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            {t("telegram.webhook_url.description")} {webhookTarget}
                          </p>
                          <a
                            href="https://core.telegram.org/bots/webhooks"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {t("telegram.webhook_url.docs")}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                    <SwitchField
                      label={t("telegram.bot_enable.title")}
                      description={t("telegram.bot_enable.description")}
                      checked={asBoolean(values.telegram_bot_enable)}
                      onChange={(checked) => form.setValue("telegram_bot_enable", checked)}
                    />
                    <InputField
                      label={t("telegram.discuss_link.title")}
                      placeholder={t("telegram.discuss_link.placeholder")}
                      description={t("telegram.discuss_link.description")}
                      value={asString(values.telegram_discuss_link)}
                      onChange={(value) => form.setValue("telegram_discuss_link", value)}
                    />
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">{t("common.saving", { defaultValue: "保存中..." })}</div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}
