import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Copy, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { LangSwitch, ThemeSwitch } from "@/components/layout/header-widgets";
import { http } from "@/lib/http";

/**
 * 原件：`Jst`（offset 5,059,850，登录页外壳）+ `g8e`（登录表单）+ `Qst`（右上角语言切换）。
 *
 * 已还原的行为：
 *  - 登录：POST /passport/auth/login {email,password} -> body.data.auth_data（"Bearer <token>"）
 *    写入 localStorage["Xboard_access_token"]（原件 Mf.set("access_token", v, 259200)，前缀 Xboard_，3 天 TTL），
 *    随后跳转 redirect 参数或 "/"。
 *  - 右上角语言切换（原件 Qst = 语言下拉，仅按钮形态）。
 *  - 忘记密码：原件弹窗展示 `signIn.resetPassword.command`（php artisan 重置命令）并带复制按钮。
 *    本实现保留该说明，并按后端契约补充 /passport/auth/forget 自助重置（email + email_code + password，
 *    见 app/Http/Requests/Passport/AuthForget.php）与 /passport/comm/sendEmailVerify 验证码发送。
 *  - GET /guest/comm/config（app/Http/Routes/V1/GuestRoute.php:24 -> CommController::config）拉取
 *    is_email_verify / is_captcha / captcha_type / *_site_key，条件渲染验证码与邮箱验证码区块。
 */

import { setToken } from "@/lib/http";

/** 后端统一响应信封（app/Helpers/ApiResponse.php::jsonResponse） */
interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

interface LoginData {
  auth_data: string;
  is_admin?: boolean;
  token?: string;
}

interface GuestCommConfig {
  is_email_verify?: number;
  is_captcha?: number;
  captcha_type?: string;
  recaptcha_site_key?: string | null;
  recaptcha_v3_site_key?: string | null;
  turnstile_site_key?: string | null;
}

