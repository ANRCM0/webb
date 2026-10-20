import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Mail, MessageSquare, Search, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { } from "@/components/layout/header-widgets";
import { ticket } from "@/api";
import { cn } from "@/lib/utils";

/**
 * 原件：`x9t`（offset 6,500,637）工单页外壳 + `y9t`（列表 + Datatable 列工厂 `i9t`）
 *   + `b9t`（会话面板：左侧同状态工单列表 + 右侧会话流）。
 *
 * 已还原的端点（app/Http/Routes/V2/AdminRoute.php:171-175）：
 *  - POST /ticket/fetch  { pageSize, current, filter:[{id,value}], sort:[{id,desc}] }
 *        —— 带 id 时返回单条详情（含 messages + user），否则返回分页列表
 *  - POST /ticket/reply  { id, message }
 *  - POST /ticket/close  { id }
 *
 * 轮询：会话详情 refetchInterval = 5000（原件 b9t），发送/关闭后同时失效
 *      ticketList / ticketSidebarList / ticketDetail 三个 query。
 *
 * 关于“附件上传”：对 dist bundle（index-CEIYH7i8.js）与后端均做了核对——工单没有附件通道：
 *   · TicketController::reply 只校验 {id, message}；
 *   · AdminRoute 中唯一的 upload 路由是 /theme/upload 与 /plugin/upload；
 *   · 蓝图 user-ticket.md:290 里的 “upload” 是用户编辑弹窗的“上行流量”字段（edit.form.upload）。
 *   因此这里按原件实现纯文本回复，不臆造不存在的附件接口。
 */

/** 原件 aqt：工单状态 */
const TICKET_STATUS = { OPENING: 0, CLOSED: 1 } as const;
/** 原件 lqt：优先级 */
const TICKET_LEVEL = { LOW: 0, MIDDLE: 1, HIGH: 2 } as const;

interface TicketUser {
  id: number;
  email: string;
}

interface TicketMessage {
  id: number;
  ticket_id?: number;
  user_id?: number;
  is_from_admin?: boolean;
  is_me?: boolean;
  message: string;
  created_at: number;
}

interface TicketItem {
  id: number;
  subject: string;
  level: number;
  status: number;
  reply_status?: number;
  created_at: number;
  updated_at: number;
  user?: TicketUser;
}

interface TicketDetail extends TicketItem {
  messages: TicketMessage[];
}

interface ApiEnvelope<T> {
  data?: T;
}

async function readData<T>(request: Promise<{ data: unknown }>): Promise<T | null> {
  const response = await request;
  return ((response.data as ApiEnvelope<T>).data ?? null) as T | null;
}

/** 原件 SS：秒级时间戳按 UTC+8 渲染 */
function formatDateTime(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let seconds = Number(value);
  if (!Number.isFinite(seconds)) return "";
  if (Math.floor(seconds).toString().length === 10) seconds = seconds * 1000;
  const shifted = new Date(seconds + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())} ${pad(
    shifted.getUTCHours(),
  )}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** 原件状态/优先级文案映射 */
function statusBadge(ticket: TicketItem, t: Translate): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (ticket.status === TICKET_STATUS.CLOSED) {
    return { label: t("status.closed"), variant: "default" };
  }
  const replyStatus = ticket.reply_status ?? 0;
  return replyStatus === 1
    ? { label: t("status.replied"), variant: "secondary" }
    : { label: t("status.pending"), variant: "destructive" };
}

function levelBadge(level: number, t: Translate): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (level === TICKET_LEVEL.LOW) return { label: t("level.low"), variant: "default" };
  if (level === TICKET_LEVEL.MIDDLE) return { label: t("level.medium"), variant: "secondary" };
  return { label: t("level.high"), variant: "destructive" };
}

