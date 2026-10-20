# 视觉回归基建（原件 SPA ↔ 重建脚手架）

同一端口、同一套确定性 fixture，供后续 Chromium 像素比对使用。

| 文件 | 作用 |
| --- | --- |
| `tools/mock-api.mjs` | 纯 Node HTTP 服务（无第三方依赖）：`/settings.js`、`/api/v2/**` fixture、`/orig/**` 与 `/app/**` 静态托管 |
| `tools/build-and-serve.mjs` | 一条命令：构建重建工程（`BASE_URL=/app/`）→ 起 fixture 服务 → 打印两个 URL |
| `tools/README.md` | 本文件 |

端口固定 **4318**，监听 `0.0.0.0`（默认），对外 URL 用 `127.0.0.1`。

---

## 1. 启动

在 `/workspace/reconstruction` 下：

```bash
# 构建 + 起服务（Lead 用这个）
node tools/build-and-serve.mjs

# 已构建过，跳过构建
node tools/build-and-serve.mjs --skip-build

# 只起 fixture / 只起静态托管（dist 需已存在）
node tools/mock-api.mjs

# 可选环境变量
PORT=4318 HOST=0.0.0.0 PUBLIC_HOST=127.0.0.1 node tools/mock-api.mjs
```

启动后：

```
original SPA : http://127.0.0.1:4318/orig/index.html
rebuild      : http://127.0.0.1:4318/app/
fixtures     : http://127.0.0.1:4318/__fixtures
seed auth    : http://127.0.0.1:4318/seed.html?app=orig&to=/config/notice
```

停止：`Ctrl+C`（或 kill 该进程）。服务不写任何应用目录。

### 静态托管映射

| URL 前缀 | 磁盘目录 | 说明 |
| --- | --- | --- |
| `/orig/**` | `/workspace/xboard/public/assets/admin` | 原件 dist，只读；`/orig` → 302 `/orig/`；`index.html` 里的 `./assets`、`./locales` 相对路径与 `/settings.js`、`/settings.local.js` 绝对路径都命中 |
| `/app/**` | `/workspace/reconstruction/scaffold/dist` | 构建产物；`/app` → 302 `/app/`；资源为 `/app/assets/...` |

`/settings.js` 内容固定为：

```js
window.settings = {base_url:"/", title:"Xboard", version:"1.0.0", logo:"", secure_path:"admin"};
```

`/settings.local.js` 返回 `window.settings_local = {};`（原件 `index.html` 引用它，避免 404）。

---

## 2. 登录态（必须先看）

两个应用对 token 的存储格式**不同**（已在 bundle 与重建代码中核实）：

| 应用 | localStorage key | 值格式 |
| --- | --- | --- |
| 原件 | `XBOARD_ACCESS_TOKEN`（存储工具把 `Xboard_` 前缀整体大写） | `{"value":"Bearer test-token","time":0,"expire":null}` |
| 重建 | `Xboard_access_token` | 裸字符串 `Bearer test-token` |

因此：

- 只登录原件，重建仍会跳 `#/sign-in`；反之亦然。
- 视觉巡检前推荐用 **seed 页**，它一次写入两种格式，然后跳到目标页：

```
http://127.0.0.1:4318/seed.html?app=orig&to=/config/notice
http://127.0.0.1:4318/seed.html?app=app&to=/server/manage
```

`app=orig|app`，`to` 是 hash 路由（默认 `/`），`lang=zh-CN|en-US|ru-RU`（默认 `zh-CN`）。
seed 后 profile 内登录态保持，之后可直接改 hash 巡检其它页面。

- 也可以直接走登录页：`POST /api/v2/passport/auth/login` 对任意账号返回
  `{status:"success", data:{token:"t", auth_data:"Bearer test-token", is_admin:1}}`。
  但每个应用只会写自己那套 key，跨应用请用 seed。

---

## 3. 每个页面的可访问 URL

两个前缀：

- 原件：`http://127.0.0.1:4318/orig/index.html`
- 重建：`http://127.0.0.1:4318/app/`

