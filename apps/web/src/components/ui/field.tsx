import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-small text-ink-900 placeholder:text-ink-400 transition-colors duration-300 focus:border-lumen-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  hint,
  className,
  ...rest
}: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-2 block text-micro tracking-[0.14em] text-ink-500 uppercase">
        {label}
      </span>
      <input className={cn(baseField, className)} {...rest} />
      {hint ? <span className="mt-2 block text-micro text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function TextareaField({
  label,
  className,
  ...rest
}: { label: string } & ComponentProps<"textarea">) {
  return (
    <label className="block">
      <span className="mb-2 block text-micro tracking-[0.14em] text-ink-500 uppercase">
        {label}
      </span>
      <textarea className={cn(baseField, "min-h-32 resize-y", className)} {...rest} />
    </label>
  );
}

export function SelectField({
  label,
  options,
  className,
  ...rest
}: { label: string; options: string[] } & ComponentProps<"select">) {
  return (
    <label className="block">
      <span className="mb-2 block text-micro tracking-[0.14em] text-ink-500 uppercase">
        {label}
      </span>
      <div className="relative">
        <select className={cn(baseField, "appearance-none pr-10", className)} {...rest}>
          {options.map((option) => (
            <option key={option} value={option} className="bg-surface-soft">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
      </div>
    </label>
  );
}
