/**
 * 后端接口客户端（仅服务端调用，前端不直连数据库）
 * 统一响应结构：{ success: true, data, meta? }
 * 统一错误结构：{ success: false, error: { code, message, ... } }
 */

/** 浏览器可见的 API 根地址（也用于拼图片绝对路径，见 assetUrl） */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * 服务端内部调用地址：线上指向 127.0.0.1:4000，避免绕公网域名一圈。
 * 客户端 bundle 里该变量为 undefined，会自动退回 API_BASE_URL。
 */
const SERVER_API_BASE = process.env.API_INTERNAL_URL ?? API_BASE_URL;

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export type ApiEnvelope<T> =
  | { success: true; data: T; meta?: ApiMeta }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
        path?: string;
        timestamp?: string;
      };
    };

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<Extract<ApiEnvelope<T>, { success: true }>> {
  const { revalidate, ...rest } = init ?? {};
  const response = await fetch(`${SERVER_API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    next: revalidate !== undefined ? { revalidate } : { revalidate: 0 },
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!payload.success) {
    throw new ApiError(payload.error.code, payload.error.message, response.status);
  }
  return payload;
}

export async function apiGet<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  const payload = await request<T>(path, init);
  return payload.data;
}

/** 带降级的读取：接口不可用时返回 fallback，页面不白屏 */
export async function apiGetSafe<T>(
  path: string,
  fallback: T,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  try {
    return await apiGet<T>(path, init);
  } catch {
    return fallback;
  }
}

/**
 * 浏览器端客户端：走同源代理 /backend，让 HttpOnly 会话 Cookie 自动带上。
 * 与上面服务端 fetch 的区别是 credentials: "include" + 无 next.revalidate。
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/backend${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!payload.success) {
    throw new ApiError(payload.error.code, payload.error.message, response.status);
  }
  return payload.data;
}