| 页面 | 原件 URL | 重建 URL |
| --- | --- | --- |
| 仪表盘 | `http://127.0.0.1:4318/orig/index.html#/` | `http://127.0.0.1:4318/app/#/` |
| 登录 | `http://127.0.0.1:4318/orig/index.html#/sign-in` | `http://127.0.0.1:4318/app/#/sign-in` |
| 系统设置（站点） | `http://127.0.0.1:4318/orig/index.html#/config/system` | `http://127.0.0.1:4318/app/#/config/system` |
| 安全设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/safe` | `http://127.0.0.1:4318/app/#/config/system/safe` |
| 订阅设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/subscribe` | `http://127.0.0.1:4318/app/#/config/system/subscribe` |
| 邀请&佣金 | `http://127.0.0.1:4318/orig/index.html#/config/system/invite` | `http://127.0.0.1:4318/app/#/config/system/invite` |
| 前端设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/frontend` | `http://127.0.0.1:4318/app/#/config/system/frontend` |
| 节点配置 | `http://127.0.0.1:4318/orig/index.html#/config/system/server` | `http://127.0.0.1:4318/app/#/config/system/server` |
| 邮件设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/email` | `http://127.0.0.1:4318/app/#/config/system/email` |
| Telegram 设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/telegram` | `http://127.0.0.1:4318/app/#/config/system/telegram` |
| APP 设置 | `http://127.0.0.1:4318/orig/index.html#/config/system/APP` | `http://127.0.0.1:4318/app/#/config/system/app`（大写也匹配） |
| 订阅模板 | `http://127.0.0.1:4318/orig/index.html#/config/system/subscribe-template` | `http://127.0.0.1:4318/app/#/config/system/subscribe-template` |
| 主题配置 | `http://127.0.0.1:4318/orig/index.html#/config/theme` | `http://127.0.0.1:4318/app/#/config/theme` |
| 插件管理 | `http://127.0.0.1:4318/orig/index.html#/config/plugin` | `http://127.0.0.1:4318/app/#/config/plugin` |
| 插件菜单示例 | `http://127.0.0.1:4318/orig/index.html#/config/plugin/menu-demo` | `http://127.0.0.1:4318/app/#/config/plugin/menu-demo` |
| 插件 CRUD 示例 | `http://127.0.0.1:4318/orig/index.html#/config/plugin/crud-demo` | `http://127.0.0.1:4318/app/#/config/plugin/crud-demo` |
| 公告管理 | `http://127.0.0.1:4318/orig/index.html#/config/notice` | `http://127.0.0.1:4318/app/#/config/notice` |
| 知识库 | `http://127.0.0.1:4318/orig/index.html#/config/knowledge` | `http://127.0.0.1:4318/app/#/config/knowledge` |
| 支付配置 | `http://127.0.0.1:4318/orig/index.html#/config/payment` | `http://127.0.0.1:4318/app/#/config/payment` |
| 节点管理 | `http://127.0.0.1:4318/orig/index.html#/server/manage` | `http://127.0.0.1:4318/app/#/server/manage` |
| 服务器管理 | `http://127.0.0.1:4318/orig/index.html#/server/machine` | `http://127.0.0.1:4318/app/#/server/machine` |
| 权限组 | `http://127.0.0.1:4318/orig/index.html#/server/group` | `http://127.0.0.1:4318/app/#/server/group` |
| 路由管理 | `http://127.0.0.1:4318/orig/index.html#/server/route` | `http://127.0.0.1:4318/app/#/server/route` |
| 套餐管理 | `http://127.0.0.1:4318/orig/index.html#/finance/plan` | `http://127.0.0.1:4318/app/#/finance/plan` |
| 订单管理 | `http://127.0.0.1:4318/orig/index.html#/finance/order` | `http://127.0.0.1:4318/app/#/finance/order` |
| 优惠券 | `http://127.0.0.1:4318/orig/index.html#/finance/coupon` | `http://127.0.0.1:4318/app/#/finance/coupon` |
| 礼品卡 | `http://127.0.0.1:4318/orig/index.html#/finance/gift-card` | `http://127.0.0.1:4318/app/#/finance/gift-card` |
| 用户管理 | `http://127.0.0.1:4318/orig/index.html#/user/manage` | `http://127.0.0.1:4318/app/#/user/manage` |
| 工单管理 | `http://127.0.0.1:4318/orig/index.html#/user/ticket` | `http://127.0.0.1:4318/app/#/user/ticket` |
| 流量重置日志 | `http://127.0.0.1:4318/orig/index.html#/user/traffic-reset-logs` | `http://127.0.0.1:4318/app/#/user/traffic-reset-logs` |
| 插件页面示例 | `http://127.0.0.1:4318/orig/index.html#/plugins/traffic-analytics/overview` | `http://127.0.0.1:4318/app/#/plugins/traffic-analytics/overview` |

> 需登录的页面请先走一次 `/seed.html?...`；`#/sign-in` 不需要 token。

---

## 4. Fixture 覆盖

时间基准固定为 **2024-06-01T00:00:00Z**（`T0 = 1717200000`），所有列表 3–8 行，无随机数、无 `Date.now()` 参与数据；重复请求字节一致（已用 sha256 抽查）。

### 信封约定

```jsonc
// 普通
{"status":"success","message":"","data": {...}}
// 列表：total 在信封顶层（原件的 `resp.data` / `resp.total` 与重建读取器都按这个形状）
{"status":"success","message":"","data":[...],"total":5}
// 配置：data 下按 section 包一层
{"status":"success","message":"","data":{"site":{...}}}
// 未知端点：HTTP 200 + fail（绝不返回 4xx/5xx，避免原件拦截器跳登录）
{"status":"fail","message":"no fixture for GET /xxx","data":null}
```

分页参数支持 `current/page` + `pageSize/per_page`（GET/POST 的 query 或 JSON body），返回切片与全量 `total`。**过滤与排序参数被忽略**。

### 端点与数据

| 分组 | 端点 | 数据 |
| --- | --- | --- |
| 认证 | `/passport/auth/login`、`token2Login`、`register`、`forget`、`/passport/comm/sendEmailVerify`、`/guest/comm/config` | 登录返回任务指定的 `{token:"t",auth_data:"Bearer test-token",is_admin:1}`；guest config 全关验证码/邮箱验证 |
| 当前用户 | `/user/info`（注意：原件请求 `/api/v2/user/info`，不带 secure_path；两种前缀都支持） | carol@example.com，管理员 |
| 仪表盘 | `/stat/getStats`、`/stat/getOrder`、`/stat/getTrafficRank?type=node\|user`、`/stat/getStatUser` | 8 张统计卡、7 天收入序列 + 汇总、节点 6 条/用户 5 条流量榜 |
| 队列 | `/system/getQueueStats`、`/system/getHorizonFailedJobs`、`getSystemStatus`、`getQueueWorkload`、`getQueueMasters` | 3 条失败任务（含多行 exception）、8 进程、wait 队列 |
| 配置 | `/config/fetch?key=site\|safe\|subscribe\|invite\|frontend\|server\|email\|telegram\|app\|subscribe_template`、`/config/save`、`/config/getEmailTemplate`、`/config/testSendMail`、`/config/setTelegramWebhook` | 9 个 section + 6 份订阅模板，字段名与原件 schema 一致 |
| 邮件模板 | `/mail/template/list`、`/mail/template/get?name=`、`save`、`reset`、`test` | welcome/verify/notify/remind_expire 4 份，含 subject/content/required_vars |
| 公告 | `/notice/fetch` + `save/drop/show/sort` | 5 条（1 条隐藏） |
| 知识库 | `/knowledge/fetch` + `save/drop/show/sort` | 5 条（1 条隐藏） |
| 支付 | `/payment/fetch`、`getPaymentMethods`、`getPaymentForm`、`save/drop/show/sort` | 支付宝/微信/Stripe/易支付 4 条，methods 4 个 |
| 节点 | `/server/manage/getNodes` + `save/update/drop/copy/sort/resetTraffic/batch*`、`generateEchKey` | 6 个节点（ss/vmess/trojan/hysteria/vless/tuic），含 groups/group_ids/machine_id |
| 服务器 | `/server/machine/fetch` + `save/drop`、`getToken`、`resetToken`、`installCommand`、`nodes`、`history` | 3 台（在线/停用/从未心跳）；负载含 cpu/mem/disk |
| 权限组 | `/server/group/fetch` + `save/drop` | 3 组 |
| 路由 | `/server/route/fetch` + `save/drop` | 4 条（block/direct/dns/proxy） |
| 套餐 | `/plan/fetch` + `save/update/drop/sort` | 4 个套餐（3 个在售），8 种价格 |
| 订单 | `/order/fetch` + `detail/assign/cancel/paid/update` | 6 单，覆盖待支付/开通中/已完成/已取消 |
| 优惠券 | `/coupon/fetch` + `generate/drop/update` | 5 张（金额/折扣/停用/过期） |
| 用户 | `/user/fetch` + `update/ban/destroy/resetSecret/sendMail/dumpCSV` | 6 个用户（管理员/员工/封禁/过期/长期） |
| 工单 | `/ticket/fetch`（POST 列表、`?id=` 详情）、`close`、`reply` | 5 张工单，详情 3 条消息 |
| 流量重置 | `/traffic-reset/logs`、`reset-user` | 5 条，含 old_traffic.formatted/upload/download |
| 主题 | `/theme/getThemes`、`getThemeConfig`、`saveThemeConfig`、`delete`、`upload` | 3 个主题，active=xboard，配置字段扁平对象 |
| 插件 | `/plugin/types`、`getPlugins`、`config`（GET 读 / POST 存）、`install/upgrade/uninstall/enable/disable/delete/upload` | 4 个插件、3 种类型、配置字段描述 |
| 礼品卡 | `/gift-card/templates`、`codes`、`usages`、`statistics`、`create/update/delete-template`、`generate-codes`、`toggle-code` | 4 模板 / 6 码 / 4 使用记录 / 7 天统计 |
| 兼容别名 | `/config/{notice,knowledge,payment,plugin,system,theme}`、`/server/{manage,group,machine,route}`、`/user/{manage,ticket}` | 旧客户端的无 action 路由，返回同类数据 |

