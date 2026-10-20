import * as React from "react";
import Editor from "@monaco-editor/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutBody } from "@/components/layout/layout";
import { UserNav } from "@/components/layout/header-widgets";
import { InputField, SelectField, SettingsSection, SwitchField } from "@/components/settings/settings";
import { useConfig } from "@/components/settings/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { http } from "@/lib/http";
import { asBoolean, asNumber, asString, useSectionConfig, useSettingsT } from "./system-shared";

/**
 * `/config/system/email` —— 邮件设置（两个页签）。
 *
 * 原件：
 * - `xYt`（bundle offset 5818563，751B）：`h3 settings:email.title` + `p settings:email.description` + `$f`
 *   + Tabs（`email.tab_settings` / `email.tab_templates`）
 * - `MZt`（offset 5800676，4273B）：基本设置（SMTP + 测试发信）
 * - `bYt`（offset 5809704，4737B）：模板管理（列表 / 详情 / 编辑器 / 预览 / 保存 / 恢复默认 / 测试）
 * - `yYt`（offset 5814441，4059B）：模板编辑器主体（Monaco html + iframe 预览 + 占位符表）
 * - `RZt`（offset 5798057，2290B）：测试发信结果弹窗
 * - schema `OZt`（offset 5800354）
 *
 * 邮件模板端点（原件 `ST`，bundle offset 542557）未收录进 `src/api/index.ts`，此处按原路径直连：
 * `GET  ${secure_path}/mail/template/list`
 * `GET  ${secure_path}/mail/template/get?name=`
 * `POST ${secure_path}/mail/template/save | /reset | /test`
 */

const SECURE = window.settings?.secure_path ?? "";

/* ------------------------------------------------------------------ 类型与解析 */

type MailTemplateSummary = { name: string; label: string; customized: boolean };

type MailTemplateDetail = {
  name: string;
  subject: string;
  content: string;
  requiredVars: string[];
  optionalVars: string[];
};

type TemplateDraft = { subject: string; content: string; dirty: boolean };

type VarMeta = Record<string, { desc: string; sample: string }>;

type TestMailResult = {
  error: string;
  email: string;
  subject: string;
  templateName: string;
  config: {
    driver: string;
    host: string;
    port: string;
    encryption: string;
    from: string;
    username: string;
  } | null;
};

