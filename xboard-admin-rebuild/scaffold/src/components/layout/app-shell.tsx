import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Icon } from "@tabler/icons-react";
import {
  IconChevronDown,
  IconMenu2,
  IconX,
  IconSettings,
  IconServer,
  IconCreditCard,
  IconUsers,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navGroups } from "@/components/layout/nav-config";
import { getToken } from "@/lib/http";

const GROUP_ICONS: Record<string, Icon> = {
  systemManagement: IconSettings,
  nodeManagement: IconServer,
  subscriptionManagement: IconCreditCard,
  userManagement: IconUsers,
};

/**
 * 复刻原件侧边栏（shadcn 变体）：
 * - 头部 `h-[var(--header-height)] p-4 px-4 py-3 shadow sticky top-0`，logo 32px + 标题 `font-medium`；
 * - 一级项 `text-xs h-12 rounded-none px-6`，图标 18px 包在 `<div class="mr-2">`；
 * - 分组是折叠按钮（`h-12 w-full justify-start px-6`，右侧 chevron 24px/stroke-1，展开时 `-rotate-180`）；
 * - 二级项 `h-10 w-full border-l border-l-slate-500 px-2`，外层 `<li class="my-1 ml-8">`。
 */
export default function AppShell() {
  const { t } = useTranslation("nav");
  const { t: tc } = useTranslation("common");
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  if (!getToken()) {
    const base = window.location.pathname.split("/")[1];
    const prefix = base ? `/${base}` : "";
    const redirect = encodeURIComponent(window.location.hash.slice(1));
    window.location.href = `${prefix}#/sign-in${redirect ? `?redirect=${redirect}` : ""}`;
    return null;
  }

  return (
    <div className="flex min-h-svh bg-background">
      <aside
        id="sidebar-menu"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border/50 bg-background md:static md:flex",
          open ? "flex" : "hidden",
        )}
      >
        <div className="sticky top-0 flex h-[var(--header-height)] flex-none items-center justify-between gap-4 bg-background p-4 px-4 py-3 shadow md:px-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 256 256" className="h-8 w-8 transition-all">
              <rect width="256" height="256" fill="none" />
              <line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              <line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
            </svg>
            <div className="flex flex-col justify-end truncate">
              <span className="font-medium">{window.settings?.title}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={tc("toggleNavigation")}
            aria-controls="sidebar-menu"
            aria-expanded={open}
            onClick={() => setOpen(false)}
          >
            <IconX size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-auto overscroll-contain border-b bg-background py-2 md:border-none md:py-2">
          <nav className="grid gap-1">
            {navGroups.map((group, groupIndex) => {
              if (group.items.length === 1 && groupIndex === 0) {
                const item = group.items[0];
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end
                    className={({ isActive }) =>
                      cn(
                        "inline-flex items-center whitespace-nowrap rounded-none text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        "h-12 justify-start px-6",
                        isActive && "bg-accent text-accent-foreground",
                      )
                    }
                  >
                    <div className="mr-2">
                      <item.icon size={18} />
                    </div>
                    {t(item.key)}
                  </NavLink>
                );
              }
              const GroupIcon = GROUP_ICONS[group.label] ?? IconLayoutDashboard;
              const isOpen = collapsed[group.label] !== true;
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setCollapsed((prev) => ({ ...prev, [group.label]: isOpen }))}
                    className="group inline-flex h-12 w-full items-center justify-start whitespace-nowrap rounded-none px-6 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="mr-2">
                      <GroupIcon size={18} />
                    </div>
                    {t(group.label)}
                    <span className={cn("ml-auto transition-all", isOpen && "-rotate-180")}>
                      <IconChevronDown size={24} strokeWidth={1} />
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="collapsibleDropdown">
                      {group.items.map((item) => (
                        <li key={item.href} className="my-1 ml-8">
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              cn(
                                "inline-flex h-10 w-full items-center justify-start whitespace-nowrap rounded-none border-l border-l-slate-500 px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                isActive && "bg-accent text-accent-foreground",
                              )
                            }
                          >
                            <div className="mr-2">
                              <item.icon size={18} />
                            </div>
                            {t(item.key)}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          v{window.settings?.version}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 z-30 md:hidden"
          aria-label={tc("toggleNavigation")}
          onClick={() => setOpen((v) => !v)}
        >
          <IconMenu2 size={24} />
        </Button>
        <Outlet />
      </div>
    </div>
  );
}
