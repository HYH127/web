import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * 服务端内部调用地址（rewrites 目的地）。
 * 线上请设 API_INTERNAL_URL=http://127.0.0.1:4000/api，避免 Nginx → Next → 公网域名 → 再回来的环路。
 * 未设置时退回公开地址，本地开发行为不变。
 */
const API_INTERNAL = process.env.API_INTERNAL_URL ?? API_BASE;

/**
 * 内容安全策略。
 *
 * `script-src` 必须带 'unsafe-inline'：Next App Router 会在 HTML 里内联
 * `self.__next_f.push(...)` 这类流式数据脚本，没有它整页白屏。代价是挡不住
 * 「内联注入」，但仍能挡住外部域脚本加载、eval、以及 XSS 后的数据外带——
 * 这三项才是实际被利用的路径。后续要更严，可改用 middleware 下发 nonce。
 *
 * 其余按「只允许本站」收紧：站点所有图片、字体、样式都已自托管，
 * 没有任何外部 CDN 依赖，所以不需要放行任何第三方域。
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // 防点击劫持：站点不允许被任何页面嵌套（与 X-Frame-Options 双保险）
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // 一年 + 子域，配合 certbot 的 301 跳转，杜绝降级到明文
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // 不让浏览器猜类型：上传目录若被塞入伪装文件，也不会被当 HTML 执行
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 这些能力站点一个都不用，直接声明关掉，避免被第三方脚本利用
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 不再对外宣告技术栈与版本
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // 上传的图片是用户侧可达的资源，额外禁止被当作文档解析
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'none'; img-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
