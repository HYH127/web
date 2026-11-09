import type { ReactElement } from "react";
import { social } from "@/lib/messages";
import { cn } from "@/lib/utils";

/**
 * 官方品牌图标：统一为「圆角方块 + 白色图形」。
 *
 * 所有图形都取自官方 SVG 的原始路径，再按各自原始坐标系精确换算到统一的
 * 24×24 画布，并统一光学尺寸（白色图形外接盒 ≈ 14.4 单位 / 画布的 60%，
 * 中心严格落在 12,12），保证五个图标在同一排里大小一致、边缘齐平。
 */

/**
 * YouTube：红色圆角方块 + 白色播放键。
 *
 * 关键：外框与三角必须写在**同一个 path** 里并配 evenodd —— 三角是同向子路径，
 * evenodd 会把它挖成镂空孔洞，露出底色红。若拆成两个独立 path，白色三角叠在
 * 白色外框上会被完全遮住，只剩一块白色圆角矩形。
 * 路径取自官方 iconfinder 版本（72 网格），等比缩放后居中于 24 画布。
 */
function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <rect width="24" height="24" rx="5.6" fill="#FF0002" />
      <path
        transform="translate(0,0) scale(0.3333)"
        fill="#fff"
        fillRule="evenodd"
        d="M31.044 42.269916L31.0425 28.6877416L44.0115 35.5022437L31.044 42.269916ZM59.52 26.3341627C59.52 26.3341627 59.0505 23.003199 57.612 21.5363665C55.7865 19.610299 53.7405 19.6012352 52.803 19.4894477C46.086 19 36.0105 19 36.0105 19L35.9895 19C35.9895 19 25.914 19 19.197 19.4894477C18.258 19.6012352 16.2135 19.610299 14.3865 21.5363665C12.948 23.003199 12.48 26.3341627 12.48 26.3341627C12.48 26.3341627 12 30.2467232 12 34.1577731L12 37.8256098C12 41.7381703 12.48 45.6492202 12.48 45.6492202C12.48 45.6492202 12.948 48.9801839 14.3865 50.4470165C16.2135 52.3730839 18.612 52.3126583 19.68 52.5135736C23.52 52.8851913 36 53 36 53C36 53 46.086 52.9848936 52.803 52.4954459C53.7405 52.3821478 55.7865 52.3730839 57.612 50.4470165C59.0505 48.9801839 59.52 45.6492202 59.52 45.6492202C59.52 45.6492202 60 41.7381703 60 37.8256098L60 34.1577731C60 30.2467232 59.52 26.3341627 59.52 26.3341627Z"
      />
    </svg>
  );
}

/** TikTok：黑色圆角方块 + 白色音符（官方原始路径，等比缩放居中） */
function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <rect width="24" height="24" rx="5.6" fill="#000" />
      <path
        transform="translate(4.8,4.8) scale(0.45)"
        fill="#fff"
        d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z"
      />
    </svg>
  );
}

/** Facebook：蓝色圆角方块 + 白色 f（官方原始路径，等比缩放居中） */
function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <rect width="24" height="24" rx="5.6" fill="#3B5999" />
      <path
        transform="translate(0,0) scale(0.093)"
        fill="#fff"
        d="M84 106l27 0 0-5c0-8-1-18 0-26 1-19 11-31 37-32l26 1 0 28c-11 0-30-4-32 10l0 24 30 0-3 31-27 0 0 78-31 0 0-78-27-1 0-30z"
      />
    </svg>
  );
}

