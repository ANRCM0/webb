import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconSearch, IconSun, IconMoon, IconDeviceLaptop, IconLogout, IconSettings, IconLanguage, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { navGroups } from "@/components/layout/nav-config";
import { clearToken, getToken, toSignIn } from "@/lib/http";

/** 复刻原件 Eut：⌘K 命令面板，数据源 = 导航项 */
export function SearchPalette() {
  const { t } = useTranslation("search");
  const { t: tn } = useTranslation("nav");
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const items = React.useMemo(
    () => navGroups.flatMap((g) => g.items).filter((i) => tn(i.key).toLowerCase().includes(q.toLowerCase())),
    [q, t],
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <IconSearch className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">{t("placeholder")}</span>
        <span className="sr-only">{t("shortcut.label")}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          {t("shortcut.key")}
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("placeholder")}
            className="h-12 rounded-none border-0 border-b"
          />
          <div className="max-h-80 overflow-auto p-2">
            {items.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t("noResults")}</p>}
            {items.map((i) => (
              <button
                key={i.href}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  setOpen(false);
                  navigate(i.href);
                }}
              >
                <i.icon className="h-4 w-4 text-muted-foreground" />
                {tn(i.key)}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** 复刻原件 Lut：主题切换（light/dark/system） */
export function ThemeSwitch() {
  const { t } = useTranslation("common");
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("theme")}>
          {theme === "dark" ? <IconMoon className="h-4 w-4" /> : theme === "light" ? <IconSun className="h-4 w-4" /> : <IconDeviceLaptop className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <IconSun className="h-4 w-4" /> {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <IconMoon className="h-4 w-4" /> {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <IconDeviceLaptop className="h-4 w-4" /> {t("theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 语言切换：en-US / zh-CN / ru-RU，写入 i18nextLng */
export function LangSwitch() {
  const { i18n } = useTranslation();
  const langs = [
    { code: "zh-CN", label: "简体中文" },
    { code: "en-US", label: "English" },
    { code: "ru-RU", label: "Русский" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" aria-label="language">
          <IconLanguage className="h-4 w-4" />
          <span className="text-xs font-medium">{i18n.language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langs.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => void i18n.changeLanguage(l.code)}>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 复刻原件 sht：用户菜单（设置 ⌘S / 退出 ⇧⌘Q） */
export function UserNav() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const token = getToken();
  const email = (() => {
    try {
      return (token && atob(token.replace("Bearer ", "").slice(0, 24).replace(/[^A-Za-z0-9+/=]/g, ""))) || "";
    } catch {
      return "";
    }
  })();
  if (!token) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("user")}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
            {(email || "A").slice(0, 2).toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs text-muted-foreground">{email || t("defaultEmail")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/config/system")}>
          <IconSettings className="h-4 w-4" /> {t("settings")}
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            clearToken();
            toSignIn();
          }}
        >
          <IconLogout className="h-4 w-4" /> {t("logout")}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
