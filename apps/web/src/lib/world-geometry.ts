/**
 * 世界地图的纯几何工具（服务端与浏览器共用，不依赖任何地图库）
 *
 * 投影公式与 d3-geo 的 geoNaturalEarth1 完全一致，
 * 参数由 `scripts/build-world.mjs` 在构建期算出并写入 generated JSON，
 * 因此这里不需要把 d3-geo 打进浏览器包。
 */

export interface ProjectionParams {
  scale: number;
  translate: [number, number];
}

export interface Point {
  x: number;
  y: number;
}

const RAD = Math.PI / 180;

/** d3-geo geoNaturalEarth1 的 raw 投影（返回单位球坐标，需再乘 scale） */
export function naturalEarth1(lng: number, lat: number): Point {
  const lambda = lng * RAD;
  const phi = lat * RAD;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  return {
    x:
      lambda *
      (0.8707 -
        0.131979 * phi2 +
        phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    y:
      phi *
      (1.007226 +
        phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))),
  };
}

export function createProjection({ scale, translate }: ProjectionParams) {
  const [tx, ty] = translate;
  return (lng: number, lat: number): Point => {
    const p = naturalEarth1(lng, lat);
    return { x: tx + scale * p.x, y: ty - scale * p.y };
  };
}

export type Projector = ReturnType<typeof createProjection>;

export interface Arc {
  /** SVG path 的 d 属性 */
  d: string;
  /** 按 0–1 取弧线上的点（用于小人动画） */
  at: (t: number) => Point;
}

/**
 * 起点 → 终点的三次贝塞尔航线。
 * 控制点沿法线向上（屏幕 y 更小）抬起，高度随距离增长但设上限，
 * 保证短途不会拱成半圆、长途也不会飞出画布。
 */
export function buildArc(
  from: Point,
  to: Point,
  { curvature = 0.3, maxLift = 140 }: { curvature?: number; maxLift?: number } = {},
): Arc {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(maxLift, len * curvature);

  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const c1 = { x: from.x + dx / 3 + nx * lift, y: from.y + dy / 3 + ny * lift };
  const c2 = {
    x: from.x + (dx * 2) / 3 + nx * lift,
    y: from.y + (dy * 2) / 3 + ny * lift,
  };

  const at = (t: number): Point => {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return {
      x: a * from.x + b * c1.x + c * c2.x + d * to.x,
      y: a * from.y + b * c1.y + c * c2.y + d * to.y,
    };
  };

  return {
    d: `M${from.x.toFixed(1)},${from.y.toFixed(1)} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${to.x.toFixed(1)},${to.y.toFixed(1)}`,
    at,
  };
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
