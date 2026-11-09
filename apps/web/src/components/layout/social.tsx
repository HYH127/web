import type { ReactElement } from "react";
import { social } from "@/lib/messages";
import { cn } from "@/lib/utils";

/**
 * 官方品牌图标：每个平台都是「品牌色底 + 白色图形」的完整官方图标，
 * 与 Instagram 的渐变图标保持一致，视觉清晰统一。
 */

/** YouTube：红色圆底 + 白色播放三角 */
function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden focusable="false" className={className}>
      <path
        d="M36 72c19.88 0 36-16.12 36-36S55.88 0 36 0 0 16.12 0 36s16.12 36 36 36Z"
        fill="#FF0002"
      />
      <path
        d="M31.04 42.27V28.69l12.97 6.81-12.97 6.77Zm28.48-15.94s-.47-3.33-1.91-4.8c-1.83-1.92-3.87-1.93-4.81-2.04C46.09 19 36.01 19 36.01 19h-.02s-10.08 0-16.79.49c-.94.11-2.99.12-4.81 2.04-1.44 1.47-1.91 4.8-1.91 4.8S12 30.25 12 34.16v3.67c0 3.91.48 7.82.48 7.82s.47 3.33 1.91 4.8c1.83 1.92 4.22 1.86 5.29 2.06 3.84.37 12.32.49 12.32.49s10.09-.02 16.79-.51c.94-.11 2.99-.12 4.81-2.04 1.44-1.47 1.91-4.8 1.91-4.8s.48-3.91.48-7.82v-3.67c0-3.91-.48-7.82-.48-7.82Z"
        fill="#fff"
      />
    </svg>
  );
}

/** TikTok：黑色圆角方块 + 白色音符 */
function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false" className={className}>
      <rect width="32" height="32" rx="7" fill="#000000" />
      <path
        d="M16.71 6.53c1.75-.03 3.48-.01 5.21-.03.11 2.04.84 4.12 2.33 5.56 1.49 1.48 3.6 2.16 5.65 2.39v5.37c-1.92-.06-3.86-.46-5.6-1.29-.76-.34-1.47-.79-2.16-1.24-.01 3.9.02 7.79-.03 11.67-.1 1.86-.72 3.72-1.8 5.25-1.74 2.56-4.77 4.23-7.88 4.28-1.91.11-3.81-.41-5.44-1.37-2.69-1.59-4.59-4.5-4.86-7.62-.03-.67-.04-1.33-.02-1.98.24-2.54 1.5-4.96 3.44-6.62 2.21-1.92 5.3-2.84 8.2-2.3.03 1.98-.05 3.95-.05 5.92-1.32-.43-2.87-.31-4.03.5-.84.55-1.49 1.38-1.82 2.33-.28.68-.2 1.43-.18 2.15.32 2.19 2.42 4.03 4.67 3.83 1.49-.02 2.92-.88 3.69-2.15.25-.44.53-.9.55-1.42.13-2.38.08-4.76.1-7.14.01-5.38-.02-10.74.03-16.09Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Facebook：蓝色圆角方块 + 白色 "f" */
function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 258 258" aria-hidden focusable="false" className={className}>
      <rect width="258" height="258" rx="28" fill="#3B5999" />
      <path
        d="M168 12h-27c-26 1-36 13-37 32-1 8 0 18 0 26v5h-27v30h27v78h31v-78h27l3-31h-30v-24c2-14 21-10 32-10V5c-9-1-17-1-26-1Z"
        transform="translate(26 40)"
        fill="#fff"
      />
    </svg>
  );
}

