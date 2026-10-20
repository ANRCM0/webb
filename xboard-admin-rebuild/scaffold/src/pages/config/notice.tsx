import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type VisibilityState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
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
import { TagInput } from "@/components/ui/tag-input";
import { DialogClose } from "@/components/ui/dialog";
import { EditorDialog, FormField, MarkdownField } from "@/pages/config/form-dialog";
import {
  ConfirmDialog,
  SECURE,
  apiGet,
  apiPost,
  boolFilter,
  useDragSort,
  useSyncedRows,
} from "@/pages/_b/shared";

/**
 * 原件 `/config/notice`：页面组件 G2t（offset 6052168）→ 专属组件 K2t（1824B）
 * 列工厂 q2t、工具栏 $2t、编辑弹窗 U2t（bundle 540522 附近）。
 */

export interface NoticeRow {
  id: number;
  title: string;
  content?: string;
  img_url?: string;
  show?: boolean | number;
  tags?: string[];
  created_at?: number;
}

interface NoticeFormValues {
  id: number | null;
  title: string;
  content: string;
  img_url: string;
  show: boolean;
  tags: string[];
}

const emptyForm: NoticeFormValues = { id: null, title: "", content: "", img_url: "", show: false, tags: [] };

/* 端点（bundle 540522）：bD/yD/xD/wD/CD */
const fetchNotices = () => apiGet<{ data?: NoticeRow[] }>(`${SECURE}/notice/fetch`);
const saveNotice = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/notice/save`, body);
const dropNotice = (id: number) => apiPost<{ data?: unknown }>(`${SECURE}/notice/drop`, { id });
const showNotice = (id: number) => apiPost<{ data?: unknown }>(`${SECURE}/notice/show`, { id });
const sortNotices = (ids: number[]) => apiPost<{ data?: unknown }>(`${SECURE}/notice/sort`, { ids });

function NoticeDialog({
  refetch,
  defaultFormValues,
  type = "create",
  trigger,
}: {
  refetch: () => void;
  defaultFormValues?: NoticeRow;
  type?: "create" | "edit";
  trigger: React.ReactElement;
}) {
  const { t } = useTranslation(["notice", "common"]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<NoticeFormValues>(emptyForm);

  React.useEffect(() => {
    if (!open) return;
    if (defaultFormValues) {
      setForm({
        id: defaultFormValues.id,
        title: defaultFormValues.title ?? "",
        content: defaultFormValues.content ?? "",
        img_url: defaultFormValues.img_url ?? "",
        show: Boolean(defaultFormValues.show),
        tags: Array.isArray(defaultFormValues.tags) ? defaultFormValues.tags : [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, defaultFormValues]);

  /* 原件 H2t：title.min(1).max(250)、content.min(1)；提交体即表单值（show 为布尔、tags 为数组） */
  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      const { data } = await saveNotice({
        id: form.id,
        title: form.title,
        content: form.content,
        show: form.show,
        tags: form.tags,
        img_url: form.img_url,
      });
      if (!data) return;
      toast.success(t("form.buttons.success", { defaultValue: "提交成功" }));
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
          ? t("form.edit.title", { defaultValue: "编辑公告" })
          : t("form.add.title", { defaultValue: "添加公告" })
      }
      description={t("form.description", { defaultValue: "发布或编辑系统公告，支持 Markdown 格式。" })}
      footer={
        <>
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="h-8 px-4 font-mono text-xs font-bold" disabled={busy}>
              {t("form.buttons.cancel", { defaultValue: "取消" })}
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
            {t("form.buttons.submit", { defaultValue: "提交" })}
          </Button>
        </>
      }
    >
      <FormField label={t("form.fields.title.label", { defaultValue: "标题" })}>
        <Input
          className="h-9 font-mono text-xs"
          value={form.title}
          placeholder={t("form.fields.title.placeholder", { defaultValue: "请输入公告标题" })}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </FormField>
      <MarkdownField
        label={t("form.fields.content.label", { defaultValue: "公告内容" })}
        value={form.content}
        onChange={(value) => setForm({ ...form, content: value })}
      />
      <FormField label={t("form.fields.img_url.label", { defaultValue: "公告背景" })}>
        <Input
          type="text"
          className="h-9 font-mono text-xs"
          value={form.img_url}
          placeholder={t("form.fields.img_url.placeholder", { defaultValue: "请输入公告背景图片URL" })}
          onChange={(e) => setForm({ ...form, img_url: e.target.value })}
        />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t("form.fields.tags.label", { defaultValue: "节点标签" })}>
          <TagInput
            value={form.tags}
            className="w-full font-mono text-xs"
            placeholder={t("form.fields.tags.placeholder", { defaultValue: "输入后回车添加标签" })}
            onChange={(tags) => setForm({ ...form, tags })}
          />
        </FormField>
        <FormField label={t("form.fields.show.label", { defaultValue: "显示" })} className="flex flex-col">
          <div className="flex h-9 items-center">
            <Switch checked={form.show} onCheckedChange={(v: boolean) => setForm({ ...form, show: v })} />
          </div>
        </FormField>
      </div>
    </EditorDialog>
  );
}

export default function ConfigNotice() {
  const { t } = useTranslation(["notice", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageSize: 50, pageIndex: 0 });
  /** 原件 isSortMode */
  const [isSortMode, setIsSortMode] = React.useState(false);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => (await fetchNotices()).data ?? [],
  });

  const [rows, setRows] = useSyncedRows<NoticeRow>(data);

  /* 原件 K2t 第二个 useEffect：进入排序模式只保留拖拽列，分页放大到 99999 */
  React.useEffect(() => {
    setColumnVisibility({
      "drag-handle": isSortMode,
      content: !isSortMode,
      created_at: !isSortMode,
      actions: !isSortMode,
    });
    setPagination({ pageSize: isSortMode ? 99999 : 50, pageIndex: 0 });
  }, [isSortMode]);

  const saveOrder = async () => {
    if (!isSortMode) {
      setIsSortMode(true);
      return;
    }
    try {
      await sortNotices(rows.map((r) => r.id));
      toast.success(t("table.toolbar.sort.save", { defaultValue: "排序保存成功" }));
      setIsSortMode(false);
      refetch();
    } finally {
      setIsSortMode(false);
    }
  };

  const columns = React.useMemo<ColumnDef<NoticeRow>[]>(
    () => [
      {
        id: "drag-handle",
        header: "",
        cell: () => (
          <div className="flex items-center justify-center">
            <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.sort", { defaultValue: "排序" }) },
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.id", { defaultValue: "ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {row.original.id}
            </Badge>
          </div>
        ),
        enableSorting: true,
        size: 60,
        meta: { label: t("table.columns.id", { defaultValue: "ID" }) },
      },
      {
        accessorKey: "show",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.show", { defaultValue: "显示状态" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <Switch
              checked={Boolean(row.original.show)}
              onCheckedChange={async () => {
                const body = await showNotice(row.original.id);
                if (!body.data) refetch();
              }}
            />
          </div>
        ),
        enableSorting: false,
        size: 100,
        filterFn: (row, id, value) => boolFilter(row, id, value),
        meta: { label: t("table.columns.show", { defaultValue: "显示状态" }) },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("table.columns.title", { defaultValue: "标题" })} />
        ),
        cell: ({ row }) => (
          <div className="flex max-w-[500px] items-center">
            <span className="truncate font-medium">{row.original.title}</span>
          </div>
        ),
        enableSorting: false,
        size: 6000,
        meta: { label: t("table.columns.title", { defaultValue: "标题" }) },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title={t("table.columns.actions", { defaultValue: "操作" })}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <NoticeDialog
              refetch={refetch}
              type="edit"
              defaultFormValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">{t("table.actions.edit", { defaultValue: "编辑" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("table.actions.delete.title", { defaultValue: "删除确认" })}
              description={t("table.actions.delete.description", {
                defaultValue: "确定要删除该条公告吗？此操作无法撤销。",
              })}
              onConfirm={async () => {
                await dropNotice(row.original.id);
                toast.success(t("table.actions.delete.success", { defaultValue: "删除成功" }));
                refetch();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600 dark:hover:text-red-400" />
                <span className="sr-only">{t("table.actions.delete.title", { defaultValue: "删除确认" })}</span>
              </Button>
            </ConfirmDialog>
          </div>
        ),
        size: 100,
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("table.columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<NoticeRow>({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, columnSizing, pagination },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const drag = useDragSort<NoticeRow>({ enabled: isSortMode, rows, setRows });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 $2t（offset 6047356）：新增 + 搜索 + 条件重置 …… 排序模式切换 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
          {!isSortMode && (
            <NoticeDialog
              refetch={refetch}
              trigger={
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <div>{t("form.add.button", { defaultValue: "添加公告" })}</div>
                </Button>
              }
            />
          )}
          {!isSortMode && (
            <Input
              placeholder={t("table.toolbar.search", { defaultValue: "搜索公告标题..." })}
              value={(tbl.getColumn("title")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(e) => tbl.getColumn("title")?.setFilterValue(e.target.value)}
              className="h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]"
            />
          )}
          {filtersActive && !isSortMode && (
            <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-9 px-2 lg:px-3">
              {t("table.toolbar.reset", { defaultValue: "重置" })}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        {tbl.getRowCount() > 0 && (
          <div className="hidden items-center space-x-2 md:flex">
            <Button variant={isSortMode ? "default" : "outline"} onClick={saveOrder} className="h-8" size="sm">
              {isSortMode
                ? t("table.toolbar.sort.save", { defaultValue: "保存排序" })
                : t("table.toolbar.sort.edit", { defaultValue: "编辑排序" })}
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
          <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "公告管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("description", { defaultValue: "在这里可以配置公告，包括添加、删除、编辑等操作。" })}
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
