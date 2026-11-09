/**
 * 轻量可视化原语（纯 CSS，无图表库依赖）
 *
 * 设计约束：白底、细线、低饱和；只用来把已有数据排得更易读，
 * 不加坐标轴网格、不加阴影，避免仪表盘感。
 */

import { cn } from "@/lib/utils";

export type MixItem = { label: string; value: number; note?: string };

/** 与设计 token 对应的四个序列色：champagne-500 / lumen-600 / champagne-400 / lumen-400 */
const SERIES = ["#b8933f", "#178f9c", "#cfa85f", "#55cdd9"];

/**
 * 百分比堆叠条：一条 100% 的横条 + 图例。
 * compact 用于侧栏等窄容器（图例单行横排）。
 */
export function StackedMix({
  items,
  className,
  compact = false,
}: {
  items: MixItem[];
  className?: string;
  compact?: boolean;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className={className}>
      <div className="flex h-2.5 w-full overflow-hidden bg-surface-strong">
        {items.map((item, index) => (
          <span
            key={item.label}
            title={`${item.label} ${Math.round((item.value / total) * 100)}%`}
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: SERIES[index % SERIES.length],
              transformOrigin: "left",
              animation: "grow-x 720ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
              animationDelay: `${index * 90}ms`,
            }}
          />
        ))}
      </div>

      {compact ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-1.5 text-micro text-ink-500">
              <span
                className="h-1.5 w-1.5"
                style={{ backgroundColor: SERIES[index % SERIES.length] }}
              />
              {item.label}
              <span className="text-ink-400">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-small text-ink-700">
                <span
                  className="h-2 w-2"
                  style={{ backgroundColor: SERIES[index % SERIES.length] }}
                />
                {item.label}
              </span>
              <span className="font-display text-small text-ink-900">
                {Math.round((item.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 订单节点进度：7 段等分，已完成段实心。
 * 用于用户中心的订单卡片，替代一句「生产中」。
 */
export function NodeProgress({
  nodes,
  current,
  label,
  className,
}: {
  nodes: readonly string[];
  current: number;
  /** 已超出节点表的状态（如已签收）可直接给文案 */
  label?: string;
  className?: string;
}) {
  const active = Math.min(Math.max(current, 0), nodes.length);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 gap-1">
        {nodes.map((node, index) => (
          <span
            key={node}
            title={node}
            className={cn(
              "h-1 flex-1",
              index < active ? "bg-lumen-600" : "bg-surface-strong",
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-micro text-ink-400">
        {label ?? nodes[Math.max(active - 1, 0)]} · {active}/{nodes.length}
      </span>
    </div>
  );
}
