# Xboard 管理前端重建（scaffold）

从镜像 `ghcr.io/cedar2025/xboard:latest` 内 `/www/public/assets/admin` 的**构建产物**逆向重建的可编译 React 工程。
29 个页面全部落地，`tsc --noEmit` 与 `vite build` 均通过。

```bash
cd reconstruction/scaffold
npm install          # 已装好，重装可忽略
npm run dev          # 开发；index.html 里的 window.settings 需指向你的 Xboard
npm run typecheck    # tsc --noEmit
npm run build        # 产出 dist/（约 1.63 MB JS + 45 KB CSS）
```

把 `index.html` 中 `window.settings` 的 `secure_path` 改成后端 `admin_setting('secure_path')` 的实际值（默认是 `crc32b(app.key)` 的十六进制串），否则所有 `/api/v2/{secure_path}/...` 请求会 404。

## 规模

| 层 | 文件 | 行数 |
| --- | --- | --- |
| 页面（29 个路由） | 36 | 23,131 |
| 共享层（ui/layout/data-table/settings/lib/api） | 40 | 2,436 |

## 目录

```
src/
├── components/
│   ├── ui/            # 20 个 shadcn 原语（button/card/table/tabs/dialog/dropdown/select/… 含 monaco-editor.tsx 懒加载封装）
│   ├── layout/        # layout.tsx（Layout / LayoutHeader / LayoutBody = 原件 eot/tot/not）
│   │                  # app-shell.tsx、nav-config.ts、header-widgets.tsx（⌘K 搜索 / 主题 / 语言 / 用户）
│   ├── data-table/    # DataTable + 列头 + 分页 + FilterBuilder（字段/操作符/单位）
│   ├── settings/      # SettingsSection/Field/*Field/useConfig/useSaveConfig/SaveButton
│   └── theme-provider.tsx
├── lib/               # http.ts（axios + 拦截器）、i18n.ts（3 语）、query.ts、utils.ts、monaco.ts（离线 Monaco 配置）
├── api/index.ts       # 88 条端点，GET/POST 与原件一致（IL=GET / RL=POST）
├── locales/           # zh-CN / en-US / ru-RU（从产物逐字节还原）
└── pages/             # 29 个路由页面
```

## 页面 ↔ 原件对应

| 路由 | 文件 | 原件组件（bundle offset） |
| --- | --- | --- |
| `/` | `pages/dashboard/index.tsx` | `$Gt`@5,748,402（`uqt` 统计卡 / `$$t` 收入 / `eKt` 流量榜 / `UGt` 队列） |
| `/sign-in` | `pages/auth/sign-in.tsx` | `Jst`@5,059,850 |
| `/config/system` | `pages/config/system.tsx` + `system/index.tsx` | `GGt`@5,751,229 / `dZt`@5,761,942 |
| `/config/system/{safe,subscribe,invite,frontend,server,email,telegram,APP,subscribe-template}` | `pages/config/system/*.tsx` | `pZt`/`vZt`/`wZt`/`NZt`/`IZt`/`xYt`/`kYt`/`DYt`/`WQe` |
| `/config/theme` | `pages/config/theme.tsx` | `E1t`@5,990,398 |
| `/config/plugin` | `pages/config/plugin.tsx` | `g1t`@5,966,014 |
| `/config/plugin/{menu-demo,crud-demo}` | `pages/config/plugin/*.tsx` | `f1t`@5,974,389 / `C1t`@5,986,617 |
| `/config/notice` · `/config/knowledge` | `pages/config/{notice,knowledge}.tsx` | `G2t`@6,052,168 / `n4t`@6,064,439 |
| `/config/payment` | `pages/config/payment.tsx` | `_Qt`@5,866,421 |
| `/plugins/:pluginCode/*` | `pages/plugins/index.tsx` | `r4t`@6,066,003 |
| `/server/{manage,machine,group,route}` | `pages/server/*.tsx` | `J5t`@6,242,245 / `B3t`@6,286,633 / `U3t`@6,291,513 / `Y3t`@6,299,974 |
| `/finance/{plan,order,coupon,gift-card}` | `pages/finance/*.tsx` | `d6t`@6,320,121 / `L6t`@6,342,596 / `B6t`@6,362,347 / `s8t`@6,401,827 |
| `/user/{manage,ticket,traffic-reset-logs}` | `pages/user/*.tsx` | `Y8t`@6,476,931 / `x9t`@6,500,637 / `N9t`@6,518,366 |

