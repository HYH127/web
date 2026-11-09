"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { brand, states } from "@/lib/messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[web] 页面错误：", error);
  }, [error]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[130px]"
      />
      <div className="relative w-full max-w-xl">
        <p className="label-micro">{brand.name} · ERROR</p>
        <h1 className="text-h1 mt-5 font-light text-ink-900">{states.errorTitle}</h1>
        <p className="mt-4 text-ink-500">{states.errorBody}</p>
        {error.digest ? (
          <p className="mt-3 text-micro tracking-[0.14em] text-ink-400 uppercase">
            digest {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>{states.retry}</Button>
          <ButtonLink href="/" variant="ghost">
            {states.backHome}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
