import * as React from "react";
import { useTranslation } from "react-i18next";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { toast } from "@/components/ui/sonner";

/**
 * 原件：`C1t`（offset 5,986,617）—— 由单份 JSON schema 驱动的完整 CRUD 演示页。
 *
 * 已还原的行为：
 *  - 种子数据由 `y1t()` 生成（12 条域名记录，status 在 active/inactive/blocked 间轮转，
 *    is_monitored = index % 3 !== 2，notes 隔行填充，created_at 递减一天）；
 *  - schema `b1t`：version/title/description/id_field/api{list,save,delete}/columns[]/form/actions；
 *  - 保存 save(record, isCreate)：新建时 id 自增（原件 x1t 从 100 起）并置顶，编辑时按 id 覆盖；
 *  - 删除 delete(id)；
 *  - 两步延迟：保存 400ms、删除 300ms（原件 w1t），用于演示 loading 态；
 *  - 右侧固定展示 schema 原文（JSON.stringify(schema, null, 2)）。
 *  全部为本地状态，不请求 api.list / api.save / api.delete（原件同样未接线）。
 */

type RowValue = string | number | boolean;
type CrudRow = Record<string, RowValue>;

interface CrudColumnOption {
  value: string;
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

interface CrudColumn {
  key: string;
  title: string;
  type: "number" | "string" | "tag" | "boolean" | "datetime";
  sortable?: boolean;
  searchable?: boolean;
  width?: number;
  options?: CrudColumnOption[];
}

interface CrudFormField {
  type: "string" | "number" | "text" | "select" | "boolean";
  label: string;
  placeholder?: string;
  required?: boolean;
  value?: RowValue;
  description?: string;
  options?: { value: string; label: string }[];
}

interface CrudSchema {
  version: number;
  title: string;
  description: string;
  id_field: string;
  api: { list: string; save: string; delete: string };
  columns: CrudColumn[];
  form: Record<string, CrudFormField>;
  actions: { create: boolean; edit: boolean; delete: boolean };
}

/** 原件 b1t：演示 schema 原文 */
const DEMO_SCHEMA: CrudSchema = {
  version: 1,
  title: "Traffic Records",
  description: "Demonstrates a full CRUD page driven entirely by a JSON schema.",
  id_field: "id",
  api: {
    list: "/plugin/traffic-analytics/records/fetch",
    save: "/plugin/traffic-analytics/records/save",
    delete: "/plugin/traffic-analytics/records/delete" },
  columns: [
    { key: "id", title: "ID", type: "number", sortable: true, width: 80 },
    { key: "domain", title: "Domain", type: "string", searchable: true },
    { key: "requests", title: "Requests", type: "number", sortable: true },
    {
      key: "status",
      title: "Status",
      type: "tag",
      options: [
        { value: "active", label: "Active", variant: "default" },
        { value: "inactive", label: "Inactive", variant: "secondary" },
        { value: "blocked", label: "Blocked", variant: "destructive" },
      ] },
    { key: "is_monitored", title: "Monitored", type: "boolean" },
    { key: "created_at", title: "Created", type: "datetime", sortable: true },
  ],
  form: {
    domain: { type: "string", label: "Domain", placeholder: "e.g. example.com", required: true },
    requests: { type: "number", label: "Requests", placeholder: "0", value: 0 },
    status: {
      type: "select",
      label: "Status",
      value: "active",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "blocked", label: "Blocked" },
      ] },
    is_monitored: {
      type: "boolean",
      label: "Enable monitoring",
      description: "When enabled, traffic will be tracked in real-time.",
      value: false },
    notes: { type: "text", label: "Notes", placeholder: "Optional notes about this record..." } },
  actions: { create: true, edit: true, delete: true } };

