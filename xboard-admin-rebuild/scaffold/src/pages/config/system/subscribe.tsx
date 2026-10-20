import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SelectField, SettingsSection, SwitchField } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import { asBoolean, asNumber, asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/subscribe` —— 订阅设置。
 *
 * 原件：
 * - `vZt`（bundle offset 5781882，413B）：`h3 settings:subscribe.title` + `p settings:subscribe.description` + `$f`
 * - `_Zt`（offset 5775953，5923B）：表单体
 * - schema `mZt`（offset 5775132）/ 默认值 `fZt`（offset 5775682）
 *
 * 注意：schema 里还有 `default_remind_expire`、`default_remind_traffic` 两个字段，
 * 原件表单体并未渲染它们（既不显示也不提交修改），此处同样不渲染，回填时原样保留。
 */

const RESET_TRAFFIC_METHODS = ["0", "1", "2", "3", "4"] as const;

const ORDER_EVENTS = ["0", "1"] as const;

export default function ConfigSystemSubscribe() {
  const t = useSettingsT();
  const form = useSectionConfig("subscribe");
  const values = form.values;

  const subscribePath = asString(values.subscribe_path);

  return (
    <>
                <SettingsSection title={t("subscribe.title")} description={t("subscribe.description")}>
                  <div className="space-y-4">
                    <SwitchField
                      label={t("subscribe.plan_change_enable.title")}
                      description={t("subscribe.plan_change_enable.description")}
                      checked={asBoolean(values.plan_change_enable)}
                      onChange={(checked) => form.setValue("plan_change_enable", checked)}
                    />
                    <SelectField
                      label={t("subscribe.reset_traffic_method.title")}
                      description={t("subscribe.reset_traffic_method.description")}
                      value={String(asNumber(values.reset_traffic_method) ?? 0)}
                      onChange={(value) => form.setValue("reset_traffic_method", Number(value))}
                      options={RESET_TRAFFIC_METHODS.map((value) => ({
                        value,
                        label: t(`subscribe.reset_traffic_method.options.${resetTrafficOptionKey(value)}`),
                      }))}
                    />
                    <SwitchField
                      label={t("subscribe.surplus_enable.title")}
                      description={t("subscribe.surplus_enable.description")}
                      checked={asBoolean(values.surplus_enable)}
                      onChange={(checked) => form.setValue("surplus_enable", checked)}
                    />
                    <SelectField
                      label={t("subscribe.new_order_event.title")}
                      description={t("subscribe.new_order_event.description")}
                      value={String(asNumber(values.new_order_event_id) ?? 0)}
                      onChange={(value) => form.setValue("new_order_event_id", Number(value))}
                      options={ORDER_EVENTS.map((value) => ({
                        value,
                        label: t(`subscribe.new_order_event.options.${orderEventOptionKey(value)}`),
                      }))}
                    />
                    <SelectField
                      label={t("subscribe.renew_order_event.title")}
                      description={t("subscribe.renew_order_event.description")}
                      value={String(asNumber(values.renew_order_event_id) ?? 0)}
                      onChange={(value) => form.setValue("renew_order_event_id", Number(value))}
                      options={ORDER_EVENTS.map((value) => ({
                        value,
                        label: t(`subscribe.renew_order_event.options.${orderEventOptionKey(value)}`),
                      }))}
                    />
                    <SelectField
                      label={t("subscribe.change_order_event.title")}
                      description={t("subscribe.change_order_event.description")}
                      value={String(asNumber(values.change_order_event_id) ?? 0)}
                      onChange={(value) => form.setValue("change_order_event_id", Number(value))}
                      options={ORDER_EVENTS.map((value) => ({
                        value,
                        label: t(`subscribe.change_order_event.options.${orderEventOptionKey(value)}`),
                      }))}
                    />
                    <InputField
                      label={t("subscribe.subscribe_path.title")}
                      placeholder="subscribe"
                      description={[
                        t("subscribe.subscribe_path.description"),
                        t("subscribe.subscribe_path.current_format", { path: subscribePath || "s" }),
                        t("subscribe.subscribe_path.restart_tip"),
                      ].join(" ")}
                      value={subscribePath}
                      onChange={(value) => form.setValue("subscribe_path", value)}
                    />
                    <SwitchField
                      label={t("subscribe.show_info_to_server.title")}
                      description={t("subscribe.show_info_to_server.description")}
                      checked={asBoolean(values.show_info_to_server_enable)}
                      onChange={(checked) => form.setValue("show_info_to_server_enable", checked)}
                    />
                    <SwitchField
                      label={t("subscribe.show_protocol_to_server.title")}
                      description={t("subscribe.show_protocol_to_server.description")}
                      checked={asBoolean(values.show_protocol_to_server_enable)}
                      onChange={(checked) => form.setValue("show_protocol_to_server_enable", checked)}
                    />
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">{t("subscribe.saving", { defaultValue: "保存中..." })}</div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}

/** 原件 options 键顺序：monthly_first / monthly_reset / no_reset / yearly_first / yearly_reset */
function resetTrafficOptionKey(value: string): string {
  switch (value) {
    case "0":
      return "monthly_first";
    case "1":
      return "monthly_reset";
    case "2":
      return "no_reset";
    case "3":
      return "yearly_first";
    default:
      return "yearly_reset";
  }
}

/** 原件 options 键：no_action / reset_traffic */
function orderEventOptionKey(value: string): string {
  return value === "1" ? "reset_traffic" : "no_action";
}
