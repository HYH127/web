"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, header, nav } from "@/lib/messages";
import { contact } from "@/lib/content/company";
import { cn } from "@/lib/utils";
import { fetchMe, type SessionUser } from "@/lib/auth-client";
import { SocialRail } from "./social";

/**
 * 站点导航
 *
 * 2026-11-10 改版：从「透明 → 白底」改为常驻深墨蓝实底。
 * 原因：浅色透明的导航在白底页面上几乎没有重量，整站看着轻飘；
 * 深色横条 + 金色 CTA 是 B2B / 工业类站点的通用做法（Flexport、Thomasnet、
 * Maersk 的深色顶栏都是这个逻辑）—— 一眼给出「这是个正经公司」的基调，
 * 同时把「询盘」这个唯一转化入口从浅金描边升级成实底金按钮，对比更明确。
 */
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
      id="site-top"
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-abyss-900 text-white transition-shadow duration-300",
        scrolled ? "shadow-[0_18px_36px_-24px_rgb(10_21_38_/_0.85)]" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-17 w-full max-w-[1440px] items-center justify-between gap-6 px-6 md:px-10">
        <Link href="/" className="group flex shrink-0 items-baseline gap-3">
          <span className="font-display text-xl font-medium tracking-[0.14em] text-white">
            {brand.name}
          </span>
          <span className="hidden text-micro font-medium tracking-[0.18em] text-white/40 uppercase xl:block">
            {brand.tagline}
          </span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-xs px-3.5 py-2 text-small font-medium transition-colors duration-200",
                isActive(item.href)
                  ? "text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
              {isActive(item.href) ? (
                <span
                  aria-hidden
                  className="absolute inset-x-3.5 -bottom-[9px] h-[2px] bg-champagne-400"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/cart"
            aria-label={header.cart}
            className="hidden h-10 w-10 items-center justify-center rounded-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white sm:flex"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
          </Link>
          <Link
            href={loginHref}
            className="hidden rounded-sm px-3 py-2 text-small font-medium text-white/70 transition-colors hover:text-white sm:block"
          >
            {loginLabel}
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-champagne-400 px-4 text-small font-semibold text-abyss-900 transition-colors duration-200 hover:bg-champagne-300 md:h-10 md:px-5"
          >
            {header.cta}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? header.close : header.menu}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-white transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 底部金色极细线：给深色横条一点收口，避免和白色内容区生硬相接 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-champagne-400/45 to-transparent"
      />

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-abyss-900 px-6 pb-8 pt-4 lg:hidden"
        >
          <nav aria-label="移动端导航" className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between border-b border-white/10 py-4 text-h3 transition-colors",
                  isActive(item.href) ? "text-champagne-300" : "text-white",
                )}
              >
                {item.label}
                <span className="text-micro font-medium tracking-[0.16em] text-white/35 uppercase">
                  0{nav.indexOf(item) + 1}
                </span>
              </Link>
            ))}
          </nav>
          {/* 竖排：390px 宽时「询盘单 / 登录 / 用户中心」和 5 个图标挤一行会把字挤断行 */}
          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small font-medium whitespace-nowrap text-white/60">
              <Link href="/cart" className="hover:text-white">
                {header.cart}
              </Link>
              <Link href={loginHref} className="hover:text-white">
                {loginLabel}
              </Link>
              <Link href="/account" className="hover:text-white">
                {header.account}
              </Link>
              <Link href={contact.emailHref} className="text-white/45 hover:text-white">
                {contact.email}
              </Link>
            </div>
            <SocialRail size="sm" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
