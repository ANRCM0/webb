#!/usr/bin/env node
/**
 * Xboard visual-regression fixture server.
 *
 * One process, one port (4318), three jobs:
 *   1. /settings.js + /settings.local.js  → the two globals the shipped SPA expects
 *   2. /api/v2/**                        → deterministic fixtures (no clock, no randomness)
 *   3. /orig/** and /app/**              → static hosting for the original dist and the rebuild
 *
 * Node built-ins only. No network access, no writes to either app tree.
 */
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIG_ROOT = path.resolve(HERE, "../../xboard/public/assets/admin");
const APP_ROOT = path.resolve(HERE, "../scaffold/dist");
const PORT = Number(process.env.PORT || 4318);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_HOST = process.env.PUBLIC_HOST || "127.0.0.1";

/* ------------------------------------------------------------------ *
 * Deterministic fixture data
 * ------------------------------------------------------------------ */

/** 2024-06-01T00:00:00Z — every timestamp below is derived from this fixed anchor. */
const T0 = 1717200000;
const HOUR = 3600;
const GB = 1024 ** 3;

const MAIL_TEMPLATES = [
  {
    name: "welcome",
    label: "欢迎邮件",
    customized: true,
    subject: "欢迎加入 Xboard",
    required_vars: ["name", "url"],
    optional_vars: ["code"],
    content:
      "<p>你好 {{name}}，</p>\n<p>欢迎加入 Xboard，请点击下面的链接完成登录：</p>\n<p><a href=\"{{url}}\">{{url}}</a></p>\n<p>如果这不是你本人的操作，请忽略本邮件。</p>",
  },
  {
    name: "verify",
    label: "邮箱验证",
    customized: true,
    subject: "请验证你的邮箱",
    required_vars: ["code"],
    optional_vars: [],
    content: "<p>你的验证码是 <strong>{{code}}</strong>，10 分钟内有效。</p>",
  },
  {
    name: "notify",
    label: "站内通知",
    customized: false,
    subject: "{{subject}}",
    required_vars: ["subject", "content"],
    optional_vars: [],
    content: "<p>{{content}}</p>",
  },
  {
    name: "remind_expire",
    label: "到期提醒",
    customized: false,
    subject: "你的订阅即将到期",
    required_vars: ["name", "expire_at"],
    optional_vars: ["url"],
    content: "<p>你好 {{name}}，你的订阅将于 {{expire_at}} 到期。</p>",
  },
];

const CONFIG_SECTIONS = {
  site: {
    logo: "",
    force_https: 1,
    stop_register: 0,
    ticket_must_wait_reply: 0,
    app_name: "Xboard",
    app_description: "Xboard 管理后台演示站点",
    app_url: "https://demo.xboard.test",
    subscribe_url: "https://demo.xboard.test/api/v1/client/subscribe",
    try_out_plan_id: 2,
    try_out_hour: 24,
    tos_url: "https://demo.xboard.test/tos",
    currency: "CNY",
    currency_symbol: "¥",
  },
  safe: {
    email_verify: 1,
    safe_mode_enable: 1,
    secure_path: "admin",
    email_whitelist_enable: 1,
    email_whitelist_suffix: ["gmail.com", "outlook.com", "qq.com"],
    email_gmail_limit_enable: 0,
    captcha_enable: 0,
    captcha_type: "recaptcha",
    recaptcha_key: "",
    recaptcha_site_key: "6Lc-fixture-site-key",
    recaptcha_v3_secret_key: "",
    recaptcha_v3_site_key: "",
    recaptcha_v3_score_threshold: "0.5",
    turnstile_secret_key: "",
    turnstile_site_key: "",
    register_limit_by_ip_enable: 1,
    register_limit_count: 3,
    register_limit_expire: 60,
    password_limit_enable: 1,
    password_limit_count: 5,
    password_limit_expire: 30,
  },
  subscribe: {
    plan_change_enable: 1,
    reset_traffic_method: 0,
    surplus_enable: 0,
    new_order_event_id: 1,
    renew_order_event_id: 1,
    change_order_event_id: 0,
    show_info_to_server_enable: 0,
    show_protocol_to_server_enable: 0,
    default_remind_expire: 1,
    default_remind_traffic: 1,
    subscribe_path: "s",
  },
  invite: {
    invite_force: 0,
    invite_commission: "10",
    invite_gen_limit: "5",
    invite_never_expire: 1,
    commission_first_time_enable: 1,
    commission_auto_check_enable: 0,
    commission_withdraw_limit: "100",
    commission_withdraw_method: ["支付宝", "USDT", "Paypal"],
    withdraw_close_enable: 0,
    commission_distribution_enable: 1,
    commission_distribution_l1: 15,
    commission_distribution_l2: 5,
    commission_distribution_l3: 2,
  },
  frontend: {
    frontend_theme: "default",
    frontend_theme_sidebar: "normal",
    frontend_theme_header: "normal",
    frontend_theme_color: "default",
    frontend_background_url: "",
  },
  server: {
    server_pull_interval: 60,
    server_push_interval: 60,
    server_token: "fixture-server-token-0123456789abcdef",
    device_limit_mode: 0,
    server_ws_enable: 1,
    server_ws_url: "wss://demo.xboard.test/ws",
  },
  email: {
    email_host: "smtp.example.com",
    email_port: 465,
    email_username: "noreply@example.com",
    email_password: "fixture-password",
    email_encryption: "ssl",
    email_from_address: "noreply@example.com",
    remind_mail_enable: 1,
  },
  telegram: {
    telegram_bot_enable: 1,
    telegram_bot_token: "123456789:AAF-fixture-token",
    telegram_webhook_url: "https://demo.xboard.test/api/v1/telegram/webhook",
    telegram_discuss_link: "https://t.me/xboard_demo",
  },
  app: {
    windows_version: "1.7.0",
    windows_download_url: "https://dl.xboard.test/xboard-1.7.0-setup.exe",
    macos_version: "1.7.0",
    macos_download_url: "https://dl.xboard.test/xboard-1.7.0.dmg",
    android_version: "1.7.0",
    android_download_url: "https://dl.xboard.test/xboard-1.7.0.apk",
  },
  subscribe_template: {
    subscribe_template_singbox:
      '{\n  "log": { "level": "info" },\n  "outbounds": [\n    { "type": "selector", "tag": "proxy", "outbounds": ["auto"] },\n    { "type": "urltest", "tag": "auto", "outbounds": [] }\n  ]\n}\n',
    subscribe_template_clash:
      "mixed-port: 7890\nallow-lan: false\nmode: rule\nlog-level: info\nproxy-groups:\n  - name: Proxy\n    type: select\n    proxies: []\nrules:\n  - GEOIP,CN,DIRECT\n  - MATCH,Proxy\n",
    subscribe_template_clashmeta:
      "mixed-port: 7890\nmode: rule\nproxy-groups:\n  - name: Proxy\n    type: select\n    proxies: []\nrules:\n  - GEOIP,CN,DIRECT\n  - MATCH,Proxy\n",
    subscribe_template_stash:
      "mixed-port: 7890\nmode: rule\nproxy-groups:\n  - name: Proxy\n    type: select\n    proxies: []\nrules:\n  - GEOIP,CN,DIRECT\n  - MATCH,Proxy\n",
    subscribe_template_surge:
      "[General]\nloglevel = notify\n[Proxy]\nDIRECT = direct\n[Rule]\nFINAL,DIRECT\n",
    subscribe_template_surfboard:
      "[General]\nloglevel = notify\n[Proxy]\nDIRECT = direct\n[Rule]\nFINAL,DIRECT\n",
  },
};

const GROUPS = [
  { id: 1, name: "默认权限组", users_count: 128, server_count: 4 },
  { id: 2, name: "高级用户", users_count: 42, server_count: 2 },
  { id: 3, name: "测试组", users_count: 7, server_count: 1 },
];

