import { Outlet, useLocation } from "react-router-dom";
import { Layout, LayoutBody, LayoutHeader } from "@/components/layout/layout";
import { LangSwitch, SearchPalette, ThemeSwitch, UserNav } from "@/components/layout/header-widgets";
import { Separator } from "@/components/ui/separator";
import { SystemNav, useSettingsT } from "./system/system-shared";
import { SiteSettingsContent } from "./system/index";

/**
 * `/config/system` 设置页骨架。
 *
 * 原件 `GGt`（bundle offset 5751229，974B）：
 * ```
 * <eot fadedBelow fixedHeight>                        // Layout
 *   <tot><Eut/><div.ml-auto><Lut/><sht/></div></tot>  // LayoutHeader：搜索 / 主题 / 语言 / 用户
 *   <not className="flex flex-col" fixedHeight>        // LayoutBody
 *     <div.space-y-2><h1>{settings:title}</h1><div>{settings:description}</div></div>
 *     <$f className="my-6"/>                            // Separator
 *     <div.flex ... lg:flex-row>
 *       <aside.sticky lg:w-1/5><qGt items={KGt}/></aside>
 *       <div.flex-1 w-full p-1 pr-4><div.pb-16><vg/></div></div>   // <Outlet/>
 *     </div>
 *   </not>
 * </eot>
 * ```
 * 页签导航 `qGt`（offset 5749033）+ 导航表 `KGt`（offset 5750079）见 `./system/system-shared`。
 *
 * index 路由：原件的 index 子页是 `dZt`（offset 5761942）→ 内容体 `cZt`（offset 5755527），
 * 挂在 `vg`（Outlet）上。本项目 `src/router.tsx` 把 10 个子页注册为**扁平路由**，
 * 因此 index 内容在 `/config/system` 上由本文件直接渲染；改为嵌套路由时 Outlet 会自动生效。
 */
const INDEX_PATH = "/config/system";

export default function ConfigSystem() {
  const t = useSettingsT();
  const { pathname } = useLocation();
  const isIndex = pathname.replace(/\/+$/, "") === INDEX_PATH;

  return (
    <Layout fadedBelow fixedHeight>
      <LayoutHeader />
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
          <div className="text-muted-foreground">{t("description")}</div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-1 flex-col space-y-8 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="sticky top-0 lg:w-1/5">
            <SystemNav />
          </aside>
          <div className="w-full flex-1 pt-6 pr-4">
            <div className="pb-16">{isIndex ? <SiteSettingsContent /> : <Outlet />}</div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  );
}
