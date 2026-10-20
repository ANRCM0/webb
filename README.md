# xboard-admin-rebuild

对 **Xboard**（`github.com/cedar2025/Xboard`，MIT）**已发布镜像内后台管理前端**的逆向重建：
从构建产物（Vite 单 chunk，未混淆）恢复路由、i18n、API 契约、组件结构与样式，并重写为可编译、可运行的
React 18 + TypeScript 工程；配套一套「原件 vs 重建」的逐像素视觉回归工具。

> 本仓库只含**重建代码、逆向脚本、证据与工具**，不包含上游源码，也不包含镜像层二进制。

## 目录

| 路径 | 内容 |
|---|---|
| `xboard-admin-rebuild/scaffold/` | 重建工程（29 个页面，`tsc --noEmit` 0 错误，`vite build` 通过） |
| `xboard-admin-rebuild/pages/` | 33 份逐页反解蓝图（组件链 + 去最小化源码 + 同模块 schema/列工厂） |
| `xboard-admin-rebuild/meta/` | 路由表、端点表（88 条）、组件图、页面索引 |
| `xboard-admin-rebuild/locales/` | 从产物逐字节还原的 3 语言 × 23 命名空间语料 |
| `xboard-admin-rebuild/tools/` | 视觉回归基建：`mock-api.mjs`（131 条 fixture）、`build-and-serve.mjs`、`regress.sh`、`pngdiff.py`、`shot.mjs`、`measure.mjs`、`oci-pull.sh` |
| `xboard-admin-rebuild/analysis/` | 逆向脚本（路由重建、组件图、页面蓝图生成、端点表生成） |
| `xboard-admin-rebuild/artifacts/manifest.json` | 溯源：镜像/层/bundle 的 sha256 与基线数字 |

## 溯源（可复核）

- 镜像 `ghcr.io/cedar2025/xboard:latest`，index `sha256:896e4926…`，amd64 manifest `sha256:3a432c8e…`
- 前端位于镜像层 `sha256:999bf9b3…` 的 `/www/public/assets/admin`，与上游子模块 `xboard-admin-dist@ef5f43d` **逐文件 sha256 相同**
- 入口 bundle `index-CEIYH7i8.js` sha256 `f04f09a9…bcd77`（6,534,570 B），CSS `index-DiYa-_z_.css` sha256 `d9f2c763…`
- 复原的依赖版本：React **18.3.1**、react-router **6.30.2**、Monaco **0.55.1**、lucide-react **0.400.0**、Tailwind **3.4.x**

## 复现

```bash
# 1) 拉取并解包镜像里的前端（无需 docker daemon）
./xboard-admin-rebuild/tools/oci-pull.sh ghcr.io/cedar2025/xboard:latest --platform linux/amd64 --out images/xboard

# 2) 重建工程
cd xboard-admin-rebuild/scaffold && npm install && npm run typecheck && npm run build

# 3) 视觉回归（同端口同时托管原件与重建 + 同一套确定性 fixture）
cd .. && node tools/build-and-serve.mjs     # http://127.0.0.1:4318/orig/index.html 与 /app/
bash tools/regress.sh                        # 31 路由 + 9 个弹层，输出 /tmp/shots/report.tsv
```

## 当前保真度（1440×900，同一 fixture）

| 维度 | 结果 |
|---|---|
| 页面（31 路由） | 平均 **3.57%** 不同像素，最好 0.79%，最差 11.35%（crud 演示页，随机演示数据所致） |
| 弹层（9 用例） | 平均 **0.77%**，最大 1.20% |

口径：单像素三通道累计差 > 24 记为「不同」；比对脚本 `tools/pngdiff.py`（纯标准库 PNG 解码）。

## 未完成项

尚未复刻/未验证的内容集中在插件页与验证维度，详见 [xboard-admin-rebuild/REPORT-REMAINING.md](xboard-admin-rebuild/REPORT-REMAINING.md)。

## 说明与边界

- 上游为 MIT 许可；本仓库的重建代码在同等条件下可用。
- `tools/` 中的 fixture 全部是**确定性假数据**，不含任何真实站点、用户或凭据。
- 未纳入本仓库：镜像层二进制、`node_modules`、构建产物、运行期截图（体积原因）。