const PLANS = [
  {
    id: 1,
    name: "基础套餐",
    show: 1,
    sell: 1,
    renew: 1,
    users_count: 642,
    active_users_count: 318,
    group_id: 1,
    group: { id: 1, name: "默认权限组", users_count: 128, server_count: 4 },
    prices: {
      monthly: 1500,
      quarterly: 4000,
      half_yearly: 7500,
      yearly: 14000,
      two_yearly: 26000,
      three_yearly: 36000,
      onetime: null,
    },
    reset_price: 1000,
    transfer_enable: 100 * GB,
    device_limit: 3,
    capacity_limit: 500,
    speed_limit: null,
  },
  {
    id: 2,
    name: "标准套餐",
    show: 1,
    sell: 1,
    renew: 1,
    users_count: 386,
    active_users_count: 241,
    group_id: 1,
    group: { id: 1, name: "默认权限组", users_count: 128, server_count: 4 },
    prices: {
      month_price: 3000,
      quarter_price: 8500,
      half_year_price: 16000,
      year_price: 30000,
      two_year_price: 56000,
      three_year_price: 78000,
      onetime_price: null,
      reset_price: 2000,
    },
    transfer_enable: 300 * GB,
    device_limit: 5,
    capacity_limit: 300,
    speed_limit: 200,
  },
  {
    id: 3,
    name: "高级套餐",
    show: 1,
    sell: 1,
    renew: 1,
    users_count: 158,
    active_users_count: 120,
    group_id: 2,
    group: { id: 2, name: "高级用户", users_count: 42, server_count: 2 },
    prices: {
      month_price: 6000,
      quarter_price: 17000,
      half_year_price: 32000,
      year_price: 60000,
      two_year_price: 110000,
      three_year_price: 150000,
      onetime_price: null,
      reset_price: 3000,
    },
    transfer_enable: 1024 * GB,
    device_limit: 8,
    capacity_limit: null,
    speed_limit: null,
  },
  {
    id: 4,
    name: "按量计费",
    show: 0,
    sell: 0,
    renew: 0,
    users_count: 24,
    active_users_count: 12,
    group_id: 3,
    group: { id: 3, name: "测试组", users_count: 7, server_count: 1 },
    prices: {
      month_price: null,
      quarter_price: null,
      half_year_price: null,
      year_price: null,
      two_year_price: null,
      three_year_price: null,
      onetime_price: 500,
      reset_price: null,
    },
    transfer_enable: 50 * GB,
    device_limit: 1,
    capacity_limit: 100,
    speed_limit: 50,
  },
];

const USERS = [
  {
    id: 1,
    email: "alice@example.com",
    is_admin: 0,
    is_staff: 0,
    banned: 0,
    online_count: 2,
    plan_id: 1,
    group_id: 1,
    u: 12 * GB,
    d: 48 * GB,
    transfer_enable: 100 * GB,
    expired_at: T0 + 30 * 24 * HOUR,
    balance: 12500,
    commission_balance: 3200,
    created_at: T0 - 40 * 24 * HOUR,
    uuid: "11111111-1111-4111-8111-111111111111",
    token: "fixture-token-alice",
  },
  {
    id: 2,
    email: "bob@example.com",
    is_admin: 0,
    is_staff: 1,
    banned: 0,
    online_count: 1,
    plan_id: 2,
    group_id: 1,
    u: 36 * GB,
    d: 120 * GB,
    transfer_enable: 300 * GB,
    expired_at: T0 + 90 * 24 * HOUR,
    balance: 6800,
    commission_balance: 950,
    created_at: T0 - 28 * 24 * HOUR,
    uuid: "22222222-2222-4222-8222-222222222222",
    token: "fixture-token-bob",
  },
  {
    id: 3,
    email: "carol@example.com",
    is_admin: 1,
    is_staff: 1,
    banned: 0,
    online_count: 3,
    plan_id: 3,
    group_id: 2,
    u: 220 * GB,
    d: 680 * GB,
    transfer_enable: 1024 * GB,
    expired_at: T0 + 180 * 24 * HOUR,
    balance: 0,
    commission_balance: 0,
    created_at: T0 - 120 * 24 * HOUR,
    uuid: "33333333-3333-4333-8333-333333333333",
    token: "fixture-token-carol",
  },
  {
    id: 4,
    email: "dave@example.com",
    is_admin: 0,
    is_staff: 0,
    banned: 1,
    online_count: 0,
    plan_id: null,
    group_id: 1,
    u: 5 * GB,
    d: 18 * GB,
    transfer_enable: 50 * GB,
    expired_at: T0 - 10 * 24 * HOUR,
    balance: 0,
    commission_balance: 0,
    created_at: T0 - 200 * 24 * HOUR,
    uuid: "44444444-4444-4444-8444-444444444444",
    token: "fixture-token-dave",
  },
  {
    id: 5,
    email: "erin@example.com",
    is_admin: 0,
    is_staff: 0,
    banned: 0,
    online_count: 1,
    plan_id: 2,
    group_id: 2,
    u: 15 * GB,
    d: 62 * GB,
    transfer_enable: 300 * GB,
    expired_at: T0 + 15 * 24 * HOUR,
    balance: 4200,
    commission_balance: 780,
    created_at: T0 - 12 * 24 * HOUR,
    uuid: "55555555-5555-4555-8555-555555555555",
    token: "fixture-token-erin",
  },
  {
    id: 6,
    email: "frank@example.com",
    is_admin: 0,
    is_staff: 0,
    banned: 0,
    online_count: 0,
    plan_id: null,
    group_id: 1,
    u: 0,
    d: 0,
    transfer_enable: 0,
    expired_at: null,
    balance: 900,
    commission_balance: 0,
    created_at: T0 - 2 * 24 * HOUR,
    uuid: "66666666-6666-4666-8666-666666666666",
    token: "fixture-token-frank",
  },
];

const ORDERS = [
  { id: 1001, trade_no: "202406011001", type: 1, period: "month_price", plan: { name: "基础套餐" }, total_amount: 1500, status: 3, commission_balance: 150, commission_status: 2, created_at: T0 + 1 * HOUR },
  { id: 1002, trade_no: "202406011002", type: 2, period: "year_price", plan: { name: "标准套餐" }, total_amount: 30000, status: 3, commission_balance: 3000, commission_status: 2, created_at: T0 + 3 * HOUR },
  { id: 1003, trade_no: "202406011003", type: 3, period: "quarter_price", plan: { name: "高级套餐" }, total_amount: 17000, status: 1, commission_balance: 1700, commission_status: 1, created_at: T0 + 6 * HOUR },
  { id: 1004, trade_no: "202406011004", type: 1, period: "month_price", plan: { name: "高级套餐" }, total_amount: 6000, status: 0, commission_balance: 0, commission_status: 0, created_at: T0 + 9 * HOUR },
  { id: 1005, trade_no: "202406011005", type: 4, period: "reset_price", plan: { name: "基础套餐" }, total_amount: 1000, status: 2, commission_balance: 0, commission_status: 0, created_at: T0 + 12 * HOUR },
  { id: 1006, trade_no: "202406011006", type: 1, period: "half_year_price", plan: { name: "标准套餐" }, total_amount: 16000, status: 3, commission_balance: 1600, commission_status: 0, created_at: T0 + 18 * HOUR },
];

const NOTICES = [
  { id: 1, title: "系统维护通知（6 月 2 日 02:00 - 04:00）", content: "维护期间面板与订阅服务将短暂不可用，节点连接不受影响。", img_url: "", show: 1, tags: ["maintenance"], created_at: T0 + 1 * HOUR },
  { id: 2, title: "新增 Hysteria2 节点与 TUIC 支持", content: "东京、新加坡机房已完成升级，客户端请更新到 1.7.0 以上。", img_url: "", show: 1, tags: ["update", "node"], created_at: T0 + 5 * HOUR },
  { id: 3, title: "端午活动：年付套餐 8 折", content: "6 月 1 日至 6 月 10 日，年付套餐自动应用 8 折优惠。", img_url: "", show: 1, tags: ["promotion"], created_at: T0 + 9 * HOUR },
  { id: 4, title: "支付通道升级说明", content: "支付宝通道切换至新版网关，历史订单不受影响。", img_url: "", show: 1, tags: ["payment"], created_at: T0 + 13 * HOUR },
  { id: 5, title: "旧版客户端停止支持公告", content: "1.4.0 以下版本将于 7 月 1 日停止服务，请及时升级。", img_url: "", show: 0, tags: ["deprecated"], created_at: T0 + 20 * HOUR },
];

const KNOWLEDGE = [
  { id: 1, title: "如何导入订阅链接", category: "使用教程", language: "zh-CN", body: "复制订阅链接，在客户端中选择「从剪贴板导入」即可。", show: 1 },
  { id: 2, title: "Clash 无法连接节点", category: "常见问题", language: "zh-CN", body: "请检查系统时间是否准确，并尝试切换 DNS 模式。", show: 1 },
  { id: 3, title: "流量重置规则说明", category: "计费说明", language: "zh-CN", body: "套餐流量按自然月重置，重置流量包不参与月度重置。", show: 1 },
  { id: 4, title: "邀请返佣结算周期", category: "推广", language: "zh-CN", body: "佣金在订单完成 7 天后进入可提现余额。", show: 1 },
  { id: 5, title: "API 接入指南", category: "开发", language: "zh-CN", body: "使用 Bearer Token 调用 /api/v1 接口，注意请求频率限制。", show: 0 },
];

