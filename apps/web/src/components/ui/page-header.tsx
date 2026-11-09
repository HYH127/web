import type { ReactNode } from "react";
import { Container } from "./container";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden pt-32 pb-16 md:pt-40", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[120px]"
      />
      <Container className="relative">
        {eyebrow ? <p className="label-micro mb-5">{eyebrow}</p> : null}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-h1 font-light text-ink-900">{title}</h1>
            {description ? (
              <p className="mt-5 max-w-2xl text-ink-500">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {children}
      </Container>
    </header>
  );
}
