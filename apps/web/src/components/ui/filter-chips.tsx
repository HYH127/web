import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterChips({
  items,
  active,
  basePath,
  paramKey,
  allLabel = "全部",
  counts,
}: {
  items: ReadonlyArray<{ value: string; label: string }>;
  active?: string;
  basePath: string;
  paramKey: string;
  allLabel?: string;
  counts?: Record<string, number>;
}) {
  const total = counts
    ? Object.values(counts).reduce((sum, value) => sum + value, 0)
    : null;

  return (
    <nav aria-label="筛选" className="flex flex-wrap items-center gap-2">
      <Link
        href={basePath}
        aria-current={!active ? "page" : undefined}
        className={cn(
          "rounded-sm border px-4 py-2 text-small transition-colors duration-300",
          !active
            ? "border-champagne-400/70 bg-champagne-200/70 text-champagne-700"
            : "border-line text-ink-500 hover:border-line-strong hover:text-ink-900",
        )}
      >
        {allLabel}
        {total !== null ? (
          <span className="ml-2 text-micro text-ink-400">{total}</span>
        ) : null}
      </Link>
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <Link
            key={item.value}
            href={`${basePath}?${paramKey}=${item.value}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-sm border px-4 py-2 text-small transition-colors duration-300",
              isActive
                ? "border-champagne-400/70 bg-champagne-200/70 text-champagne-700"
                : "border-line text-ink-500 hover:border-line-strong hover:text-ink-900",
            )}
          >
            {item.label}
            {counts ? (
              <span className="ml-2 text-micro text-ink-400">{counts[item.value] ?? 0}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