const PAYMENTS = [
  { id: 1, name: "支付宝", payment: "alipay", enable: 1, icon: "", notify_domain: "https://demo.xboard.test", notify_url: "https://demo.xboard.test/api/v1/payment/notify/alipay", handling_fee_percent: 0, handling_fee_fixed: 0, config: { app_id: "2021000000000000", private_key: "(fixture)", alipay_public_key: "(fixture)", gateway: "https://openapi.alipay.com/gateway.do" } },
  { id: 2, name: "微信支付", payment: "wechat", enable: 0, icon: "", notify_domain: "https://demo.xboard.test", notify_url: "https://demo.xboard.test/api/v1/payment/notify/wechat", handling_fee_percent: 0.6, handling_fee_fixed: 0, config: { app_id: "wx0000000000000000", mch_id: "1900000000", api_key: "(fixture)" } },
  { id: 3, name: "Stripe", payment: "stripe", enable: 1, icon: "", notify_domain: "https://demo.xboard.test", notify_url: "https://demo.xboard.test/api/v1/payment/notify/stripe", handling_fee_percent: 2.9, handling_fee_fixed: 30, config: { secret_key: "sk_test_fixture", webhook_secret: "whsec_fixture", currency: "cny" } },
  { id: 4, name: "易支付", payment: "epay", enable: 0, icon: "", notify_domain: "https://demo.xboard.test", notify_url: "https://demo.xboard.test/api/v1/payment/notify/epay", handling_fee_percent: 0, handling_fee_fixed: 0, config: { url: "https://pay.example.com", pid: "1001", key: "(fixture)" } },
];

const PAYMENT_METHODS = ["alipay", "wechat", "stripe", "epay"];

const PAYMENT_FORMS = {
  alipay: { app_id: "2021000000000000", private_key: "(fixture)", alipay_public_key: "(fixture)", gateway: "https://openapi.alipay.com/gateway.do" },
  wechat: { app_id: "wx0000000000000000", mch_id: "1900000000", api_key: "(fixture)" },
  stripe: { secret_key: "sk_test_fixture", webhook_secret: "whsec_fixture", currency: "cny" },
  epay: { url: "https://pay.example.com", pid: "1001", key: "(fixture)" },
};

const MACHINES = [
  { id: 1, name: "东京-01", notes: "东京机房 · 主力节点", is_active: 1, last_seen_at: T0 + 20 * HOUR, servers_count: 3, load_status: { cpu: 38.4, mem: { used: 6 * GB, total: 16 * GB }, disk: { used: 120 * GB, total: 480 * GB }, net: { in_speed: 524288, out_speed: 262144 }, updated_at: T0 + 20 * HOUR } },
  { id: 2, name: "新加坡-01", notes: "新加坡机房 · 备用", is_active: 0, last_seen_at: null, servers_count: 2, load_status: { cpu: 0, mem: { used: 0, total: 8 * GB }, disk: { used: 0, total: 200 * GB }, updated_at: null } },
  { id: 3, name: "法兰克福-01", notes: "欧洲节点 · 高负载", is_active: 1, last_seen_at: null, servers_count: 1, load_status: { cpu: 72.5, mem: { used: 13 * GB, total: 16 * GB }, disk: { used: 410 * GB, total: 480 * GB }, net: { in_speed: 1048576, out_speed: 786432 }, updated_at: T0 + 7 * HOUR } },
];

const NODES = [
  { id: 1, protocol_settings: { method: "aes-256-gcm", plugin: "", plugin_opts: "" }, code: "tokyo-ss-01", name: "东京 SS-01", type: "shadowsocks", host: "jp1.demo.xboard.test", port: 443, server_port: 2443, rate: 1, online: 86, u: 2 * GB, d: 18 * GB, transfer_enable: 1024 * GB, banned: 0, show: 1, machine_id: 1, sort: 1, groups: [{ id: 1, name: "默认权限组" }], group_ids: [1] },
  { id: 2, code: "tokyo-vmess-01", name: "东京 VMess-01", type: "vmess", host: "jp2.demo.xboard.test", port: 443, server_port: 2444, rate: 1, online: 64, u: 1.4 * GB, d: 12.6 * GB, transfer_enable: 1024 * GB, banned: 0, show: 1, machine_id: 1, sort: 2, groups: [{ id: 1, name: "默认权限组" }, { id: 2, name: "高级用户" }], group_ids: [1, 2] },
  { id: 3, code: "sg-trojan-01", name: "新加坡 Trojan-01", type: "trojan", host: "sg1.demo.xboard.test", port: 443, server_port: 2445, rate: 1.2, online: 41, u: 900 * 1024 * 1024, d: 8.2 * GB, transfer_enable: 1024 * GB, banned: 0, show: 1, machine_id: 2, sort: 3, groups: [{ id: 2, name: "高级用户" }], group_ids: [2] },
  { id: 4, code: "sg-hysteria-01", name: "新加坡 Hysteria2-01", type: "hysteria", host: "sg2.demo.xboard.test", port: 8443, server_port: 2446, rate: 1.5, online: 28, u: 540 * 1024 * 1024, d: 5.4 * GB, transfer_enable: 1024 * GB, banned: 0, show: 1, machine_id: 2, sort: 4, groups: [{ id: 1, name: "默认权限组" }, { id: 2, name: "高级用户" }], group_ids: [1, 2] },
  { id: 5, protocol_settings: { network: "ws", tls: { enabled: 1, server_name: "edge1.demo.xboard.test", allow_insecure: 0 }, multiplex: { enabled: 0 } }, code: "edge-vless-01", name: "边缘 VLESS-01", type: "vless", host: "edge1.demo.xboard.test", port: 443, server_port: 2447, rate: 2, online: 12, u: 320 * 1024 * 1024, d: 3.1 * GB, transfer_enable: 1024 * GB, banned: 1, show: 1, machine_id: null, sort: 5, groups: [{ id: 3, name: "测试组" }], group_ids: [3] },
  { id: 6, code: "fra-tuic-01", name: "法兰克福 TUIC-01", type: "tuic", host: "de1.demo.xboard.test", port: 443, server_port: 2448, rate: 1, online: 19, u: 210 * 1024 * 1024, d: 2.4 * GB, transfer_enable: 1024 * GB, banned: 0, show: 0, machine_id: 3, sort: 6, groups: [{ id: 1, name: "默认权限组" }], group_ids: [1] },
];

const SERVER_ROUTES = [
  { id: 1, remarks: "拦截广告域名", match: ["ads.example.com", "tracker.example.net"], action: "block", action_value: null },
  { id: 2, remarks: "直连国内站点", match: ["cn.example.com"], action: "direct", action_value: null },
  { id: 3, remarks: "自定义 DNS", match: ["dns.example.com"], action: "dns", action_value: "1.1.1.1" },
  { id: 4, remarks: "代理流媒体", match: ["netflix.com", "youtube.com"], action: "proxy", action_value: "tokyo-ss-01" },
];

const COUPONS = [
  { id: 1, name: "新用户立减", code: "WELCOME2024", show: 1, type: 1, value: 500, limit_use: 100, limit_use_with_user: 1, started_at: T0 - 10 * 24 * HOUR, ended_at: T0 + 80 * 24 * HOUR },
  { id: 2, name: "夏日 85 折", code: "SUMMER85", show: 1, type: 2, value: 15, limit_use: null, limit_use_with_user: null, started_at: T0, ended_at: T0 + 30 * 24 * HOUR },
  { id: 3, name: "年付续费券", code: "RENEW1000", show: 1, type: 1, value: 1000, limit_use: 200, limit_use_with_user: 2, started_at: T0 - 30 * 24 * HOUR, ended_at: T0 + 60 * 24 * HOUR },
  { id: 4, name: "已停用测试券", code: "TESTONLY", show: 0, type: 1, value: 100, limit_use: 10, limit_use_with_user: 1, started_at: T0 - 60 * 24 * HOUR, ended_at: T0 - 1 * 24 * HOUR },
  { id: 5, name: "黑五 7 折", code: "BLACKFRIDAY", show: 1, type: 2, value: 30, limit_use: 500, limit_use_with_user: 1, started_at: T0 - 5 * 24 * HOUR, ended_at: T0 + 120 * 24 * HOUR },
];

