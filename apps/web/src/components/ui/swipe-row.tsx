"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 移动端横向滑动容器（<640px 生效，桌面完全交给原来的 grid）
 *
 * 设计取舍：
 * - 滚动、吸附、惯性全部交给浏览器原生（`overflow-x-auto` + `scroll-snap`），
 *   不做 transform 拖拽，避免和页面纵向滚动抢手势；
 * - 滚动监听里直接写 DOM 属性与 style，**不 setState**——卡片是服务端渲染的，
 *   每帧 setState 会把整棵子树重渲染，滑起来会掉帧；
 * - 卡片默认露出一截（88% 宽），滑到哪张哪张「亮起来」：
 *   非激活项 scale 0.965 + 透明度 75%，形成深浅层次；
 * - 底部进度条 + 「右滑」提示，滚过第一屏后提示自动淡出，不长期占地方。
 */
interface SwipeRowProps {
  children: ReactNode;
  className?: string;
  /** 底部提示文案，滚动后自动淡出 */
  hint?: string;
  /** 语义标签：流程步骤用 ol，其余保持 div */
  as?: "div" | "ol" | "ul";
}

const MOBILE_QUERY = "(max-width: 639px)";

export function SwipeRow({ children, className, hint = "右滑查看更多", as = "div" }: SwipeRowProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const track = wrapRef.current?.querySelector<HTMLElement>("[data-swipe-track]");
    if (!track) return;

    const mq = window.matchMedia(MOBILE_QUERY);
    let frame = 0;
    let idle = 0;
    let detach: (() => void) | null = null;

    const paint = () => {
      frame = 0;
      const items = track.querySelectorAll<HTMLElement>("[data-swipe-item]");
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 8 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;

      if (barRef.current) {
        // 留一截底，滑到起点时进度条也看得见
        barRef.current.style.transform = `scaleX(${(0.18 + ratio * 0.82).toFixed(3)})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = ratio > 0.02 ? "0" : "1";
      }

      // 以「卡片中心离容器中心多远」判定谁是当前卡
      const center = track.scrollLeft + track.clientWidth / 2;
      items.forEach((item) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        item.dataset.active = Math.abs(itemCenter - center) < item.offsetWidth * 0.55 ? "true" : "false";
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    /**
     * 滚动中给轨道打上 data-swiping：此时卡片自身的过渡动画会被 CSS 关掉，
     * 避免「手指已经滑过去、卡片还在做 300ms 缩放」的滞后感。
     * 停止滚动 140ms 后摘掉标记，恢复过渡。
     */
    const onScroll = () => {
      if (!track.dataset.swiping) track.dataset.swiping = "1";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        delete track.dataset.swiping;
      }, 140);
      schedule();
    };

    const attach = () => {
      if (detach) return;
      track.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      detach = () => {
        track.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", schedule);
        window.clearTimeout(idle);
        delete track.dataset.swiping;
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      };
      paint();
    };

    const release = () => {
      detach?.();
      detach = null;
      delete track.dataset.swiping;
      track.querySelectorAll<HTMLElement>("[data-swipe-item]").forEach((item) => {
        delete item.dataset.active;
      });
      if (barRef.current) barRef.current.style.transform = "";
      if (hintRef.current) hintRef.current.style.opacity = "";
    };

    const sync = () => (mq.matches ? attach() : release());
    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      release();
    };
  }, []);

  return (
    <div ref={wrapRef}>
      {createElement(as, { "data-swipe-track": "", className: cn(className) }, children)}
      <div aria-hidden className="mt-3 flex items-center justify-between gap-4 sm:hidden">
        <span
          ref={hintRef}
          className="text-micro tracking-[0.14em] text-ink-400 uppercase transition-opacity duration-500"
        >
          {hint}
        </span>
        <span className="relative h-[2px] w-16 overflow-hidden rounded-full bg-surface-strong">
          <span
            ref={barRef}
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-champagne-500 transition-transform duration-200 ease-out"
            style={{ transform: "scaleX(0.18)" }}
          />
        </span>
      </div>
    </div>
  );
}
