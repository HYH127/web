import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "gold";
  className?: string;
}) {
  const tones = {
    neutral: "border-line-strong text-ink-500",
    cyan: "border-lumen-500/40 bg-lumen-300/40 text-lumen-700",
    gold: "border-champagne-400/60 bg-champagne-200/70 text-champagne-700",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-2 py-1 text-micro tracking-[0.14em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
