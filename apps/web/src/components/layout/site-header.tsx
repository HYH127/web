"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, header, nav } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { fetchMe, type SessionUser } from "@/lib/auth-client";
import { SocialRail } from "./social";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 读取会话，决定右上角显示「登录」还是「用户中心」
  useEffect(() => {
    let cancelled = false;
    fetchMe().then((me) => {
      if (!cancelled) setUser(me);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // 路由变化时关闭移动端抽屉
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const loginLabel = user ? header.account : header.login;
  const loginHref = user ? "/account" : "/login";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-lumen",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-17 w-full max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-xl tracking-[0.14em] text-ink-900">
            {brand.name}
          </span>
          <span className="hidden text-micro tracking-[0.18em] text-ink-400 uppercase xl:block">
            {brand.tagline}
          </span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-xs px-3.5 py-2 text-small transition-colors duration-300",
                isActive(item.href)
                  ? "text-ink-900"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {item.label}
              {isActive(item.href) ? (
                <span
                  aria-hidden
                  className="absolute inset-x-3.5 -bottom-0.5 h-px bg-champagne-500"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={header.cart}
            className="hidden h-10 w-10 items-center justify-center rounded-sm text-ink-500 transition-colors hover:text-ink-900 sm:flex"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
          </Link>
          <Link
            href={loginHref}
            className="hidden rounded-sm px-3 py-2 text-small text-ink-500 transition-colors hover:text-ink-900 sm:block"
          >
            {loginLabel}
          </Link>
          <Link
            href="/contact"
            className="hidden h-10 items-center rounded-sm border border-champagne-400/80 bg-champagne-200/60 px-5 text-small text-champagne-700 transition-all duration-300 hover:border-champagne-500 hover:shadow-glow-gold md:inline-flex"
          >
            {header.cta}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? header.close : header.menu}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-700 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-line bg-paper/95 px-6 pb-8 pt-4 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="移动端导航" className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between border-b border-line py-4 text-h3 font-light",
                  isActive(item.href) ? "text-champagne-700" : "text-ink-900",
                )}
              >
                {item.label}
                <span className="text-micro tracking-[0.16em] text-ink-400 uppercase">
                  0{nav.indexOf(item) + 1}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-4 text-small text-ink-500">
              <Link href="/cart" className="hover:text-ink-900">
                {header.cart}
              </Link>
              <Link href={loginHref} className="hover:text-ink-900">
                {loginLabel}
              </Link>
              <Link href="/account" className="hover:text-ink-900">
                {header.account}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <SocialRail size="sm" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