type JsonResponse = { data?: unknown };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(record: Record<string, unknown> | null, key: string): string {
  const value = record ? record[key] : undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function readStringArray(record: Record<string, unknown> | null, key: string): string[] {
  const value = record ? record[key] : undefined;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseSummary(raw: unknown): MailTemplateSummary | null {
  const record = asRecord(raw);
  const name = readString(record, "name");
  if (!record || !name) return null;
  return {
    name,
    label: readString(record, "label") || name,
    customized: record.customized === true,
  };
}

function parseDetail(raw: unknown): MailTemplateDetail | null {
  const record = asRecord(raw);
  const name = readString(record, "name");
  if (!record || !name) return null;
  return {
    name,
    subject: readString(record, "subject"),
    content: readString(record, "content"),
    requiredVars: readStringArray(record, "required_vars"),
    optionalVars: readStringArray(record, "optional_vars"),
  };
}

function parseTestMailResult(raw: unknown): TestMailResult | null {
  const record = asRecord(raw);
  if (!record) return null;
  const config = asRecord(record.config);
  const from = asRecord(config?.from);
  const fromAddress = readString(from, "address");
  const fromName = readString(from, "name");
  return {
    error: readString(record, "error"),
    email: readString(record, "email"),
    subject: readString(record, "subject"),
    templateName: readString(record, "template_name"),
    config: config
      ? {
          driver: readString(config, "driver"),
          host: readString(config, "host"),
          port: readString(config, "port"),
          encryption: readString(config, "encryption"),
          from: fromAddress ? `${fromAddress}${fromName ? ` (${fromName})` : ""}` : "",
          username: readString(config, "username"),
        }
      : null,
  };
}

/* ------------------------------------------------------------------ 邮件模板 API（原件 ST） */

const mailTemplateApi = {
  list: () => http.get<JsonResponse>(`${SECURE}/mail/template/list`),
  get: (name: string) => http.get<JsonResponse>(`${SECURE}/mail/template/get?name=${encodeURIComponent(name)}`),
  save: (payload: { name: string; subject: string; content: string }) =>
    http.post(`${SECURE}/mail/template/save`, payload),
  reset: (name: string) => http.post(`${SECURE}/mail/template/reset`, { name }),
  test: (payload: { name: string; email?: string }) => http.post(`${SECURE}/mail/template/test`, payload),
};

/* ------------------------------------------------------------------ 基本设置（原件 MZt） */

type EmailEncryption = "" | "ssl" | "tls";

function EmailSettingsTab() {
  const t = useSettingsT();
  const form = useSectionConfig("email");
  const values = form.values;
  const [result, setResult] = React.useState<TestMailResult | null>(null);
  const [resultOpen, setResultOpen] = React.useState(false);

  const testMutation = useMutation({
    mutationFn: async (): Promise<TestMailResult | null> => {
      const response = await http.post<JsonResponse>(`${SECURE}/config/testSendMail`);
      return parseTestMailResult(response.data?.data);
    },
    onSuccess: (parsed) => {
      setResult(parsed);
      setResultOpen(true);
      if (parsed?.error) toast.error(t("email.test.error"));
      else toast.success(t("email.test.success"));
    },
    onError: () => toast.error(t("email.test.error")),
  });

  const encryption = asString(values.email_encryption) as EmailEncryption;

  return (
    <>
      <div className="space-y-4">
        <InputField
          label={t("email.email_host.title")}
          placeholder={t("common.placeholder")}
          description={t("email.email_host.description")}
          value={asString(values.email_host)}
          onChange={(value) => form.setValue("email_host", value)}
        />
        <InputField
          label={t("email.email_port.title")}
          placeholder={t("common.placeholder")}
          description={t("email.email_port.description")}
          value={asString(values.email_port)}
          onChange={(value) => form.setValue("email_port", asNumber(value))}
          type="number"
        />
        <SelectField
          label={t("email.email_encryption.title")}
          description={t("email.email_encryption.description")}
          value={encryption || "none"}
          onChange={(value) => form.setValue("email_encryption", value === "none" ? "" : value)}
          options={[
            { label: t("email.email_encryption.none"), value: "none" },
            { label: t("email.email_encryption.ssl"), value: "ssl" },
            { label: t("email.email_encryption.tls"), value: "tls" },
          ]}
        />
        <InputField
          label={t("email.email_username.title")}
          placeholder={t("common.placeholder")}
          description={t("email.email_username.description")}
          value={asString(values.email_username)}
          onChange={(value) => form.setValue("email_username", value)}
        />
        <InputField
          label={t("email.email_password.title")}
          placeholder={t("common.placeholder")}
          description={t("email.email_password.description")}
          value={asString(values.email_password)}
          onChange={(value) => form.setValue("email_password", value)}
          type="password"
        />
        <InputField
          label={t("email.email_from.title")}
          placeholder={t("common.placeholder")}
          description={t("email.email_from.description")}
          value={asString(values.email_from_address)}
          onChange={(value) => form.setValue("email_from_address", value)}
        />
        <SwitchField
          label={t("email.remind_mail.title")}
          description={t("email.remind_mail.description")}
          checked={asBoolean(values.remind_mail_enable)}
          onChange={(checked) => form.setValue("remind_mail_enable", checked)}
        />
        <div className="flex items-center justify-between">
          <Button
            type="button"
            disabled={testMutation.isPending}
            onClick={() => testMutation.mutate()}
          >
            {t(testMutation.isPending ? "email.test.sending" : "email.test.title")}
          </Button>
        </div>
        {form.saving && (
          <div className="text-sm text-muted-foreground">{t("common.saving", { defaultValue: "保存中..." })}</div>
        )}
      </div>
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{result?.error ? t("email.test.error") : t("email.test.success")}</DialogTitle>
            <DialogDescription>
              {result?.error ? "发送测试邮件时遇到错误" : "测试邮件已成功发送，请检查收件箱"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="font-medium">发送详情</div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-2 text-sm">
                <div className="text-muted-foreground">收件地址</div>
                <div>{result?.email || "—"}</div>
                <div className="text-muted-foreground">邮件主题</div>
                <div>{result?.subject || "—"}</div>
                <div className="text-muted-foreground">模板名称</div>
                <div>{result?.templateName || "—"}</div>
              </div>
            </div>
            {result?.error ? (
              <div className="grid gap-2">
                <div className="font-medium text-destructive">错误信息</div>
                <div className="break-all rounded-md bg-destructive/10 p-3 text-sm text-destructive">{result.error}</div>
              </div>
            ) : null}
            {result?.config ? (
              <div className="grid gap-2">
                <div className="font-medium">配置信息</div>
                <div className="grid max-h-[200px] gap-2 overflow-auto rounded-md border p-4 text-sm">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <div className="text-muted-foreground">驱动</div>
                    <div>{result.config.driver || "—"}</div>
                    <div className="text-muted-foreground">服务器</div>
                    <div>{result.config.host || "—"}</div>
                    <div className="text-muted-foreground">端口</div>
                    <div>{result.config.port || "—"}</div>
                    <div className="text-muted-foreground">加密方式</div>
                    <div>{result.config.encryption || "无"}</div>
                    <div className="text-muted-foreground">发件人</div>
                    <div>{result.config.from || "未设置"}</div>
                    <div className="text-muted-foreground">用户名</div>
                    <div>{result.config.username || "未设置"}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ 模板管理（原件 bYt + yYt） */

const TEMPLATE_VARS = ["name", "url", "code", "content", "link"] as const;

function buildVarMeta(siteUrl: string): VarMeta {
  const base = siteUrl || "https://example.com";
  return {
    name: { desc: "站点名称", sample: "XBoard" },
    url: { desc: "站点网址", sample: base },
    code: { desc: "验证码", sample: "123456" },
    content: { desc: "通知正文", sample: "这是一封测试通知邮件。" },
    link: { desc: "登录链接", sample: `${base}/login?token=test` },
  };
}

function renderPreview(subject: string, content: string, meta: VarMeta): string {
  let body = content;
  let title = subject;
  for (const key of Object.keys(meta)) {
    body = body.split(`{{${key}}}`).join(meta[key].sample);
    title = title.split(`{{${key}}}`).join(meta[key].sample);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}</style></head><body>${body}</body></html>`;
}

function EmailTemplatesTab() {
  const t = useSettingsT();
  const queryClient = useQueryClient();
  const { data: siteConfig } = useConfig<{ site?: Record<string, unknown> }>("site");
  const siteUrl = readString(asRecord(siteConfig?.site), "app_url");
  const varMeta = React.useMemo(() => buildVarMeta(siteUrl), [siteUrl]);

  const [active, setActive] = React.useState("");
  const [drafts, setDrafts] = React.useState<Record<string, TemplateDraft>>({});
  const hydrated = React.useRef<Set<string>>(new Set());
  const [pendingTab, setPendingTab] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [testOpen, setTestOpen] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");

  const { data: listResponse, isLoading: listLoading } = useQuery({
    queryKey: ["mail-template", "list"],
    queryFn: () => mailTemplateApi.list(),
  });

  const templates = React.useMemo<MailTemplateSummary[]>(() => {
    const rows: unknown = listResponse?.data?.data;
    if (!Array.isArray(rows)) return [];
    return rows.flatMap<MailTemplateSummary>((row) => {
      const summary = parseSummary(row);
      return summary ? [summary] : [];
    });
  }, [listResponse]);

  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ["mail-template", "detail", active],
    queryFn: () => mailTemplateApi.get(active),
    enabled: Boolean(active),
  });

  const detail = React.useMemo(() => parseDetail(detailResponse?.data?.data), [detailResponse]);

  React.useEffect(() => {
    if (!active && templates.length > 0) setActive(templates[0].name);
  }, [templates, active]);

  React.useEffect(() => {
    if (!detail || hydrated.current.has(detail.name)) return;
    hydrated.current.add(detail.name);
    setDrafts((previous) => ({
      ...previous,
      [detail.name]: { subject: detail.subject, content: detail.content, dirty: false },
    }));
  }, [detail]);

  const draft = drafts[active];
  const dirty = draft?.dirty ?? false;
  const customized = templates.find((item) => item.name === active)?.customized ?? false;

  const invalidate = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["mail-template", "list"] });
    void queryClient.invalidateQueries({ queryKey: ["mail-template", "detail", active] });
  }, [queryClient, active]);

  const saveMutation = useMutation({
    mutationFn: mailTemplateApi.save,
    onSuccess: () => {
      hydrated.current.delete(active);
      setDrafts((previous) => ({ ...previous, [active]: { ...previous[active], dirty: false } }));
      invalidate();
      toast.success(t("email_template.save_success"));
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => mailTemplateApi.reset(active),
    onSuccess: () => {
      hydrated.current.delete(active);
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[active];
        return next;
      });
      invalidate();
      toast.success(t("email_template.reset_success"));
    },
    onSettled: () => setResetOpen(false),
  });

  const testMutation = useMutation({
    mutationFn: () => mailTemplateApi.test({ name: active, email: testEmail || undefined }),
    onSuccess: () => {
      toast.success(t("email_template.test_success"));
      setTestOpen(false);
    },
  });

  const updateDraft = React.useCallback(
    (patch: Partial<Pick<TemplateDraft, "subject" | "content">>) => {
      setDrafts((previous) => ({
        ...previous,
        [active]: { ...previous[active], ...patch, dirty: true },
      }));
    },
    [active],
  );

  const handleTabChange = (next: string) => {
    if (next === active) return;
    if (dirty) {
      setPendingTab(next);
      setDiscardOpen(true);
      return;
    }
    setActive(next);
  };

  const confirmDiscard = () => {
    if (pendingTab) {
      hydrated.current.delete(active);
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[active];
        return next;
      });
      setActive(pendingTab);
    }
    setPendingTab(null);
    setDiscardOpen(false);
  };

  const insertPlaceholder = (variable: string) => {
    if (!draft) return;
    updateDraft({ content: `${draft.content}{{${variable}}}` });
  };

  if (listLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">{t("common.loading", { defaultValue: "加载中..." })}</div>
      </div>
    );
  }

  const variables = detail ? [...detail.requiredVars, ...detail.optionalVars] : [...TEMPLATE_VARS];
  const previewDoc = draft ? renderPreview(draft.subject, draft.content, varMeta) : "";

  return (
    <>
      <Tabs value={active} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {templates.map((template) => (
            <TabsTrigger key={template.name} value={template.name} className="gap-1.5 text-xs">
              {template.label}
              {template.customized ? (
                <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                  {t("email_template.customized")}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {templates.map((template) => (
          <TabsContent key={template.name} value={template.name} className="mt-4">
            {active !== template.name ? null : detailLoading && !draft ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-sm text-muted-foreground">{t("common.loading", { defaultValue: "加载中..." })}</div>
              </div>
            ) : detail && draft ? (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                  {t("email_template.override_hint")}
                </div>
                <div className="space-y-2">
                  <Label>{t("email_template.subject")}</Label>
                  <Input
                    value={draft.subject}
                    placeholder={t("email_template.subject_placeholder")}
                    onChange={(event) => updateDraft({ subject: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("email_template.placeholders")}</Label>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">{t("email_template.var_name")}</th>
                          <th className="px-3 py-2 text-left font-medium">{t("email_template.var_desc")}</th>
                          <th className="px-3 py-2 text-left font-medium">{t("email_template.var_sample")}</th>
                          <th className="px-3 py-2 text-left font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {variables.map((variable) => {
                          const meta = varMeta[variable];
                          return (
                            <tr key={variable} className="border-b last:border-0">
                              <td className="px-3 py-2 font-mono text-xs">
                                {`{{${variable}}}`}
                                {detail.requiredVars.includes(variable) ? (
                                  <Badge variant="destructive" className="ml-1.5 px-1 py-0 text-[10px]">
                                    {t("email_template.required")}
                                  </Badge>
                                ) : null}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{meta?.desc ?? variable}</td>
                              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                                {meta?.sample ?? "-"}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer select-none text-xs"
                                  onClick={() => insertPlaceholder(variable)}
                                >
                                  {t("email_template.insert")}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("email_template.placeholder_hint")}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("email_template.content")}</Label>
                    <div className="overflow-hidden rounded-md border">
                      <Editor
                        height="450px"
                        defaultLanguage="html"
                        value={draft.content}
                        onChange={(value) => updateDraft({ content: value ?? "" })}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          wordWrap: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          lineNumbers: "on",
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("email_template.preview")}</Label>
                    <div className="overflow-hidden rounded-md border bg-white">
                      <iframe
                        title="preview"
                        sandbox="allow-same-origin"
                        className="w-full border-0"
                        style={{ height: "450px" }}
                        srcDoc={previewDoc}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" disabled={!dirty} onClick={() => saveMutation.mutate({ name: active, subject: draft.subject, content: draft.content })}>
                    {t("email_template.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={dirty}
                    title={dirty ? t("email_template.save_before_test") : ""}
                    onClick={() => setTestOpen(true)}
                  >
                    {t("email_template.send_test")}
                  </Button>
                  {customized ? (
                    <Button type="button" variant="destructive" onClick={() => setResetOpen(true)}>
                      {t("email_template.reset")}
                    </Button>
                  ) : null}
                  {dirty ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {t("email_template.unsaved")}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("email_template.discard_title")}</DialogTitle>
            <DialogDescription>{t("email_template.discard_description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingTab(null);
                setDiscardOpen(false);
              }}
            >
              {t("email_template.cancel")}
            </Button>
            <Button type="button" onClick={confirmDiscard}>
              {t("email_template.discard_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("email_template.reset_title")}</DialogTitle>
            <DialogDescription>{t("email_template.reset_description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              {t("email_template.cancel")}
            </Button>
            <Button type="button" disabled={resetMutation.isPending} onClick={() => resetMutation.mutate()}>
              {t("email_template.reset_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("email_template.test_dialog_title")}</DialogTitle>
            <DialogDescription>{t("email_template.test_dialog_description")}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="email"
              value={testEmail}
              placeholder={t("email_template.test_email_placeholder")}
              onChange={(event) => setTestEmail(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTestOpen(false)}>
              {t("email_template.cancel")}
            </Button>
            <Button type="button" disabled={testMutation.isPending} onClick={() => testMutation.mutate()}>
              {t(testMutation.isPending ? "email_template.sending" : "email_template.send_test")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ 页面（原件 xYt） */

export default function ConfigSystemEmail() {
  const t = useSettingsT();

  return (
    <>
                <SettingsSection title={t("email.title")} description={t("email.description")}>
                  <Tabs defaultValue="settings" className="w-full">
                    <TabsList>
                      <TabsTrigger value="settings">{t("email.tab_settings")}</TabsTrigger>
                      <TabsTrigger value="templates">{t("email.tab_templates")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="settings" className="mt-4">
                      <EmailSettingsTab />
                    </TabsContent>
                    <TabsContent value="templates" className="mt-4">
                      <EmailTemplatesTab />
                    </TabsContent>
                  </Tabs>
                </SettingsSection>
            
    </>
  );
}