/** 原件 y1t：本地种子数据 */
function seedRecords(): CrudRow[] {
  const statuses = ["active", "inactive", "blocked"];
  return [
    "api.example.com",
    "cdn.example.com",
    "app.example.com",
    "static.example.com",
    "ws.example.com",
    "auth.example.com",
    "billing.example.com",
    "docs.example.com",
    "admin.example.com",
    "metrics.example.com",
    "gateway.example.com",
    "webhook.example.com",
  ].map((domain, index) => ({
    id: index + 1,
    domain,
    requests: Math.floor(100000 * Math.random()),
    status: statuses[index % statuses.length],
    is_monitored: index % 3 !== 2,
    notes: index % 2 === 0 ? "Auto-generated seed record" : "",
    created_at: Math.floor(Date.now() / 1000) - 86400 * index }));
}

/** 原件 SS：秒级时间戳按 UTC+8 渲染 */
function formatDateTime(value: RowValue | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  let seconds = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (!Number.isFinite(seconds)) return String(value);
  if (Math.floor(seconds).toString().length === 10) seconds = seconds * 1000;
  const shifted = new Date(seconds + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`,
  ].join(" ");
}

/** 原件 w1t：演示延迟 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** 原件 RYt：按 schema.form 生成初值 */
function initialFields(schema: CrudSchema): Record<string, RowValue> {
  const values: Record<string, RowValue> = {};
  for (const [key, field] of Object.entries(schema.form)) {
    values[key] = field.value ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : "");
  }
  return values;
}

export default function ConfigPluginCrudDemo() {
  const { t } = useTranslation("plugin");
  const schema = DEMO_SCHEMA;

  const [rows, setRows] = React.useState<CrudRow[]>(seedRecords);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CrudRow | null>(null);
  const [fields, setFields] = React.useState<Record<string, RowValue>>(() => initialFields(schema));
  const [deleteTarget, setDeleteTarget] = React.useState<CrudRow | null>(null);
  const [saving, setSaving] = React.useState(false);
  const nextId = React.useRef(100);

  const searchableKeys = React.useMemo(
    () => schema.columns.filter((column) => column.searchable).map((column) => column.key),
    [schema.columns],
  );

  const data = React.useMemo(() => {
    if (!search || searchableKeys.length === 0) return rows;
    const needle = search.toLowerCase();
    return rows.filter((row) =>
      searchableKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, search, searchableKeys]);

  const openCreate = () => {
    setFields(initialFields(schema));
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: CrudRow) => {
    const values: Record<string, RowValue> = {};
    for (const [key, field] of Object.entries(schema.form)) {
      values[key] = row[key] ?? field.value ?? "";
    }
    setFields(values);
    setEditing(row);
    setFormOpen(true);
  };

  const save = React.useCallback(
    async (row: CrudRow, isCreate: boolean) => {
      await sleep(400);
      if (isCreate) {
        setRows((prev) => [{ ...row, id: nextId.current++, created_at: Math.floor(Date.now() / 1000) }, ...prev]);
      } else {
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, ...row } : item)));
      }
    },
    [],
  );

  const remove = React.useCallback(async (id: RowValue) => {
    await sleep(300);
    setRows((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const columns = React.useMemo<ColumnDef<CrudRow>[]>(() => {
    const defs: ColumnDef<CrudRow>[] = schema.columns.map((column) => ({
      accessorKey: column.key,
      header: column.title,
      enableSorting: column.sortable ?? false,
      size: column.width,
      cell: ({ row }) => {
        const value = row.original[column.key];
        switch (column.type) {
          case "datetime":
            return <span className="text-sm text-muted-foreground">{formatDateTime(value)}</span>;
          case "boolean":
            return (
              <Badge variant={value ? "default" : "outline"}>
                {value
                  ? t("runtime.booleanTrue", { defaultValue: "是" })
                  : t("runtime.booleanFalse", { defaultValue: "否" })}
              </Badge>
            );
          case "tag": {
            const option = column.options?.find((item) => item.value === String(value));
            return <Badge variant={option?.variant ?? "outline"}>{option?.label ?? String(value ?? "-")}</Badge>;
          }
          case "number":
            return <span className="tabular-nums">{String(value ?? "-")}</span>;
          default:
            return <span>{String(value ?? "-")}</span>;
        }
      } }));

    if (schema.actions.edit || schema.actions.delete) {
      defs.push({
        id: "actions",
        header: () => null,
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {schema.actions.edit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {schema.actions.delete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("delete.button", { defaultValue: "删除" })}
                onClick={() => setDeleteTarget(row.original)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ) });
    }
    return defs;
    // openEdit 只依赖 schema 与 setter，闭包稳定
  }, [schema, t]);

  const table = useReactTable<CrudRow>({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnPinning: { right: ["actions"] } } });

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const isCreate = editing === null;
      const row: CrudRow = isCreate ? { ...fields } : { ...fields, [schema.id_field]: editing[schema.id_field] };
      await save(row, isCreate);
      toast.success(
        isCreate
          ? t("runtime.createSuccess", { defaultValue: "创建成功" })
          : t("runtime.updateSuccess", { defaultValue: "更新成功" }),
      );
      setFormOpen(false);
    } catch {
      toast.error(t("runtime.saveFailed", { defaultValue: "保存失败" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Schema CRUD Demo</h2>
            <p className="mt-2 text-muted-foreground">
              A complete list + create / edit / delete page generated from a single JSON schema.
            </p>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <DataTable
                table={table}
                isLoading={saving}
                showPagination
                toolbar={() => (
                  <div className="flex items-center justify-between gap-4">
                    {searchableKeys.length > 0 && (
                      <Input
                        placeholder={t("runtime.searchPlaceholder", { defaultValue: "搜索..." })}
                        className="max-w-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      {schema.actions.create && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="mr-1 h-4 w-4" />
                          {t("runtime.create", { defaultValue: "新建" })}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    Schema declaration
                    <Badge variant="outline" className="font-mono text-[10px]">
                      v{schema.version}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[70vh] overflow-auto rounded-md bg-muted/50 p-4 text-xs leading-relaxed">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>
                {editing ? t("runtime.edit", { defaultValue: "编辑" }) : t("runtime.create", { defaultValue: "新建" })}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? t("runtime.editDescription", { defaultValue: "修改下方字段后保存。" })
                  : t("runtime.createDescription", { defaultValue: "填写下方字段以创建新记录。" })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitForm} className="flex flex-col overflow-hidden">
              <div className="max-h-[60vh] space-y-4 overflow-auto px-1 py-1">
                {Object.entries(schema.form).map(([key, field]) => (
                  <SchemaField
                    key={key}
                    fieldKey={key}
                    field={field}
                    value={fields[key]}
                    onChange={(value) => setFields((prev) => ({ ...prev, [key]: value }))}
                  />
                ))}
              </div>
              <DialogFooter className="mt-6 border-t pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
                  {t("config.cancel", { defaultValue: "取消" })}
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("runtime.deleteRecordTitle", { defaultValue: "删除记录" })}</DialogTitle>
              <DialogDescription>
                {t("runtime.deleteRecordDescription", {
                  defaultValue: "确定要删除这条记录吗？此操作无法撤销。" })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                {t("runtime.cancel", { defaultValue: "取消" })}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const target = deleteTarget;
                  setDeleteTarget(null);
                  if (target) {
                    void remove(target[schema.id_field]).then(() =>
                      toast.success(t("runtime.deleteSuccess", { defaultValue: "删除成功" })),
                    );
                  }
                }}
              >
                {t("runtime.delete", { defaultValue: "删除" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </LayoutBody>
    </Layout>
  );
}

/** 由 schema.form 单项渲染控件（原件 IYt 的字段渲染器） */
function SchemaField({
  fieldKey,
  field,
  value,
  onChange }: {
  fieldKey: string;
  field: CrudFormField;
  value: RowValue | undefined;
  onChange: (value: RowValue) => void;
}) {
  const inputId = `crud-field-${fieldKey}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.type === "boolean" ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">{field.description ?? ""}</p>
          <Switch checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
        </div>
      ) : field.type === "select" ? (
        <Select value={String(value ?? "")} onValueChange={(next) => onChange(next)}>
          <SelectTrigger id={inputId}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "text" ? (
        <Textarea
          id={inputId}
          rows={3}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={inputId}
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
      {field.description && field.type !== "boolean" && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