## 还原的关键行为

- **认证**：`POST /passport/auth/login` → `auth_data`（形如 `Bearer <sanctum token>`）写入 `localStorage["Xboard_access_token"]`；axios 拦截器补 `Authorization`、`Content-Language`；无 token 跳 `#/sign-in?redirect=`。
- **端点**：`/api/v2/{secure_path}/{module}/{action}`，88 条全部按 `IL(...)`=GET、`RL(...)`=POST 还原（`api/index.ts` 每条带原件辅助函数名注释）。
- **轮询**：节点列表 `isSortMode ? false : 30000`；机器列表 `staleTime 3e4 / interval 6e4`；仪表盘统计卡 300s、概览/流量榜/队列 30s；工单会话 5s 且仅面板打开时启用。
- **表格**：TanStack Table 四种 rowModel、`columnPinning.right=["actions"]`、行选择 + 批量操作、列可见性、拖拽排序（notice/plan 按 index，manage 按 id 且 body 为 `[{id,order}]`）、排序模式下切换 pageSize 与列可见性。
- **过滤器构建器**：用户页 15 个字段（email/id/plan_id/transfer_enable(GB)/total_used(GB)/online_count/expired_at/uuid/token/banned/remarks/invite_user.email/invite_user_id/is_admin/is_staff），`contains` 裸值、其余 `op:value`，GB→字节、date→Unix 秒、bool→1/0。
- **Monaco**：订阅模板（json/yaml/ini，debounce 1500ms）、邮件模板（html）、主题配置（扁平 JSON）。
- **i18n**：3 语言 × 23 命名空间，`fallbackLng: zh-CN`，检测顺序 querystring → localStorage(`i18nextLng`) → navigator。

## 已知偏离（与原件不完全一致，均为有意）

| 项 | 原件 | 重建 | 说明 |
| --- | --- | --- | --- |
| ~~设置页页签常驻~~ | 子页嵌在 `GGt` 的 `<Outlet/>` 内 | **已还原**：`config/system` 改为嵌套路由，子页只渲染内容，页签常驻 | — |
| ~~机器详情抽屉~~ | `A3t` | **已还原**：信息卡 → 负载趋势(E3t)+负载卡(L3t) → Token 卡(I3t) → 安装命令卡(R3t) → 承载节点卡(M3t+O3t)，URL `?machine_id=` 深链 | — |
| ~~日期区间选择~~ | Popover + 双月日历（`o$t`） | **已还原**：`DateRangePicker`（`calendar.tsx` + `date-range-picker.tsx`），已接入仪表盘概览/流量榜与流量重置日志筛选 | — |
| ~~Monaco 资源~~ | 产物内同时有本地 worker 与 jsDelivr 默认路径 | **已还原**：`src/lib/monaco.ts` 懒加载；首次渲染 `<MonacoEditor/>`（订阅/邮件/主题配置）时才动态拉取 editor 核心 + 语言贡献（json/yaml/ini/html）+ editor/json/html/css worker（Vite `?worker` 本地打包） | 完全离线可用，无 CDN 依赖，首屏不再背 4MB |
| ~~插件页布局~~ | 卡片网格（`u1t`，Card + 徽章 + 操作组） | **已还原**：类型页签（默认 feature）下逐卡片渲染 `PluginCard`，受保护「锁」图标、README 按钮、升级（红）／配置／启停／卸载／删除按钮与原件一致 | 工具条右为图标+标题，无 ⌘K 搜索（原件如此） |
| ~~插件菜单/CRUD 演示页头部~~ | 均有 ⌘K 搜索 + 主题/语言/用户 | **已还原**：`<LayoutHeader/>` 统一渲染 | — |
| ~~套餐弹窗~~ | `l6t` | **已还原**：名称/标签/分组/流量/限速/设备/容量/重置方式/价格(基础价联动+清空+周期网格)/说明(Markdown+模板+预览)/编辑态「强制更新」开关 | — |
| ~~优惠券弹窗~~ | `I6t` | **已还原**：名称/自定义码/批量生成数量/类型(金额/百分比)/金额或百分比/有效期(双月日历+预设)/使用次数/单人次数/限制订阅套餐与周期 | — |
| ~~用户编辑抽屉~~ | `K8t` | **已还原**：email/邀请人邮箱/手机号(国家码+号码,条件显示)/密码/余额/佣金余额/已用上下行(GB)/流量(GB)/到期时间(Calendar+当天/长期/1月/3月预设)/订阅计划/佣金类型(系统/循环/首次)/比例/折扣/限速/设备限制/管理员/员工/备注；提交仅发送变化字段，u/d/transfer_enable 按 GB→字节 | — |
| 主题配置编辑器 | `configs[]` 逐字段表单（`k1t`） | Monaco 编辑整份 JSON | 回写同一份 `saveThemeConfig` |
| 插件页布局 | 卡片网格（`u1t`） | 表格 + 开关 + 设置抽屉 | 功能等价 |
| 工单附件 | 无（`reply` 只收 `{id,message}`） | 无 | 原件本就没有，蓝图里的 `upload` 是"上行流量"字段 |

