import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SettingsSection, SwitchField } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import {
  asBoolean,
  asString,
  asStringArray,
  useSectionConfig,
  useSettingsT,
} from "./system-shared";

/**
 * `/config/system/invite` —— 邀请 & 佣金设置。
 *
 * 原件：
 * - `wZt`（bundle offset 5789648，411B）：`h3 settings:invite.title` + `p settings:invite.description` + `$f`
 * - `xZt`（offset 5783248，6394B）：表单体
 * - schema `bZt`（offset 5782300）/ 默认值 `yZt`（offset 5782869）
 *
 * 数值语义：`invite_commission` / `invite_gen_limit` / `commission_withdraw_limit` 为数字型
 * （zod `by()` = coerce number），原件受控 input 直接绑原值；三级分销比例 onChange 时显式 `Number()`。
 */

export default function ConfigSystemInvite() {
  const t = useSettingsT();
  const form = useSectionConfig("invite");
  const values = form.values;

  const distributionEnabled = asBoolean(values.commission_distribution_enable);

  return (
    <>
                <SettingsSection title={t("invite.title")} description={t("invite.description")}>
                  <div className="space-y-4">
                    <SwitchField
                      label={t("invite.invite_force.title")}
                      description={t("invite.invite_force.description")}
                      checked={asBoolean(values.invite_force)}
                      onChange={(checked) => form.setValue("invite_force", checked)}
                    />
                    <InputField
                      label={t("invite.invite_commission.title")}
                      placeholder={t("invite.invite_commission.placeholder")}
                      description={t("invite.invite_commission.description")}
                      value={asString(values.invite_commission)}
                      onChange={(value) => form.setValue("invite_commission", value)}
                    />
                    <InputField
                      label={t("invite.invite_gen_limit.title")}
                      placeholder={t("invite.invite_gen_limit.placeholder")}
                      description={t("invite.invite_gen_limit.description")}
                      value={asString(values.invite_gen_limit)}
                      onChange={(value) => form.setValue("invite_gen_limit", value)}
                    />
                    <SwitchField
                      label={t("invite.invite_never_expire.title")}
                      description={t("invite.invite_never_expire.description")}
                      checked={asBoolean(values.invite_never_expire)}
                      onChange={(checked) => form.setValue("invite_never_expire", checked)}
                    />
                    <SwitchField
                      label={t("invite.commission_first_time.title")}
                      description={t("invite.commission_first_time.description")}
                      checked={asBoolean(values.commission_first_time_enable)}
                      onChange={(checked) => form.setValue("commission_first_time_enable", checked)}
                    />
                    <SwitchField
                      label={t("invite.commission_auto_check.title")}
                      description={t("invite.commission_auto_check.description")}
                      checked={asBoolean(values.commission_auto_check_enable)}
                      onChange={(checked) => form.setValue("commission_auto_check_enable", checked)}
                    />
                    <InputField
                      label={t("invite.commission_withdraw_limit.title")}
                      placeholder={t("invite.commission_withdraw_limit.placeholder")}
                      description={t("invite.commission_withdraw_limit.description")}
                      value={asString(values.commission_withdraw_limit)}
                      onChange={(value) => form.setValue("commission_withdraw_limit", value)}
                    />
                    <InputField
                      label={t("invite.commission_withdraw_method.title")}
                      placeholder={t("invite.commission_withdraw_method.placeholder")}
                      description={t("invite.commission_withdraw_method.description")}
                      value={asStringArray(values.commission_withdraw_method).join(",")}
                      onChange={(value) =>
                        form.setValue(
                          "commission_withdraw_method",
                          value.split(",").filter(Boolean),
                        )
                      }
                    />
                    <SwitchField
                      label={t("invite.withdraw_close.title")}
                      description={t("invite.withdraw_close.description")}
                      checked={asBoolean(values.withdraw_close_enable)}
                      onChange={(checked) => form.setValue("withdraw_close_enable", checked)}
                    />
                    <SwitchField
                      label={t("invite.commission_distribution.title")}
                      description={t("invite.commission_distribution.description")}
                      checked={distributionEnabled}
                      onChange={(checked) => form.setValue("commission_distribution_enable", checked)}
                    />
                    {distributionEnabled && (
                      <>
                        <InputField
                          label={t("invite.commission_distribution.l1")}
                          placeholder={t("invite.commission_distribution.placeholder")}
                          value={asString(values.commission_distribution_l1)}
                          onChange={(value) => form.setValue("commission_distribution_l1", value ? Number(value) : 0)}
                          type="number"
                        />
                        <InputField
                          label={t("invite.commission_distribution.l2")}
                          placeholder={t("invite.commission_distribution.placeholder")}
                          value={asString(values.commission_distribution_l2)}
                          onChange={(value) => form.setValue("commission_distribution_l2", value ? Number(value) : 0)}
                          type="number"
                        />
                        <InputField
                          label={t("invite.commission_distribution.l3")}
                          placeholder={t("invite.commission_distribution.placeholder")}
                          value={asString(values.commission_distribution_l3)}
                          onChange={(value) => form.setValue("commission_distribution_l3", value ? Number(value) : 0)}
                          type="number"
                        />
                      </>
                    )}
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">{t("invite.saving", { defaultValue: "保存中..." })}</div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}
