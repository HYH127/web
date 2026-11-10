import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { brand, nav, states } from "@/lib/messages";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[130px]"
      />
      <div className="relative mx-auto flex h-17 w-full max-w-[1440px] items-center px-6 md:px-10">
        <Link href="/" className="font-display text-xl tracking-[0.14em] text-ink-900">
          {brand.name}
        </Link>
      </div>

      <div className="relative flex flex-1 items-center px-6 md:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <p className="label-micro">ERROR 404</p>
          <h1 className="text-display mt-6 font-semibold text-ink-900">
            {states.notFoundTitle}
          </h1>
          <p className="mt-6 max-w-md text-ink-500">{states.notFoundBody}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/">{states.backHome}</ButtonLink>
            {nav
              .filter((item) => item.href !== "/")
              .slice(0, 3)
              .map((item) => (
                <ButtonLink key={item.href} href={item.href} variant="ghost">
                  {item.label}
                </ButtonLink>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
