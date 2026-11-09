import { social } from "@/lib/messages";
import { cn } from "@/lib/utils";

const paths: Record<string, string> = {
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
  tiktok:
    "M16.6 5.82A5.4 5.4 0 0 1 15.2 2h-3.1v13.1a2.9 2.9 0 1 1-2.1-2.8V9.2a6 6 0 1 0 5.2 5.9V8.9a8.5 8.5 0 0 0 4.9 1.6V7.4a5.4 5.4 0 0 1-3.5-1.58z",
  facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.13-2.41-.13-2.39 0-4.03 1.46-4.03 4.14V9.9H7.5V13h2.27v8h3.73z",
  whatsapp:
    "M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.49 1.34 5.01L2 22l5.15-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.13c-1.56 0-3.09-.42-4.42-1.2l-.32-.19-3.05.8.81-2.98-.21-.33a8.12 8.12 0 0 1-1.25-4.36c0-4.5 3.66-8.16 8.16-8.16s8.16 3.66 8.16 8.16-3.66 8.16-8.16 8.16zm4.47-6.11c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.57.18 1.1.15 1.51.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28z",
};

/** 各社交平台的品牌色（方块底色，文字用白色） */
const brandColors: Record<string, string> = {
  youtube: "#FF0000",
  tiktok: "#000000",
  facebook: "#1877F2",
  whatsapp: "#25D366",
};

/** Instagram 官方图标：渐变圆角方块 + 白色相机 + 白圆点，需单独渲染（含渐变 defs） */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={className}
    >
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

export function SocialIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  if (platform === "instagram") {
    return <InstagramGlyph className={className} />;
  }
  const d = paths[platform];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={cn("h-4 w-4 fill-current", className)}
    >
      <path d={d} />
    </svg>
  );
}

/** 社交图标方块：底色用品牌色，hover 轻微上浮 + 压暗 */
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
  const bg = brandColors[platform] ?? "#33475e";
  const isInstagram = platform === "instagram";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label}（新窗口打开）`}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-md text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:brightness-90",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isInstagram && "bg-transparent shadow-none hover:brightness-100 hover:opacity-90",
      )}
      style={isInstagram ? undefined : { backgroundColor: bg }}
    >
      {isInstagram ? (
        <InstagramGlyph className={size === "sm" ? "h-7 w-7" : "h-9 w-9"} />
      ) : (
        <SocialIcon platform={platform} className={size === "sm" ? "h-3.5 w-3.5" : undefined} />
      )}
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
