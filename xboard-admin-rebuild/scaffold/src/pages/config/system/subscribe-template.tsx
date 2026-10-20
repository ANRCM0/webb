import Editor from "@monaco-editor/react";
import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { Field, SettingsSection } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/subscribe-template` —— 订阅模板（Monaco 编辑器）。
 *
 * 原件：
 * - `WQe`（bundle offset 4400706，336B）：`h3 settings:subscribe_template.title` + `p …description` + `$f`
 * - `VQe`（offset 4398529，2177B）：表单体（Tabs + Monaco）
 * - 标签/语言表 `FQe`：singbox=json、clash=yaml、clashmeta=yaml、stash=yaml、surge=ini、surfboard=ini
 * - schema `jQe`：6 个 `subscribe_template_<key>` 字符串字段；默认值 `BQe` 全空串
 *
 * 原件细节：字段键名是 `subscribe_template_<tabKey>`，标题/描述键是
 * `settings:subscribe_template.<tabKey>.{title,description}`；保存 debounce 1500ms（其它设置页为 1000ms）；
 * 加载期与保存期分别有独立提示。
 */

const TEMPLATE_TABS = [
  { key: "singbox", label: "Sing-box", language: "json" },
  { key: "clash", label: "Clash", language: "yaml" },
  { key: "clashmeta", label: "Clash Meta", language: "yaml" },
  { key: "stash", label: "Stash", language: "yaml" },
  { key: "surge", label: "Surge", language: "ini" },
  { key: "surfboard", label: "Surfboard", language: "ini" },
] as const;

const fieldName = (tabKey: string): string => `subscribe_template_${tabKey}`;

export default function ConfigSystemSubscribeTemplate() {
  const t = useSettingsT();
  const form = useSectionConfig("subscribe_template", { delay: 1500 });
  const values = form.values;

  return (
    <>
                <SettingsSection title={t("subscribe_template.title")} description={t("subscribe_template.description")}>
                  {form.loading ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="text-sm text-muted-foreground">
                        {t("common.loading", { defaultValue: "加载中..." })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Tabs defaultValue={TEMPLATE_TABS[0].key} className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto">
                          {TEMPLATE_TABS.map((tab) => (
                            <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {TEMPLATE_TABS.map((tab) => (
                          <TabsContent key={tab.key} value={tab.key} className="mt-4">
                            <Field
                              label={t(`subscribe_template.${tab.key}.title`)}
                              description={t(`subscribe_template.${tab.key}.description`)}
                            >
                              <Editor
                                height="500px"
                                defaultLanguage={tab.language}
                                value={asString(values[fieldName(tab.key)])}
                                onChange={(value) => form.setValue(fieldName(tab.key), value ?? "")}
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 14,
                                  wordWrap: "on",
                                  scrollBeyondLastLine: false,
                                  automaticLayout: true,
                                }}
                              />
                            </Field>
                          </TabsContent>
                        ))}
                      </Tabs>
                      {form.saving && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                          {t("common.saving", { defaultValue: "保存中..." })}
                        </div>
                      )}
                    </div>
                  )}
                </SettingsSection>
            
    </>
  );
}