/** Instagram：渐变圆角方块 + 白色相机 + 白圆点 */
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
      <path
        d="M22 7c0-2.761-2.239-5-5-5-3.054 0-6.946 0-10 0-2.761 0-5 2.239-5 5 0 3.054 0 6.946 0 10 0 2.761 2.239 5 5 5 3.054 0 6.946 0 10 0 2.761 0 5-2.239 5-5 0-3.054 0-6.946 0-10Z"
        fill="url(#ig-grad)"
      />
      <path
        d="M14.958 5.005c2.091.02 4.016 1.815 4.037 4.037.007 1.972.007 3.944 0 5.916-.02 2.083-1.815 4.016-4.037 4.037-1.972.007-3.944.007-5.916 0-2.092-.02-4.016-1.815-4.037-4.037-.007-1.972-.007-3.944 0-5.916.019-2.093 1.81-4.016 4.037-4.037 1.972-.007 3.944-.007 5.916 0Zm-5.889.945c-1.623.005-3.103 1.412-3.119 3.098-.006 1.968-.006 3.936 0 5.904.015 1.605 1.388 3.082 3.098 3.098 1.968.006 3.936.006 5.904 0 1.609-.015 3.082-1.388 3.098-3.098.006-1.968.006-3.936 0-5.904-.015-1.616-1.415-3.082-3.098-3.098-1.961-.006-3.922 0-5.883 0Z"
        fill="#fff"
      />
      <path
        d="M12.024 8.5c1.618.015 3.126 1.263 3.422 2.862.211 1.14-.187 2.376-1.027 3.178-.935.89-2.382 1.208-3.622.754-1.386-.507-2.361-1.968-2.296-3.448.079-1.768 1.641-3.34 3.499-3.346.008 0 .016 0 .024 0Zm-.04.947c-1.155.011-2.244.887-2.484 2.025-.243 1.151.419 2.428 1.506 2.887 1.187.502 2.72-.061 3.293-1.233.593-1.211.034-2.856-1.218-3.441-.341-.159-.72-.239-1.097-.238Z"
        fill="#fff"
      />
      <circle cx="16.5" cy="7.5" r="1.35" fill="#fff" />
    </svg>
  );
}

/** WhatsApp：绿色渐变圆角方块 + 白色气泡电话图标 */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient
          id="wa-grad"
          x1="32"
          x2="32"
          y1="4"
          y2="64.81"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1df47c" />
          <stop offset="0.31" stopColor="#12df63" />
          <stop offset="0.75" stopColor="#05c443" />
          <stop offset="1" stopColor="#00ba37" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="11.2" fill="url(#wa-grad)" />
      <path
        d="M27.42 21.38l2 5.43a.76.76 0 0 1-.1.74 10.32 10.32 0 0 1-1.48 1.71.8.8 0 0 0-.16 1.09c1.23 1.7 4.42 5.7 8.57 7.13a.79.79 0 0 0 .89-.29l1.66-2.21a.8.8 0 0 1 1-.23l5.2 2.6a.79.79 0 0 1 .4 1c-.57 1.62-2.36 5.57-6.19 4.93a20.79 20.79 0 0 1-12.81-7.24c-3.14-3.92-9.34-14 .19-15.14a.8.8 0 0 1 1.03.45Z"
        fill="#fff"
      />
      <path
        d="M33.6 54.8a24.21 24.21 0 0 1-11.94-3.13l-12 3.08 4.41-9.91A22 22 0 0 1 10 32C10 19.43 20.59 9.2 33.6 9.2S57.2 19.43 57.2 32 46.61 54.8 33.6 54.8Zm-11.31-7.43.73.45a20.13 20.13 0 0 0 10.58 3c10.81 0 19.6-8.43 19.6-18.8S44.41 13.2 33.6 13.2 14 21.63 14 32a18.13 18.13 0 0 0 4 11.34l.75.95-3.61 6.12Z"
        fill="#fff"
      />
    </svg>
  );
}

/** 各平台的官方图标渲染器（均自带品牌底 + 白色图形） */
const glyphs: Record<string, (p: { className?: string }) => ReactElement> = {
  youtube: YouTubeGlyph,
  tiktok: TikTokGlyph,
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  whatsapp: WhatsAppGlyph,
};

/** 社交图标方块：直接渲染官方品牌图标，hover 轻微上浮 + 压暗 */
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label}（新窗口打开）`}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:brightness-90",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
      )}
    >
      {Glyph ? (
        <Glyph className={size === "sm" ? "h-7 w-7" : "h-9 w-9"} />
      ) : null}
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