const TRAFFIC_LOGS = [
  { id: 1, user_id: 1, user_email: "alice@example.com", reset_type: "manual", reset_type_name: "手动重置", trigger_source: "manual", trigger_source_name: "管理员操作", old_traffic: { formatted: "60.00 GB", upload: 12 * GB, download: 48 * GB }, reset_time: T0 + 2 * HOUR, created_at: T0 + 2 * HOUR },
  { id: 2, user_id: 2, user_email: "bob@example.com", reset_type: "monthly", reset_type_name: "每月重置", trigger_source: "auto", trigger_source_name: "自动任务", old_traffic: { formatted: "156.00 GB", upload: 36 * GB, download: 120 * GB }, reset_time: T0 + 5 * HOUR, created_at: T0 + 5 * HOUR },
  { id: 3, user_id: 3, user_email: "carol@example.com", reset_type: "first_day_month", reset_type_name: "每月首日", trigger_source: "cron", trigger_source_name: "定时任务", old_traffic: { formatted: "900.00 GB", upload: 220 * GB, download: 680 * GB }, reset_time: T0 + 8 * HOUR, created_at: T0 + 8 * HOUR },
  { id: 4, user_id: 5, user_email: "erin@example.com", reset_type: "yearly", reset_type_name: "每年重置", trigger_source: "auto", trigger_source_name: "自动任务", old_traffic: { formatted: "77.00 GB", upload: 15 * GB, download: 62 * GB }, reset_time: T0 + 11 * HOUR, created_at: T0 + 11 * HOUR },
  { id: 5, user_id: 4, user_email: "dave@example.com", reset_type: "manual", reset_type_name: "手动重置", trigger_source: "manual", trigger_source_name: "管理员操作", old_traffic: { formatted: "23.00 GB", upload: 5 * GB, download: 18 * GB }, reset_time: T0 + 15 * HOUR, created_at: T0 + 15 * HOUR },
];

const TICKETS = [
  { id: 101, subject: "无法连接东京节点", level: 1, status: 0, reply_status: 1, created_at: T0 + 1 * HOUR, updated_at: T0 + 3 * HOUR, user: { id: 1, email: "alice@example.com" } },
  { id: 102, subject: "支付成功但套餐未开通", level: 2, status: 0, reply_status: 0, created_at: T0 + 4 * HOUR, updated_at: T0 + 4 * HOUR, user: { id: 2, email: "bob@example.com" } },
  { id: 103, subject: "流量统计似乎有偏差", level: 0, status: 0, reply_status: 1, created_at: T0 + 7 * HOUR, updated_at: T0 + 9 * HOUR, user: { id: 5, email: "erin@example.com" } },
  { id: 104, subject: "邀请返佣未到账", level: 1, status: 1, reply_status: 0, created_at: T0 + 12 * HOUR, updated_at: T0 + 14 * HOUR, user: { id: 6, email: "frank@example.com" } },
  { id: 105, subject: "如何更换订阅链接", level: 0, status: 0, reply_status: 1, created_at: T0 + 16 * HOUR, updated_at: T0 + 18 * HOUR, user: { id: 4, email: "dave@example.com" } },
];

function ticketMessages(ticket) {
  return [
    { id: ticket.id * 10 + 1, ticket_id: ticket.id, user_id: ticket.user.id, is_from_admin: false, is_me: false, message: `${ticket.subject}，请协助排查，谢谢。`, created_at: ticket.created_at },
    { id: ticket.id * 10 + 2, ticket_id: ticket.id, user_id: 3, is_from_admin: true, is_me: true, message: "已收到，我们正在核查，请稍候。", created_at: ticket.created_at + 1 * HOUR },
    { id: ticket.id * 10 + 3, ticket_id: ticket.id, user_id: 3, is_from_admin: true, is_me: true, message: "已定位问题并修复，请重新连接试试。", created_at: ticket.updated_at },
  ];
}

const GIFT_TEMPLATES = [
  { id: 1, name: "新人礼包", description: "注册后自动发放的新手礼包", type: 1, type_name: "余额", status: 1, conditions: { min_balance: 0 }, rewards: { balance: 500 }, limits: { per_user: 1 }, special_config: null, icon: "", background_image: "", theme_color: "#2563eb", sort: 1, created_at: T0 - 20 * 24 * HOUR, codes_count: 120, used_count: 86 },
  { id: 2, name: "流量加油包", description: "赠送 20GB 流量", type: 2, type_name: "流量", status: 1, conditions: null, rewards: { traffic: 20 * GB }, limits: { per_user: 2 }, special_config: null, icon: "", background_image: "", theme_color: "#16a34a", sort: 2, created_at: T0 - 15 * 24 * HOUR, codes_count: 80, used_count: 51 },
  { id: 3, name: "节日折扣券", description: "节日活动折扣", type: 3, type_name: "折扣", status: 1, conditions: { min_amount: 3000 }, rewards: { discount: 0.9 }, limits: { per_user: 1 }, special_config: null, icon: "", background_image: "", theme_color: "#f59e0b", sort: 3, created_at: T0 - 10 * 24 * HOUR, codes_count: 60, used_count: 22 },
  { id: 4, name: "邀请奖励", description: "邀请好友后发放", type: 4, type_name: "邀请奖励", status: 0, conditions: null, rewards: { commission: 10 }, limits: { per_user: 5 }, special_config: null, icon: "", background_image: "", theme_color: "#7c3aed", sort: 4, created_at: T0 - 5 * 24 * HOUR, codes_count: 40, used_count: 0 },
];

const GIFT_CODES = [
  { id: 1, template_id: 1, template_name: "新人礼包", code: "XB-WELCOME-001", batch_id: "20240601A", status: 1, status_name: "已使用", user_email: "alice@example.com", used_at: T0 + 2 * HOUR, expires_at: T0 + 90 * 24 * HOUR, usage_count: 1, max_usage: 1, created_at: T0 - 20 * 24 * HOUR },
  { id: 2, template_id: 1, template_name: "新人礼包", code: "XB-WELCOME-002", batch_id: "20240601A", status: 0, status_name: "未使用", user_email: null, used_at: null, expires_at: T0 + 90 * 24 * HOUR, usage_count: 0, max_usage: 1, created_at: T0 - 20 * 24 * HOUR },
  { id: 3, template_id: 2, template_name: "流量加油包", code: "XB-TRAFFIC-001", batch_id: "20240601B", status: 1, status_name: "已使用", user_email: "bob@example.com", used_at: T0 + 6 * HOUR, expires_at: T0 + 60 * 24 * HOUR, usage_count: 1, max_usage: 1, created_at: T0 - 15 * 24 * HOUR },
  { id: 4, template_id: 2, template_name: "流量加油包", code: "XB-TRAFFIC-002", batch_id: "20240601B", status: 0, status_name: "未使用", user_email: null, used_at: null, expires_at: T0 + 60 * 24 * HOUR, usage_count: 0, max_usage: 1, created_at: T0 - 15 * 24 * HOUR },
  { id: 5, template_id: 3, template_name: "节日折扣券", code: "XB-FESTIVAL-001", batch_id: "20240601C", status: 2, status_name: "已禁用", user_email: null, used_at: null, expires_at: T0 + 30 * 24 * HOUR, usage_count: 0, max_usage: 1, created_at: T0 - 10 * 24 * HOUR },
  { id: 6, template_id: 3, template_name: "节日折扣券", code: "XB-FESTIVAL-002", batch_id: "20240601C", status: 0, status_name: "未使用", user_email: null, used_at: null, expires_at: T0 + 30 * 24 * HOUR, usage_count: 0, max_usage: 1, created_at: T0 - 10 * 24 * HOUR },
];

const GIFT_USAGES = [
  { id: 1, code: "XB-WELCOME-001", template_name: "新人礼包", user_email: "alice@example.com", rewards_given: { balance: 500 }, invite_rewards: null, multiplier_applied: null, created_at: T0 + 2 * HOUR },
  { id: 2, code: "XB-TRAFFIC-001", template_name: "流量加油包", user_email: "bob@example.com", rewards_given: { traffic: 20 * GB }, invite_rewards: null, multiplier_applied: null, created_at: T0 + 6 * HOUR },
  { id: 3, code: "XB-WELCOME-003", template_name: "新人礼包", user_email: "erin@example.com", rewards_given: { balance: 500 }, invite_rewards: 100, multiplier_applied: 1.2, created_at: T0 + 10 * HOUR },
  { id: 4, code: "XB-FESTIVAL-003", template_name: "节日折扣券", user_email: "frank@example.com", rewards_given: { discount: 0.9 }, invite_rewards: null, multiplier_applied: null, created_at: T0 + 16 * HOUR },
];

