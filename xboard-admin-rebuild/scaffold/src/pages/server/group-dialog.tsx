import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SECURE, apiPost } from "@/pages/_b/shared";

/**
 * 原件 c4t（bundle offset 6,078,787）：权限组新建/编辑弹窗。
 *
 * 被两处复用：
 *  - `pages/server/group.tsx` 工具栏「添加权限组」与行内编辑；
 *  - `pages/finance/plan.tsx` 表单里的「添加分组」链接（原件同为此弹窗）。
 *
 * 结构与原件逐字对齐：
 *  - `max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl`；
 *  - 头 `border-b bg-muted/20 px-6 pb-4 pt-6`，标题 `font-mono text-lg tracking-tight`、描述 `font-mono text-xs opacity-70`；
 *  - 体 `space-y-4 px-6 py-4`：标签 `font-mono text-[11px] text-muted-foreground`、输入 `w-full font-mono text-xs`、
 *    描述 `font-mono text-[10px] opacity-70`、校验消息 `font-mono text-[10px] uppercase tracking-tight`；
 *  - 脚 `flex flex-row items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4 sm:space-x-0`，
 *    按钮均为 `h-9 px-4 font-mono text-xs`（取消 ghost，提交时带 spinner）。
 *
 * 提交：`POST /server/group/save`（原件 `rD(t)`）。原件 zod schema `l4t`：
 * `name` 长度 2–50 且仅允许字母/数字/中文/下划线/连字符；新建态默认值只有 `{name: ""}`（不带 id）。
 */

export interface GroupDialogValues {
  id?: number | null;
  name?: string | null;
}

const NAME_MIN = 2;
const NAME_MAX = 50;
const NAME_PATTERN = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/;

const saveGroup = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/group/save`, body);

export function GroupDialog({
  refetch,
  defaultValues,
  trigger,
  type,
}: {
  refetch?: () => void | Promise<unknown>;
  defaultValues?: GroupDialogValues;
  trigger: React.ReactElement;
  /** 原件以 `type` 区分标题/按钮文案；缺省时按是否传入 defaultValues 推断 */
  type?: "create" | "edit";
}) {
  const { t } = useTranslation(["group", "common"]);
  const mode = type ?? (defaultValues?.id ? "edit" : "create");
  const isEdit = mode === "edit";
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!open) return;
    setName(defaultValues?.name ?? "");
    setError(undefined);
  }, [open, defaultValues]);

  const validate = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (trimmed.length < NAME_MIN) return t("messages.nameValidation.min", { defaultValue: "组名至少需要2个字符" });
    if (trimmed.length > NAME_MAX) return t("messages.nameValidation.max", { defaultValue: "组名不能超过50个字符" });
    if (!NAME_PATTERN.test(trimmed)) {
      return t("messages.nameValidation.pattern", {
        defaultValue: "组名只能包含字母、数字、中文、下划线和连字符",
      });
    }
    return undefined;
  };

  const submit = async () => {
    const message = validate(name);
    setError(message);
    if (message) return;

    setBusy(true);
    try {
      /* 原件新建态默认值只有 {name}；编辑态由 defaultValues 带上 id */
      const payload: Record<string, unknown> = {};
      if (defaultValues?.id) payload.id = defaultValues.id;
      payload.name = name.trim();
      await saveGroup(payload);
      toast.success(
        isEdit
          ? t("messages.updateSuccess", { defaultValue: "更新成功" })
          : t("messages.createSuccess", { defaultValue: "创建成功" }),
      );
      setOpen(false);
      await refetch?.();
    } catch {
      toast.error(t("messages.saveFailed", { defaultValue: "保存失败" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) {
          setName("");
          setError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b bg-muted/20 px-6 pb-4 pt-6">
          <DialogTitle className="font-mono text-lg tracking-tight">
            {isEdit ? t("form.edit", { defaultValue: "编辑权限组" }) : t("form.create", { defaultValue: "创建权限组" })}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs opacity-70">
            {isEdit
              ? t("form.editDescription", { defaultValue: "修改权限组信息，更新后会立即生效。" })
              : t("form.createDescription", {
                  defaultValue: "创建新的权限组，可以为不同的用户分配不同的权限。",
                })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <Label className="font-mono text-[11px] text-muted-foreground">
                {t("form.name", { defaultValue: "组名称" })}
              </Label>
              <Input
                value={name}
                placeholder={t("form.namePlaceholder", { defaultValue: "请输入权限组名称" })}
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) setError(undefined);
                }}
                className="w-full font-mono text-xs"
              />
              <p className="text-muted-foreground font-mono text-[10px] opacity-70">
                {t("form.nameDescription", {
                  defaultValue: "权限组名称用于标识不同的用户组，建议使用有意义的名称。",
                })}
              </p>
              {error && (
                <p className="text-[0.8rem] font-medium text-destructive font-mono text-[10px] uppercase tracking-tight">
                  {error}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-row items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4 sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-9 px-4 font-mono text-xs"
              disabled={busy}
            >
              {t("form.cancel", { defaultValue: "取消" })}
            </Button>
            <Button type="submit" disabled={busy || !!validate(name)} className="h-9 px-4 font-mono text-xs">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? t("form.update", { defaultValue: "更新" }) : t("form.create", { defaultValue: "创建权限组" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GroupDialog;
