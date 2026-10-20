import axios from "axios";

/**
 * 复刻原件的存储与请求层。
 *
 * 原件存储工具（bundle 内 `class If`，offset ~535,4xx）：
 *   getKey(e) = `${prefixKey}${e}`.toUpperCase()   → 前缀 "Xboard_" + "access_token" = XBOARD_ACCESS_TOKEN
 *   set(e,t,n) = localStorage[key] = JSON.stringify({ value: t, time: Date.now(), expire: n ? now+n*1000 : null })
 * 登录响应 `auth_data` 形如 "Bearer <sanctum token>"，写入 TTL = 259200 秒（3 天）。
 */
const PREFIX = "Xboard_";
const KEY = "access_token";
const storageKey = `${PREFIX}${KEY}`.toUpperCase();
const DEFAULT_TTL_SECONDS = 259200;

interface StoredValue {
  value: string | null;
  time: number;
}

function readStorage(): StoredValue {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { value: null, time: 0 };
  try {
    const parsed = JSON.parse(raw) as { value?: string | null; time?: number; expire?: number | null };
    if (parsed.expire === null || parsed.expire === undefined || parsed.expire > Date.now()) {
      return { value: parsed.value ?? null, time: parsed.time ?? 0 };
    }
    localStorage.removeItem(storageKey);
    return { value: null, time: 0 };
  } catch {
    localStorage.removeItem(storageKey);
    return { value: null, time: 0 };
  }
}

/** 读取 token（过期自清，返回 null） */
export const getToken = (): string | null => readStorage().value;

/** 写入 token，默认 3 天，与原件 `Mf.set("access_token", v, 259200)` 一致 */
export function setToken(value: string, ttlSeconds: number | null = DEFAULT_TTL_SECONDS): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      value,
      time: Date.now(),
      expire: ttlSeconds === null ? null : Date.now() + ttlSeconds * 1000,
    }),
  );
}

export const clearToken = (): void => localStorage.removeItem(storageKey);

const PUBLIC = [
  "/passport/auth/login",
  "/passport/auth/token2Login",
  "/passport/auth/register",
  "/guest/comm/config",
  "/passport/comm/sendEmailVerify",
  "/passport/auth/forget",
];

/** 复刻原件 wE()：未登录跳 `${basePath}#/sign-in?redirect=<当前 hash>` */
export const toSignIn = () => {
  const p = window.location.pathname.split("/")[1];
  const base = p ? `/${p}` : "";
  const redirect =
    window.location.pathname !== "/404" && !["/sign-in"].includes(window.location.pathname)
      ? `?redirect=${encodeURIComponent(window.location.hash.slice(1))}`
      : "";
  window.location.href = `${base}#/sign-in${redirect}`;
};

const base = window.settings?.base_url || "/";

export const http = axios.create({
  baseURL: base.endsWith("/") ? `${base}api/v2` : `${base}/api/v2`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((cfg) => {
  if (!PUBLIC.includes(cfg.url?.split("?")[0] || "")) {
    const token = getToken();
    if (!token) {
      toSignIn();
      return Promise.reject({ code: -1, message: "not logged in" });
    }
    cfg.headers.Authorization = token;
  }
  cfg.headers["Content-Language"] = localStorage.getItem("i18nextLng") || "zh-CN";
  return cfg;
});

http.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401 || e?.response?.status === 403) toSignIn();
    return Promise.reject(e);
  },
);