export default function UserTicket() {
  const { t } = useTranslation(["ticket", "common"]);
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<"open" | "closed">("open");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [activeTicket, setActiveTicket] = React.useState<TicketItem | null>(null);

  const filter = React.useMemo(
    () => [{ id: "status", value: statusFilter === "open" ? "0" : [1] }],
    [statusFilter],
  );

  const { data, isLoading, refetch } = useQuery<{ data: TicketItem[]; total: number }>({
    queryKey: ["ticketList", page, statusFilter],
    queryFn: async () => {
      const body = await ticket.fetch({ pageSize, current: page, filter, sort: [{ id: "updated_at", desc: true }] });
      const payload = (body.data ?? {}) as { data?: TicketItem[]; total?: number };
      return { data: payload.data ?? [], total: payload.total ?? 0 };
    } });

  const rows = React.useMemo(() => {
    const list = data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (item) =>
        item.subject.toLowerCase().includes(needle) ||
        (item.user?.email ?? "").toLowerCase().includes(needle),
    );
  }, [data, search]);

  const lastPage = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  async function closeTicket(id: number) {
    try {
      await ticket.close({ id });
      toast.success(t("actions.close_success"));
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["ticketSidebarList"] });
      await queryClient.invalidateQueries({ queryKey: ["ticketDetail"] });
    } catch {
      toast.error(t("common:error"));
    }
  }

  return (
    <Layout>
      <LayoutHeader>
      </LayoutHeader>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="space-y-4">
            {/* 工具栏（原件 Q8t） */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 pl-9"
                    placeholder={t("list.search_placeholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value === "closed" ? "closed" : "open");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder={t("columns.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t("status.processing")}</SelectItem>
                    <SelectItem value="closed">{t("status.closed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">{t("columns.id")}</TableHead>
                    <TableHead>{t("columns.subject")}</TableHead>
                    <TableHead className="w-[110px]">{t("columns.level")}</TableHead>
                    <TableHead className="w-[120px]">{t("columns.status")}</TableHead>
                    <TableHead className="w-[180px]">{t("columns.updated_at")}</TableHead>
                    <TableHead className="w-[170px] text-right">{t("columns.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {t("common:loading")}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {statusFilter === "open" ? t("list.no_open_tickets") : t("list.no_closed_tickets")}
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((item) => {
                    const status = statusBadge(item, t);
                    const level = levelBadge(item.level, t);
                    return (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => setActiveTicket(item)}>
                        <TableCell>
                          <Badge variant="outline">{item.id}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-[500px] truncate font-medium">{item.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={level.variant} className="whitespace-nowrap">
                            {level.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="whitespace-nowrap">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(item.updated_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveTicket(item);
                              }}
                            >
                              {t("actions.view_details")}
                            </Button>
                            {item.status !== TICKET_STATUS.CLOSED && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title={t("actions.close_ticket")}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (window.confirm(`${t("actions.close_confirm_title")}\n${t("actions.close_confirm_description")}`)) {
                                    void closeTicket(item.id);
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("common:table.pagination.pageOf", { total: lastPage })}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {t("common:table.pagination.previousPage")}
                </Button>
                <span>
                  {page} / {lastPage}
                </span>
                <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
                  {t("common:table.pagination.nextPage")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </LayoutBody>

      <TicketConversationDialog
        ticketItem={activeTicket}
        statusFilter={statusFilter}
        onClose={() => setActiveTicket(null)}
        onChanged={() => {
          void refetch();
        }}
      />
    </Layout>
  );
}

/**
 * 原件 b9t：会话面板。
 * 左侧 = 同状态工单列表（/ticket/fetch + status filter），右侧 = 会话流（/ticket/fetch?id=，5s 轮询）。
 */
function TicketConversationDialog({
  ticketItem,
  statusFilter,
  onClose,
  onChanged }: {
  ticketItem: TicketItem | null;
  statusFilter: "open" | "closed";
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation(["ticket", "common"]);
  const queryClient = useQueryClient();
  const open = ticketItem !== null;

  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [showList, setShowList] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open && ticketItem) {
      setActiveId(ticketItem.id);
      setMessage("");
      setSearch("");
    }
  }, [open, ticketItem]);

  const targetStatus = statusFilter === "closed" ? TICKET_STATUS.CLOSED : TICKET_STATUS.OPENING;

  const { data: sidebar, isLoading: sidebarLoading } = useQuery<{ data: TicketItem[]; total: number }>({
    queryKey: ["ticketSidebarList", open, targetStatus],
    queryFn: async () => {
      const body = await ticket.fetch({
        pageSize: 50,
        current: 1,
        filter: [{ id: "status", value: String(targetStatus) }],
        sort: [{ id: "updated_at", desc: true }] });
      const payload = (body.data ?? {}) as { data?: TicketItem[]; total?: number };
      return { data: payload.data ?? [], total: payload.total ?? 0 };
    },
    enabled: open });

  const { data: detail, isLoading: detailLoading } = useQuery<TicketDetail | null>({
    queryKey: ["ticketDetail", activeId],
    queryFn: () => (activeId ? readData<TicketDetail>(ticket.fetch({ id: activeId })) : Promise.resolve(null)),
    enabled: open && activeId !== null,
    refetchInterval: open && activeId !== null ? 5000 : false,
    retry: 3 });

  const sidebarRows = React.useMemo(() => {
    const list = sidebar?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (item) =>
        (item.subject ?? "").toLowerCase().includes(needle) || (item.user?.email ?? "").toLowerCase().includes(needle),
    );
  }, [sidebar, search]);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight - element.clientHeight, behavior });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      scrollToBottom("auto");
      window.setTimeout(() => scrollToBottom(), 300);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, detail?.messages, scrollToBottom]);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["ticketDetail"] }),
      queryClient.invalidateQueries({ queryKey: ["ticketSidebarList"] }),
      queryClient.invalidateQueries({ queryKey: ["ticketList"] }),
    ]);
    onChanged();
  }, [onChanged, queryClient]);

  const isClosed = detail?.status === TICKET_STATUS.CLOSED;

  async function send() {
    const text = message.trim();
    if (!text || sending || activeId === null) return;
    setSending(true);
    try {
      await ticket.reply({ id: activeId, message: text });
      setMessage("");
      await refreshAll();
      requestAnimationFrame(() => scrollToBottom());
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      toast.error(t("common:error"));
    } finally {
      setSending(false);
    }
  }

  async function closeActive() {
    if (activeId === null) return;
    try {
      await ticket.close({ id: activeId });
      toast.success(t("actions.close_success"));
      await refreshAll();
    } catch {
      toast.error(t("common:error"));
    }
  }

  const status = detail ? statusBadge(detail, t) : null;
  const level = detail ? levelBadge(detail.level, t) : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{detail?.subject ?? t("actions.view_ticket")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex h-full">
          {/* 左侧工单列表 */}
          <div
            className={cn(
              "flex-shrink-0 overflow-hidden border-r bg-background",
              showList ? "w-80" : "hidden md:block md:w-80",
            )}
          >
            <div className="flex h-full w-80 flex-col">
              <div className="space-y-3 border-b px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("list.title")}
                </p>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 pl-7 text-sm"
                    placeholder={t("list.search_placeholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                  {sidebarLoading ? (
                    <div className="flex h-24 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : sidebarRows.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
                      {search
                        ? t("list.no_search_results")
                        : targetStatus === TICKET_STATUS.CLOSED
                          ? t("list.no_closed_tickets")
                          : t("list.no_open_tickets")}
                    </div>
                  ) : (
                    sidebarRows.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        className={cn(
                          "flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60",
                          item.id === activeId && "bg-muted",
                        )}
                      >
                        <span className="truncate text-sm font-medium">{item.subject}</span>
                        <span className="truncate text-xs text-muted-foreground">{item.user?.email}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(item.updated_at)}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧会话 */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-col gap-3 border-b px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div className="flex min-w-0 items-start gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mt-0.5 hidden h-8 w-8 flex-shrink-0 md:flex"
                    title={showList ? t("list.collapse") : t("list.expand")}
                    onClick={() => setShowList((value) => !value)}
                  >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", !showList && "rotate-180")} />
                  </Button>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-semibold leading-tight">{detail?.subject}</h2>
                      {status && <Badge variant={status.variant}>{status.label}</Badge>}
                      {!isClosed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (
                              window.confirm(
                                `${t("actions.close_confirm_title")}\n${t("actions.close_confirm_description")}`,
                              )
                            ) {
                              void closeActive();
                            }
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t("actions.close_ticket")}
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{detail?.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {t("detail.created_at")} {formatDateTime(detail?.created_at)}
                        </span>
                      </div>
                      {level && <Badge variant="outline">{level.label}</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div ref={scrollRef} className="h-full space-y-4 overflow-y-auto p-4 md:p-6">
                {detailLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (detail?.messages?.length ?? 0) === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {t("detail.no_messages")}
                  </div>
                ) : (
                  detail?.messages.map((item) => {
                    const fromAdmin = item.is_from_admin ?? !item.is_me;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "max-w-[80%] rounded-lg border p-3",
                          fromAdmin ? "ml-auto bg-primary/10" : "mr-auto bg-muted/60",
                        )}
                      >
                        <div className="space-y-1">
                          <div className="text-[10px] font-medium text-muted-foreground">
                            {t(fromAdmin ? "detail.sender_admin" : "detail.sender_user")}
                          </div>
                          <div className="whitespace-pre-wrap break-words text-sm">{item.message}</div>
                          <div className="text-right">
                            <time className="text-[10px] text-muted-foreground">
                              {formatDateTime(item.created_at)}
                            </time>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t p-4">
              {isClosed && <p className="mb-2 text-xs text-muted-foreground">{t("detail.input.closed_hint")}</p>}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Textarea
                  ref={inputRef}
                  rows={2}
                  disabled={sending}
                  className="flex-1 resize-none rounded-lg border bg-background p-3 focus-visible:ring-1"
                  placeholder={t(isClosed ? "detail.input.closed_reply_placeholder" : "detail.input.reply_placeholder")}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button
                  className="w-full sm:w-auto"
                  disabled={sending || !message.trim()}
                  onClick={() => void send()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? t("detail.input.sending") : t("detail.input.send")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sr-only">
          <Button variant="outline" onClick={onClose}>
            {t("common:close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
