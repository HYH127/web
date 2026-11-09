import type { ReactNode } from "react";
import {
  LEVEL_FILL,
  LEVEL_GLOW_RADIUS,
  WORLD_VIEWBOX,
  pathOfCountry,
  project,
} from "@/lib/world";
import type { Point } from "@/lib/world-geometry";
import type { TradeMapData } from "@/lib/trade";
import { CourierAnimation, type CourierDestination } from "./courier-animation";

interface MapPoint {
  code: string;
  name: string;
  count: number;
  level: number;
  x: number;
  y: number;
}

/**
 * 首页世界地图
 *
 * 拆成两层：
 * 1. `WorldMap`（服务端渲染）—— 静态国界底图 → 亮度染色 → 光晕 → 起运地 → 国家节点；
 * 2. `CourierOverlay`（客户端）—— 随机航线、奔跑小人，以及「这一趟飞向哪国」的国家名标签。
 *
 * 国家名只跟着航线临时出现：全图唯一常驻的地名是起运地「义乌」，其余国家（德国 / 阿联酋 / 巴西…）
 * 由小人飞去时显示、回程时隐去，避免满屏都是标签。
 *
 * 分层的理由：提亮层要把左半屏压白来保证大标题可读，但小人的目的地包含美洲，
 * 留在提亮层下面就会整段被白色吃掉。拆开后底图仍然被压暗、小人永远清晰。
 * 两层共用 `mapGeometry`，所以坐标永远对齐。
 *
 * 底图是 `/map/world-base.svg` 静态资源（缓存友好、不进 RSC 数据流），首屏不依赖 JS。
 */
/**
 * 地图几何：投影后的国家节点、起运地、小人可去的国家池。
 * `WorldMap`（底图）与 `CourierOverlay`（小人层）共用同一份，保证两层永远对齐。
 */
function mapGeometry(data: TradeMapData) {
  const points: MapPoint[] = data.countries.map((c) => {
    const p = project(c.lng, c.lat);
    return {
      code: c.code,
      name: c.name,
      count: c.count,
      level: c.level,
      x: p.x,
      y: p.y,
    };
  });

  const origin = { ...data.origin, ...project(data.origin.lng, data.origin.lat) };
  const originPoint: Point = { x: origin.x, y: origin.y };

  // 小人可去的国家池：所有有交易记录的国家，去掉起运地本身。
  // 美洲（美国 / 加拿大 / 墨西哥 / 巴西 / 智利）也在池子里——小人层压在提亮层之上，
  // 飞到左半屏时人依然清晰，不会再像之前那样整段被白色渐变盖住。
  const destinations: CourierDestination[] = points
    .filter((p) => p.code !== data.origin.code)
    .map((p) => ({ id: p.code, name: p.name, x: p.x, y: p.y, count: p.count }));

  return { points, originPoint, destinations };
}

/** 底图舞台：与 `CourierOverlay` 完全一致的外框，改动时两边要一起改 */
function StageShell({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="relative w-full max-w-[1680px]">{children}</div>
      </div>
    </div>
  );
}

/**
 * 小人层：独立的一层，压在「左侧提亮层」之上，因此不论飞到美洲还是亚洲都清晰可见。
 * 坐标系与底图相同（同一个 viewBox），所以位置、航线永远与地图重合。
 */
export function CourierOverlay({ data }: { data: TradeMapData }) {
  const [vx, vy, vw, vh] = WORLD_VIEWBOX;
  const { originPoint, destinations } = mapGeometry(data);

  return (
    <StageShell>
      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className="block w-full"
        style={{ aspectRatio: `${vw} / ${vh}` }}
        role="presentation"
      >
        <CourierAnimation
          origin={originPoint}
          destinations={destinations}
          bounds={[vx, vy, vw, vh]}
        />
      </svg>
    </StageShell>
  );
}

