# 未完成项报告（Gap Report）

> 生成时间：2025-10-20 · 基线：31 条路由 + 9 个弹层，1440×900，口径「单像素三通道累计差 > 24 记为不同」
> 相关：[README](../README.md) · [视觉回归基线](tools/README.md) · [逐页蓝图](pages/README.md)

## 0. 一句话结论

功能与结构层面的复刻已经完成（29 个路由、9 个二级弹层/抽屉全部落地，`tsc --noEmit` 0 错误、`vite build` 通过）；
**剩下的问题分四类**：① 两个插件页的结构性重建（10–11%）；② 一批 5–6.4% 页面的排版细节；
③ 完全没有做的验证维度（真实后端、暗色、响应式、e2e、i18n 覆盖）；④ 工装与 fixture 的已知限制。

---

## 1. 页面保真度现状（未完成 = 5% 以上）

| 路由 | 不同像素 | 状态 |
|---|---|---|
| `/` 仪表盘 | 0.79% | ✅ |
| `/plugins/:code/*` 插件页 | 1.00% | ✅（占位页，与原件同语义） |
| `/server/group` · `/config/notice` · `/config/payment` · `/server/route` · `/config/knowledge` · `/sign-in` | 1.7–2.0% | ✅ |
| `/finance/coupon` · `/config/theme` · `/server/machine` · `/config/system/frontend` · `/user/manage` · `/finance/order` | 2.9–3.8% | ✅ |
| `/config/plugin/menu-demo` · `/config/system/safe` | 4.4–4.7% | ✅ |
| `/config/system/app` 5.17% · `email` 5.20% · `invite` 5.27% · `system` 5.42% · `subscribe` 5.43% | 5.2–5.4% | ⚠️ 排版细节 |
| `/server/manage` 5.66% · `/config/system/server` 5.98% · `subscribe-template` 6.01% | 5.7–6.0% | ⚠️ 排版细节 |
| `/finance/plan` 6.08% · `/config/system/telegram` 6.23% · `/finance/gift-card` 6.31% | 6.1–6.3% | ⚠️ 排版细节 |
| `/user/traffic-reset-logs` 6.36% · `/user/ticket` 6.38% | 6.4% | ⚠️ 排版细节 |
| **`/config/plugin` 10.46%** | 10.46% | ❌ 结构性差异（见 §2.1） |
| **`/config/plugin/crud-demo` 11.37%** | 11.37% | ❌ 结构性差异（见 §2.2） |

弹层全部达标（0.42%–1.20%），不在此列。

---

## 2. 未完成的功能/结构项

### 2.1 `/config/plugin` 插件管理页（10.46%）—— 结构性差异
- **原件是卡片网格**（`u1t`：每插件一张卡，含图标头、版本、作者、状态徽标、操作按钮组），我们做成了**表格 + 设置抽屉**。
- 未还原的交互：卡片的"升级/回滚"视觉分组、按类型分段（feature/theme/gateway）、卡片内联开关样式。
- 端点已全部接通（`/plugin/types|getPlugins|config|install|uninstall|enable|disable|upgrade|delete|upload`），**差的只是视觉结构**。

### 2.2 `/config/plugin/crud-demo` 插件 CRUD 示例页（11.37%）
- 原件是插件作者用的**示例表单 + 表格**组合，字段类型更全（switch/select/多行文本/文件），我们只做了基础表格。
- 属于演示页，业务优先级最低，但它是当前最差的一项。

### 2.3 动态插件 CRUD 路由未实现
- `/plugins/:pluginCode/:resource/*` 分支（原件由插件 `admin_crud` schema 驱动动态表单）**仅有占位**（源码里已注明 `当前版本未实现，占位`）。
- 原件本身对该分支也是占位（"Custom rendering will be available in a future version"），因此**与原件行为一致**，但若插件生态使用该能力则不可用。

### 2.4 已知未做的交互细节
- 列表页的 hover/focus/active 态未逐一比对（截图只取默认态）；
- 排序模式下的拖拽动画、toast 的出现/消失动画未比对；
- 移动端（<768px）布局完全没做对照——壳层侧栏抽屉、表格转卡片（`mobilePrimaryField`）虽已实现，但未验证；
- 键盘可达性（Tab 顺序、焦点环）未验证。

---

## 3. 验证维度缺口（一项都没做）