完整注册表可运行时查看：`curl -s http://127.0.0.1:4318/__fixtures`（当前 131 条）。

---

## 5. 自检命令

```bash
curl -s http://127.0.0.1:4318/settings.js
curl -s http://127.0.0.1:4318/api/v2/admin/notice/fetch
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4318/orig/index.html
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4318/app/
curl -s http://127.0.0.1:4318/__fixtures | head
```

已实测（headless Chromium 156）：两个应用各 31 条 hash 路由均可打开，巡检期间 fixture **0 miss**。仪表盘、公告、支付、套餐、订单、优惠券、礼品卡、用户、工单、节点、服务器、权限组、路由、主题、插件等页面均能读到上表数据；唯一例外是原件 `/user/traffic-reset-logs` 落入自身错误边界（见 §6.1）。

---

## 6. 已知差异 / 限制

### 6.1 原件 `/user/traffic-reset-logs` 自身会崩（与 fixture 无关）

原件该页的“记录时间”列调用 `SS(created_at, "YYYY-MM-DD")`，而产物内置的 date-fns v3 会拒绝 `YYYY` token，只要有一行数据就抛出：

```
Use `yyyy` instead of `YYYY` ... RangeError
```

页面落入 `#/500` 错误边界，headless 实测正文为 “Use `yyyy` instead of `YYYY`…”。重建页正常渲染 5 行。
这不是 fixture 的问题（真实后端有数据同样会崩）。若只想比对表头/工具栏，可临时把 `TRAFFIC_LOGS` 的 `created_at` 置 `null`（原件 `SS(null)` 直接返回空串），或清空该数组。

### 6.2 写操作不落库

`config/save`、`notice/save|drop`、`plan/update`、`user/update`、`theme/saveThemeConfig`、`plugin/enable` 等一律返回成功，但内存数据不变；随后 react-query invalidate 重新拉取会看到原始 fixture。
因此不要用“保存后截图”验证表单提交结果；视觉回归只覆盖初始态与弹窗态。

### 6.3 过滤/排序不生效

列表端点只做分页切片，忽略 `filter`、`sort`（以及 gift-card 的 status/type 等 query）。在 UI 上操作筛选/排序后，表格内容不会变化。需要筛选态截图时，请扩展 `mock-api.mjs` 的对应 handler。

### 6.4 固定时间基准

所有时间戳固定在 2024-06-01 附近。影响：

- 设备最后心跳固定为“很久以前”，状态徽标稳定为 offline/never/inactive；
- 仪表盘日期选择器默认值仍按浏览器“今天”计算（两个应用一致），但返回的 `getOrder` 序列固定为 2024-06-01～06-07，`summary.start_date/end_date` 也是固定值；
- 流量榜的“今天/最近 7 天”只改变请求参数，返回同一组固定数据。

这样保证同一请求字节一致；跨天重跑不会漂移。

### 6.5 两套 token 格式

见 §2。视觉巡检务必用 seed 页，否则其中一个应用会停在登录页。

### 6.6 其他非 fixture 差异（来自重建工程本身，供比对时预期）

- `/config/system/APP` 原件大写、重建路由小写 `app`（React Router 默认大小写不敏感，两种写法都能进）。
- 原件顶栏显示 `v1.0.0`（来自 `/settings.js`），重建顶栏不显示版本号。
- 插件页原件是卡片网格、重建是表格；主题配置原件是逐字段表单、重建是 Monaco JSON；日期区间原件是双月日历、重建是原生 `<input type="date">`。详见 `scaffold/README.md` 的“已知偏离”。
- 重建的 Monaco 走 `@monaco-editor/react` 默认 CDN；离线环境下订阅模板/邮件模板/主题 JSON 编辑器可能停在加载态。本机实测可加载。

### 6.7 未覆盖端点及原因

- **动态插件 CRUD**：`/plugin/{code}/{resource}/fetch|save|delete` 未逐条注册。两个“插件示例”页（menu-demo / crud-demo）在原件与重建里都是纯本地状态，不发请求；真实第三方插件页面才需要，当前无 fixture 需求。
- **上传类**：`/theme/upload`、`/plugin/upload` 接收 multipart 但只返回成功，不解析文件、不改变列表；用于覆盖上传弹窗的提交路径。
- **真实筛选/排序/搜索**：见 §6.3。
- 其余任意未注册路径统一返回 `{"status":"fail"}` + `X-Fixture: miss`，服务端日志打印 `[mock-api] MISS …`，不会触发 401/403 跳登录。巡检后 `grep MISS` 即可发现遗漏。

