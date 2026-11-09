import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * 服务端内部调用地址（rewrites 目的地）。
 * 线上请设 API_INTERNAL_URL=http://127.0.0.1:4000/api，避免 Nginx → Next → 公网域名 → 再回来的环路。
 * 未设置时退回公开地址，本地开发行为不变。
 */
const API_INTERNAL = process.env.API_INTERNAL_URL ?? API_BASE;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 后端 API 地址（服务端渲染 / 代理用）
  env: {
    NEXT_PUBLIC_API_BASE_URL: API_BASE,
  },
  // 同源代理：浏览器端 fetch("/backend/...") → API，让 HttpOnly 会话 Cookie
  // 在 3000 与 4000 之间无缝共享，避免跨域 + CORS 凭证问题。
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_INTERNAL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
