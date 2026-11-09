import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel flex flex-col items-center justify-center rounded-lg px-6 py-20 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="mb-6 h-10 w-10 rounded-full border border-lumen-500/40 bg-lumen-300/40 shadow-glow-cyan"
      />
      <p className="text-h3 text-ink-900">{title}</p>
      {body ? <p className="mt-3 max-w-sm text-small text-ink-500">{body}</p> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-surface-strong",
        className,
      )}
    />
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-panel rounded-lg p-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="mt-6 h-4 w-24" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