---

## 7. 本次对重建工程的改动（最小化）

1. `scaffold/vite.config.ts`：只加了一行 `const base = process.env.BASE_URL || "/"`，并把 `base` 放进 `defineConfig`；其它 plugins/alias 原样保留。
2. `scaffold/index.html`：内联 `window.settings` 的 `secure_path` 从 `REPLACE_ME` 改为 `admin`、`version` 从 `""` 改为 `"1.0.0"`，与 `/settings.js` 对齐，使重建请求命中 `/api/v2/admin/**`。
3. 新增 `tools/` 下三个文件。

> 构建方式说明：`scaffold/package.json` 的 `build` 是 `tsc -b && vite build`，而 tsconfig 没有 `outDir/noEmit`，`tsc -b` 会把 71 个 `.js` 直接写进 `scaffold/src/`。为满足“不改 `src/**`”，`build-and-serve.mjs` 改用 `tsc --noEmit -p tsconfig.json` + `vite build`（等价校验与产物，但不落盘到 src）。如果手动执行 `npm run build`，请事后删除 `scaffold/src/**/*.js` 与 `scaffold/tsconfig.tsbuildinfo`。

未改动 `scaffold/src/**`，未改动 `/workspace/xboard/**`。

## 视觉回归基线

`bash tools/regress.sh` 会逐路由输出 `changed_pct`（不同像素占比）与 `mean_delta`（平均通道差）。
比对口径：1440×900、同一 fixture、同一登录态；阈值 = 单像素三通道累计差 > 24 记为不同。

注意：文字抗锯齿、图标字体渲染在不同渲染进程间有成百上千像素的固有抖动，**5% 以下通常意味着"结构一致、细节待调"**；
结构性差异（多一栏、少一条、错位 > 4px）会在差异图上以大块红色呈现，优先修这类。

## 视觉回归基线（31 条路由，1440×900）

平均不同像素 **9.08%**；最好 `/sign-in` 1.97%，最差 `/server/manage` 15.29%。

| 路由 | 不同像素 | 平均通道差 |
|---|---|---|
| `/sign-in` | 1.97% | 2.25 |
| `/plugins/traffic-analytics/overview` | 3.41% | 2.67 |
| `/server/group` | 6.19% | 3.77 |
| `/config/theme` | 6.51% | 3.51 |
| `/config/system/frontend` | 6.70% | 5.04 |
| `/config/system/safe` | 7.69% | 5.45 |
| `/user/traffic-reset-logs` | 8.01% | 6.14 |
| `/config/payment` | 8.14% | 4.74 |
| `/config/system/invite` | 8.15% | 5.61 |
| `/config/plugin/menu-demo` | 8.15% | 4.52 |
| `/config/system/app` | 8.22% | 5.23 |
| `/config/system/email` | 8.29% | 5.05 |
| `/config/notice` | 8.33% | 4.98 |
| `/config/system` | 8.37% | 5.41 |
| `/config/system/subscribe` | 8.47% | 5.75 |
| `/config/system/subscribe-template` | 8.87% | 4.58 |
| `/finance/gift-card` | 8.92% | 5.66 |
| `/user/ticket` | 8.92% | 6.55 |
| `/config/knowledge` | 8.99% | 4.91 |
| `/server/route` | 9.15% | 4.58 |
| `/config/system/telegram` | 9.28% | 6.99 |
| `/finance/order` | 9.72% | 5.72 |
| `/user/manage` | 9.78% | 5.76 |
| `/config/plugin` | 10.46% | 5.91 |
| `/config/system/server` | 11.63% | 6.17 |
| `/server/machine` | 11.98% | 6.62 |
| `/finance/coupon` | 12.04% | 7.05 |
| `/finance/plan` | 12.35% | 6.68 |
| `/` | 12.79% | 8.09 |
| `/config/plugin/crud-demo` | 14.56% | 13.02 |
| `/server/manage` | 15.29% | 8.39 |

已知主要差异来源（按影响排序）：
1. **表格工具栏**：重建版在 12 个 CRUD 页额外加了「刷新 / 筛选 / 列」按钮（原件工具栏只有 添加 / 搜索 / 排序）；
2. **分页条**：原件「已选择 N 项，共 M 项 / 每页显示 / 第 X 页，共 Y 页 / 4 个翻页按钮」，重建版为「共 N 条 / 第 X 页」+ 2 个按钮；
3. **页头垂直间距**：标题区比原件低 ~20px（`LayoutHeader` 的 children 区 padding）；
4. **图标字体**：侧边栏与头部图标取自 lucide，原件用另一套图标字形，字形轮廓差异会造成整列红色；
5. **仪表盘**：只还原了统计卡/图表骨架，8 张卡的排版与原件数值密度不同（12.79%）。

复现：`node tools/build-and-serve.mjs` → `bash tools/regress.sh`。

## 视觉回归基线 · 第 2 轮（工具栏/分页/页头/图标/仪表盘对齐后）

31 条路由，平均 **8.92%**，中位数 8.42%，最好 `/sign-in` 1.98%，最差 `/server/manage` 15.45%。