| 维度 | 现状 | 影响 |
|---|---|---|
| **真实后端联调** | 全程用 `tools/mock-api.mjs` 的 131 条确定性 fixture | 写入类接口、错误码分支、鉴权过期路径都未跑过真后端 |
| **端到端流程** | 无 | 登录 → 列表 → 表单提交 → 列表刷新这条链路没有自动化 |
| **单元/组件测试** | 无（无 vitest/jest 配置） | 重构易回归 |
| **i18n 覆盖率** | 仅对照了 zh-CN 的键 | en-US / ru-RU 缺键、长文案溢出未验证 |
| **暗色主题** | 未比对（regress 只跑浅色） | `.dark` 变量已还原，但页面级暗色渲染未截图 |
| **响应式** | 未比对 | 见 §2.4 |
| **无障碍/语义** | 未检查 | role/aria 大量照抄原件，但未用工具审计 |
| **性能** | 未测 | 首屏、图表渲染、大列表分页性能均无基线 |
| **构建产物一致性** | 未比对 | 我们产出 1.98 MB JS（原件 6.53 MB，见 §5.3） |

---

## 4. 工装（tools/）的已知限制

1. **`shot.mjs` 无法驱动 Radix 下拉/菜单**：只用 `element.click()`，Radix 监听 `pointerdown`，因此"选中协议后的节点弹窗""操作菜单类弹层"未能进入自动化用例（协议面板数字来自 teammate 的临时 CDP 脚本）。
   修法：改用 CDP `Input.dispatchMouseEvent` 发真实指针序列。
2. **fixture 的写操作是 no-op**：`/save`、`/drop`、`/update` 一律返回成功但不落库，所以"提交后列表变化"无法比对。
3. **筛选/排序参数被忽略**：只做分页切片，筛选态截图拿不到筛选后的数据。
4. **上传端点不解析 multipart**：`theme/upload`、`plugin/upload` 只返回成功。
5. **动态时间戳**：`默认有效期 = now + 7 天` 之类会导致每次运行有若干像素差（已在报告里单独剔除统计）。
6. **弹层用例只有 9 个**：其余弹层（插件配置抽屉、主题上传、批量操作确认框、机器关联节点等）未纳入自动回归。

---

## 5. 有意偏离（不是缺陷，但需要知道）

| 项 | 原件行为 | 我们的行为 | 理由 |
|---|---|---|---|
| **TLS 证书面板** | 死代码：`certPath:"cert_config"` 读节点表单顶层，字段实际在 `protocol_settings.cert_config.*` → 永远显示空态 | 按可用语义实现（读写 `protocol_settings.cert_config.*`） | 复刻 bug 会让功能不可用 |
| **`multiplex.enabled === 0`** | React falsy 数值把 `0` 渲染进「高级设置」按钮 | 照抄（保持像素一致） | 视觉一致优先 |
| **提交按钮文案** | `common.submit` 在原件弹窗里渲染成「确认」 | 相关弹窗改用 `common:confirm` 对齐 | 文案像素一致 |
| **套餐「添加分组」** | 复用分组编辑弹窗（现已是 1:1 共用件） | 同 | — |
| **Monaco 资源** | 产物内同时有本地 worker 与 jsDelivr loader 路径 | 用 `@monaco-editor/react` 默认 CDN loader | 离线部署需 `loader.config({ monaco })` + Vite worker |
| **TLS/图标字形** | 原件图标为 tabler + lucide 0.400.0 | 已对齐（lucide 降级到 0.400.0） | 已消除 |

---

## 6. 建议的收尾顺序（按性价比）

| 优先级 | 任务 | 预计收益 | 工作量 |
|---|---|---|---|
| P0 | `/config/plugin` 改回卡片网格 | 10.46% → ~3%（+1 个结构性缺口清零） | 0.5–1 天 |
| P0 | 真实后端联调（起容器 + 登录/CRUD 冒烟） | 覆盖 §3 的前两行 | 0.5 天 |
| P1 | `crud-demo` 补字段类型示例 | 11.37% → ~4% | 0.5 天 |
| P1 | 5–6.4% 的 11 个页面做一轮排版精修（字段密度/图标/间距） | ~1.5–2 个百分点的整体下移 | 1–2 天 |
| P2 | 暗色主题 + 响应式比对（regress 增加 `--theme dark`、`--width 390`） | 覆盖 §3 两行 | 0.5 天 |
| P2 | `shot.mjs` 改用 CDP 真实指针事件，扩充弹层用例 | 覆盖 §4.1、§4.6 | 0.5 天 |
| P3 | i18n 覆盖检查、无障碍审计、性能基线、单元测试 | 工程质量 | 1–2 天 |

> 说明：本报告只列出**未完成/未验证**的部分；已完成项的清单见根目录 `README.md`，逐页证据见 `pages/`，逐轮基线演进见 `tools/README.md` 的「视觉回归基线」各节。
