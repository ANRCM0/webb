import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { http } from "@/lib/http";

const SECURE = window.settings?.secure_path ?? "";

/** 复刻原件 $f：设置页保存按钮（loading + success toast） */
export function SaveButton({ onClick, loading, label = "保存" }: { onClick: () => void; loading?: boolean; label?: string }) {
  return (
    <Button size="sm" disabled={loading} onClick={onClick}>
      {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
      {loading ? "保存中…" : label}
    </Button>
  );
}

/** 设置页外壳：标题 + 描述 + 右侧操作（原件 `<h3 class="text-lg font-medium">` + `<p class="text-sm text-muted-foreground">`） */
export function SettingsSection({
  title, description, children, actions,
}: { title: string; description?: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

/** 字段行：label + description + 控件（原件设置项统一为此布局） */
export function Field({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:items-center md:gap-6">
      <div>
        <Label>{label}</Label>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/** 读取配置：GET /config/fetch?key=<key>（原件 CT 模块的 /config/fetch?key=） */
export function useConfig<T = Record<string, unknown>>(key: string) {
  return useQuery({
    queryKey: ["config", key],
    queryFn: async () => {
      const { data } = await http.get(`${SECURE}/config/fetch?key=${key}`);
      return (data?.data ?? data ?? {}) as T;
    },
  });
}

/** 保存配置：POST /config/save（原件 /config/save） */
export function useSaveConfig(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      await http.post(`${SECURE}/config/save`, { ...payload });
    },
    onSuccess: () => {
      toast.success("保存成功");
      void qc.invalidateQueries({ queryKey: ["config", key] });
    },
    onError: () => toast.error("保存失败"),
  });
}

/** 开关字段 */
export function SwitchField({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <Field label={label} description={description}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </Field>
  );
}

export function InputField({ label, description, value, onChange, placeholder, type = "text" }: {
  label: string; description?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Field label={label} description={description}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
    </Field>
  );
}

export function TextareaField({ label, description, value, onChange, rows = 3 }: {
  label: string; description?: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <Field label={label} description={description}>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function SelectField({ label, description, value, onChange, options }: {
  label: string; description?: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <Field label={label} description={description}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
