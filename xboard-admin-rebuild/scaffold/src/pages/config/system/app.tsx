import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SettingsSection } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import { asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/APP` —— APP 设置。
 *
 * 原件：
 * - `DYt`（bundle offset 5827101，405B）：`h3 settings:app.title` + `p settings:app.description` + `$f`
 * - `LYt`（offset 5824182，2913B）：表单体
 * - schema `NYt`（offset 5823838）/ 默认值 `EYt`（offset 5824051）
 *
 * 6 个字段：windows / macos / android 各一组「版本 + 下载地址」；
 * placeholder 统一取 `settings:common.placeholder`，保存提示取 `settings:common.saving`。
 */

const PLATFORMS = [
  { key: "windows", versionKey: "version", downloadKey: "download" },
  { key: "macos", versionKey: "version", downloadKey: "download" },
  { key: "android", versionKey: "version", downloadKey: "download" },
] as const;

export default function ConfigSystemApp() {
  const t = useSettingsT();
  const form = useSectionConfig("app");
  const values = form.values;

  return (
    <>
                <SettingsSection title={t("app.title")} description={t("app.description")}>
                  <div className="space-y-4">
                    {PLATFORMS.map((platform) => (
                      <div key={platform.key} className="space-y-4">
                        <InputField
                          label={t(`app.${platform.key}.${platform.versionKey}.title`)}
                          placeholder={t("common.placeholder")}
                          description={t(`app.${platform.key}.${platform.versionKey}.description`)}
                          value={asString(values[`${platform.key}_version`])}
                          onChange={(value) => form.setValue(`${platform.key}_version`, value)}
                        />
                        <InputField
                          label={t(`app.${platform.key}.${platform.downloadKey}.title`)}
                          placeholder={t("common.placeholder")}
                          description={t(`app.${platform.key}.${platform.downloadKey}.description`)}
                          value={asString(values[`${platform.key}_download_url`])}
                          onChange={(value) => form.setValue(`${platform.key}_download_url`, value)}
                        />
                      </div>
                    ))}
                    {form.saving && (
                      <div className="text-sm text-muted-foreground">{t("common.saving", { defaultValue: "保存中..." })}</div>
                    )}
                  </div>
                </SettingsSection>
            
    </>
  );
}
