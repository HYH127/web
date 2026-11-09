import { social } from "@/lib/messages";
import { cn } from "@/lib/utils";

const paths: Record<string, string> = {
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
  tiktok:
    "M16.6 5.82A5.4 5.4 0 0 1 15.2 2h-3.1v13.1a2.9 2.9 0 1 1-2.1-2.8V9.2a6 6 0 1 0 5.2 5.9V8.9a8.5 8.5 0 0 0 4.9 1.6V7.4a5.4 5.4 0 0 1-3.5-1.58z",
  facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.13-2.41-.13-2.39 0-4.03 1.46-4.03 4.14V9.9H7.5V13h2.27v8h3.73z",
  instagram:
    "M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23a3.7 3.7 0 0 1-.9 1.38 3.7 3.7 0 0 1-1.38.9c-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2zm0 3.5a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6zm0 10.4a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2zm8-10.65a1.47 1.47 0 1 1-2.94 0 1.47 1.47 0 0 1 2.94 0z",
  whatsapp:
    "M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.49 1.34 5.01L2 22l5.15-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.13c-1.56 0-3.09-.42-4.42-1.2l-.32-.19-3.05.8.81-2.98-.21-.33a8.12 8.12 0 0 1-1.25-4.36c0-4.5 3.66-8.16 8.16-8.16s8.16 3.66 8.16 8.16-3.66 8.16-8.16 8.16zm4.47-6.11c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.57.18 1.1.15 1.51.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28z",
};

/** 各社交平台的品牌色（方块底色，文字用白色） */
const brandColors: Record<string, string> = {
  youtube: "#FF0000",
  tiktok: "#000000",
  facebook: "#1877F2",
  instagram: "#E1306C",
  whatsapp: "#25D366",
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
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
      )}
      style={{ backgroundColor: bg }}
    >
      <SocialIcon platform={platform} className={size === "sm" ? "h-3.5 w-3.5" : undefined} />
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
