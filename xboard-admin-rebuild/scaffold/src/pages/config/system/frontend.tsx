import { ChevronDown } from "lucide-react";
import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { Field, InputField, SaveButton, SettingsSection, SwitchField } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/frontend` —— 个性化（前端主题）设置。
 *
 * 原件：
 * - `NZt`（bundle offset 5792391，389B）：**标题与描述是硬编码中文**（没有走 i18n）
 *   `h3 "个性化设置"` + `p "自定义系统界面外观，包括主题风格、布局、颜色方案、背景图等个性化选项。"` + `$f`
 * - `kZt`（offset 5790387，1998B）：表单体
 * - schema `CZt`（offset 5790060）/ 默认值 `SZt`（offset 5790261）
 *
 * 与其它设置页的差异（均与原件一致）：
 * 1. 不是自动保存，而是 `form.onSubmit`（mode `onChange`）+「保存设置」按钮；
 * 2. 文案全部硬编码中文；
 * 3. `frontend_theme_color` 用的是原生 `<select>`，不是 Radix Select；
 * 4. 该页**不在** `KGt` 页签表里（原件导航没有入口，只能直接访问路由）。
 *
 * 说明：schema 里还有 `frontend_theme` 字段，原件表单体未渲染，此处同样不渲染、原样保留。
 */

const THEME_COLORS = [
  { value: "default", label: "默认" },
  { value: "black", label: "黑色" },
  { value: "blackblue", label: "暗蓝色" },
  { value: "green", label: "奶绿色" },
] as const;

export default function ConfigSystemFrontend() {
  const t = useSettingsT();
  const form = useSectionConfig("frontend", { autoSave: false });
  const values = form.values;
  const themeColor = asString(values.frontend_theme_color) || "default";

  return (
    <>
                <SettingsSection title="个性化设置" description="自定义系统界面外观，包括主题风格、布局、颜色方案、背景图等个性化选项。">
                  <div className="space-y-4">
                    <SwitchField
                      label="边栏风格"
                      description="边栏风格"
                      checked={Boolean(values.frontend_theme_sidebar)}
                      onChange={(checked) => form.setValue("frontend_theme_sidebar", checked)}
                    />
                    <SwitchField
                      label="头部风格"
                      description="边栏风格"
                      checked={Boolean(values.frontend_theme_header)}
                      onChange={(checked) => form.setValue("frontend_theme_header", checked)}
                    />
                    <Field label="主题色" description="主题色">
                      <div className="relative w-max">
                        <select
                          className={cn(buttonVariants({ variant: "outline" }), "w-[200px] appearance-none font-normal")}
                          value={themeColor}
                          onChange={(event) => form.setValue("frontend_theme_color", event.target.value)}
                        >
                          {THEME_COLORS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </Field>
                    <InputField
                      label="背景"
                      placeholder="请输入图片地址"
                      description="将会在后台登录页面进行展示。"
                      value={asString(values.frontend_background_url)}
                      onChange={(value) => form.setValue("frontend_background_url", value)}
                    />
                    <div className="flex items-center justify-between">
                      <SaveButton onClick={form.save} loading={form.saving} label="保存设置" />
                    </div>
                  </div>
                </SettingsSection>
            
    </>
  );
}
