"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 移动端横向滑动容器（<640px 生效，桌面完全交给原来的 grid）
 *
 * 滚动、吸附、惯性全部交给浏览器原生（`overflow-x-auto` + `scroll-snap`），
 * 不做 transform 拖拽，避免和页面纵向滚动抢手势。
 *
 * ── 关于「闪跳 / 重影 / 瞬间错位」的三处修正（2026-11-10）──────────────
 * 1) 旧版按「谁是当前卡」离散地写 data-active，非激活卡瞬时 scale 0.965，
 *    而滚动中又用 CSS 关掉了 transition —— 属性一变就是一次硬跳，手指
 *    滑过时卡片会突然缩一下，视觉上就是错位 + 闪。现在改成**连续量**：
 *    每帧按「卡片中心离容器中心多远」写入 --swipe-p（0 居中 → 1 出屏），
 *    由 CSS 算 scale / opacity，全程无补间，位移和缩放永远同一帧、同源。
 * 2) 卡片的 backdrop-filter 在「滚动 + 缩放」的合成层里会逐帧重算背景
 *    模糊，低端机表现为闪白 / 重影。移动端横滑卡改成实底白（见 globals.css）。
 * 3) 旧版每帧读 offsetLeft / clientWidth，读写交替触发强制同步布局。
 *    现在尺寸只在挂载、resize、ResizeObserver 时量一次，滚动帧里只写不读。
 *
 * 另外：滚动回调不 setState —— 卡片是服务端渲染的，每帧重渲染整棵子树
 * 必掉帧；并用 will-change 固定合成层，缩放只做纹理变换、不逐帧重新栅格化。
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
/** 位置变化小于这个阈值就不写样式，避免无意义的样式重算 */
const EPSILON = 0.004;

export function SwipeRow({ children, className, hint = "右滑查看更多", as = "div" }: SwipeRowProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = wrap?.querySelector<HTMLElement>("[data-swipe-track]");
    if (!wrap || !track) return;

    const mq = window.matchMedia(MOBILE_QUERY);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let nodes: HTMLElement[] = [];
    /** 每张卡中心点在 track 内容坐标系下的 x —— 量一次，滚动帧里不再读布局 */
    let centers: number[] = [];
    let viewWidth = 0;
    let maxScroll = 0;
    const lastP = new Map<HTMLElement, number>();
    let lastRatio = -1;
    let hintHidden = false;
    let frame = 0;
    let attached = false;
    let lateMeasure = 0;
    let observer: ResizeObserver | null = null;

    const paint = () => {
      frame = 0;
      if (!nodes.length || !viewWidth) return;

      const scroll = track.scrollLeft;
      const viewCenter = scroll + viewWidth / 2;
      const half = viewWidth / 2;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const p = Math.min(1, Math.abs(centers[i] - viewCenter) / half);
        const prev = lastP.get(node);
        if (prev === undefined || Math.abs(p - prev) > EPSILON) {
          node.style.setProperty("--swipe-p", p.toFixed(3));
          lastP.set(node, p);
        }
      }

      const ratio = maxScroll > 8 ? Math.min(1, Math.max(0, scroll / maxScroll)) : 0;
      if (Math.abs(ratio - lastRatio) > EPSILON) {
        wrap.style.setProperty("--swipe-ratio", ratio.toFixed(3));
        lastRatio = ratio;
      }

      // 提示只在跨过阈值时写一次，避免每帧碰 DOM
      const shouldHide = ratio > 0.02;
      if (hintRef.current && shouldHide !== hintHidden) {
        hintHidden = shouldHide;
        hintRef.current.style.opacity = shouldHide ? "0" : "1";
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    /** 只在尺寸真的变了时重新量；量完立刻画一帧，避免用旧中心点算出错的缩放 */
    const measure = () => {
      const nextWidth = track.clientWidth;
      const nextMax = Math.max(0, track.scrollWidth - nextWidth);
      const nextNodes = Array.from(track.querySelectorAll<HTMLElement>("[data-swipe-item]"));
      const nextCenters = nextNodes.map((node) => node.offsetLeft + node.offsetWidth / 2);

      const same =
        nextWidth === viewWidth &&
        nextMax === maxScroll &&
        nextNodes.length === nodes.length &&
        nextCenters.every((value, index) => Math.abs(value - centers[index]) < 0.5);

      if (same) return;

      nodes = nextNodes;
      centers = nextCenters;
      viewWidth = nextWidth;
      maxScroll = nextMax;
      lastP.clear();
      paint();
    };

    const onScroll = () => schedule();
    // 视口变化后卡片宽度/间距都会变，必须重量一次再画，否则中心点算错会闪一下
    const onResize = () => {
      measure();
      schedule();
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      track.addEventListener("scroll", onScroll, { passive: true });
      track.addEventListener("scrollend", schedule);
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("orientationchange", onResize, { passive: true });
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => measure());
        observer.observe(track);
      }
      measure();
      // 首帧字体/图片可能还没落位，补量一次
      lateMeasure = window.setTimeout(() => {
        if (attached) measure();
      }, 200);
    };

    const release = () => {
      if (!attached) return;
      attached = false;
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      observer?.disconnect();
      observer = null;
      window.clearTimeout(lateMeasure);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      nodes.forEach((node) => node.style.removeProperty("--swipe-p"));
      wrap.style.removeProperty("--swipe-ratio");
      if (hintRef.current) hintRef.current.style.opacity = "";
      nodes = [];
      centers = [];
      lastP.clear();
      lastRatio = -1;
      hintHidden = false;
      viewWidth = 0;
      maxScroll = 0;
    };

    /** 降级：用户要求减少动效时，只保留吸附，不做缩放/淡出 */
    const sync = () => {
      if (mq.matches && !calm.matches) attach();
      else release();
    };

    sync();
    mq.addEventListener("change", sync);
    calm.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
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
            data-swipe-bar
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-champagne-500"
          />
        </span>
      </div>
    </div>
  );
}