const PLUGINS = [
  { code: "traffic-analytics", name: "Traffic Analytics", version: "1.2.0", description: "流量分析与可视化扩展", author: "XBoard Labs", type: "feature", is_installed: true, is_enabled: true, is_protected: true, can_be_deleted: false, config: { refresh_interval: 15 }, readme: "# Traffic Analytics\n\n流量分析与可视化扩展。", need_upgrade: false, admin_menus: null, admin_crud: null },
  { code: "telegram-notify", name: "Telegram Notify", version: "1.0.4", description: "通过 Telegram Bot 推送站内事件", author: "XBoard Labs", type: "feature", is_installed: true, is_enabled: false, is_protected: false, can_be_deleted: true, config: { chat_id: "-1000000000000" }, readme: "# Telegram Notify\n\n事件推送插件。", need_upgrade: true, admin_menus: null, admin_crud: null },
  { code: "stripe-gateway", name: "Stripe Gateway", version: "2.1.0", description: "Stripe 支付网关", author: "XBoard Labs", type: "payment", is_installed: false, is_enabled: false, is_protected: false, can_be_deleted: true, config: {}, readme: "# Stripe Gateway\n\n支付网关插件。", need_upgrade: false, admin_menus: null, admin_crud: null },
  { code: "aurora-theme", name: "Aurora Theme", version: "0.9.2", description: "极光风格前端主题", author: "Community", type: "theme", is_installed: true, is_enabled: false, is_protected: false, can_be_deleted: true, config: { accent: "#7c3aed" }, readme: "# Aurora Theme\n\n前端主题插件。", need_upgrade: false, admin_menus: null, admin_crud: null },
];

const PLUGIN_TYPES = [
  { value: "feature", label: "功能扩展", description: "扩展后台功能" },
  { value: "payment", label: "支付网关", description: "接入新的支付方式" },
  { value: "theme", label: "前端主题", description: "替换用户端外观" },
];

const THEMES = {
  xboard: { name: "Xboard 默认主题", description: "后台默认主题", version: "1.0.0", background_url: "", images: [], can_delete: false, is_system: true, configs: [{ field_name: "primary_color", label: "主题色", type: "color" }, { field_name: "enable_blur", label: "毛玻璃效果", type: "switch" }, { field_name: "background_image", label: "背景图", type: "text" }] },
  aurora: { name: "Aurora", description: "极光渐变风格", version: "0.9.2", background_url: "", images: [], can_delete: true, is_system: false, configs: [{ field_name: "primary_color", label: "主题色", type: "color" }, { field_name: "gradient_angle", label: "渐变角度", type: "number" }] },
  minimal: { name: "Minimal", description: "极简黑白风格", version: "1.1.0", background_url: "", images: [], can_delete: true, is_system: false, configs: [{ field_name: "border_radius", label: "圆角", type: "number" }] },
};

const THEME_ACTIVE = "xboard";

const THEME_CONFIGS = {
  xboard: { primary_color: "#2563eb", enable_blur: true, background_image: "" },
  aurora: { primary_color: "#7c3aed", gradient_angle: 135 },
  minimal: { border_radius: 6 },
};

const PLUGIN_CONFIG = {
  refresh_interval: { type: "number", label: "刷新间隔（秒）", description: "仪表盘数据的刷新间隔", value: 15 },
  enable_charts: { type: "switch", label: "启用图表", description: "是否展示可视化图表", value: true },
  api_endpoint: { type: "text", label: "API 地址", placeholder: "https://example.com/api", value: "https://demo.xboard.test/api" },
  log_level: { type: "select", label: "日志级别", value: "info", options: [{ value: "debug", label: "Debug" }, { value: "info", label: "Info" }, { value: "warn", label: "Warn" }] },
};

const STATS = {
  todayIncome: 1288600,
  dayIncomeGrowth: 12.4,
  currentMonthIncome: 4866200,
  lastMonthIncome: 4127800,
  monthIncomeGrowth: 17.9,
  currentMonthCommissionPayout: 328500,
  commissionPendingTotal: 76400,
  currentMonthNewUsers: 156,
  totalUsers: 4218,
  activeUsers: 3312,
  userGrowth: 6.8,
  onlineUsers: 248,
  onlineDevices: 512,
  ticketPendingTotal: 7,
  onlineNodes: 18,
  todayTraffic: { upload: Math.round(2.34 * GB), download: Math.round(9.87 * GB), total: Math.round(12.21 * GB) },
  monthTraffic: { upload: Math.round(68.4 * GB), download: Math.round(286.7 * GB), total: Math.round(355.1 * GB) },
  totalTraffic: { upload: Math.round(2.4 * 1024 * GB), download: Math.round(9.8 * 1024 * GB), total: Math.round(12.2 * 1024 * GB) },
};

const ORDER_STAT = {
  summary: { paid_total: 4866200, paid_count: 312, commission_total: 328500, commission_count: 87, avg_paid_amount: 15600, commission_rate: 6.75, start_date: "2024-06-01", end_date: "2024-06-07" },
  list: [
    { date: "2024-06-01", paid_total: 582000, paid_count: 38, commission_total: 42000, commission_count: 11, avg_order_amount: 15315, avg_commission_amount: 3818 },
    { date: "2024-06-02", paid_total: 694500, paid_count: 44, commission_total: 51000, commission_count: 13, avg_order_amount: 15784, avg_commission_amount: 3923 },
    { date: "2024-06-03", paid_total: 521800, paid_count: 35, commission_total: 38000, commission_count: 9, avg_order_amount: 14908, avg_commission_amount: 4222 },
    { date: "2024-06-04", paid_total: 748200, paid_count: 47, commission_total: 56000, commission_count: 14, avg_order_amount: 15919, avg_commission_amount: 4000 },
    { date: "2024-06-05", paid_total: 812600, paid_count: 52, commission_total: 61000, commission_count: 16, avg_order_amount: 15626, avg_commission_amount: 3812 },
    { date: "2024-06-06", paid_total: 733400, paid_count: 46, commission_total: 40500, commission_count: 12, avg_order_amount: 15943, avg_commission_amount: 3375 },
    { date: "2024-06-07", paid_total: 773700, paid_count: 50, commission_total: 40000, commission_count: 12, avg_order_amount: 15474, avg_commission_amount: 3333 },
  ],
};

const QUEUE_STATS = {
  failedJobs: 3,
  jobsPerMinute: 42,
  pausedMasters: 0,
  periods: { failedJobs: 3, recentJobs: 1280 },
  processes: 8,
  queueWithMaxRuntime: { name: "default", runtime: 1.24 },
  queueWithMaxThroughput: { name: "default", throughput: 38.5 },
  recentJobs: 1280,
  status: true,
  wait: { default: 0, emails: 2, notifications: 1 },
};

const FAILED_JOBS = [
  { id: 1, failed_at: T0 + 2 * HOUR, queue: "default", name: "App\\Jobs\\SendEmail", exception: "RuntimeException: SMTP connection timed out\n#0 /www/app/Jobs/SendEmail.php(42): ...", payload: "{\"email\":\"alice@example.com\"}", connection: "redis" },
  { id: 2, failed_at: T0 + 6 * HOUR, queue: "notifications", name: "App\\Jobs\\SendTelegram", exception: "GuzzleHttp\\Exception\\ConnectException: cURL error 28", payload: "{\"chat_id\":\"-1000000000000\"}", connection: "redis" },
  { id: 3, failed_at: T0 + 11 * HOUR, queue: "emails", name: "App\\Jobs\\SendRemindMail", exception: "InvalidArgumentException: Template [remind_expire] missing", payload: "{\"user_id\":3}", connection: "redis" },
];

const USER_INFO = {
  id: 3,
  email: "carol@example.com",
  is_admin: 1,
  is_staff: 1,
  balance: 0,
  commission_balance: 0,
  transfer_enable: 1024 * GB,
  u: 220 * GB,
  d: 680 * GB,
  expired_at: T0 + 180 * 24 * HOUR,
  plan_id: 3,
  group_id: 2,
};

/* ------------------------------------------------------------------ *
 * Response helpers
 * ------------------------------------------------------------------ */

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function ok(data, extra = {}) {
  return { status: "success", message: "", data, ...extra };
}

/** Laravel-style paginator flattened into the envelope: {status,message,data:[...],total}. */
function pageEnvelope(rows, total = rows.length, extra = {}) {
  return { status: "success", message: "", data: rows, total, ...extra };
}

