"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  authErrorMessage,
  login,
  register,
  resendVerification,
  verifyEmail,
} from "@/lib/auth-client";

/**
 * 登录 / 注册（真实接入后端）
 *
 * - 登录：POST /auth/login，成功后建立 HttpOnly 会话 Cookie，跳用户中心。
 * - 注册：两步。第一步提交资料（含蜜罐 + 填写时长），后端下发 6 位验证码；
 *   第二步输入验证码完成验证并建立会话。
 * - 后端统一错误码经 authErrorMessage 映射成中文提示。
 */

function useFormStartedAt() {
  const startedAt = useRef(Date.now());
  return startedAt.current;
}

function passwordScore(password: string): { score: number; label: string; tone: string } {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  const clamped = Math.min(4, score);
  const labels = ["", "弱", "一般", "良好", "强"];
  const tones = ["", "text-red-600", "text-amber-600", "text-lumen-700", "text-emerald-700"];
  return { score: clamped, label: labels[clamped], tone: tones[clamped] };
}

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const rememberMe = data.get("remember") === "on";

    if (!email || !password) {
      setError("邮箱和密码都要填。");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await login(email, password, rememberMe);
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
      setPending(false);
    }
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
      <Field label="邮箱" name="email" type="email" autoComplete="email" />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="current-password"
      />
      <label className="flex items-center gap-2 text-small text-ink-500">
        <input
          type="checkbox"
          name="remember"
          className="h-4 w-4 rounded-sm border-line-strong accent-champagne-600"
        />
        30 天内保持登录
      </label>
      {error ? (
        <p role="alert" className="text-small text-red-600">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        登录
      </Button>
      <p className="text-center text-micro text-ink-400">
        连续输错 5 次会临时锁定 15 分钟。
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const formStartedAt = useFormStartedAt();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [password, setPassword] = useState("");
  const [countdown, setCountdown] = useState(0);

  const score = useMemo(() => passwordScore(password), [password]);

  // 验证码 60 秒重发倒计时
  const tick = () => {
    setCountdown((value) => {
      if (value <= 1) return 0;
      window.setTimeout(tick, 1000);
      return value - 1;
    });
  };

  const submitStepOne = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const emailValue = String(data.get("email") ?? "").trim();
    const passwordValue = String(data.get("password") ?? "");
    const acceptTerms = data.get("terms") === "on";

    if (!name || !emailValue || !passwordValue) {
      setError("姓名、邮箱和密码都要填。");
      return;
    }
    if (!acceptTerms) {
      setError("请先同意隐私与联系条款。");
      return;
    }
    setError(null);
    setPending(true);
    setEmail(emailValue);
    try {
      const result = await register({
        name,
        company: company || undefined,
        email: emailValue,
        password: passwordValue,
        acceptTerms,
        website: "",
        formStartedAt,
      });
      setStep("verify");
      setResendAfter(result.resendAfterSeconds);
      setCountdown(result.resendAfterSeconds);
      window.setTimeout(tick, 1000);
      if (result.devCode) {
        setHint(`开发环境：验证码 ${result.devCode}`);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const submitVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      setError("验证码是 6 位数字。");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await verifyEmail(email, code, true);
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    try {
      const result = await resendVerification(email);
      setResendAfter(result.resendAfterSeconds);
      setCountdown(result.resendAfterSeconds);
      window.setTimeout(tick, 1000);
      if (result.devCode) setHint(`开发环境：验证码 ${result.devCode}`);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  if (step === "verify") {
    return (
      <form className="mt-8 space-y-5" onSubmit={submitVerify} noValidate>
        <div className="rounded-sm border border-lumen-500/30 bg-lumen-300/20 p-4 text-small text-ink-700">
          验证码已发送到 <span className="font-medium text-ink-900">{email}</span>
          ，10 分钟内有效。请勿透露给他人。
        </div>
        <Field
          label="邮箱验证码"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 位数字"
          maxLength={6}
        />
        {hint ? (
          <p className="flex items-center gap-1.5 text-small text-lumen-700">
            <ShieldCheck className="h-4 w-4" />
            {hint}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-small text-red-600">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          验证并登录
        </Button>
        <div className="flex items-center justify-between text-small">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className="text-lumen-600 hover:text-lumen-700 disabled:cursor-not-allowed disabled:text-ink-300"
          >
            {countdown > 0 ? `${countdown} 秒后可重发` : "重新发送验证码"}
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="text-ink-400 hover:text-ink-700"
          >
            返回修改资料
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={submitStepOne} noValidate>
      <Field label="姓名" name="name" autoComplete="name" />
      <Field label="公司" name="company" autoComplete="organization" />
      <Field label="邮箱" name="email" type="email" autoComplete="email" />
      <div>
        <Field
          label="密码"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="至少 10 位，需包含字母、数字、符号中的两类。"
        />
        {password ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={
                    "h-1 w-6 rounded-full " +
                    (level <= score.score
                      ? score.score >= 3
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                      : "bg-line-strong")
                  }
                />
              ))}
            </div>
            <span className={`text-micro ${score.tone}`}>{score.label}</span>
          </div>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-small text-ink-500">
        <input
          type="checkbox"
          name="terms"
          className="mt-0.5 h-4 w-4 rounded-sm border-line-strong accent-champagne-600"
        />
        同意仅为业务沟通使用我的联系方式，不用于群发营销。
      </label>

      {/* 蜜罐字段：真实用户不可见，机器人会填 */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error ? (
        <p role="alert" className="text-small text-red-600">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        创建账号
      </Button>
    </form>
  );
}