| 路由 | 不同像素 | 平均通道差 |
|---|---|---|
| `/sign-in` | 1.98% | 2.26 |
| `/plugins/traffic-analytics/overview` | 3.36% | 2.64 |
| `/server/group` | 6.10% | 3.71 |
| `/config/theme` | 6.52% | 3.49 |
| `/config/system/frontend` | 6.66% | 5.01 |
| `/` | 7.13% | 5.17 |
| `/config/system/safe` | 7.65% | 5.42 |
| `/config/system/invite` | 8.11% | 5.59 |
| `/config/plugin/menu-demo` | 8.11% | 4.50 |
| `/config/system/app` | 8.17% | 5.21 |
| `/config/payment` | 8.20% | 4.88 |
| `/user/traffic-reset-logs` | 8.21% | 6.24 |
| `/config/system/email` | 8.24% | 5.03 |
| `/config/notice` | 8.30% | 4.99 |
| `/config/system` | 8.33% | 5.38 |
| `/config/system/subscribe` | 8.42% | 5.72 |
| `/config/system/subscribe-template` | 8.83% | 4.56 |
| `/finance/gift-card` | 8.87% | 5.64 |
| `/user/ticket` | 8.88% | 6.53 |
| `/config/knowledge` | 9.04% | 4.99 |
| `/server/route` | 9.14% | 4.59 |
| `/config/system/telegram` | 9.23% | 6.97 |
| `/user/manage` | 9.78% | 5.88 |
| `/finance/order` | 10.51% | 6.31 |
| `/config/plugin` | 10.63% | 5.95 |
| `/config/system/server` | 11.59% | 6.09 |
| `/server/machine` | 11.87% | 6.78 |
| `/finance/coupon` | 12.19% | 7.27 |
| `/finance/plan` | 12.35% | 6.66 |
| `/config/plugin/crud-demo` | 14.56% | 13.02 |
| `/server/manage` | 15.45% | 8.57 |

本轮改动（均已落地并复测）：
1. **工具栏**：12 个 CRUD 页按原件逐页重排——删掉原件没有的「刷新 / 列」控件，补回原件有的 Faceted 过滤（type/machine/group_ids/status/period/commission_status 等）、批量操作菜单、导出 CSV、创建用户/发信对话框；共享件新增 `FacetedFilter`、`apiPostBlob`，移除 `ColumnsDropdown`/`RefreshButton`。
2. **分页**：`DataTablePagination` 按原件 `AGt` 重写——「已选择 N 项，共 M 项」+ 每页显示下拉（10/20/30/40/50/100/500，`h-8 w-[70px]`）+ 「第 [n] 页，共 N 页」输入框 + 四个翻页按钮（首尾仅 lg 显示）。
3. **页头间距**：`LayoutHeader` 拆成「工具条 64px + children 标题区 `pt-2`」，并新增 `inline` 变体（标题左、搜索右），仪表盘使用该变体。
4. **图标**：全站改用 `@tabler/icons-react`（原件即 Tabler），侧边栏 18 项逐一映射，头部语言按钮显示语言码、用户按钮改为圆形首字母头像。
5. **仪表盘**：改 inline 页头 + 卡片/收入概览/图表对齐，12.79% → 7.13%。

剩余差异主因（结构性项已消除，剩余以渲染细节为主）：
- 表格行高与列宽（单元格内两行文本的行距、`columnSizing` 与原件不完全一致）；
- 字体抗锯齿与 Tabler 图标的笔画粗细（1.5 vs 原件 1.5/2 混用）；
- 弹窗/抽屉类内容未进入截图基线（需交互后才能比对）。

## 视觉回归基线 · 第 3 轮（列宽/表头/对话框/配色契约）

31 条路由平均 **8.16%**（第 2 轮 8.92%，第 1 轮 9.08%），中位数 8.06%，最好 `/sign-in` 1.98%，最差 `/config/plugin/crud-demo` 13.76%。

| 路由 | 不同像素 |
|---|---|
| `/sign-in` | 1.98% |
| `/plugins/traffic-analytics/overview` | 3.01% |
| `/server/group` | 5.44% |
| `/` | 5.70% |
| `/config/theme` | 5.70% |
| `/config/system/frontend` | 6.32% |
| `/config/plugin/menu-demo` | 6.84% |
| `/config/system/safe` | 7.29% |
| `/config/notice` | 7.61% |
| `/config/payment` | 7.68% |
| `/config/system/invite` | 7.79% |
| `/config/system/app` | 7.80% |
| `/config/system/email` | 7.85% |
| `/server/route` | 7.86% |
| `/config/system` | 7.99% |
| `/config/system/subscribe` | 8.06% |
| `/config/knowledge` | 8.14% |
| `/user/traffic-reset-logs` | 8.17% |
| `/finance/gift-card` | 8.31% |
| `/user/manage` | 8.38% |
| `/finance/plan` | 8.48% |
| `/config/system/subscribe-template` | 8.49% |
| `/user/ticket` | 8.57% |
| `/config/system/telegram` | 8.85% |
| `/finance/order` | 10.44% |
| `/finance/coupon` | 10.74% |
| `/config/plugin` | 10.76% |
| `/config/system/server` | 11.19% |
| `/server/machine` | 11.20% |
| `/server/manage` | 12.46% |
| `/config/plugin/crud-demo` | 13.76% |

本轮关键修复：
1. **列宽真正生效**：`DataTable` 按原件补 `<th/td style={width:getSize()}>`、表头 `h-11 bg-card px-4`、行 `animate-fade-in`、固定列 sticky+分隔线 —— 此前各页 `size:` 是死数据。
2. **表头组件重写**（原件 `eQt`）：不可排序列改纯文本（不再渲染下拉/箭头）；可排序列用 ghost 按钮 + Tabler 三态图标；新增 `tooltip` 属性（ⓘ）。
3. **列集合/单元格**：server/manage 删自造 `drag-handle` 列、id 改单行徽标、name 去掉 host 第二行、host 列补端口与内部端口；machine 补概览统计条与 load/relation 单元格；coupon 列 `#`+有效期芯片；user/manage 恢复原件列可见性（不再多藏 3 列）。
4. **对话框**：notice/knowledge 改 `max-w-4xl` + `p-0` + 等宽字体头/体 + `rc-md-editor`（原件的 markdown 编辑器，400px）+ `TagInput` 芯片输入 —— notice 弹层 38.2% → **5.8%**。
5. **契约修正**：套餐价格键从 `month_price/...` 改为后端 `Plan::$periodMap` 的 `prices.{monthly,quarterly,half_yearly,yearly,two_yearly,three_yearly,onetime}`；fixture 同步 —— plan 页 12.35% → **8.48%**。
6. **壳层**：侧栏宽度回到原件 256px、页头标题区 `pt-6`（标题 y=88 与原件一致）。

弹层基线（`report-modals.tsv`）：notice 5.8% / knowledge 10.5% / plan 17.8% / coupon 30.5% / user 81.9%。
后三个仍是大表单弹窗（原件套餐弹窗 7.3KB、优惠券表单、创建用户抽屉 12.9KB），字段与提交语义一致但排版未逐字符对齐。