/** 从 hash 路由的查询串里取出 redirect（原件 Bf 鉴权守卫写的就是 ?redirect=<encoded path>） */
function readRedirect(): string {
  const hash = window.location.hash.replace(/^#/, "");
  const queryIndex = hash.indexOf("?");
  if (queryIndex < 0) return "/";
  const target = new URLSearchParams(hash.slice(queryIndex + 1)).get("redirect");
  if (!target) return "/";
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

/** window.settings 在 global.d.ts 里只声明了 5 个字段；登录页标题/描述走宽松读取 */
function readSettings(): { title?: string; description?: string } {
  return (window.settings as { title?: string; description?: string } | undefined) ?? {};
}

export default function SignIn() {
  const { t } = useTranslation(["auth", "common"]);
  const navigate = useNavigate();
  const settings = readSettings();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [commConfig, setCommConfig] = React.useState<GuestCommConfig | null>(null);
  const [forgotOpen, setForgotOpen] = React.useState(false);

  // GET /guest/comm/config —— 公共接口（lib/http.ts PUBLIC 白名单内）
  React.useEffect(() => {
    let alive = true;
    http
      .get("/guest/comm/config")
      .then((res) => {
        if (!alive) return;
        const body = res.data as ApiEnvelope<GuestCommConfig>;
        setCommConfig(body.data ?? null);
      })
      .catch(() => {
        if (alive) setCommConfig(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email) {
      setError(t("signIn.validation.emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("signIn.validation.emailInvalid"));
      return;
    }
    if (!password) {
      setError(t("signIn.validation.passwordRequired"));
      return;
    }
    if (password.length < 7) {
      setError(t("signIn.validation.passwordLength"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await http.post("/passport/auth/login", { email, password });
      const body = res.data as ApiEnvelope<LoginData>;
      const authData = body.data?.auth_data;
      if (!authData) throw new Error(body.message ?? t("common:http.unknownError"));
      setToken(authData);
      navigate(readRedirect(), { replace: true });
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? (err instanceof Error ? err.message : t("common:http.unknownError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="container relative flex min-h-svh flex-col items-center justify-center bg-primary-foreground px-4 py-8 lg:max-w-none lg:px-0">
        <div className="absolute right-4 top-4 flex items-center gap-2 md:right-8 md:top-8">
          <LangSwitch />
          <ThemeSwitch />
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[420px] lg:p-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">{settings.title ?? "Xboard"}</h1>
            <p className="text-sm text-muted-foreground">{settings.description ?? ""}</p>
          </div>
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("signIn.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("signIn.description")}</p>
            </div>
            <CardContent className="p-0 pt-6">
              <form onSubmit={onSubmit} className="space-y-4">
                {error && <div className="text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="sign-in-email">{t("signIn.email")}</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="sign-in-email"
                      className="pl-9"
                      type="email"
                      autoComplete="email"
                      placeholder={t("signIn.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sign-in-password">{t("signIn.password")}</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="sign-in-password"
                      className="pl-9"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("signIn.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm font-normal text-muted-foreground hover:text-primary"
                    onClick={() => setForgotOpen(true)}
                  >
                    {t("signIn.forgotPassword")}
                  </Button>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("signIn.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} config={commConfig} />
    </>
  );
}

/** 忘记密码对话框：原件为"命令行重置"说明；此处按后端 /passport/auth/forget 契约补齐自助重置 */
function ForgotPasswordDialog({
  open,
  onOpenChange,
  config,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: GuestCommConfig | null;
}) {
  const { t } = useTranslation(["auth", "common"]);
  const command = t("signIn.resetPassword.command");

  const [email, setEmail] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [captchaToken, setCaptchaToken] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const isEmailVerify = (config?.is_email_verify ?? 0) === 1;
  const isCaptcha = (config?.is_captcha ?? 0) === 1;
  const captchaType = config?.captcha_type ?? "recaptcha";
  const captchaSiteKey =
    captchaType === "turnstile"
      ? config?.turnstile_site_key
      : captchaType === "recaptcha_v3"
        ? config?.recaptcha_v3_site_key
        : config?.recaptcha_site_key;

  async function sendEmailCode() {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    try {
      await http.post("/passport/comm/sendEmailVerify", { email, ...(isCaptcha ? { recaptcha: captchaToken } : {}) });
      toast.success(t("common:success"));
      setCooldown(60);
    } catch {
      toast.error(t("common:error"));
    } finally {
      setSending(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await http.post("/passport/auth/forget", {
        email,
        email_code: emailCode,
        password,
        ...(isCaptcha ? { recaptcha: captchaToken } : {}),
      });
      toast.success(t("common:success"));
      onOpenChange(false);
      setEmail("");
      setEmailCode("");
      setPassword("");
      setCaptchaToken("");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message ?? t("common:error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("signIn.resetPassword.title")}</DialogTitle>
          <DialogDescription>{t("signIn.resetPassword.description")}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <pre className="max-w-full overflow-x-auto rounded-md bg-secondary p-4 pr-12 text-sm">{command}</pre>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 hover:bg-secondary-foreground/10"
            aria-label={t("common:copy.success")}
            onClick={() => {
              void navigator.clipboard
                ?.writeText(command)
                .then(() => toast.success(t("common:copy.success")))
                .catch(() => toast.error(t("common:copy.failed")));
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t("signIn.email")}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder={t("signIn.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isEmailVerify && (
            <div className="space-y-2">
              <Label htmlFor="forgot-code">邮箱验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="forgot-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                />
                <Button type="button" variant="outline" disabled={sending || cooldown > 0} onClick={sendEmailCode}>
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {cooldown > 0 ? `${cooldown}s` : "发送验证码"}
                </Button>
              </div>
            </div>
          )}

          {isCaptcha && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="h-4 w-4" />
                人机验证（{captchaType}）
              </div>
              <p className="text-xs text-muted-foreground">
                {captchaSiteKey ? `站点密钥：${captchaSiteKey}` : "站点未配置密钥"}
              </p>
              <Input
                placeholder="请粘贴人机验证 token"
                value={captchaToken}
                onChange={(e) => setCaptchaToken(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="forgot-password">新密码</Label>
            <Input
              id="forgot-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common:cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !email || !password || (isEmailVerify && emailCode.length !== 6)}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common:submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
