import * as React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TOptions } from "i18next";
import {
  Building2,
  LayoutTemplate,
  Lock,
  Mail,
  Send,
  Server,
  SlidersHorizontal,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { useConfig, useSaveConfig } from "@/components/settings/settings";
import { cn } from "@/lib/utils";

/**
 * 本组共享逻辑（仅 /config/system 子树使用）。
 *
 * 对应原件：
 * - `qGt`（bundle offset 5749033）= 侧边导航：桌面端 NavLink 列表 + 移动端 Select + 路由驱动
 * - `KGt`（offset 5750079）= 导航项表（title/href/icon 三元组，title 为 settings 命名空间的键）
 * - `cZt`/`gZt`/`_Zt`/`xZt`/`TZt`/`MZt`/`SYt`/`LYt`/`VQe` 共用的保存节流逻辑
 *   （原件每页都是 `FT.debounce(..., 1000)` + `FT.isEqual` 基线比较 + `kT.saveSettings`）
 */

export const SETTINGS_NAMESPACE = "settings";

export type TParams = Record<string, string | number | undefined>;

export type SettingsT = (key: string, params?: TParams & { defaultValue?: string }) => string;

/**
 * 原件每页都调用 `jy("settings")`，然后用 `settings` 命名空间内的短键（如 `site.title`）。
 *
 * 脚手架 `src/lib/i18n.ts` 只注册了 `translation` 一个命名空间，而
 * `src/locales/*.json` 的顶层键本身就是命名空间（`settings`、`common` …），
 * 因此这里先按 `settings.<key>` 全键解析（当前语言包的真实布局），
 * 再退回 `settings` 命名空间的短键（语言包被按命名空间拆分后的布局），
 * 最后才使用调用方给的 defaultValue。两种资源布局下都能正确出文案。
 */
export function useSettingsT(): SettingsT {
  const { t: tNamespace } = useTranslation(SETTINGS_NAMESPACE);
  const { t: tRoot } = useTranslation();

  return React.useCallback<SettingsT>(
    (key, params) => {
      const options = { ...(params ?? {}) } as TOptions;
      const fromRoot = tRoot(`${SETTINGS_NAMESPACE}.${key}`, { ...options, defaultValue: "" });
      if (fromRoot) return fromRoot;
      // 原件在 settings 命名空间里也直接引用 common.* 键（如 common.loading / common.placeholder），
      // 脚手架语言包把 common 放在顶层，这里跨命名空间再解析一次
      if (key.startsWith("common.")) {
        const fromCommon = tRoot(key, { ...options, defaultValue: "" });
        if (fromCommon) return fromCommon;
      }
      const fromNamespace = tNamespace(key, { ...options, defaultValue: "" });
      if (fromNamespace) return fromNamespace;
      return params?.defaultValue ?? key;
    },
    [tNamespace, tRoot],
  );
}

export type SectionValues = Record<string, unknown>;

export type SectionConfigOptions = {
  /** 原件设置页默认自动保存（debounce 1000ms）；frontend 页为显式「保存设置」按钮 => false */
  autoSave?: boolean;
  /** 保存前对整份表单整形（原件 site 的 null→""、safe 的 email_whitelist_suffix filter） */
  transform?: (values: SectionValues) => SectionValues;
  /** 服务端回填后、建立保存基线前套用的默认值（原件 server 页用站点网址兜底 server_ws_url） */
  hydrate?: (remote: SectionValues) => SectionValues;
  /** 节流毫秒；原件 site/safe/invite/subscribe/server/email/telegram/app 为 1000，订阅模板页 1500 */
  delay?: number;
};

export type SectionConfig = {
  values: SectionValues;
  /** 服务端配置已回填（原件 safe/invite 的 `ready` 标志，未回填前不触发保存） */
  ready: boolean;
  loading: boolean;
  saving: boolean;
  setValue: (name: string, value: unknown) => void;
  /** 立即保存（显式保存按钮用） */
  save: () => void;
};

/** 稳定序列化：键排序后比较，等价于原件 lodash isEqual 的用途（仅本组表单的扁平原语值） */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

const sameValues = (a: SectionValues, b: SectionValues): boolean => stable(a) === stable(b);

/** 表单值读取辅助：原件把数字也直接绑到受控 input 上 */
export const asString = (value: unknown): string =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : "";

export const asNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/**
 * 原件 gZt 等表单把回填值里的 number 一律转成字符串（o.setValue(e, String(n))），
 * 随后条件判断与 Switch 的 checked 直接用 JS truthy。这导致服务端返回 0 时
 * 开关显示「开」且子字段仍渲染 —— 本重建镜像该 truthiness 语义以保持像素一致。
 */
export const asBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return String(value ?? "") !== "";
};

