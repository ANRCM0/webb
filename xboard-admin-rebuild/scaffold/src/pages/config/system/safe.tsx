import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SelectField, SettingsSection, SwitchField, TextareaField } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import {
  asBoolean,
  asString,
  asStringArray,
  useSectionConfig,
  useSettingsT,
  type SectionValues,
} from "./system-shared";

/**
 * `/config/system/safe` —— 安全设置。
 *
 * 原件：
 * - `pZt`（bundle offset 5774724，407B）：`h3 settings:safe.title` + `p settings:safe.description` + `$f`
 * - `gZt`（offset 5763782，10936B）：表单体
 * - schema `uZt`（offset 5762350）：22 个字段；默认值 `hZt`（offset 5763276）
 *
 * 渲染顺序与条件分支（`email_whitelist_enable` / `captcha_enable` / `captcha_type` /
 * `register_limit_by_ip_enable` / `password_limit_enable`）与原件一致。
 */

/** 原件 gZt 的保存整形：`email_whitelist_suffix` 过滤空行 */
function filterWhitelistSuffix(values: SectionValues): SectionValues {
  return {
    ...values,
    email_whitelist_suffix: asStringArray(values.email_whitelist_suffix).filter(Boolean),
  };
}

export default function ConfigSystemSafe() {
  const t = useSettingsT();
  const form = useSectionConfig("safe", { transform: filterWhitelistSuffix });
  const values = form.values;

  const captchaEnable = asBoolean(values.captcha_enable);
  const captchaType = asString(values.captcha_type) || "recaptcha";

  return (
    <>
                <SettingsSection title={t("safe.title")} description={t("safe.description")}>
                  <div className="space-y-4">
                    <SwitchField
                      label={t("safe.form.emailVerify.label")}
                      description={t("safe.form.emailVerify.description")}
                      checked={asBoolean(values.email_verify)}
                      onChange={(checked) => form.setValue("email_verify", checked)}
                    />
                    <SwitchField
                      label={t("safe.form.gmailLimit.label")}
                      description={t("safe.form.gmailLimit.description")}
                      checked={asBoolean(values.email_gmail_limit_enable)}
                      onChange={(checked) => form.setValue("email_gmail_limit_enable", checked)}
                    />
                    <SwitchField
                      label={t("safe.form.safeMode.label")}
                      description={t("safe.form.safeMode.description")}
                      checked={asBoolean(values.safe_mode_enable)}
                      onChange={(checked) => form.setValue("safe_mode_enable", checked)}
                    />
                    <InputField
                      label={t("safe.form.securePath.label")}
                      placeholder={t("safe.form.securePath.placeholder")}
                      description={t("safe.form.securePath.description")}
                      value={asString(values.secure_path)}
                      onChange={(value) => form.setValue("secure_path", value)}
                    />
                    <SwitchField
                      label={t("safe.form.emailWhitelist.label")}
                      description={t("safe.form.emailWhitelist.description")}
                      checked={asBoolean(values.email_whitelist_enable)}
                      onChange={(checked) => form.setValue("email_whitelist_enable", checked)}
                    />
                    {asBoolean(values.email_whitelist_enable) && (
                      <TextareaField
                        label={t("safe.form.emailWhitelist.suffixes.label")}
                        description={t("safe.form.emailWhitelist.suffixes.description")}
                        value={asStringArray(values.email_whitelist_suffix).join("\n")}
                        onChange={(value) => form.setValue("email_whitelist_suffix", value.split("\n").filter(Boolean))}
                        rows={5}
                      />
                    )}
                    <SwitchField
                      label={t("safe.form.captcha.enable.label")}
                      description={t("safe.form.captcha.enable.description")}
                      checked={captchaEnable}
                      onChange={(checked) => form.setValue("captcha_enable", checked)}
                    />
                    {captchaEnable && (
                      <>
                        <SelectField
                          label={t("safe.form.captcha.type.label")}
                          description={t("safe.form.captcha.type.description")}
                          value={captchaType}
                          onChange={(value) => form.setValue("captcha_type", value)}
                          options={[
                            { label: t("safe.form.captcha.type.options.recaptcha"), value: "recaptcha" },
                            { label: t("safe.form.captcha.type.options.recaptcha-v3"), value: "recaptcha-v3" },
                            { label: t("safe.form.captcha.type.options.turnstile"), value: "turnstile" },
                          ]}
                        />
                        {captchaType === "recaptcha" && (
                          <>
                            <InputField
                              label={t("safe.form.captcha.recaptcha.siteKey.label")}
                              placeholder={t("safe.form.captcha.recaptcha.siteKey.placeholder")}
                              description={t("safe.form.captcha.recaptcha.siteKey.description")}
                              value={asString(values.recaptcha_site_key)}
                              onChange={(value) => form.setValue("recaptcha_site_key", value)}
                            />
                            <InputField
                              label={t("safe.form.captcha.recaptcha.key.label")}
                              placeholder={t("safe.form.captcha.recaptcha.key.placeholder")}
                              description={t("safe.form.captcha.recaptcha.key.description")}
                              value={asString(values.recaptcha_key)}
                              onChange={(value) => form.setValue("recaptcha_key", value)}
                            />
                          </>
                        )}
                        {captchaType === "recaptcha-v3" && (
                          <>
                            <InputField
                              label={t("safe.form.captcha.recaptcha_v3.siteKey.label")}
                              placeholder={t("safe.form.captcha.recaptcha_v3.siteKey.placeholder")}
                              description={t("safe.form.captcha.recaptcha_v3.siteKey.description")}
                              value={asString(values.recaptcha_v3_site_key)}
                              onChange={(value) => form.setValue("recaptcha_v3_site_key", value)}
                            />
                            <InputField
                              label={t("safe.form.captcha.recaptcha_v3.secretKey.label")}
                              placeholder={t("safe.form.captcha.recaptcha_v3.secretKey.placeholder")}
                              description={t("safe.form.captcha.recaptcha_v3.secretKey.description")}
                              value={asString(values.recaptcha_v3_secret_key)}
                              onChange={(value) => form.setValue("recaptcha_v3_secret_key", value)}
                            />
                            <InputField
                              label={t("safe.form.captcha.recaptcha_v3.scoreThreshold.label")}
                              placeholder={t("safe.form.captcha.recaptcha_v3.scoreThreshold.placeholder")}
                              description={t("safe.form.captcha.recaptcha_v3.scoreThreshold.description")}
                              value={asString(values.recaptcha_v3_score_threshold)}
                              onChange={(value) => form.setValue("recaptcha_v3_score_threshold", value)}
                              type="number"
                            />
                          </>
                        )}
                        {captchaType === "turnstile" && (
                          <>
                            <InputField
                              label={t("safe.form.captcha.turnstile.siteKey.label")}
                              placeholder={t("safe.form.captcha.turnstile.siteKey.placeholder")}
                              description={t("safe.form.captcha.turnstile.siteKey.description")}
                              value={asString(values.turnstile_site_key)}
                              onChange={(value) => form.setValue("turnstile_site_key", value)}
                            />
                            <InputField
                              label={t("safe.form.captcha.turnstile.secretKey.label")}
                              placeholder={t("safe.form.captcha.turnstile.secretKey.placeholder")}
                              description={t("safe.form.captcha.turnstile.secretKey.description")}
                              value={asString(values.turnstile_secret_key)}
                              onChange={(value) => form.setValue("turnstile_secret_key", value)}
                            />
                          </>
                        )}
                      </>
                    )}
                    <SwitchField
                      label={t("safe.form.registerLimit.enable.label")}
                      description={t("safe.form.registerLimit.enable.description")}
                      checked={asBoolean(values.register_limit_by_ip_enable)}
                      onChange={(checked) => form.setValue("register_limit_by_ip_enable", checked)}
                    />
                    {asBoolean(values.register_limit_by_ip_enable) && (
                      <>
                        <InputField
                          label={t("safe.form.registerLimit.count.label")}
                          placeholder={t("safe.form.registerLimit.count.placeholder")}
                          description={t("safe.form.registerLimit.count.description")}
                          value={asString(values.register_limit_count)}
                          onChange={(value) => form.setValue("register_limit_count", value)}
                        />
                        <InputField
                          label={t("safe.form.registerLimit.expire.label")}
                          placeholder={t("safe.form.registerLimit.expire.placeholder")}
                          description={t("safe.form.registerLimit.expire.description")}
                          value={asString(values.register_limit_expire)}
                          onChange={(value) => form.setValue("register_limit_expire", value)}
                        />
                      </>
                    )}
                    <SwitchField
                      label={t("safe.form.passwordLimit.enable.label")}
                      description={t("safe.form.passwordLimit.enable.description")}
                      checked={asBoolean(values.password_limit_enable)}
                      onChange={(checked) => form.setValue("password_limit_enable", checked)}
                    />
                    {asBoolean(values.password_limit_enable) && (
                      <>
                        <InputField
                          label={t("safe.form.passwordLimit.count.label")}
                          placeholder={t("safe.form.passwordLimit.count.placeholder")}
                          description={t("safe.form.passwordLimit.count.description")}
                          value={asString(values.password_limit_count)}
                          onChange={(value) => form.setValue("password_limit_count", value)}
                        />
                        <InputField
                          label={t("safe.form.passwordLimit.expire.label")}
                          placeholder={t("safe.form.passwordLimit.expire.placeholder")}
                          description={t("safe.form.passwordLimit.expire.description")}
                          value={asString(values.password_limit_expire)}
                          onChange={(value) => form.setValue("password_limit_expire", value)}
                        />
                      </>
                    )}
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">
                        {t("safe.form.saving", { defaultValue: "保存中..." })}
                      </div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}