## 视觉回归基线 · 第 4 轮（服务器区二级页面 + 全局间距）

31 条路由平均 **7.63%**（第 3 轮 8.16%），中位数 7.85%，最好 `/sign-in` 1.98%，最差 `/config/plugin/crud-demo` 13.73%。

| 路由 | 不同像素 |
|---|---|
| `/sign-in` | 1.98% |
| `/plugins/traffic-analytics/overview` | 3.01% |
| `/server/group` | 4.84% |
| `/` | 5.70% |
| `/config/theme` | 5.70% |
| `/config/system/frontend` | 6.32% |
| `/server/route` | 6.33% |
| `/config/payment` | 6.50% |
| `/config/notice` | 6.53% |
| `/config/knowledge` | 6.63% |
| `/config/plugin/menu-demo` | 6.84% |
| `/config/system/safe` | 7.29% |
| `/user/manage` | 7.62% |
| `/config/system/invite` | 7.79% |
| `/config/system/app` | 7.80% |
| `/config/system/email` | 7.85% |
| `/finance/coupon` | 7.92% |
| `/config/system` | 7.99% |
| `/config/system/subscribe` | 8.06% |
| `/server/machine` | 8.12% |
| `/user/traffic-reset-logs` | 8.16% |
| `/finance/gift-card` | 8.31% |
| `/config/system/subscribe-template` | 8.49% |
| `/user/ticket` | 8.57% |
| `/finance/order` | 8.69% |
| `/config/system/telegram` | 8.85% |
| `/finance/plan` | 9.23% |
| `/server/manage` | 9.83% |
| `/config/plugin` | 10.76% |
| `/config/system/server` | 11.19% |
| `/config/plugin/crud-demo` | 13.73% |

**服务器区（本轮重点）**

| 页面 | 第 3 轮 | 本轮 |
|---|---|---|
| `/server/manage` | 12.46% | **9.83%** |
| `/server/machine` | 11.20% | **8.12%** |
| `/server/route` | 7.86% | **6.33%** |
| `/server/group` | 5.44% | **4.84%** |

| 二级页面（弹层/抽屉） | 差异 |
|---|---|
| 新建节点弹窗 | **2.41%**（第 3 轮 22.8%） |
| 服务器详情抽屉（`?machine_id=1`） | **2.35%** |
| 添加权限组弹窗 | 4.81% |
| 添加路由弹窗 | 6.97% |

本轮改动：
1. **节点弹窗 1:1**：30 个字段组全部落地（协议选择移到 header 右侧 + 协议徽标、动态倍率规则表、流量限制、自定义 ID、标签芯片、权限组/路由组多选、父级节点、绑定服务器、ⓘ tooltip、同步端口按钮、页脚"高级设置"入口），弹窗宽度 576px，提交体字段名与原件一致（`transfer_enable` GB→字节、`port/server_port` 为字符串）。
2. **服务器详情抽屉**：5 张卡（概览 + 负载趋势面积图 + 负载条 + Token + 安装命令 + 关联节点），`?machine_id=` 深链自动打开；Token 3 分钟自动隐藏、重置二次确认；安装命令复制；节点开关/解绑/关联。
3. **全局间距修正**：`LayoutBody` 新增 `dense`（顶部 12px），12 个"标题在 LayoutHeader"的列表页启用 —— 表格顶边从 y=225 回到 y=213（原件 212）。
4. **fixture/基建**：`server/machine/history` 改为负荷历史点（`recorded_at/cpu/mem/disk/net`，支持 `limit/range_hours`）；`machine/nodes` 修正 `machine_id` 取参与 `enabled` 字段；根入口补挂 `<Toaster richColors position="top-right"/>`（原件同款，此前所有 toast 被静默丢弃）。

## 视觉回归基线 · 第 5 轮（节点弹窗协议面板 + 高级设置）

**节点弹窗已完整**：空态 2.41%（全页）/ 0.10%（弹窗裁剪），11 种协议面板与「高级设置」四面板落地。

| 状态（弹窗裁剪 584×842，同一 protocol_settings 数据） | 差异 |
|---|---|
| 新建节点（未选协议占位态） | 0.10% |
| shadowsocks / vmess / trojan / hysteria / vless(TLS) / vless(reality) | 0.11% – 0.23% |
| tuic | 0.58% |
| 高级设置 · 多路复用 | 0.57% |
| 高级设置 · TLS | 31.1%（**原件 bug，故意不复刻**，见下） |

本轮实现：
1. **协议专属面板** 11 个：shadowsocks（cipher 可搜索 combobox + plugin 六选 + plugin_opts + client_fingerprint）、vmess（TLS/network/uTLS/ECH）、vless（TLS 三档 / reality 7 字段 / flow / encryption / network / uTLS / ECH）、trojan（uTLS+ECH 顶层常驻）、hysteria（v1/v2 / obfs / bandwidth / hop_interval / ECH）、tuic（version / congestion / alpn 多选 / udp_relay_mode / ECH）、anytls（padding_scheme）、http/naive（TLS 档）、mieru（transport / traffic_pattern 生成器）、socks（无专属字段）。
2. **高级设置**：Tabs = TLS / 多路复用 / 自定义 Outbounds / 自定义 Routes；`cert_mode` 五档（none/http-01/dns-01/self-signed/content）；多路复用 smux/yamux/h2mux + padding + brutal；Outbounds/Routes JSON 文本域带数组校验；**ECH 生成**走 `POST /server/manage/generateEchKey` 并写回 `protocol_settings.tls.ech`。
3. **提交体**：`protocol_settings`、`custom_outbounds`、`custom_routes` 整体随表单提交（拦截 XHR 核对通过）；X25519 密钥对生成用纯 TS 实现（RFC 7748 向量自测），未新增依赖。

已知差异：
1. **原件 TLS 面板是死代码**（`certPath:"cert_config"` 读节点表单顶层，而字段实际在 `protocol_settings.cert_config.*`，导致原件该 tab 永远显示空态、页脚 TLS 圆点永不出现）。我们按可用语义实现，因此该 tab 与原件差 31%——这是**有意偏离**；若要 bug 兼容，把 `AdvancedSettingsDialog` 的 `certPath` 置空即可。
2. `multiplex.enabled === 0` 时原件会把字面量 `0` 渲染进「高级设置」按钮（React falsy 数值怪癖），已照抄以保持像素一致。
3. 多选组件（权限组/路由组/ALPN）闭态已对齐，展开态是 Popover+复选行（原件为 cmdk 版）。