/** Instagram：橙紫渐变圆角方块 + 白色相机 + 白圆点 */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <defs>
        <radialGradient
          id="ig-grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(27.933,0,0,27.933,2,21.5)"
        >
          <stop offset="0" stopColor="#ff8100" />
          <stop offset="0.19" stopColor="#ff7209" />
          <stop offset="0.32" stopColor="#f55e16" />
          <stop offset="0.48" stopColor="#d92938" />
          <stop offset="1" stopColor="#9100ff" />
        </radialGradient>
      </defs>
      {/* 渐变底：铺满整个画布 */}
      <path
        transform="translate(-2.4,-2.4) scale(1.2)"
        d="M22 7c0-2.761-2.239-5-5-5-3.054 0-6.946 0-10 0-2.761 0-5 2.239-5 5 0 3.054 0 6.946 0 10 0 2.761 2.239 5 5 5 3.054 0 6.946 0 10 0 2.761 0 5-2.239 5-5 0-3.054 0-6.946 0-10Z"
        fill="url(#ig-grad)"
      />
      {/* 白色相机：统一光学尺寸并居中 */}
      <g transform="translate(-0.343,-0.343) scale(1.0286)">
        <path
          d="M14.958 5.005c2.091.02 4.016 1.815 4.037 4.037.007 1.972.007 3.944 0 5.916-.02 2.083-1.815 4.016-4.037 4.037-1.972.007-3.944.007-5.916 0-2.092-.02-4.016-1.815-4.037-4.037-.007-1.972-.007-3.944 0-5.916.019-2.093 1.81-4.016 4.037-4.037 1.972-.007 3.944-.007 5.916 0Zm-5.889.945c-1.623.005-3.103 1.412-3.119 3.098-.006 1.968-.006 3.936 0 5.904.015 1.605 1.388 3.082 3.098 3.098 1.968.006 3.936.006 5.904 0 1.609-.015 3.082-1.388 3.098-3.098.006-1.968.006-3.936 0-5.904-.015-1.616-1.415-3.082-3.098-3.098-1.961-.006-3.922 0-5.883 0Z"
          fill="#fff"
        />
        <path
          d="M12.024 8.5c1.618.015 3.126 1.263 3.422 2.862.211 1.14-.187 2.376-1.027 3.178-.935.89-2.382 1.208-3.622.754-1.386-.507-2.361-1.968-2.296-3.448.079-1.768 1.641-3.34 3.499-3.346.008 0 .016 0 .024 0Zm-.04.947c-1.155.011-2.244.887-2.484 2.025-.243 1.151.419 2.428 1.506 2.887 1.187.502 2.72-.061 3.293-1.233.593-1.211.034-2.856-1.218-3.441-.341-.159-.72-.239-1.097-.238Z"
          fill="#fff"
        />
        <circle cx="16.5" cy="7.5" r="1.35" fill="#fff" />
      </g>
    </svg>
  );
}

/** WhatsApp：绿色渐变圆角方块 + 白色气泡电话（官方原始路径，等比缩放居中） */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id="wa-grad" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1df47c" />
          <stop offset="0.31" stopColor="#12df63" />
          <stop offset="0.75" stopColor="#05c443" />
          <stop offset="1" stopColor="#00ba37" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.6" fill="url(#wa-grad)" />
      <g transform="translate(1.874,2.304) scale(0.3029)">
        <path
          d="M27.42 21.38l2 5.43a.76.76 0 0 1-.1.74 10.32 10.32 0 0 1-1.48 1.71.8.8 0 0 0-.16 1.09c1.23 1.7 4.42 5.7 8.57 7.13a.79.79 0 0 0 .89-.29l1.66-2.21a.8.8 0 0 1 1-.23l5.2 2.6a.79.79 0 0 1 .4 1c-.57 1.62-2.36 5.57-6.19 4.93a20.79 20.79 0 0 1-12.81-7.24c-3.14-3.92-9.34-14 .19-15.14a.8.8 0 0 1 1.03.45Z"
          fill="#fff"
        />
        <path
          d="M33.6 54.8a24.21 24.21 0 0 1-11.94-3.13l-12 3.08 4.41-9.91A22 22 0 0 1 10 32C10 19.43 20.59 9.2 33.6 9.2S57.2 19.43 57.2 32 46.61 54.8 33.6 54.8Zm-11.31-7.43.73.45a20.13 20.13 0 0 0 10.58 3c10.81 0 19.6-8.43 19.6-18.8S44.41 13.2 33.6 13.2 14 21.63 14 32a18.13 18.13 0 0 0 4 11.34l.75.95-3.61 6.12Z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

/** 各平台的官方图标渲染器 */
const glyphs: Record<string, (p: { className?: string }) => ReactElement> = {
  youtube: YouTubeGlyph,
  tiktok: TikTokGlyph,
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  whatsapp: WhatsAppGlyph,
};

/** 社交图标方块：图标铺满方块，hover 轻微上浮 + 压暗 */
function BrandTile({
  href,
  label,
  platform,
  size = "md",
}: {
  href: string;
  label: string;
  platform: string;
  size?: "sm" | "md";
}) {
  const Glyph = glyphs[platform];
  if (!Glyph) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label}（新窗口打开）`}
      title={label}
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:brightness-95",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
      )}
    >
      <Glyph className="h-full w-full" />
    </a>
  );
}

export function SocialRail({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {social.map((item) => (
        <li key={item.platform}>
          <BrandTile
            href={item.href}
            label={item.label}
            platform={item.platform}
            size={size}
          />
        </li>
      ))}
    </ul>
  );
}