function paginate(rows, ctx, defaultSize = 20) {
  const body = ctx.body && typeof ctx.body === "object" ? ctx.body : {};
  const query = ctx.url.searchParams;
  const current = Math.max(1, Number(body.current ?? body.page ?? query.get("current") ?? query.get("page") ?? 1) || 1);
  const perPage = Math.max(1, Number(body.pageSize ?? body.per_page ?? query.get("pageSize") ?? query.get("per_page") ?? defaultSize) || defaultSize);
  const start = (current - 1) * perPage;
  return { rows: rows.slice(start, start + perPage), total: rows.length, current, perPage };
}

/* ------------------------------------------------------------------ *
 * Route table
 * ------------------------------------------------------------------ */

const ROUTES = new Map();
function on(pathname, handler) {
  if (ROUTES.has(pathname)) throw new Error(`duplicate fixture route: ${pathname}`);
  ROUTES.set(pathname, handler);
}

/* --- auth / public -------------------------------------------------- */
on("/passport/auth/login", () => ok({ token: "t", auth_data: "Bearer test-token", is_admin: 1 }));
on("/passport/auth/token2Login", () => ok({ token: "t", auth_data: "Bearer test-token", is_admin: 1 }));
on("/passport/auth/register", () => ok({ token: "t", auth_data: "Bearer test-token", is_admin: 0 }));
on("/passport/auth/forget", () => ok(true));
on("/passport/comm/sendEmailVerify", () => ok(true));
on("/guest/comm/config", () =>
  ok({
    is_email_verify: 0,
    is_captcha: 0,
    captcha_type: "recaptcha",
    recaptcha_site_key: null,
    recaptcha_v3_site_key: null,
    turnstile_site_key: null,
  }),
);
on("/user/info", () => ok(USER_INFO));

/* --- config --------------------------------------------------------- */
on("/config/fetch", (ctx) => {
  const key = ctx.url.searchParams.get("key") ?? "";
  if (!key) return ok(CONFIG_SECTIONS);
  return ok({ [key]: CONFIG_SECTIONS[key] ?? {} });
});
on("/config/save", () => ok(true));
on("/config/getEmailTemplate", () => ok({ templates: MAIL_TEMPLATES }));
on("/config/testSendMail", () =>
  ok({
    error: "",
    email: "admin@example.com",
    subject: "Xboard 测试邮件",
    template_name: "test",
    config: {
      driver: "smtp",
      host: "smtp.example.com",
      port: "465",
      encryption: "ssl",
      from: { address: "noreply@example.com", name: "Xboard" },
      username: "noreply@example.com",
    },
  }),
);
on("/config/setTelegramWebhook", () =>
  ok({
    webhook_url: "https://demo.xboard.test/api/v1/telegram/webhook",
    webhook_base_url: "https://demo.xboard.test",
  }),
);

/* Legacy config modules (kept for older admin clients; current SPA uses /config/fetch). */
on("/config/notice", () => ok(NOTICES));
on("/config/knowledge", () => ok(KNOWLEDGE));
on("/config/payment", () => ok(PAYMENTS));
on("/config/plugin", () => ok(PLUGINS));
on("/config/system", () => ok({ site: CONFIG_SECTIONS.site, safe: CONFIG_SECTIONS.safe, subscribe: CONFIG_SECTIONS.subscribe }));
on("/config/theme", () => ok({ themes: THEMES, active: THEME_ACTIVE }));

/* --- mail templates ------------------------------------------------- */
on("/mail/template/list", () => ok(MAIL_TEMPLATES.map(({ name, label, customized }) => ({ name, label, customized }))));
on("/mail/template/get", (ctx) => {
  const name = ctx.url.searchParams.get("name") ?? "";
  const template = MAIL_TEMPLATES.find((item) => item.name === name) ?? MAIL_TEMPLATES[0];
  return ok(template);
});
on("/mail/template/save", () => ok(true));
on("/mail/template/reset", () => ok(true));
on("/mail/template/test", () => ok(true));

/* --- stats ---------------------------------------------------------- */
on("/stat/getStats", () => ok(STATS));
on("/stat/getOrder", () => ok(ORDER_STAT));
on("/stat/getTrafficRank", (ctx) => {
  const type = ctx.url.searchParams.get("type") === "user" ? "user" : "node";
  if (type === "user") {
    return ok([
      { id: "u3", name: "carol@example.com", value: 900 * GB, previousValue: 820 * GB, change: 9.76 },
      { id: "u2", name: "bob@example.com", value: 156 * GB, previousValue: 172 * GB, change: -9.3 },
      { id: "u5", name: "erin@example.com", value: 77 * GB, previousValue: 64 * GB, change: 20.31 },
      { id: "u1", name: "alice@example.com", value: 60 * GB, previousValue: 58 * GB, change: 3.45 },
      { id: "u4", name: "dave@example.com", value: 23 * GB, previousValue: 31 * GB, change: -25.81 },
    ]);
  }
  return ok([
    { id: "1", name: "东京 SS-01", value: 20 * GB, previousValue: 18 * GB, change: 11.11 },
    { id: "2", name: "东京 VMess-01", value: 14 * GB, previousValue: 15.5 * GB, change: -9.68 },
    { id: "3", name: "新加坡 Trojan-01", value: 9.1 * GB, previousValue: 8.2 * GB, change: 10.98 },
    { id: "4", name: "新加坡 Hysteria2-01", value: 5.94 * GB, previousValue: 5.1 * GB, change: 16.47 },
    { id: "5", name: "边缘 VLESS-01", value: 3.42 * GB, previousValue: 4.1 * GB, change: -16.59 },
    { id: "6", name: "法兰克福 TUIC-01", value: 2.61 * GB, previousValue: 2.2 * GB, change: 18.64 },
  ]);
});
on("/stat/getStatUser", () => ok({ total: 4218, active: 3312, new: 156 }));

/* --- system --------------------------------------------------------- */
on("/system/getSystemStatus", () => ok({ status: true, php_version: "8.3.8", laravel_version: "11.9.2", horizon: "running", queue: "redis" }));
on("/system/getQueueWorkload", () => ok({ default: { name: "default", size: 0, processes: 8, wait: 0, throughput: 38.5 } }));
on("/system/getQueueMasters", () => ok([{ name: "master-1", pid: 1201, status: "running" }]));
on("/system/getQueueStats", () => ok(QUEUE_STATS));
on("/system/getHorizonFailedJobs", (ctx) => {
  const { rows, total } = paginate(FAILED_JOBS, ctx, 10);
  return pageEnvelope(rows, total);
});

/* --- notice / knowledge / payment ---------------------------------- */
on("/notice/fetch", () => ok(NOTICES));
on("/notice/save", () => ok(true));
on("/notice/drop", () => ok(true));
on("/notice/show", () => ok(true));
on("/notice/sort", () => ok(true));

on("/knowledge/fetch", () => ok(KNOWLEDGE));
on("/knowledge/save", () => ok(true));
on("/knowledge/drop", () => ok(true));
on("/knowledge/show", () => ok(true));
on("/knowledge/sort", () => ok(true));

on("/payment/fetch", () => ok(PAYMENTS));
on("/payment/getPaymentMethods", () => ok(PAYMENT_METHODS));
on("/payment/getPaymentForm", (ctx) => {
  const payment = String(ctx.body?.payment ?? "");
  return ok(PAYMENT_FORMS[payment] ?? PAYMENT_FORMS.alipay);
});
on("/payment/save", () => ok(true));
on("/payment/drop", () => ok(true));
on("/payment/show", (ctx) => {
  const id = Number(ctx.body?.id);
  return ok(PAYMENTS.find((row) => row.id === id) ?? PAYMENTS[0]);
});
on("/payment/sort", () => ok(true));

/* --- server --------------------------------------------------------- */
on("/server/group/fetch", () => ok(GROUPS));
on("/server/group/save", () => ok(true));
on("/server/group/drop", () => ok(true));