工具限制：`shot.mjs` 的文本点击无法驱动 Radix Select（需要真实指针序列），所以「选中协议后的弹窗」未纳入 `regress.sh` 的自动用例；协议面板数字来自 teammate 的 CDP 脚本（真实事件驱动，裁剪比对）。

## 视觉回归基线 · 第 6 轮（套餐 / 优惠券弹窗 1:1）

页面级 31 条路由平均 **7.63%**（与第 5 轮持平：本轮只动弹窗与全局 border 规则）；
**弹层 9 个用例全部进入 11% 以下**，两个大表单从「精简版」变为基本一致：

| 弹层 | 上一轮 | 本轮 |
|---|---|---|
| `/finance/plan` 添加套餐 | 18.03% | **2.09%** |
| `/finance/coupon` 添加优惠券 | 29.81% | **1.90%** |
| `/server/manage` 添加节点 | 2.41% | 2.41% |
| `/server/machine` 详情抽屉 | 2.35% | 2.35% |
| `/server/group` 添加权限组 | 4.81% | 4.81% |
| `/server/route` 添加路由 | 6.97% | 6.97% |
| `/user/manage` 创建用户 | 7.30% | 7.30% |
| `/config/notice` 添加公告 | 5.65% | 5.65% |
| `/config/knowledge` 添加知识 | 10.39% | 10.39% |

弹窗内裁剪比对（各自 teammate 自测）：套餐 **0.56%**、优惠券 **0.021%**（编辑态）/ 0.06–0.095%（新建态，含时间戳抖动）。

本轮实现：
1. **套餐弹窗**：外壳按原件 `XXt`（`max-w-xl`、`p-0`、头/体/脚三段的 `px-6 py-*`、页脚 `text-xs font-bold`）；字段 = 名称 / 标签（芯片）/ 权限组（含"添加分组"）/ 流量 GB / 速度 Mbps / 设备数 / 容量 / 重置策略六选 / **价格区**（基础价 + 8 周期 + 清空，基础价按 `base × months × discount` 写入全部周期）/ 说明（Markdown 编辑器 + 模板 + 预览）/ 编辑态 `force_update`；提交体 `prices.{monthly…reset_traffic}`。
2. **优惠券弹窗**：原件 `I6t`（6,345,594）外壳与字段 1:1 —— 名称（必填）/ 批量生成数 / 券码 / **类型+金额融合控件**（select + input + 单位块）/ **有效期 Popover**（快速预设 7/14/30/90/180/365 天 + 起止 datetime-local）/ 总次数 / 每用户次数 / 适用周期多选 / 适用套餐多选；提交体键名键序与原件逐字一致（拦截 XHR 核对）。
3. **全局 base 规则**：`globals.css` 补 `* { @apply border-border }`（此前裸 `border` 退回 Tailwind 预设 `#e5e7eb`，与 `hsl(var(--border))` 差 2/255），所有页面分隔线颜色统一。
4. 修正：`common.submit` 在原件对应弹窗里用的是 `common:confirm`（确认/Confirm/Подтвердить），优惠券页已改用该键对齐像素；页面级未受影响。

仍存在（弹层侧）：
- `/config/knowledge` 10.39%：与 notice 同构但正文编辑器高度与字段分组未逐项对齐；
- `/user/manage` 创建用户 7.30%：日期用原生 `input[type=date]`、模板插入按钮缺失；
- `/server/route` 6.97%：配色与内距；
- 套餐「添加分组」是极简弹窗（原件复用服务器分组编辑弹窗的全部字段）。

## 视觉回归基线 · 第 7 轮（弹层收尾：全部 ≤ 4.81%）

**弹层 9 个用例平均 2.25%**，最差 4.81%；页面级 31 路由平均 7.63%（页面已收敛，剩余为壳层与渲染抗锯齿）。

| 弹层 | 第 6 轮 | 本轮 |
|---|---|---|
| `/config/notice` 添加公告 | 5.65% | **1.42%** |
| `/config/knowledge` 添加知识 | 10.39% | **1.42%** |
| `/server/route` 添加路由 | 6.97% | **1.59%** |
| `/finance/coupon` 添加优惠券 | 1.90% | 1.90% |
| `/finance/plan` 添加套餐 | 2.09% | 2.09% |
| `/user/manage` 创建用户 | 7.30% | **2.22%** |
| `/server/machine` 详情抽屉 | 2.35% | 2.35% |
| `/server/manage` 添加节点 | 2.41% | 2.41% |
| `/server/group` 添加权限组 | 4.81% | 4.81% |

弹层内残余（teammate 裁剪实测）：公告/知识各 67–105 px、创建用户 90 px、套餐 0.56%、优惠券 0.021%、权限组 0.04% —— **全部是 lucide 图标字形差**（脚手架 `lucide-react@0.468` 与原件旧版路径不同）。

本轮改动：
1. **共用表单外壳** `src/pages/config/form-dialog.tsx`（复刻原件 `U2t`/`X2t` 的内联 Dialog 组合：`max-w-4xl p-0 sm:rounded-2xl`、头/体/脚三段、`font-mono` 标题与字段标签、页脚 `h-8 px-8 font-mono text-xs font-bold`），公告与知识两页改为共用。
2. **知识弹窗 1:1**：字段顺序纠正为 标题/分类（纯文本 Input，不是 select）/语言（7 项固定顺序 Select）/显示（Switch）/内容（400px Markdown 编辑器）；提交体 `{id,language,category,title,body,show}`；编辑态先 `GET /knowledge/fetch?id=` 取正文再回填。
3. **公告弹窗**：挂到共用外壳，修掉 4 处偏差（`space-y-1→2`、标签补 `font-medium`、页脚按钮尺寸、显示项独立成行）。
4. **创建用户弹窗**：邮箱复合控件（前缀/`@` 块/后缀）、密码、**Popover + Calendar 到期时间**（组件层新增 `calendar.tsx`/`date-range-picker.tsx`，react-day-picker v8）、订阅计划、生成数量、导出 CSV；另补齐「发送邮件」弹层的作用域选择、占位符说明、系统通知模板按钮。
5. **优惠券有效期**补双月范围日历（`mode="range" numberOfMonths={2}` + 快速预设 7/14/30/90/180/365 天 + 起止时间输入）。
6. **路由弹窗**：动作徽标四色与条件字段（DNS/转发标签）对齐，6.97% → 1.59%。
7. **套餐「添加分组」**改用与 `/server/group` 相同的 `GroupDialog`（`c4t` 1:1，弹层 0.04%）。

