# Xboard 管理前端复刻 —— 离线部署说明

本工程的可交付形态是 `dist/`（Vite 构建产物），**没有任何 CDN / 外网依赖**
（Monaco 语言贡献与 editor / json / html / css worker 均本地打包，字体以 codicon 随包交付）。

## 1. 构建

```bash
cd reconstruction/scaffold
npm install          # 仅安装时用一次
npm run typecheck    # tsc --noEmit（0 error）
npm run build        # 产出 dist/（BASE_URL=/ 根路径部署）
```

若部署在子路径（例如 Nginx `location /admin/`），用：

```bash
BASE_URL=/admin/ npm run build
```

## 2. 后端要求

前端通过 `window.settings` 读取后端地址与安全路径，该对象由后端注入：

```html
<script>window.settings = { base_url:"/", title:"Xboard", version:"1.0.0", logo:"", secure_path:"admin" };</script>
```

- `secure_path` 必须与后端 `admin_setting('secure_path')`（默认 `crc32b(app.key)` 十六进制串）一致，
  否则所有 `/api/v2/{secure_path}/**` 请求 404。
- API 前缀 = `window.settings.base_url + "api/v2/" + secure_path`；
  登录接口 `POST /passport/auth/login` 返回 `auth_data`，前端写入
  `localStorage["Xboard_access_token"]`，axios 拦截器以此携带 `Authorization` 与 `Content-Language`。

## 3. 托管方式

### Nginx（推荐）

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /var/www/xboard-admin/dist;
    index index.html;

    # SPA 哈希路由：仅回退首页（#/ 路由不经过服务器）
    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:7001;   # 你的 Xboard 后端
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

> 重定向 admin 面板的 `secure_path` 后需重启后端（README 备注还要重启 Octane）。

### 静态服务（任意 HTTP 服务器）

把 `dist/` 目录整目录发布即可；无需 Node 运行时。入口 `index.html`
仅引用相对 `./assets/` 或由 `BASE_URL` 决定的资源前缀。

## 4. 打包产物清单

| 产物 | 说明 |
| --- | --- |
| `index-*.js` | 应用主包（首屏入口，≈2MB / gzip 591KB） |
| `monaco-vs-*.js` | Monaco 编辑器核心（懒加载，仅打开编辑器页面才下载，≈4MB / gzip 1.05MB） |
| `monaco-json-*.js` / `monaco-langs-*.js` | JSON 语言贡献 + yaml/ini/html 语言注册（懒加载） |
| `editor.worker-*.js` / `json.worker-*.js` / `html.worker-*.js` / `css.worker-*.js` | Monaco 本地 worker（Vite `?worker`） |
| `index-*.css` / `monaco-vs-*.css` / `react-vendor-*.css` | 样式 |
| `codicon-*.ttf` | Monaco 图标字体 |

## 5. 常见问题

- **`window.settings` 未定义**：入口页未注入 `window.settings`，检查后端模板/反向代理是否改写 `index.html`。
- **API 404**：`secure_path` 不匹配（默认值为 `crc32b(app.key)` 十六进制）；另一个可能：登录接口返回值结构不同，
  见 `src/lib/http.ts` 的 `auth_data` 解析。
- **首次打开订阅/邮件/主题配置页稍慢**：属预期，Monaco 核心在首次使用时按需加载。
- **离线环境无法打开编辑器**：确认 `dist/assets/` 下存在 `monaco-vs-*` 与三个 `*.worker-*` 拆分；不允许再回退到 CDN。
