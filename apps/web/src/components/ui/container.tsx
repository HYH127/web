import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const width =
    size === "wide"
      ? "max-w-[1440px]"
      : size === "narrow"
        ? "max-w-3xl"
        : "max-w-6xl";

  return (
    <div className={cn("mx-auto w-full px-6 md:px-10", width, className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  as: Tag = "section",
  tight = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article" | "aside";
  /** 紧跟 PageHeader 的区块：去掉上边距，避免与页头叠出过大的空白 */
  tight?: boolean;
}) {
  return (
    <Tag
      id={id}
      className={cn(tight ? "pt-4 pb-20 md:pb-28" : "py-20 md:py-28", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="label-micro mb-3">{eyebrow}</p> : null}
        <h2 className="text-h2 text-ink-900">{title}</h2>
        {description ? (
          <p className="mt-4 text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