已知残留：
- 图标字形（lucide 版本差）是弹层内唯一可见差异；
- 页面级 7.63% 的地板来自：侧栏导航项 + 头部控件（跨页共有）+ 字体抗锯齿；
- `/config/plugin/crud-demo` 13.82% 为插件示例页（纯本地演示，优先级最低）。

## 视觉回归基线 · 第 8 轮（图标版本对齐）

**结论：原件的 lucide 版本确定为 `lucide-react@0.400.0`** —— 从产物里解析出 73 个内联图标定义（`aat("Name",[[...]])`），与候选版本逐个比对 SVG `path.d`：

| 版本 | 路径完全一致 | 不一致 | 缺失 |
|---|---|---|---|
| 0.294.0 | 47 | 11 | 15 |
| 0.344.0 | 56 | 3 | 14 |
| 0.378.0 | 67 | 1 | 5 |
| 0.390.0 | 67 | 1 | 5 |
| **0.395.0 / 0.400.0 / 0.405.0** | **68** | **0** | 5（均为已废弃别名：BarChart3/Layers3/Link2/Settings2/Trash2，实际指向同名 canonical 图标，比对后亦完全一致） |
| 0.410.0+ | 66 | 2 | 5 |
| 0.427.0 | 65 | 3 | 5 |
| 0.468.0（原依赖） | 61 | 7 | 5 |

已把工程依赖降级为 `lucide-react@0.400.0`（`npx tsc --noEmit` 0 错误）。

**效果（弹层）**：平均 **2.25% → 2.03%**，最大 **4.81% → 2.91%**（权限组弹窗），其余不变或微降：

| 弹层 | 上轮 | 本轮 |
|---|---|---|
| `/server/group` 添加权限组 | 4.81% | **2.91%** |
| `/server/manage` 添加节点 | 2.41% | 2.41% |
| `/server/machine` 详情抽屉 | 2.35% | 2.35% |
| `/user/manage` 创建用户 | 2.22% | 2.22% |
| `/finance/plan` 添加套餐 | 2.09% | 2.09% |
| `/finance/coupon` 添加优惠券 | 1.90% | 1.89% |
| `/server/route` 添加路由 | 1.59% | 1.59% |
| `/config/notice` / `/config/knowledge` | 1.42% | 1.42% |

页面级平均保持 **7.63%**：页面里剩下的图标主要是侧边栏的 Tabler 图标（已与原件同源），所以本轮对页面数字没有可见影响；页面地板由壳层排版与文字抗锯齿构成。

## 视觉回归基线 · 第 9 轮（壳层排版 + 设置页堆叠布局）

**页面平均 7.63% → 4.51%**（中位数 4.67%，最好 0.79%，最差 11.37%）
**弹层平均 2.03% → 0.77%**（最大 1.20%）

| 指标 | 第 8 轮 | 本轮 |
|---|---|---|
| 页面平均 | 7.63% | **4.51%** |
| 页面中位数 | 7.85% | **4.67%** |
| 页面最好 | 1.98% | **0.79%**（仪表盘） |
| 页面最差 | 13.80% | **11.37%**（插件示例页） |
| 弹层平均 | 2.03% | **0.77%** |
| 弹层最大 | 2.91% | **1.20%** |

本轮两处改动（都在壳层与一个设置页）：

### 1. 侧边栏按原件重写（`components/layout/app-shell.tsx`）
用 CDP 量 `getBoundingClientRect` 对齐到像素：
- 一级项：`text-xs h-12 rounded-none px-6`、图标 18px 包 `<div class="mr-2">`（原来 13px/32px 高/圆角/px-2）；
- 分组：折叠按钮 `h-12 w-full px-6` + 右侧 chevron 24px/stroke-1（展开时 `-rotate-180`）；
- 二级项：`h-10 w-full border-l border-l-slate-500 px-2`，外层 `<li class="my-1 ml-8">`；
- 头部：`h-[var(--header-height)] p-4 px-4 py-3 shadow sticky top-0`，logo 为 32px 描边图标；
- nav 容器 `grid gap-1`，`py-2`。
量测结果：`link0 (0,72,254×48, 12px/500, pad 0 24px)`、`link1 (32,176,222×40, pad 0 8px)` 与原件**完全一致**。

### 2. 页头去掉多余的底边框（`components/layout/layout.tsx`）
原件 `tot` 无 border，我们的 `LayoutHeader` 之前加了 `border-b`；同时内距改为原件的 `p-4 md:px-8`。

### 3. `/config/system/server` 改为原件的堆叠字段布局
原件该页是「标签(16px) 在上 / 控件整行 / 说明(text-sm muted) 在下」，行距约 111px；我们此前用的是两列 `Field`（标签左、控件右 360px）。
调整后该页 **11.19% → 5.98%**。

### 4. 其余页面普涨（壳层改动是全局的）
例：`/` 5.70→0.79、`/config/notice` 6.53→1.75、`/server/route` 6.32→1.75、`/server/manage` 9.83→5.66、`/finance/coupon` 7.92→2.86、`/config/theme` 5.70→2.87。

### 剩余最大项
- `/config/plugin/crud-demo` 11.37% 与 `/config/plugin` 10.46%：插件页（卡片网格 / 插件配置抽屉，重写幅度最大）；
- 一批 5–6.4% 的设置页与财务页：字段密度与图标细节；
- 弹层已全部 ≤ 1.20%，只剩图标字形与动态时间戳。

新增工具：`tools/measure.mjs`（CDP 执行任意 JS，用于量 `getBoundingClientRect`/computed style，本轮壳层对齐就靠它）。
