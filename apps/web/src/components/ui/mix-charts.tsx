"use client";

/**
 * 带交互的可视化：环形图 + 增长条形。
 *
 * 之所以放在客户端：需要在挂载后触发一次绘制动画（dasharray / scaleX），
 * 以及 hover / focus 联动高亮。数据本身仍是服务端传入的静态数组，没有接口依赖。
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MixDatum = { label: string; value: number; note?: string };

/** 与设计 token 对应：champagne-500 / lumen-600 / champagne-400 / lumen-400 / champagne-600 */
const SERIES = ["#b8933f", "#178f9c", "#cfa85f", "#55cdd9", "#96742c"];

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/**
 * 进入视口后再播动画。
 * 首屏之下的图表如果挂载即播，等用户滚到就只剩静态结果了。
 */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * 环形图：挂载后顺时针生长，hover 图例或弧段高亮对应分区，中心显示该分区占比。
 */
export function MixDonut({
  items,
  unit = "%",
  className,
}: {
  items: MixDatum[];
  unit?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);

  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 82;
  const circumference = 2 * Math.PI * radius;

  let cursor = 0;
  const segments = items.map((item, index) => {
    const length = (item.value / total) * circumference;
    const segment = { ...item, index, length, offset: cursor };
    cursor += length;
    return segment;
  });

  // 默认展示占比最大的分区；悬停时其余弧段淡出，中心读数跟着换
  const activeIndex = hovered ?? 0;
  const current = items[activeIndex] ?? items[0];
  const currentPct = Math.round((current.value / total) * 100);

  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center gap-8 sm:flex-row sm:items-start", className)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="relative h-[196px] w-[196px] shrink-0">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`环形图：${items.map((item) => `${item.label} ${item.value}${unit}`).join("，")}`}
        >
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#eef3f8" strokeWidth="16" />
          {segments.map((segment) => {
            const visible = Math.max(segment.length - 1.6, 0.6);
            const isHovered = hovered === segment.index;
            return (
              <circle
                key={segment.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={SERIES[segment.index % SERIES.length]}
                strokeWidth={isHovered ? 21 : 16}
                strokeDasharray={
                  inView ? `${visible} ${circumference - visible}` : `0 ${circumference}`
                }
                strokeDashoffset={-segment.offset}
                style={{
                  transition: `stroke-dasharray 900ms ${EASE}, stroke-width 320ms ${EASE}, opacity 320ms ${EASE}`,
                  transitionDelay: `${segment.index * 110}ms, 0ms, 0ms`,
                  opacity: hovered === null || isHovered ? 1 : 0.55,
                }}
                onMouseEnter={() => setHovered(segment.index)}
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {/* 中心读数：原来用 Playfair（衬线）—— 衬线数字粗细对比极大，
              32px 时看着"花"，而且它的 % 天生偏上，像上标。
              改成 Inter Tight 半粗 + 等宽数字：笔画厚度均匀、字形圆润，
              % 与数字同基线，只降一号、压成浅灰，不再抢读数。 */}
          <span className="text-[2.375rem] leading-none font-semibold tracking-[-0.03em] tabular-nums text-ink-900">
            {currentPct}
            <span className="ml-0.5 text-lg text-ink-400">{unit}</span>
          </span>
          <span className="mt-2 text-micro tracking-[0.12em] text-ink-500 uppercase">
            {current.label}
          </span>
        </div>
      </div>

      <div className="w-full">
        <ul>
          {items.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-4 border-b border-line/70 py-2.5 text-left transition-colors duration-300",
                  hovered === index ? "text-ink-900" : "text-ink-500",
                )}
              >
                <span className="flex items-center gap-2.5 text-small">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: SERIES[index % SERIES.length] }}
                  />
                  {item.label}
                </span>
                <span className="text-small font-semibold tabular-nums text-ink-900">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 min-h-[1.25rem] text-micro text-ink-400">{current.note ?? ""}</p>
      </div>
    </div>
  );
}

/**
 * 横向条形：挂载后从左向右展开，hover 整行加深。
 * 条长相对组内最大值，短的那条也能看出比例。
 */
export function MixBars({
  items,
  unit = "%",
  className,
}: {
  items: MixDatum[];
  unit?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLUListElement>();
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul ref={ref} className={cn("space-y-5", className)}>
      {items.map((item, index) => (
        <li
          key={item.label}
          onMouseEnter={() => setActive(index)}
          onMouseLeave={() => setActive(null)}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span
              className={cn(
                "text-small transition-colors duration-300",
                active === index ? "text-ink-900" : "text-ink-700",
              )}
            >
              {item.label}
            </span>
            <span className="text-small font-semibold tabular-nums text-ink-900">
              {item.value}
              {unit}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-strong">
            <div
              className={cn(
                "h-full origin-left rounded-full",
                active === index ? "bg-champagne-700" : "bg-champagne-500",
              )}
              style={{
                width: `${(item.value / max) * 100}%`,
                transform: inView ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 900ms ${EASE}, background-color 300ms ${EASE}`,
                transitionDelay: `${index * 90}ms, 0ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
