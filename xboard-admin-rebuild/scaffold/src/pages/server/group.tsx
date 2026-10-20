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
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Pencil, Plus, Server, Trash2, Users, X } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ConfirmDialog,
  SECURE,
  apiGet,
  apiPost,
} from "@/pages/_b/shared";
import { GroupDialog } from "./group-dialog";

/**
 * 原件 `/server/group`：页面组件 U3t（offset 6291513）→ 专属组件 z3t（819B）
 * 列工厂 H3t、工具栏 V3t、表单 c4t（bundle 540043 附近）。
 */

export interface GroupRow {
  id: number;
  name: string;
  users_count?: number;
  server_count?: number;
}

/* 端点（bundle 540043）：iD/rD/sD */
const fetchGroups = () => apiGet<{ data?: GroupRow[] }>(`${SECURE}/server/group/fetch`);
const saveGroup = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/group/save`, body);
const dropGroup = (body: Record<string, unknown>) => apiPost<{ data?: unknown }>(`${SECURE}/server/group/drop`, body);

export default function ServerGroup() {
  const { t } = useTranslation(["group", "common"]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["serverGroupList"],
    queryFn: async () => (await fetchGroups()).data,
  });

  const columns = React.useMemo<ColumnDef<GroupRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.id", { defaultValue: "组ID" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{row.original.id}</Badge>
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.id", { defaultValue: "组ID" }) },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.name", { defaultValue: "组名称" })} />
        ),
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <span className="max-w-32 truncate font-medium">{row.original.name}</span>
          </div>
        ),
        meta: { label: t("columns.name", { defaultValue: "组名称" }) },
      },
      {
        accessorKey: "users_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.usersCount", { defaultValue: "用户数量" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 px-4">
            <Users className="h-4 w-4" />
            <span className="font-medium">{row.original.users_count ?? 0}</span>
          </div>
        ),
        enableSorting: true,
        meta: { label: t("columns.usersCount", { defaultValue: "用户数量" }) },
      },
      {
        accessorKey: "server_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.serverCount", { defaultValue: "节点数量" })} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 px-4">
            <Server className="h-4 w-4" />
            <span className="font-medium">{row.original.server_count ?? 0}</span>
          </div>
        ),
        enableSorting: true,
        size: 8000,
        meta: { label: t("columns.serverCount", { defaultValue: "节点数量" }) },
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
          <div className="flex items-center justify-center">
            <GroupDialog
              refetch={refetch}
              defaultValues={row.original}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">{t("form.edit", { defaultValue: "编辑权限组" })}</span>
                </Button>
              }
            />
            <ConfirmDialog
              title={t("messages.deleteConfirm", { defaultValue: "确认删除" })}
              description={t("messages.deleteDescription", {
                defaultValue: "此操作将永久删除该权限组，删除后无法恢复。确定要继续吗？",
              })}
              confirmText={t("messages.deleteButton", { defaultValue: "删除" })}
              onConfirm={async () => {
                await dropGroup({ id: row.original.id });
                toast.success(t("messages.updateSuccess", { defaultValue: "更新成功" }));
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
        enableSorting: false,
        enableHiding: false,
        meta: { label: t("columns.actions", { defaultValue: "操作" }) },
      },
    ],
    [refetch, t],
  );

  const table = useReactTable<GroupRow>({
    data: data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { columnPinning: { right: ["actions"] } },
  });

  const toolbar = (tbl: typeof table) => {
    const filtersActive = tbl.getState().columnFilters.length > 0;
    /* 原件 V3t（offset 6287538）：新增 + 搜索 + 条件重置，右侧无控件 */
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
          <GroupDialog
            refetch={refetch}
            trigger={
              <Button variant="outline" size="sm" className="space-x-2">
                <Plus className="h-4 w-4" />
                <div>{t("form.add", { defaultValue: "添加权限组" })}</div>
              </Button>
            }
          />
          <Input
            placeholder={t("toolbar.searchPlaceholder", { defaultValue: "搜索权限组..." })}
            value={(tbl.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) => tbl.getColumn("name")?.setFilterValue(e.target.value)}
            className={cn(
              "h-8 w-full min-w-[150px] sm:w-[150px] lg:w-[250px]",
              filtersActive && "border-primary/50 ring-primary/20",
            )}
          />
          {filtersActive && (
            <Button variant="ghost" onClick={() => tbl.resetColumnFilters()} className="h-8 px-2 lg:px-3">
              {t("toolbar.reset", { defaultValue: "重置" })}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <LayoutHeader>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title", { defaultValue: "权限组管理" })}</h2>
          <p className="text-muted-foreground mt-2">
            {t("description", { defaultValue: "管理所有权限组，包括添加、删除、编辑等操作。" })}
          </p>
        </div>
      </LayoutHeader>
      <LayoutBody dense fixedHeight className="flex flex-col overflow-auto">
        <DataTable table={table} toolbar={toolbar} isLoading={isFetching} mobilePrimaryField="name" />
      </LayoutBody>
    </Layout>
  );
}
