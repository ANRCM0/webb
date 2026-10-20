import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import type { AxiosResponse } from "axios";
import { ChevronLeft, ChevronRight, Images, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { http } from "@/lib/http";
import { toast } from "@/components/ui/sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { LangSwitch, ThemeSwitch, UserNav } from "@/components/layout/header-widgets";
import { cn } from "@/lib/utils";

/**
 * 原件：`E1t`（offset 5,990,398）主题配置页 + `k1t`（主题配置编辑器）+ `hQt`（确认弹窗）+ `N1t`（骨架卡）。
 *
 * 已还原的端点与语义（前缀 = window.settings.secure_path）：
 *  - GET  /theme/getThemes      -> { themes: Record<string, ThemeInfo>, active: string }   （原件 BL）
 *  - POST /theme/upload         -> multipart/form-data，字段 file，仅 .zip                  （原件 HL）
 *  - POST /theme/delete         -> { name }，当前主题不可删除                               （原件 zL）
 *  - POST /theme/getThemeConfig -> { name } 返回扁平 {field_name: value} 的配置             （原件 VL）
 *  - POST /theme/saveThemeConfig-> { name, config }                                         （原件 WL）
 *  - POST /config/save          -> { frontend_theme: name } 用于切换激活主题                 （原件 kT.updateSystemConfig）
 *
 * 与原件的一处刻意差异：原件 `k1t` 按主题 config.json 的 `configs[]` 渲染逐字段表单；
 * 本重建按任务要求改用 @monaco-editor/react 直接编辑同一份扁平 JSON 配置
 * （ThemeService::getConfig 返回的 map；updateConfig 只会保留 configs[].field_name 内的键）。
 */

function securePath(): string {
  return window.settings?.secure_path ?? "";
}

interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

interface ThemeConfigField {
  field_name: string;
  label?: string;
  type?: string;
}

interface ThemeInfo {
  name?: string;
  description?: string;
  version?: string;
  background_url?: string;
  images?: string[];
  can_delete?: boolean;
  is_system?: boolean;
  configs?: ThemeConfigField[];
}

interface ThemeListData {
  themes?: Record<string, ThemeInfo>;
  active?: string;
}

type ThemeConfigValues = Record<string, unknown>;

/** 提取后端信封里的 data（原件 axios 响应拦截器统一返回 body） */
async function readEnvelope<T>(request: Promise<AxiosResponse<unknown>>): Promise<T> {
  const response = await request;
  const body = response.data as ApiEnvelope<T> | undefined;
  return (body?.data ?? null) as T;
}

export default function ConfigTheme() {
  const { t } = useTranslation(["theme", "common"]);
  const queryClient = useQueryClient();

  const [pendingName, setPendingName] = React.useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<{ name: string; images: string[] } | null>(null);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [configTheme, setConfigTheme] = React.useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = React.useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<ThemeListData>({
    queryKey: ["themeList"],
    queryFn: async () => {
      const response = await http.get(`${securePath()}/theme/getThemes`);
      return ((response.data as ApiEnvelope<ThemeListData>).data ?? {}) as ThemeListData;
    } });

  /** 原件 _(file)：非 .zip 直接 toast error，否则 POST 到 /theme/upload */
  async function uploadTheme(file: File) {
    if (!file.name.endsWith(".zip")) {
      toast.error(t("upload.error.format"));
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await http.post(`${securePath()}/theme/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" } });
      toast.success("主题上传成功");
      setUploadOpen(false);
      await refetch();
    } catch {
      toast.error(t("upload.error.format"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDrag(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") setDragging(true);
    else if (event.type === "dragleave") setDragging(false);
  }

  async function activateTheme(name: string) {
    setPendingName(name);
    try {
      await http.post(`${securePath()}/config/save`, { frontend_theme: name });
      toast.success("主题切换成功");
      await refetch();
    } catch {
      toast.error(t("common:error"));
    } finally {
      setPendingName(null);
    }
  }

  async function deleteTheme(name: string) {
    setPendingName(name);
    try {
      await http.post(`${securePath()}/theme/delete`, { name });
      toast.success("主题删除成功");
      await queryClient.invalidateQueries({ queryKey: ["themeList"] });
    } catch {
      toast.error(t("common:error"));
    } finally {
      setPendingName(null);
    }
  }

  const themes = data?.themes ?? {};
  const activeTheme = data?.active ?? "";
  const themeEntries = Object.entries(themes);

  return (
    <Layout>
      <LayoutHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ThemeSwitch />
          <LangSwitch />
          <UserNav />
        </div>
      </LayoutHeader>
      <LayoutBody>
        <header className="mb-8">
          <div className="mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">{t("description")}</div>
            <Button className="ml-4 shrink-0" size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t("upload.button")}
            </Button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <>
              <ThemeCardSkeleton />
              <ThemeCardSkeleton />
            </>
          ) : (
            themeEntries.map(([key, info]) => {
              const isActive = key === activeTheme;
              const canDelete = Boolean(info.can_delete) && !isActive;
              return (
                <Card
                  key={key}
                  className="group relative overflow-hidden transition-all hover:shadow-md"
                  style={{
                    backgroundImage: info.background_url ? `url(${info.background_url})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center" }}
                >
                  <div
                    className={cn(
                      "relative z-10 h-full transition-colors",
                      info.background_url
                        ? "bg-gradient-to-t from-background/95 via-background/80 to-background/60 backdrop-blur-[1px] group-hover:from-background/98 group-hover:via-background/90 group-hover:to-background/70"
                        : "bg-background",
                    )}
                  >
                    {info.can_delete && (
                      <div className="absolute right-2 top-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={pendingName === key || !canDelete}
                          aria-label={t("card.delete.button")}
                          onClick={() => {
                            if (isActive) {
                              toast.error(t("card.delete.error.active"));
                              return;
                            }
                            setDeleteCandidate(key);
                          }}
                        >
                          {pendingName === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{info.name ?? key}</CardTitle>
                      <CardDescription>
                        <div className="space-y-2">
                          <div>{info.description}</div>
                          {info.version && <div className="text-sm text-muted-foreground">{t("card.version", { version: info.version })}</div>}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-end space-x-3">
                      {Array.isArray(info.images) && info.images.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t("preview.title")}
                          onClick={() => {
                            setPreviewIndex(0);
                            setPreview({ name: info.name ?? key, images: info.images ?? [] });
                          }}
                        >
                          <Images className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setConfigTheme(key)}>
                        {t("card.configureTheme")}
                      </Button>
                      <Button
                        onClick={() => void activateTheme(key)}
                        disabled={pendingName === key || isActive}
                        variant={isActive ? "secondary" : "default"}
                      >
                        {pendingName === key && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isActive ? t("card.currentTheme") : t("card.activateTheme")}
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              );
            })
          )}
        </section>
      </LayoutBody>

      {/* 上传主题对话框（原件 htt + ptt + 拖拽区） */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("upload.title")}</DialogTitle>
            <DialogDescription>{t("upload.description")}</DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "relative mt-4 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-10 text-center transition-colors",
              dragging && "border-primary/50 bg-muted/50",
            )}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void uploadTheme(file);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".zip"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadTheme(file);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
                <div className="text-sm text-muted-foreground">{t("upload.uploading")}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full border-2 border-muted-foreground/25 p-3">
                  <Upload className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {t("upload.dragText")}{" "}
                    <button
                      type="button"
                      className="mx-1 text-primary hover:underline"
                      onClick={() => fileRef.current?.click()}
                    >
                      {t("upload.clickText")}
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">{t("upload.supportText")}</div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 主题截图预览（原件 imageCount/上一张/下一张/缩略图） */}
      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null);
            setPreviewIndex(0);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.name} {t("preview.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {preview && t("preview.imageCount", { current: previewIndex + 1, total: preview.images.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className="aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
              {preview?.images[previewIndex] && (
                <img
                  src={preview.images[previewIndex]}
                  alt={`${preview.name} 预览图 ${previewIndex + 1}`}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            {preview && preview.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
                  onClick={() =>
                    setPreviewIndex((index) =>
                      index === 0 ? preview.images.length - 1 : index - 1,
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
                  onClick={() =>
                    setPreviewIndex((index) =>
                      index === preview.images.length - 1 ? 0 : index + 1,
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          {preview && preview.images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {preview.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2",
                    previewIndex === index ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={image} alt={`缩略图 ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 原件 hQt：删除确认弹窗 */}
      <Dialog open={deleteCandidate !== null} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("card.delete.title")}</DialogTitle>
            <DialogDescription>{t("card.delete.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>
              {t("common:cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const name = deleteCandidate;
                setDeleteCandidate(null);
                if (name) void deleteTheme(name);
              }}
            >
              {t("card.delete.button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ThemeConfigDialog
        themeKey={configTheme}
        themeName={configTheme ? (themes[configTheme]?.name ?? configTheme) : ""}
        fields={configTheme ? (themes[configTheme]?.configs ?? []) : []}
        onClose={() => setConfigTheme(null)}
      />
    </Layout>
  );
}

/** 原件 N1t：加载骨架卡 */
function ThemeCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-[200px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
      </CardHeader>
      <CardContent className="flex items-center justify-end space-x-3">
        <div className="h-10 w-[100px] animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-[100px] animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

/**
 * 主题配置编辑器（原件 k1t，此处用 Monaco 编辑扁平 JSON 配置）。
 * getThemeConfig 返回 ThemeService::getConfig() 的扁平 map；保存时整体回写。
 */
function ThemeConfigDialog({
  themeKey,
  themeName,
  fields,
  onClose }: {
  themeKey: string | null;
  themeName: string;
  fields: ThemeConfigField[];
  onClose: () => void;
}) {
  const { t } = useTranslation(["theme", "common"]);
  const [text, setText] = React.useState("{}");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!themeKey) return;
    let alive = true;
    setLoading(true);
    void readEnvelope<ThemeConfigValues>(http.post(`${securePath()}/theme/getThemeConfig`, { name: themeKey }))
      .then((config) => {
        if (alive) setText(JSON.stringify(config ?? {}, null, 2));
      })
      .catch(() => {
        if (alive) setText("{}");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [themeKey]);

  async function save() {
    if (!themeKey) return;
    let parsed: ThemeConfigValues;
    try {
      const value: unknown = JSON.parse(text);
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        toast.error("配置必须是 JSON 对象");
        return;
      }
      parsed = value as ThemeConfigValues;
    } catch {
      toast.error("JSON 解析失败");
      return;
    }
    setSaving(true);
    try {
      await http.post(`${securePath()}/theme/saveThemeConfig`, { name: themeKey, config: parsed });
      toast.success(t("config.success"));
      onClose();
    } catch {
      toast.error(t("common:error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={themeKey !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("config.title", { name: themeName })}</DialogTitle>
          <DialogDescription>{t("config.description")}</DialogDescription>
        </DialogHeader>
        {fields.length > 0 && (
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            主题声明的字段：{fields.map((field) => field.field_name).join("、")}
            （保存时后端仅保留这些键，其余会被丢弃）
          </div>
        )}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <Editor
              height="360px"
              language="json"
              theme="vs-dark"
              value={text}
              onChange={(value) => setText(value ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, tabSize: 2 }}
            />
          </div>
        )}
        <DialogFooter className="mt-6 gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("config.cancel")}
          </Button>
          <Button type="button" disabled={saving || loading} onClick={() => void save()}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("config.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