export const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/**
 * 读取 + 自动保存一个配置节：GET /config/fetch?key=<section>，POST /config/save。
 * 原件等价物为每页的 `pC({queryKey:["settings",section]})` + `mC({mutationFn:kT.saveSettings})`
 * + `FT.debounce` 基线与保存节流。
 */
export function useSectionConfig(section: string, options: SectionConfigOptions = {}): SectionConfig {
  const { autoSave = true, transform, hydrate, delay = 1000 } = options;
  const { data, isLoading } = useConfig<Record<string, SectionValues | undefined>>(section);
  const { mutateAsync } = useSaveConfig(section);

  const [values, setValues] = React.useState<SectionValues>({});
  const [ready, setReady] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const valuesRef = React.useRef<SectionValues>({});
  const savedRef = React.useRef<SectionValues>({});
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = React.useCallback((next: SectionValues) => {
    valuesRef.current = next;
    setValues(next);
  }, []);

  // 回填一次；保存成功后 react-query 的 invalidate 会带来新对象，不能覆盖用户正在编辑的值
  React.useEffect(() => {
    if (ready) return;
    const remote = data?.[section];
    if (!remote) return;
    /* 原件 gZt effect：number → String，使 truthy 判断与「数字绑定受控 input」行为一致 */
    const normalized: SectionValues = {};
    for (const [key, value] of Object.entries(remote)) {
      normalized[key] = typeof value === "number" ? String(value) : value;
    }
    const next = hydrate ? hydrate({ ...normalized }) : { ...normalized };
    savedRef.current = next;
    apply(next);
    setReady(true);
  }, [data, section, ready, hydrate, apply]);

  const flush = React.useCallback(
    async (next: SectionValues) => {
      if (sameValues(next, savedRef.current)) return;
      setSaving(true);
      try {
        await mutateAsync(transform ? transform(next) : next);
        savedRef.current = next;
      } catch {
        // useSaveConfig 已给出错误提示；保留未保存值，下一次编辑会再次尝试
      } finally {
        setSaving(false);
      }
    },
    [mutateAsync, transform],
  );

  const schedule = React.useCallback(
    (next: SectionValues) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void flush(next);
      }, delay);
    },
    [flush, delay],
  );

  const setValue = React.useCallback(
    (name: string, value: unknown) => {
      const next = { ...valuesRef.current, [name]: value };
      apply(next);
      if (autoSave && ready) schedule(next);
    },
    [apply, autoSave, ready, schedule],
  );

  const save = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    void flush(valuesRef.current);
  }, [flush]);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { values, ready, loading: isLoading, saving, setValue, save };
}

export type SystemNavItem = {
  /** settings 命名空间内的标题键（原件 KGt 的 title 字段） */
  titleKey: string;
  href: string;
  icon: LucideIcon;
};

/** 原件 `KGt`（bundle offset 5750079）：顺序、路由与图标语义逐个对应 */
export const SYSTEM_NAV: SystemNavItem[] = [
  { titleKey: "site.title", href: "/config/system", icon: Building2 },
  { titleKey: "safe.title", href: "/config/system/safe", icon: Lock },
  { titleKey: "subscribe.title", href: "/config/system/subscribe", icon: Ticket },
  { titleKey: "invite.title", href: "/config/system/invite", icon: UserRound },
  { titleKey: "server.title", href: "/config/system/server", icon: Server },
  { titleKey: "email.title", href: "/config/system/email", icon: Mail },
  { titleKey: "telegram.title", href: "/config/system/telegram", icon: Send },
  { titleKey: "app.title", href: "/config/system/app", icon: SlidersHorizontal },
  { titleKey: "subscribe_template.title", href: "/config/system/subscribe-template", icon: LayoutTemplate },
];

/** 原件 `qGt`（offset 5749033）：移动端 Select 切换 + 桌面端 NavLink 列表，均由当前路由驱动 */
export function SystemNav({ className }: { className?: string }) {
  const t = useSettingsT();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(pathname || "/config/system");

  React.useEffect(() => setValue(pathname), [pathname]);

  return (
    <>
      <div className="p-1 md:hidden">
        <Select
          value={value}
          onValueChange={(href) => {
            setValue(href);
            navigate(href);
          }}
        >
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {SYSTEM_NAV.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">
                    <item.icon size={18} />
                  </span>
                  <span className="text-md">{t(item.titleKey)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden w-full overflow-x-auto bg-background px-1 py-2 md:block">
        <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}>
          {SYSTEM_NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/config/system"}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                "justify-start",
              )}
            >
              <span className="mr-2">
                <item.icon size={18} />
              </span>
              {t(item.titleKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
