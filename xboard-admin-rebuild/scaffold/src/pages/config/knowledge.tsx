import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogClose } from "@/components/ui/dialog";
import { EditorDialog, FormField, MarkdownField } from "@/pages/config/form-dialog";
import {
  ConfirmDialog,
  FacetedFilter,
  SECURE,
  apiGet,
  apiPost,
  boolFilter,
  useDragSort,
  useSyncedRows,
} from "@/pages/_b/shared";

/**
 * 原件 `/config/knowledge`：页面组件 n4t（offset 6064439）→ 专属组件 t4t（1641B）
 * 列工厂 e4t、工具栏 J2t（bundle 540706 附近）。
 */

export interface KnowledgeRow {
  id: number;
  title: string;
  category?: string;
  language?: string;
  body?: string;
  show?: boolean | number;
}

interface KnowledgeForm {
  id: number | null;
  title: string;
  category: string;
  language: string;
  body: string;
  show: boolean;
}

const emptyForm: KnowledgeForm = { id: null, title: "", category: "", language: "zh-CN", body: "", show: false };

/** 原件 X2t 的语言候选顺序 */
const LANGUAGES = ["en-US", "ja-JP", "ko-KR", "vi-VN", "zh-CN", "zh-TW", "ru-RU"];

/* 端点（bundle 540706）：kD/ED/LD/DD/TD */
const fetchKnowledge = () => apiGet<{ data?: KnowledgeRow[] }>(`${SECURE}/knowledge/fetch`);
/* 原件 ND：编辑时按 id 取完整正文 */
const fetchKnowledgeById = (id: number) => apiGet<{ data?: KnowledgeRow }>(`${SECURE}/knowledge/fetch?id=${id}`);
const saveKnowledge = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/knowledge/save`, body);
const dropKnowledge = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/knowledge/drop`, body);
const showKnowledge = (id: number) => apiPost<{ data?: unknown }>(`${SECURE}/knowledge/show`, { id });
const sortKnowledge = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/knowledge/sort`, body);

function KnowledgeDialog({
  refetch,
  defaultFormValues,
  type = "create",
  trigger,
}: {
  refetch: () => void;
  defaultFormValues?: KnowledgeRow;
  type?: "create" | "edit";
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["knowledge", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<KnowledgeForm>(emptyForm);

  /* 原件 X2t：打开编辑弹层时先按 id 拉取完整正文（ND = GET /knowledge/fetch?id=）再 reset 表单 */
  React.useEffect(() => {
    if (!open) return;
    const row = defaultFormValues;
    if (!row) {
      setForm(emptyForm);
      return;
    }
    setForm({
      id: row.id,
      title: row.title ?? "",
      category: row.category ?? "",
      language: row.language ?? "zh-CN",
      body: row.body ?? "",
      show: Boolean(row.show),
    });
    let alive = true;
    fetchKnowledgeById(row.id)
      .then((body) => {
        /* 真后端按 id 返回单行；若返回的是列表（例如某些实现忽略 ?id=）则保留行数据，避免清空表单 */
        const detail: unknown = body.data;
        if (!alive || detail == null || typeof detail !== "object" || Array.isArray(detail)) return;
        const record = detail as KnowledgeRow;
        setForm({
          id: record.id ?? row.id,
          title: record.title ?? "",
          category: record.category ?? "",
          language: record.language ?? "zh-CN",
          body: record.body ?? "",
          show: Boolean(record.show),
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [open, defaultFormValues]);

  const submit = async () => {
    /* 原件 Z2t schema：title.min(1)、body.min(1) */
    if (!form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      await saveKnowledge({
        id: form.id,
        language: form.language,
        category: form.category,
        title: form.title,
        body: form.body,
        show: form.show,
      });
      toast.success(t("messages.operationSuccess", { defaultValue: "操作成功" }));
      setForm(emptyForm);
      setOpen(false);
      refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditorDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={
        type === "edit"
          ? t("form.edit", { defaultValue: "编辑知识" })
          : t("form.add", { defaultValue: "添加知识" })
      }
      description={t("form.description", {
        defaultValue: "发布或编辑知识库文章，支持多语言和 Markdown 格式。",
      })}
      bodyClassName="font-mono text-xs"
      footer={
        <>
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="h-8 px-4 font-mono text-xs font-bold" disabled={busy}>
              {t("form.cancel", { defaultValue: "取消" })}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="h-8 px-8 font-mono text-xs font-bold"
            disabled={busy}
            onClick={() => {
              void submit();
            }}
          >
            {t("form.submit", { defaultValue: "提交" })}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t("form.title", { defaultValue: "标题" })}>
          <Input
            className="h-9 font-mono text-xs"
            value={form.title}
            placeholder={t("form.titlePlaceholder", { defaultValue: "请输入知识标题" })}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>
        <FormField label={t("form.category", { defaultValue: "分类" })}>
          <Input
            className="h-9 font-mono text-xs"
            value={form.category}
            placeholder={t("form.categoryPlaceholder", { defaultValue: "请输入分类，分类将会自动归类" })}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t("form.language", { defaultValue: "语言" })}>
          <Select value={form.language} onValueChange={(v: string) => setForm({ ...form, language: v })}>
            <SelectTrigger className="h-9 font-mono text-xs">
              <SelectValue placeholder={t("form.languagePlaceholder", { defaultValue: "请选择语言" })} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((code) => (
                <SelectItem key={code} value={code} className="cursor-pointer font-mono text-xs">
                  {t(`languages.${code}`, { defaultValue: code })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t("form.show", { defaultValue: "显示" })} className="flex flex-col">
          <div className="flex h-9 items-center">
            <Switch checked={form.show} onCheckedChange={(v: boolean) => setForm({ ...form, show: v })} />
          </div>
        </FormField>
      </div>
      <MarkdownField
        label={t("form.content", { defaultValue: "内容" })}
        value={form.body}
        onChange={(value) => setForm({ ...form, body: value })}
      />
    </EditorDialog>
  );
}

export default function ConfigKnowledge() {
  const { t } = useTranslation(["knowledge", "common"]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isSortMode, setIsSortMode] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ "drag-handle": false });
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 20, pageIndex: 0 });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["knowledge"],
    queryFn: async () => (await fetchKnowledge()).data,
  });

  const [rows, setRows] = useSyncedRows<KnowledgeRow>(data ?? undefined);

  /* 原件 t4t 第二个 useEffect */
  React.useEffect(() => {
    setColumnVisibility({ "drag-handle": isSortMode, actions: !isSortMode });
    setPagination({ pageSize: isSortMode ? 99999 : 10, pageIndex: 0 });
  }, [isSortMode]);

  const saveOrder = async () => {
    if (!isSortMode) {
      setIsSortMode(true);
      return;
    }
    await sortKnowledge({ ids: rows.map((r) => r.id) });
    refetch();
    setIsSortMode(false);
    toast.success(t("toolbar.saveSort", { defaultValue: "排序保存成功" }));
  };

  const columns = React.useMemo<ColumnDef<KnowledgeRow>[]>(
    () => [
      {
        id: "drag-handle",
        header: () => null,
        cell: () => (
          <div className={isSortMode ? "cursor-move" : "opacity-0"}>
            <GripVertical className="size-4" />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("toolbar.editSort", { defaultValue: "编辑排序" }) },
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.id", { defaultValue: "ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {row.original.id}
            </Badge>
          </div>
        ),
        enableSorting: true,
        size: 70,
        meta: { label: t("columns.id", { defaultValue: "ID" }) },
      },
      {
        accessorKey: "show",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.status", { defaultValue: "状态" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <Switch
              checked={Boolean(row.original.show)}
              onCheckedChange={async () => {
                const body = await showKnowledge(row.original.id);
                if (!body.data) refetch();
              }}
            />
          </div>
        ),
        enableSorting: false,
        size: 100,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("columns.status", { defaultValue: "状态" }) },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.title", { defaultValue: "标题" })} />
        ),
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <span className="line-clamp-2 font-medium">{row.original.title}</span>
          </div>
        ),
        enableSorting: true,
        size: 600,
        meta: { label: t("columns.title", { defaultValue: "标题" }) },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.category", { defaultValue: "分类" })} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="max-w-[180px] truncate">
            {row.original.category}
          </Badge>
        ),
        enableSorting: true,
        size: 1800,
        meta: { label: t("columns.category", { defaultValue: "分类" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title={t("columns.actions", { defaultValue: "操作" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-1">
            <KnowledgeDialog
              refetch={refetch}
              type="edit"
              defaultFormValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">{t("form.edit", { defaultValue: "编辑知识" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("messages.deleteConfirm", { defaultValue: "确认删除" })}
              description={t("messages.deleteDescription", {
                defaultValue: "此操作将永久删除该知识库记录，删除后无法恢复。确定要继续吗？",
              })}
              confirmText={t("messages.deleteButton", { defaultValue: "删除" })}
              onConfirm={async () => {
                await dropKnowledge({ id: row.original.id });
                toast.success(t("messages.operationSuccess", { defaultValue: "操作成功" }));
                refetch();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400" />
                <span className="sr-only">{t("messages.deleteButton", { defaultValue: "删除" })}</span>
              </Button>
            </ConfirmDialog>
          </div>
        ),
        size: 100,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [isSortMode, refetch, t],
  );

  const table = useReactTable<KnowledgeRow>({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const drag = useDragSort<KnowledgeRow>({ enabled: isSortMode, rows, setRows });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 J2t（offset 6059340）：排序模式只留提示语；否则 新增 + 搜索 + 分类 facet + 条件重置 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {isSortMode ? (
          <p className="text-sm text-muted-foreground">
            {t("toolbar.sortModeHint", { defaultValue: "拖拽知识条目进行排序，完成后点击保存" })}
          </p>
        ) : (
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
            <KnowledgeDialog
              refetch={refetch}
              trigger={
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <div>{t("form.add", { defaultValue: "添加知识" })}</div>
                </Button>
              }
            />
            <Input
              placeholder={t("toolbar.searchPlaceholder", { defaultValue: "搜索知识..." })}
              value={(tbl.getColumn("title")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => tbl.getColumn("title")?.setFilterValue(e.target.value)}
              className="h-8 w-full sm:w-[150px] lg:w-[250px]"
            />
            {tbl.getColumn("category") && (
              <FacetedFilter
                column={tbl.getColumn("category")}
                title={t("columns.category", { defaultValue: "分类" })}
                options={Array.from(
                  new Set(
                    tbl
                      .getCoreRowModel()
                      .rows.map((row) => row.getValue("category"))
                      .filter((value): value is string => typeof value === "string" && value !== ""),
                  ),
                ).map((value) => ({ label: value, value }))}
              />
            )}
            {filtersActive && (
              <Button variant="ghost" onClick={() => tbl.resetColumnFilters()}>
                {t("toolbar.reset", { defaultValue: "重置" })}
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {tbl.getRowCount() > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant={isSortMode ? "default" : "outline"} onClick={saveOrder} size="sm">
              {isSortMode
                ? t("toolbar.saveSort", { defaultValue: "保存排序" })
                : t("toolbar.editSort", { defaultValue: "编辑排序" })}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            {t("title", { defaultValue: "知识库管理" })}
          </h2>
          <p className="text-muted-foreground">
            {t("description", { defaultValue: "在这里可以配置知识库，包括添加、删除、编辑等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <DataTable
          table={table}
          toolbar={toolbar}
          draggable={isSortMode}
          onDragStart={drag.onDragStart}
          onDragEnd={drag.onDragEnd}
          onDragOver={drag.onDragOver}
          onDragLeave={drag.onDragLeave}
          onDrop={drag.onDrop}
          showPagination={!isSortMode}
          isLoading={isFetching}
          mobilePrimaryField="title"
        />
      </LayoutBody>
    </Layout>
  );
}