on("/server/machine/fetch", () => ok(MACHINES));
on("/server/machine/save", () => ok(true));
on("/server/machine/drop", () => ok(true));
on("/server/machine/getToken", () => ok({ token: "fixture-machine-token" }));
on("/server/machine/resetToken", () => ok({ token: "fixture-machine-token" }));
on("/server/machine/installCommand", () => ok({ command: "bash <(curl -fsSL https://demo.xboard.test/install.sh) --token fixture-machine-token" }));
on("/server/machine/nodes", (ctx) => {
  const q = ctx.url?.searchParams ?? new URLSearchParams();
  const mid = Number(q.get("machine_id") ?? q.get("id") ?? 0);
  const list = NODES
    .filter((n) => (mid ? n.machine_id === mid : true))
    .map(({ id, name, host, port, type, enable, machine_id }) => ({
      id, name, host, port, type, machine_id,
      // 原件读 enabled（不是 enable）；enabled===null 表示"跟随节点自身 show"
      enabled: enable === undefined ? null : Boolean(enable),
    }));
  return ok(list);
});
on("/server/machine/history", (ctx) => {
  const q = ctx.url?.searchParams ?? new URLSearchParams();
  const mid = Number(q.get("machine_id") ?? q.get("id") ?? 0);
  const hours = Number(q.get("range_hours") ?? 6);
  const limit = Number(q.get("limit") ?? 360);
  const step = Math.max(60, Math.round((hours * 3600) / Math.max(1, limit)));
  const machine = MACHINES.find((m) => m.id === mid) ?? MACHINES[0];
  const base = machine.load_status ?? { cpu: 30, mem: { used: 8 * GB, total: 16 * GB }, disk: { used: 200 * GB, total: 480 * GB } };
  const rows = [];
  for (let i = limit - 1; i >= 0; i--) {
    const wave = Math.sin((limit - i) / 12) * 8;
    rows.push({
      recorded_at: T0 + 20 * HOUR - i * step,
      cpu: Math.max(1, Math.min(99, Number((base.cpu + wave).toFixed(1)))),
      mem_used: base.mem.used + Math.round(((limit - i) % 40) * 32 * 1024 * 1024),
      mem_total: base.mem.total,
      disk_used: base.disk.used,
      disk_total: base.disk.total,
      net_in_speed: 1200 + ((limit - i) % 60) * 900,
      net_out_speed: 800 + ((limit - i) % 60) * 600,
    });
  }
  return ok(rows);
});

on("/server/manage/getNodes", () => ok(NODES));
on("/server/manage/save", () => ok(true));
on("/server/manage/update", () => ok(true));
on("/server/manage/drop", () => ok(true));
on("/server/manage/copy", () => ok(true));
on("/server/manage/sort", () => ok(true));
on("/server/manage/resetTraffic", () => ok(true));
on("/server/manage/batchDelete", () => ok(true));
on("/server/manage/batchResetTraffic", () => ok(true));
on("/server/manage/batchUpdate", () => ok(true));
on("/server/manage/generateEchKey", () => ok({ key: "fixture-ech-key" }));

/* Legacy no-action aliases (older admin clients). */
on("/server/manage", () => ok(NODES));
on("/server/group", () => ok(GROUPS));
on("/server/machine", () => ok(MACHINES));
on("/server/route", () => ok(SERVER_ROUTES));

on("/server/route/fetch", () => ok(SERVER_ROUTES));
on("/server/route/save", () => ok(true));
on("/server/route/drop", () => ok(true));

/* --- finance -------------------------------------------------------- */
on("/plan/fetch", () => ok(PLANS));
on("/plan/save", () => ok(true));
on("/plan/update", () => ok(true));
on("/plan/drop", () => ok(true));
on("/plan/sort", () => ok(true));

on("/order/fetch", (ctx) => {
  const { rows, total } = paginate(ORDERS, ctx);
  return pageEnvelope(rows, total);
});
on("/order/detail", (ctx) => {
  const id = Number(ctx.body?.id);
  return ok(ORDERS.find((row) => row.id === id) ?? ORDERS[0]);
});
on("/order/assign", () => ok(true));
on("/order/cancel", () => ok(true));
on("/order/paid", () => ok(true));
on("/order/update", () => ok(true));

on("/coupon/fetch", (ctx) => {
  const { rows, total } = paginate(COUPONS, ctx);
  return pageEnvelope(rows, total);
});
on("/coupon/generate", () => ok(true));
on("/coupon/drop", () => ok(true));
on("/coupon/update", () => ok(true));

/* --- users / tickets / traffic reset -------------------------------- */
/* Legacy no-action aliases (older admin clients). */
on("/user/manage", (ctx) => {
  const { rows, total } = paginate(USERS, ctx);
  return pageEnvelope(rows, total);
});
on("/user/ticket", (ctx) => {
  const { rows, total } = paginate(TICKETS, ctx);
  return pageEnvelope(rows, total);
});

on("/user/fetch", (ctx) => {
  const { rows, total } = paginate(USERS, ctx);
  return pageEnvelope(rows, total);
});
on("/user/update", () => ok(true));
on("/user/ban", () => ok(true));
on("/user/destroy", () => ok(true));
on("/user/resetSecret", () => ok(true));
on("/user/sendMail", () => ok(true));
on("/user/dumpCSV", () => ok("id,email\n1,alice@example.com\n2,bob@example.com\n"));

on("/ticket/fetch", (ctx) => {
  const id = Number(ctx.url.searchParams.get("id"));
  if (id) {
    const ticket = TICKETS.find((row) => row.id === id) ?? TICKETS[0];
    return ok({ ...ticket, messages: ticketMessages(ticket) });
  }
  const { rows, total } = paginate(TICKETS, ctx);
  return pageEnvelope(rows, total);
});
on("/ticket/close", () => ok(true));
on("/ticket/reply", () => ok(true));

on("/traffic-reset/logs", (ctx) => {
  const { rows, total } = paginate(TRAFFIC_LOGS, ctx);
  return pageEnvelope(rows, total);
});
on("/traffic-reset/reset-user", () => ok(true));

/* --- theme ---------------------------------------------------------- */
on("/theme/getThemes", () => ok({ themes: THEMES, active: THEME_ACTIVE }));
on("/theme/getThemeConfig", (ctx) => {
  const name = String(ctx.body?.name ?? THEME_ACTIVE);
  return ok(THEME_CONFIGS[name] ?? THEME_CONFIGS.xboard);
});
on("/theme/saveThemeConfig", () => ok(true));
on("/theme/delete", () => ok(true));
on("/theme/upload", () => ok(true));

/* --- plugin --------------------------------------------------------- */
on("/plugin/types", () => ok(PLUGIN_TYPES));
on("/plugin/getPlugins", () => ok(PLUGINS));
on("/plugin/config", (ctx) => {
  if (ctx.method === "POST") return ok(true);
  return ok(PLUGIN_CONFIG);
});
on("/plugin/install", () => ok(true));
on("/plugin/upgrade", () => ok(true));
on("/plugin/uninstall", () => ok(true));
on("/plugin/enable", () => ok(true));
on("/plugin/disable", () => ok(true));
on("/plugin/delete", () => ok(true));
on("/plugin/upload", () => ok(true));

/* --- gift card ------------------------------------------------------ */
on("/gift-card/templates", (ctx) => {
  const { rows, total } = paginate(GIFT_TEMPLATES, ctx);
  return pageEnvelope(rows, total);
});
on("/gift-card/codes", (ctx) => {
  const { rows, total } = paginate(GIFT_CODES, ctx);
  return pageEnvelope(rows, total);
});
on("/gift-card/usages", (ctx) => {
  const { rows, total } = paginate(GIFT_USAGES, ctx);
  return pageEnvelope(rows, total);
});
on("/gift-card/statistics", () =>
  ok({
    total_stats: { templates_count: 4, active_templates_count: 3, codes_count: 300, used_codes_count: 159, usages_count: 168 },
    daily_usages: [
      { date: "2024-06-01", count: 12 },
      { date: "2024-06-02", count: 18 },
      { date: "2024-06-03", count: 9 },
      { date: "2024-06-04", count: 21 },
      { date: "2024-06-05", count: 16 },
      { date: "2024-06-06", count: 24 },
      { date: "2024-06-07", count: 19 },
    ],
    type_stats: [
      { template_id: 1, template_name: "新人礼包", count: 86 },
      { template_id: 2, template_name: "流量加油包", count: 51 },
      { template_id: 3, template_name: "节日折扣券", count: 22 },
      { template_id: 4, template_name: "邀请奖励", count: 0 },
    ],
  }),
);
on("/gift-card/create-template", () => ok(true));
on("/gift-card/update-template", () => ok(true));
on("/gift-card/delete-template", () => ok(true));
on("/gift-card/generate-codes", () => ok(["XB-GIFT-101", "XB-GIFT-102", "XB-GIFT-103"]));
on("/gift-card/toggle-code", () => ok(true));