export function WorldMap({ data }: { data: TradeMapData }) {
  const [vx, vy, vw, vh] = WORLD_VIEWBOX;
  const { points, originPoint } = mapGeometry(data);

  return (
    <StageShell>
      {/* 底图：176 条国界路径，静态资源（约 78KB / gzip 26KB），不进 RSC 数据流 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/map/world-base.svg"
        alt=""
        width={vw}
        height={vh}
        className="block h-auto w-full"
      />

      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className="absolute inset-0 h-full w-full"
        role="presentation"
      >
        <defs>
          {/* 亮度光晕：用径向渐变代替高斯模糊，30 个节点同屏也不掉帧 */}
          {[1, 2, 3, 4].map((level) => (
            <radialGradient key={level} id={`wm-glow-${level}`}>
              <stop offset="0%" stopColor="#2fb6c4" stopOpacity={0.1 + level * 0.05} />
              <stop offset="42%" stopColor="#2fb6c4" stopOpacity={0.05 + level * 0.028} />
              <stop offset="100%" stopColor="#2fb6c4" stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        {/* 1. 亮度染色层：只画有交易的国家（26 条路径），叠在静态底图之上 */}
        <g stroke="#a8d6dd" strokeWidth={0.5} strokeLinejoin="round">
          {points.map((point) => {
            const d = pathOfCountry(point.code);
            if (!d) return null;
            return (
              <path
                key={`tint-${point.code}`}
                d={d}
                fill={LEVEL_FILL[Math.min(4, Math.max(0, point.level))]}
              />
            );
          })}
        </g>

        {/* 2. 亮度光晕 */}
        <g>
          {points
            .filter((p) => p.level >= 1)
            .map((p) => {
              const r = LEVEL_GLOW_RADIUS[p.level];
              const breathing = p.level >= 3;
              return (
                <circle
                  key={`glow-${p.code}`}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={`url(#wm-glow-${p.level})`}
                  className={breathing ? "animate-glow" : undefined}
                  style={
                    breathing
                      ? {
                          transformBox: "fill-box",
                          transformOrigin: "center",
                          animationDelay: `${(p.x % 7) * 0.45}s`,
                        }
                      : undefined
                  }
                />
              );
            })}
        </g>

        {/* 3. 起运地：义乌 */}
        <g>
          <circle
            cx={originPoint.x}
            cy={originPoint.y}
            r={22}
            fill="url(#wm-glow-3)"
            className="animate-glow"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <circle
            cx={originPoint.x}
            cy={originPoint.y}
            r={11}
            fill="none"
            stroke="#178f9c"
            strokeWidth={0.9}
            strokeOpacity={0.35}
            className="animate-glow"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animationDelay: "1.2s",
            }}
          />
          <circle cx={originPoint.x} cy={originPoint.y} r={3.1} fill="#178f9c" />
          {/* 起运地是全场唯一常驻的地名：其余国家名跟着小人的航线临时出现 */}
          <text
            x={originPoint.x + 11}
            y={originPoint.y + 4}
            fontSize={11}
            fontWeight={500}
            fill="#106e79"
            letterSpacing="0.12em"
          >
            义乌
          </text>
        </g>

        {/* 4. 国家节点 + 悬停提示（纯 CSS，不需要 JS）。
            所有节点统一是青色小点——「被送货的那一国」才亮棕色灯，那盏灯在 `CourierOverlay` 里跟着航线走。 */}
        <g>
          {points.map((p) => {
            const width = 18 + p.name.length * 10 + String(p.count).length * 5.8;
            return (
              <g key={p.code} className="group pointer-events-auto">
                <circle cx={p.x} cy={p.y} r={2.2} fill="#178f9c" fillOpacity={0.72} />
                {/* 命中区 */}
                <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
                {/* 悬停提示：放在光点下方，避开上方随时可能出现的航线国家名 */}
                <g className="pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <rect
                    x={p.x - width / 2}
                    y={p.y + 12}
                    width={width}
                    height={19}
                    rx={4}
                    fill="#ffffff"
                    stroke="#ccd8e4"
                    strokeWidth={0.7}
                  />
                  <text
                    x={p.x}
                    y={p.y + 21.6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#33475e"
                  >
                    {p.name} · {p.count}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

      </svg>
    </StageShell>
  );
}
