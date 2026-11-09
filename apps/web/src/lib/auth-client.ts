/**
 * 浏览器端认证客户端：封装登录 / 注册 / 验证码 / 会话，统一错误映射。
 * 所有请求走 /backend 同源代理，HttpOnly 会话 Cookie 由浏览器自动携带。
 */
import { ApiError, apiFetch } from "./api";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: string;
}

/** 把后端错误码映射成前端可直接展示的中文提示（兜底用原始 message） */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const byCode: Record<string, string> = {
      EMAIL_TAKEN: "该邮箱已注册，可直接登录。",
      EMAIL_DOMAIN_NOT_ALLOWED: "请使用公司邮箱注册，临时邮箱无法接收报价与单证。",
      WEAK_PASSWORD: error.message,
      INVALID_CREDENTIALS: "邮箱或密码不正确。",
      ACCOUNT_LOCKED: error.message,
      EMAIL_NOT_VERIFIED: "邮箱还未验证，请先完成验证码验证。",
      CODE_INVALID: error.message,
      CODE_EXPIRED: error.message,
      CODE_ATTEMPTS_EXCEEDED: error.message,
      CODE_RATE_LIMITED: error.message,
      RESEND_TOO_SOON: error.message,
      SESSION_EXPIRED: "登录已过期，请重新登录。",
      SESSION_REVOKED: "账号已在其他设备修改密码，请重新登录。",
    };
    if (byCode[error.code]) return byCode[error.code];
    if (error.status === 429) return "操作太频繁，请稍后再试。";
    return error.message;
  }
  return "网络异常，请稍后重试。";
}

export interface RegisterInput {
  name: string;
  company?: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  website?: string;
  formStartedAt: number;
}

export interface RegisterResult {
  email: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  devCode?: string;
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  return apiFetch<RegisterResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resendVerification(email: string): Promise<RegisterResult> {
  return apiFetch<RegisterResult>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmail(
  email: string,
  code: string,
  rememberMe: boolean,
): Promise<SessionPayload> {
  return apiFetch<SessionPayload>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code, rememberMe }),
  });
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<SessionPayload> {
  return apiFetch<SessionPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* 即使后端失败也继续，前端状态照常清除 */
  }
}

export async function fetchMe(): Promise<SessionUser | null> {
  try {
    return await apiFetch<SessionUser>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    return null;
  }
}