/* ------------------------------------------------------------------ *
 * HTTP plumbing
 * ------------------------------------------------------------------ */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...headers, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

function sendJson(res, body, status = 200, extra = {}) {
  send(res, status, JSON.stringify(body, null, 2), { ...jsonHeaders, ...extra });
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) throw new Error("request body too large");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  const type = String(req.headers["content-type"] || "");
  if (type.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (type.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return {};
}

/** /api/v2/admin/... and /api/v2/REPLACE_ME/... both normalize to /.... */
function normalizeApiPath(pathname) {
  let p = pathname;
  if (p === "/api/v2") p = "/";
  else if (p.startsWith("/api/v2/")) p = p.slice("/api/v2".length);
  const segments = p.split("/").filter(Boolean);
  if (segments.length > 0 && (segments[0] === "admin" || segments[0] === "REPLACE_ME")) segments.shift();
  return "/" + segments.join("/");
}

async function serveStatic(req, res, url, prefix, root) {
  let relative;
  try {
    relative = decodeURIComponent(url.pathname.slice(prefix.length));
  } catch {
    return send(res, 400, "bad path");
  }
  if (relative === "") return redirect(res, `${prefix}/`);
  relative = relative.replace(/^\/+/, "");
  let absolute = path.resolve(root, relative);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (absolute !== root && !absolute.startsWith(rootWithSep)) return send(res, 403, "forbidden");

  let info;
  try {
    info = await stat(absolute);
  } catch {
    return send(res, 404, `not found: ${url.pathname}`, { "Content-Type": "text/plain; charset=utf-8" });
  }
  if (info.isDirectory()) {
    absolute = path.join(absolute, "index.html");
    try {
      info = await stat(absolute);
    } catch {
      return send(res, 404, `not found: ${url.pathname}`, { "Content-Type": "text/plain; charset=utf-8" });
    }
  }
  const type = MIME[path.extname(absolute).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": info.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(absolute).pipe(res);
}

const FAVICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2563eb"/><path d="M9 22 15 9h2l6 13h-3l-1.4-3.2h-5.2L12 22Zm5.4-5.8h3.2L16 12.4Z" fill="#fff"/></svg>\n';
/** 1x1 transparent PNG, so the original index.html's favicon.png link does not 404. */
const FAVICON_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function seedPage(query) {
  const app = query.get("app") === "app" ? "app" : "orig";
  const lang = ["zh-CN", "en-US", "ru-RU"].includes(query.get("lang") ?? "") ? query.get("lang") : "zh-CN";
  let to = query.get("to") ?? "/";
  if (!to.startsWith("/") || to.startsWith("//")) to = "/";
  const target = `/${app}/index.html#${to}`;
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><title>seed</title></head>
<body>
<p>seeding localStorage and redirecting to <a href="${target}">${target}</a>…</p>
<script>
/* Original storage util upper-cases its "Xboard_" prefix and JSON-wraps the value. */
localStorage.setItem("XBOARD_ACCESS_TOKEN", JSON.stringify({ value: "Bearer test-token", time: 0, expire: null }));
/* Rebuild reads the raw key/value pair. */
localStorage.setItem("Xboard_access_token", "Bearer test-token");
localStorage.setItem("i18nextLng", ${JSON.stringify(lang)});
location.replace(${JSON.stringify(target)});
</script>
</body></html>
`;
}

export async function startServer(options = {}) {
  const port = options.port ?? PORT;
  const host = options.host ?? HOST;

  const server = http.createServer(async (req, res) => {
    const startedAt = Date.now();
    let url;
    try {
      url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${PUBLIC_HOST}:${port}`}`);
    } catch {
      return send(res, 400, "bad request");
    }

    try {
      /* --- fixture globals ----------------------------------------- */
      if (url.pathname === "/settings.js") {
        return send(
          res,
          200,
          'window.settings = {base_url:"/", title:"Xboard", version:"1.0.0", logo:"", secure_path:"admin"};\n',
          { "Content-Type": "text/javascript; charset=utf-8" },
        );
      }
      if (url.pathname === "/settings.local.js") {
        return send(res, 200, "window.settings_local = {};\n", { "Content-Type": "text/javascript; charset=utf-8" });
      }
      if (url.pathname === "/images/favicon.svg" || url.pathname === "/favicon.svg") {
        return send(res, 200, FAVICON_SVG, { "Content-Type": "image/svg+xml" });
      }
      if (url.pathname === "/images/favicon.png" || url.pathname === "/favicon.png") {
        return send(res, 200, FAVICON_PNG, { "Content-Type": "image/png" });
      }
      if (url.pathname === "/__health") {
        return sendJson(res, { ok: true, port, orig: "/orig/index.html", app: "/app/" });
      }
      if (url.pathname === "/__fixtures") {
        return sendJson(res, {
          apiBase: "/api/v2/admin",
          port,
          staticRoots: { orig: ORIG_ROOT, app: APP_ROOT },
          routes: [...ROUTES.keys()].sort(),
        });
      }
      if (url.pathname === "/seed.html") {
        return send(res, 200, seedPage(url.searchParams), { "Content-Type": "text/html; charset=utf-8" });
      }

      /* --- API ------------------------------------------------------ */
      if (url.pathname === "/api/v2" || url.pathname.startsWith("/api/v2/")) {
        const apiPath = normalizeApiPath(url.pathname);
        const handler = ROUTES.get(apiPath);
        if (!handler) {
          console.warn(`[mock-api] MISS ${req.method} ${apiPath}`);
          return sendJson(
            res,
            { status: "fail", message: `no fixture for ${req.method} ${apiPath}`, data: null },
            200,
            { "X-Fixture": "miss" },
          );
        }
        const ctx = {
          req,
          res,
          url,
          method: req.method ?? "GET",
          body: req.method === "GET" || req.method === "HEAD" ? {} : await readBody(req),
        };
        const body = await handler(ctx);
        if (res.writableEnded) return;
        return sendJson(res, body, 200, { "X-Fixture": "hit" });
      }

      /* --- static apps --------------------------------------------- */
      if (url.pathname === "/orig") return redirect(res, "/orig/");
      if (url.pathname.startsWith("/orig/")) return serveStatic(req, res, url, "/orig", ORIG_ROOT);
      if (url.pathname === "/app") return redirect(res, "/app/");
      if (url.pathname.startsWith("/app/")) return serveStatic(req, res, url, "/app", APP_ROOT);
      if (url.pathname === "/") {
        return send(
          res,
          200,
          "<!doctype html><meta charset=utf-8><title>Xboard visual regression</title>" +
            "<h1>Xboard visual regression harness</h1><ul>" +
            '<li><a href="/orig/index.html">/orig/index.html</a> — original dist</li>' +
            '<li><a href="/app/">/app/</a> — rebuild</li>' +
            '<li><a href="/__fixtures">/__fixtures</a> — fixture coverage</li>' +
            '<li><a href="/seed.html?app=orig&to=/dashboard">/seed.html?app=orig&amp;to=/dashboard</a> — seed auth + redirect</li>' +
            "</ul>",
          { "Content-Type": "text/html; charset=utf-8" },
        );
      }
      return send(res, 404, `not found: ${url.pathname}`, { "Content-Type": "text/plain; charset=utf-8" });
    } catch (error) {
      console.error(`[mock-api] ERROR ${req.method} ${url.pathname}:`, error);
      return sendJson(res, { status: "fail", message: "fixture server error", data: null }, 200, { "X-Fixture": "error" });
    } finally {
      const ms = Date.now() - startedAt;
      if (url.pathname.startsWith("/api/")) {
        console.log(`[mock-api] ${req.method} ${url.pathname}${url.search} (${ms}ms)`);
      }
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });

  return {
    server,
    port,
    url: `http://${PUBLIC_HOST}:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const instance = await startServer();
  console.log("");
  console.log("  Xboard visual-regression fixture server");
  console.log("  ---------------------------------------");
  console.log(`  listening : http://${PUBLIC_HOST}:${instance.port}  (bind ${HOST})`);
  console.log(`  original  : http://${PUBLIC_HOST}:${instance.port}/orig/index.html   ← ${ORIG_ROOT}`);
  console.log(`  rebuild   : http://${PUBLIC_HOST}:${instance.port}/app/              ← ${APP_ROOT}`);
  console.log(`  fixtures  : http://${PUBLIC_HOST}:${instance.port}/__fixtures`);
  console.log(`  seed auth : http://${PUBLIC_HOST}:${instance.port}/seed.html?app=orig&to=/config/notice`);
  console.log("");
  const shutdown = async () => {
    await instance.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