## 离线部署

见 [docs/offline-deployment.md](docs/offline-deployment.md)（构建、Nginx/静态托管、`window.settings` 要求、常见问题）。

## 验收

```bash
npx tsc --noEmit     # 0 error
npx vite build       # 10872 modules；首屏入口 index 1.99 MB JS（gzip 591 KB）+ CSS 89 KB
                     # Monaco 为懒加载 chunk（仅首次打开编辑器页面时拉取）：
                     #   monaco-vs 4.06 MB（gzip 1.05 MB）+ monaco-json 7 KB + monaco-langs 11 KB
                     #   worker：editor 276 KB / json 408 KB / html 714 KB / css 1.06 MB
                     # 其它静态资源：codicon 153 KB ttf
```

> Monaco 与原件一样采用本地化交付（无 jsDelivr CDN 依赖），但按需加载：
> 常规页面不承担 4MB 核心；`vite.config.ts` 的 `monacoAliases` 与
> `build.rollupOptions.output.manualChunks` 负责深路径映射与拆分。
> 若需要退回 CDN 版，可改回 `@monaco-editor/react` 默认加载并移除别名。

未做（本次范围外）：与真实 Xboard 后端联调、逐像素视觉回归、SSR/e2e 测试。

## 证据链

- 逐页反解蓝图：`../pages/*.md`（含去最小化源码与 offset）
- 端点/路由/组件清单：`../meta/{endpoints,routes,page_index,components}.json`
- 语言包：`../locales/*.json`
- 产物基线：`sha256(f04f09a9…)`，镜像内路径 `/www/public/assets/admin`

## 视觉回归（对原件逐路由像素比对）

最近一次本地基线（40 组对比，1440×900，阈值 24）：

| 范围 | 结果 |
| --- | --- |
| 全部页面/弹层 | 平均像素差 ≈3.5%，最接近 <0.5%（仪表盘、公告、知识库、支付、权限组、插件总览） |
| 弹层/抽屉（9 组：公告/知识/套餐/优惠券/创建用户/添加节点/权限组/路由/机器详情） | 全部 ≤1.2%，与原件一致 |
| 插件页 | 10.5% → **3.5%**（卡片网格已按 `u1t` 还原） |
| 系统配置子页 | 5–6%，主要残留为字段行距微差与整页垂直偏移（已把 `Field` 改为与原件相同的 `space-y-2` 垂直堆叠） |
| 插件 crud-demo | ~11%：结构已对齐（13 行、列宽、时间格式 `MM/dd/yyyy, HH:mm`、英文文案），残留差异来自两端演示数据随机（`Math.random()` 生成 requests，原件亦然，任意两次截图互不相同） |
| 流量重置日志 | ~6.3%，单控件日期范围选择属已知偏离 |

```bash
# 重跑基线
node tools/build-and-serve.mjs
bash tools/regress.sh            # 31 条路由 + 9 组弹层
```

```bash
# 一个端口同时托管「原件 SPA」与「重建产物」+ 同一套确定性 fixture
node ../tools/build-and-serve.mjs          # http://127.0.0.1:4318/orig/index.html 与 /app/
bash ../tools/regress.sh                   # 31 条路由，逐页截图 + 像素差，报告 /tmp/shots/report.tsv
bash ../tools/regress.sh notice plan       # 只跑名字匹配的路由
```

- 截图：headless Chromium 1440×900，`/seed.html` 先写登录态再跳目标 hash 路由；
- 比对：`tools/pngdiff.py`（纯标准库 PNG 解码，无 PIL 依赖），判定阈值：单像素三通道累计差 > 24 计为「不同」；
- 输出：`o_*.png`（原件）/`a_*.png`（重建）/`d_*.png`（差异图，白=相同、红=不同）。

本地基线见 `../tools/README.md` 的「视觉回归基线」一节。
