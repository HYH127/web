import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "gold" | "goldSoft" | "lumenSoft" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-300 ease-lumen disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-paper shadow-[0_10px_28px_-16px_rgba(10,21,38,0.75)] hover:bg-ink-800 hover:shadow-raised",
  ghost:
    "border border-line-strong text-ink-700 hover:border-ink-400 hover:text-ink-900",
  gold:
    "border border-champagne-500 bg-champagne-500 text-ink-900 hover:border-champagne-400 hover:bg-champagne-400 hover:shadow-glow-gold",
  // 区块标题右侧的次级入口：暖米底，有颜色但不与首屏主按钮抢
  goldSoft:
    "border border-champagne-500/45 bg-champagne-200 text-champagne-700 hover:border-champagne-500 hover:bg-champagne-300 hover:text-champagne-700",
  // 转化类次级入口：冷青底，作为页内唯一的功能色
  lumenSoft:
    "border border-lumen-500/45 bg-lumen-300/55 text-lumen-700 hover:border-lumen-500 hover:bg-lumen-300/80 hover:text-lumen-700",
  subtle: "text-ink-500 hover:text-ink-900",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-small",
  md: "h-11 px-6 text-small",
  lg: "h-13 px-8 text-body",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
