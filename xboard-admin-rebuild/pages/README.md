# Xboard 管理前端 - 33 个路由组件的逐页反解索引

> 每个路由对应 `pages/<slug>.md`：页面组件链 + 页面专属组件源码（去最小化）+ 同模块 schema/列工厂上下文。

| 路由 | 组件 | 命名空间 | 专属组件 | 关键能力 | hooks | API 辅助函数 |
|---|---|---|---|---|---|---|
| `/sign-in` | `Jst` | auth | 4 | — | st0/ef0 | — |
| `/` | `$Gt` | — | 4 | Columns,Query | st9/ef0 | AL→/stat/getOrder |
| `/` | `$Gt` | — | 4 | Columns,Query | st9/ef0 | AL→/stat/getOrder |
| `/config/system` | `GGt` | settings | 3 | — | st0/ef0 | — |
| `/config/system/` | `dZt` | settings | 2 | Query | st1/ef3 | RD→/plan/fetch |
| `/config/system/safe` | `pZt` | settings | 2 | Query | st2/ef3 | — |
| `/config/system/subscribe` | `vZt` | settings | 2 | Query | st1/ef3 | — |
| `/config/system/invite` | `wZt` | settings | 2 | Query | st2/ef3 | — |
| `/config/system/frontend` | `NZt` | — | 2 | Query | st0/ef1 | — |
| `/config/system/server` | `IZt` | settings | 2 | Query | st1/ef3 | — |
| `/config/system/email` | `xYt` | settings | 4 | Editor,Invalidate,Query | st12/ef5 | — |
| `/config/system/telegram` | `kYt` | settings | 2 | Query | st1/ef3 | — |
| `/config/system/APP` | `DYt` | settings | 2 | Query | st1/ef3 | — |
| `/config/system/subscribe-template` | `WQe` | settings | 2 | Query | st2/ef2 | — |
| `/config/payment` | `_Qt` | payment | 1 | Columns,DragSort,Query | st6/ef2 | _D→/payment/sort, uD→/payment/fetch |
| `/config/plugin` | `g1t` | plugin | 4 | — | st0/ef0 | — |
| `/config/plugin/menu-demo` | `f1t` | plugin | 4 | — | st0/ef0 | — |
| `/config/plugin/crud-demo` | `C1t` | — | 4 | — | st0/ef0 | — |
| `/config/theme` | `E1t` | theme | 4 | — | st0/ef0 | — |
| `/config/notice` | `G2t` | notice | 1 | Columns,DragSort,Query | st8/ef2 | — |
| `/config/knowledge` | `n4t` | knowledge | 1 | Columns,DragSort,Query | st6/ef2 | TD→/knowledge/sort, kD→/knowledge/fetch |
| `/plugins/:pluginCode/*` | `r4t` | plugin | 4 | — | st0/ef0 | — |
| `/server/manage` | `J5t` | server | 1 | Columns,DragSort,Query | st9/ef4 | DT→/server/machine/fetch, QL→/server/manage/sort, iD→/server/group/fetch |
| `/server/machine` | `B3t` | machine | 1 | Columns,Query | st6/ef1 | DT→/server/machine/fetch |
| `/server/group` | `U3t` | group | 1 | Columns,Query | st4/ef0 | iD→/server/group/fetch |
| `/server/route` | `Y3t` | route | 1 | Columns | st0/ef0 | — |
| `/finance/plan` | `d6t` | subscribe | 1 | Columns,DragSort,Query | st7/ef2 | PD→/plan/sort, RD→/plan/fetch |
| `/finance/order` | `L6t` | order | 1 | Columns,Query | st5/ef1 | FD→/order/fetch |
| `/finance/coupon` | `B6t` | coupon | 1 | Columns,Query | st5/ef0 | tT→/coupon/fetch |
| `/finance/gift-card` | `s8t` | giftCard | 4 | Columns,Query | st13/ef0 | JD→/gift-card/statistics, QD→/gift-card/usages, ZD→/gift-card/codes |
| `/user/manage` | `Y8t` | user | 1 | Query | st7/ef2 | RD→/plan/fetch, iD→/server/group/fetch |
| `/user/ticket` | `x9t` | ticket | 3 | Columns,Invalidate,Query | st10/ef2 | RD→/plan/fetch, bT→/ticket/fetch, wT→/ticket/close |
| `/user/traffic-reset-logs` | `N9t` | user | 1 | Query | st5/ef0 | — |

## 反解方法与可复现性

1. 路由数组（bundle offset 4,400,613）解析 `path -> lazy 模块引用`；
2. 模块引用 -> `Object.freeze(Object.defineProperty({default:function(){...}}))` 组件体；
3. 递归展开 `jsx/jsxs` 子组件，按跨页频次划分"外壳组件"与"页面专属组件"；
4. 页面专属组件去最小化打印，并回溯其 API 辅助函数（`VAR+"<endpoint>"` 形态）。
