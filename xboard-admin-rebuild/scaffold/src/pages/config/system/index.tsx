import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { InputField, SelectField, SettingsSection, SwitchField, TextareaField } from "@/components/settings/settings";
import { Separator } from "@/components/ui/separator";
import { plan } from "@/api";
import {
  SystemNav,
  asBoolean,
  asNumber,
  asString,
  useSectionConfig,
  useSettingsT,
  type SectionValues } from "./system-shared";

/**
 * `/config/system` 默认子页（index）。
 *
 * 原件组件链：
 * - `dZt`（bundle offset 5761942，407B）：`<div.space-y-6><h3 settings:site.title><p settings:site.description><Separator/><cZt/></div>`
 * - `cZt`（offset 5755527，6409B）：站点设置表单体
 * - schema `lZt`（offset 5754995）：13 个字段，见下
 *
 * 数据：`GET ${secure_path}/config/fetch?key=site` → `{ data: { site: {...} } }`；
 * 保存：`POST ${secure_path}/config/save`，原件用 1000ms debounce + isEqual 基线比较。
 */

type PlanOption = { id: number; name: string };

/** 原件 `RD()` → `plan.fetch`（订阅管理数据源，用于「注册试用」下拉） */
function usePlanOptions(): PlanOption[] {
  const { data } = useQuery({ queryKey: ["plans"], queryFn: () => plan.fetch() });
  return React.useMemo<PlanOption[]>(() => {
    const rows: unknown = data?.data?.data;
    if (!Array.isArray(rows)) return [];
    return rows.flatMap<PlanOption>((row) => {
      if (!row || typeof row !== "object") return [];
      const record = row as Record<string, unknown>;
      const id = asNumber(record.id);
      if (id === null) return [];
      const name = typeof record.name === "string" ? record.name : String(id);
      return [{ id, name }];
    });
  }, [data]);
}

/** 原件 cZt 的保存整形：`null` 统一转空串 */
function nullsToEmptyString(values: SectionValues): SectionValues {
  const next: SectionValues = {};
  for (const [key, value] of Object.entries(values)) next[key] = value === null ? "" : value;
  return next;
}

/** 站点设置表单体（原件 cZt），供 index 页与 `/config/system` 骨架的 index 路由共用 */
export function SiteSettingsContent() {
  const t = useSettingsT();
  const form = useSectionConfig("site", { transform: nullsToEmptyString });
  const plans = usePlanOptions();
  const tryOutPlanId = asNumber(form.values.try_out_plan_id);

  return (
    <SettingsSection title={t("site.title")} description={t("site.description")}>
      <div className="space-y-4">
        <InputField
          label={t("site.form.siteName.label")}
          placeholder={t("site.form.siteName.placeholder")}
          description={t("site.form.siteName.description")}
          value={asString(form.values.app_name)}
          onChange={(value) => form.setValue("app_name", value)}
        />
        <InputField
          label={t("site.form.siteDescription.label")}
          placeholder={t("site.form.siteDescription.placeholder")}
          description={t("site.form.siteDescription.description")}
          value={asString(form.values.app_description)}
          onChange={(value) => form.setValue("app_description", value)}
        />
        <InputField
          label={t("site.form.siteUrl.label")}
          placeholder={t("site.form.siteUrl.placeholder")}
          description={t("site.form.siteUrl.description")}
          value={asString(form.values.app_url)}
          onChange={(value) => form.setValue("app_url", value)}
        />
        <SwitchField
          label={t("site.form.forceHttps.label")}
          description={t("site.form.forceHttps.description")}
          checked={asBoolean(form.values.force_https)}
          onChange={(checked) => form.setValue("force_https", Number(checked))}
        />
        <InputField
          label={t("site.form.logo.label")}
          placeholder={t("site.form.logo.placeholder")}
          description={t("site.form.logo.description")}
          value={asString(form.values.logo)}
          onChange={(value) => form.setValue("logo", value)}
        />
        <TextareaField
          label={t("site.form.subscribeUrl.label")}
          description={t("site.form.subscribeUrl.description")}
          value={asString(form.values.subscribe_url)}
          onChange={(value) => form.setValue("subscribe_url", value)}
        />
        <InputField
          label={t("site.form.tosUrl.label")}
          placeholder={t("site.form.tosUrl.placeholder")}
          description={t("site.form.tosUrl.description")}
          value={asString(form.values.tos_url)}
          onChange={(value) => form.setValue("tos_url", value)}
        />
        <SwitchField
          label={t("site.form.stopRegister.label")}
          description={t("site.form.stopRegister.description")}
          checked={asBoolean(form.values.stop_register)}
          onChange={(checked) => form.setValue("stop_register", Number(checked))}
        />
        <SwitchField
          label={t("site.form.ticketMustWaitReply.label")}
          description={t("site.form.ticketMustWaitReply.description")}
          checked={asBoolean(form.values.ticket_must_wait_reply)}
          onChange={(checked) => form.setValue("ticket_must_wait_reply", Number(checked))}
        />
        <SelectField
          label={t("site.form.tryOut.label")}
          description={t("site.form.tryOut.description")}
          value={tryOutPlanId === null ? "0" : String(tryOutPlanId)}
          onChange={(value) => form.setValue("try_out_plan_id", Number(value))}
          options={[
            { label: t("site.form.tryOut.placeholder"), value: "0" },
            ...plans.map((option) => ({ label: option.name, value: String(option.id) })),
          ]}
        />
        {Boolean(tryOutPlanId) && (
          <InputField
            label={t("site.form.tryOut.duration.label")}
            placeholder={t("site.form.tryOut.duration.placeholder")}
            description={t("site.form.tryOut.duration.description")}
            value={asString(form.values.try_out_hour)}
            onChange={(value) => form.setValue("try_out_hour", value)}
          />
        )}
        <InputField
          label={t("site.form.currency.label")}
          placeholder={t("site.form.currency.placeholder")}
          description={t("site.form.currency.description")}
          value={asString(form.values.currency)}
          onChange={(value) => form.setValue("currency", value)}
        />
        <InputField
          label={t("site.form.currencySymbol.label")}
          placeholder={t("site.form.currencySymbol.placeholder")}
          description={t("site.form.currencySymbol.description")}
          value={asString(form.values.currency_symbol)}
          onChange={(value) => form.setValue("currency_symbol", value)}
        />
        {form.saving && (
          <div className="text-sm text-muted-foreground">
            {t("site.form.saving", { defaultValue: "保存中..." })}
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

export default function ConfigSystemIndex() {
  const t = useSettingsT();

  return (
    <Layout fadedBelow fixedHeight>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
          <div className="text-muted-foreground">{t("description")}</div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-1 flex-col space-y-8 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="sticky top-0 lg:w-1/5">
            <SystemNav />
          </aside>
          <div className="w-full flex-1 p-1 pr-4">
            <div className="pb-16">
              <SiteSettingsContent />
            </div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  );
}
