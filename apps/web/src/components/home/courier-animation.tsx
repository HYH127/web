"use client";

/**
 * 小人奔跑动画（随机航线）
 *
 * 每一趟从已交易国家里随机挑一个目的地，因此画面始终有变化。
 * 同屏最多 2 个（桌面端），移动端只保留 1 个。
 *
 * 一趟行程 = 抱箱奔出去 → 到达 → 弯腰把箱子放下 → 转身 → 空手跑回来 → 短暂消失 → 重抽国家。
 * 去程时长按弧长换算，长短途的奔跑速度看起来一致；回程空手更快一点。
 *
 * 位置每帧直接写 DOM 属性，不走 React state，避免 60fps 重渲染。
 * 几何与地图同源（buildArc），所以小人与它自己的虚线航迹永远重合。
 */
import { useEffect, useRef } from "react";
import { buildArc, type Point } from "@/lib/world-geometry";

export interface CourierDestination {
  /** 国家代码，用于避免连续两次飞同一处 */
  id: string;
  name: string;
  x: number;
  y: number;
  count: number;
}

interface CourierAnimationProps {
  origin: Point;
  destinations: CourierDestination[];
  /** 地图 viewBox，用于给航迹遮罩定范围 */
  bounds?: [number, number, number, number];
}

interface Trip {
  arc: ReturnType<typeof buildArc>;
  outMs: number;
  stayMs: number;
  backMs: number;
  total: number;
  start: number;
  toId: string;
  toName: string;
  toX: number;
  toY: number;
  /** 终点落在标题区（左侧提亮椭圆）里：灯照样亮，但不写国名，免得压在大标题上 */
  hideLabel: boolean;
}

interface Slot {
  index: number;
  wrapper: SVGGElement;
  figure: SVGGElement;
  upper: SVGGElement | null;
  trail: SVGPathElement | null;
  grad: SVGLinearGradientElement | null;
  legA: SVGPathElement | null;
  legB: SVGPathElement | null;
  armBack: SVGPathElement | null;
  armFront: SVGPathElement | null;
  box: SVGGElement | null;
  speed: SVGGElement | null;
  dropped: SVGGElement | null;
  /** 目的地中文名：只有文字 + 白色描边，不加底板，避免遮住地图 */
  label: SVGGElement | null;
  labelText: SVGTextElement | null;
  /** 目的地那盏棕色灯：这一趟送到哪国就亮在哪国 */
  target: SVGGElement | null;
  trip: Trip | null;
  lastId: string;
  booted: boolean;
}

const SLOT_COUNT = 2;
/** 到达后：站定 → 弯腰放箱 → 空手站一会儿，三段的时长 */
const SETTLE_MS = 240;
const DROP_MS = 720;
const STAY_MS = SETTLE_MS + DROP_MS + 460;
const GAP_MS = 1000;
/** 空手回程比去程快 */
const BACK_SPEED_RATIO = 1.5;
/** 每视图单位对应的去程时长，让远近航线的观感速度一致 */
const MS_PER_UNIT = 15;
const MIN_OUT_MS = 3200;
const MAX_OUT_MS = 8200;
/** 桌面按这个比例画人；移动端地图整体缩小，需要单独放大 */
const FIGURE_SCALE = 1.35;
const MOBILE_SCALE = 2.4;

/* 跑步姿态的骨架尺寸：髋部、大腿、小腿（与地图同一坐标系，单位≈px@1200 宽） */
const HIP_Y = -4.4;
const THIGH = 2.55;
const SHIN = 2.55;
const CARRY_ARM = "M0.3,-8.9 L2.4,-8.4 L3.4,-7.9";
const PUMP_ARM = "M0.3,-8.9 L1.1,-6.9 L2.4,-7.6";
/** 箱子从胸前落到地面的位移（本地坐标，y 向下为正） */
const BOX_DROP_DY = 5.6;
/** 弯腰放箱时上半身前倾的最大角度（弧度） */
const BEND_MAX = 0.62;

/** 站定时的双腿：膝盖基本伸直、两脚略分开 */
const STAND_A = "M0,-4.4 L-0.35,-1.9 L-1.05,0.55";
const STAND_B = "M0,-4.4 L0.35,-1.9 L1.05,0.55";

/**
 * 首屏左侧标题区（与航迹遮罩同一块椭圆）。
 * 落在这里的国家不写名字——那块被柔边遮罩压白，写上去就是压在大标题上的第二层字。
 */
const TYPE_ZONE = { x: 288, y: 262, rx: 300, ry: 138 };
function inTypeZone(x: number, y: number) {
  return (
    ((x - TYPE_ZONE.x) / TYPE_ZONE.rx) ** 2 + ((y - TYPE_ZONE.y) / TYPE_ZONE.ry) ** 2 < 1
  );
}

/**
 * 单条腿的跑步轨迹：髋角随相位前后摆，向后摆时收膝（脚跟上抬）。
 * 第二项 cos 让两条腿在「经过身体中线」的瞬间一屈一伸——
 * 否则两腿会在同一帧重叠成笔直站立，「跑」就读成了「站」。
 */
function legPath(phase: number) {
  const swing = 1.0 * Math.sin(phase);
  const bend =
    0.15 +
    1.15 * Math.max(0, -Math.sin(phase)) +
    0.85 * Math.max(0, Math.cos(phase));
  const kneeX = Math.sin(swing) * THIGH;
  const kneeY = Math.cos(swing) * THIGH;
  const shin = swing - bend;
  const footX = kneeX + Math.sin(shin) * SHIN;
  const footY = kneeY + Math.cos(shin) * SHIN;
  return `M0,${HIP_Y} L${kneeX.toFixed(2)},${(HIP_Y + kneeY).toFixed(2)} L${footX.toFixed(2)},${(HIP_Y + footY).toFixed(2)}`;
}

/** 按交易量加权抽一个目的地；平方根压一压极值，避免永远只去最大的几个国家 */
function pickDestination(
  pool: CourierDestination[],
  lastId: string,
  taken: Set<string>,
): CourierDestination | null {
  if (pool.length === 0) return null;

  let candidates = pool.filter((d) => d.id !== lastId && !taken.has(d.id));
  if (candidates.length === 0) candidates = pool.filter((d) => d.id !== lastId);
  if (candidates.length === 0) candidates = pool;

  const weights = candidates.map((d) => Math.pow(Math.max(1, d.count), 0.6));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function CourierAnimation({
  origin,
  destinations,
  bounds = [-6, 42, 1212, 535],
}: CourierAnimationProps) {
  const [bvx, bvy, bvw, bvh] = bounds;
  const rootRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || destinations.length === 0) return;

    const slots: Slot[] = [];
    for (let index = 0; index < SLOT_COUNT; index += 1) {
      const wrapper = root.querySelector<SVGGElement>(`[data-slot="${index}"]`);
      const figure = wrapper?.querySelector<SVGGElement>("[data-courier]");
      if (!wrapper || !figure) continue;
      slots.push({
        index,
        wrapper,
        figure,
        upper: figure.querySelector<SVGGElement>(".upper"),
        trail: wrapper.querySelector<SVGPathElement>(".trail"),
        grad: root.querySelector<SVGLinearGradientElement>(`#courier-trail-${index}`),
        legA: figure.querySelector<SVGPathElement>(".leg-a"),
        legB: figure.querySelector<SVGPathElement>(".leg-b"),
        armBack: figure.querySelector<SVGPathElement>(".arm-back"),
        armFront: figure.querySelector<SVGPathElement>(".arm-front"),
        box: figure.querySelector<SVGGElement>(".box"),
        speed: figure.querySelector<SVGGElement>(".speed"),
        dropped: wrapper.querySelector<SVGGElement>(".dropped"),
        label: wrapper.querySelector<SVGGElement>(".dest-label"),
        labelText: wrapper.querySelector<SVGTextElement>(".dest-label-text"),
        target: wrapper.querySelector<SVGGElement>(".target"),
        trip: null,
        lastId: "",
        booted: false,
      });
    }
    if (slots.length === 0) return;

    // 视口宽度只在 resize 时读一次，避免每帧都碰 layout
    let viewportWidth = window.innerWidth;
    const figureScale = () => (viewportWidth < 768 ? MOBILE_SCALE : FIGURE_SCALE);
    // 标签要压在缩小的地图上也读得清：按「每用户单位多少像素」反算放大倍数
    const stageSvg = root.ownerSVGElement;
    let pxPerUnit = 1;
    const measureStage = () => {
      const rect = stageSvg?.getBoundingClientRect();
      pxPerUnit = rect && rect.width > 0 ? rect.width / bvw : 1;
    };
    const labelScale = () => Math.max(1, Math.min(3.2, 1.05 / pxPerUnit));
    measureStage();
    const onResize = () => {
      viewportWidth = window.innerWidth;
      measureStage();
    };
    window.addEventListener("resize", onResize, { passive: true });

    const startTrip = (slot: Slot, now: number, taken: Set<string>): Trip | null => {
      const to = pickDestination(destinations, slot.lastId, taken);
      if (!to) return null;

      const len = Math.hypot(to.x - origin.x, to.y - origin.y) || 1;
      const outMs = Math.round(
        Math.min(MAX_OUT_MS, Math.max(MIN_OUT_MS, len * MS_PER_UNIT)),
      );
      const backMs = Math.round(outMs / BACK_SPEED_RATIO);
      // 曲率每趟略有差别，避免所有航线叠成同一道弧
      const arc = buildArc(origin, { x: to.x, y: to.y }, {
        curvature: 0.22 + Math.random() * 0.1,
      });

      slot.lastId = to.id;

      if (slot.trail) slot.trail.setAttribute("d", arc.d);

      // 目的地标记：棕色灯 + 国家名，位置钉在终点国家上
      if (slot.target) {
        slot.target.setAttribute(
          "transform",
          `translate(${to.x.toFixed(2)},${to.y.toFixed(2)})`,
        );
        slot.target.style.opacity = "0";
      }
      if (slot.label) {
        slot.label.setAttribute(
          "transform",
          `translate(${to.x.toFixed(2)},${to.y.toFixed(2)}) scale(${labelScale().toFixed(2)})`,
        );
        slot.label.style.opacity = "0";
      }
      if (slot.labelText) {
        // 纯文字：默认吊在光点上方，贴地图顶边的国家翻到下方。
        // 两个小人各错开一行，荷兰 / 波兰这种相邻国家不会叠在一起。
        const flip = to.y < 105;
        const dy = flip ? 24 + slot.index * 15 : -15 - slot.index * 15;
        slot.labelText.textContent = to.name;
        slot.labelText.setAttribute("y", String(dy));
      }
      if (slot.grad) {
        slot.grad.setAttribute("x1", String(origin.x));
        slot.grad.setAttribute("y1", String(origin.y));
        slot.grad.setAttribute("x2", String(to.x));
        slot.grad.setAttribute("y2", String(to.y));
      }

      // 落地的那只箱子先按「终点处、朝终点的朝向」摆好，放下之前保持不可见
      if (slot.dropped) {
        const head = arc.at(1);
        const tail = arc.at(0.985);
        const endDir = head.x - tail.x >= 0 ? 1 : -1;
        const scale = figureScale();
        slot.dropped.setAttribute(
          "transform",
          `translate(${to.x.toFixed(2)},${to.y.toFixed(2)}) scale(${(endDir * scale).toFixed(3)},${scale.toFixed(3)})`,
        );
        slot.dropped.style.opacity = "0";
      }

      return {
        arc,
        outMs,
        stayMs: STAY_MS,
        backMs,
        total: outMs + STAY_MS + backMs + GAP_MS,
        start: now,
        toId: to.id,
        toName: to.name,
        toX: to.x,
        toY: to.y,
        hideLabel: inTypeZone(to.x, to.y),
      };
    };

    const paint = (slot: Slot, now: number) => {
      const taken = new Set(
        slots.filter((s) => s !== slot && s.trip).map((s) => s.trip!.toId),
      );
      if (!slot.trip) {
        slot.trip = startTrip(slot, now, taken);
        // 第二个小人延后出场，否则两个同时从义乌出发，看起来像重影
        if (slot.trip && !slot.booted) {
          slot.trip.start += slot.index * 2600;
          slot.booted = true;
        }
      } else if (now - slot.trip.start >= slot.trip.total) {
        slot.trip = startTrip(slot, now, taken);
      }
      const trip = slot.trip;
      if (!trip) return;

      const t = now - trip.start;
      const outEnd = trip.outMs;
      const stayEnd = outEnd + trip.stayMs;
      const backEnd = stayEnd + trip.backMs;

      let s = 1;
      let carrying = true;
      let visible = true;
      let moving = false;
      let grounded = false;
      let bend = 0;
      let drop = 0;

      if (t < 0) {
        // 还没到出发时间（延后出场的那一个）
        visible = false;
        s = 0;
      } else if (t < outEnd) {
        s = t / outEnd;
        moving = true;
      } else if (t < stayEnd) {
        s = 1;
        const arrive = t - outEnd;
        if (arrive >= SETTLE_MS) {
          // 弯腰、把箱子放到地上、再直起身
          drop = Math.min(1, (arrive - SETTLE_MS) / DROP_MS);
          bend = Math.sin(Math.PI * drop) * BEND_MAX;
          if (drop >= 1) {
            carrying = false;
            grounded = true;
          }
        }
      } else if (t < backEnd) {
        s = 1 - (t - stayEnd) / trip.backMs;
        carrying = false;
        grounded = true;
        moving = true;
      } else {
        visible = false;
        grounded = true;
        s = 0;
      }

      // 国家名 / 棕灯：去程淡入 → 到站常显 → 回程淡出（人回到义乌就熄灯）
      let labelOpacity = 0;
      if (t >= 0) {
        if (t < outEnd) labelOpacity = Math.min(1, t / 520);
        else if (t < stayEnd) labelOpacity = 1;
        else labelOpacity = Math.max(0, 1 - (t - stayEnd) / 420);
      }
      if (slot.label) slot.label.style.opacity = String(trip.hideLabel ? 0 : labelOpacity);
      // 灯也一样：落在大标题上的金点会被读成错字，干脆不点
      if (slot.target) slot.target.style.opacity = String(trip.hideLabel ? 0 : labelOpacity);

      // 航迹 / 落地箱子：出发淡入，回程结束前淡出，不残留成静态图
      const fadeIn = Math.min(1, Math.max(0, t) / 620);
      const fadeOut = 1 - Math.min(1, Math.max(0, (t - (trip.total - 560)) / 560));
      const fade = Math.max(0, Math.min(fadeIn, fadeOut));
      if (slot.trail) slot.trail.style.opacity = String(fade * 0.9);
      if (slot.dropped) slot.dropped.style.opacity = grounded ? String(fade) : "0";

      const p = trip.arc.at(Math.min(1, Math.max(0, s)));
      const ahead = trip.arc.at(Math.min(1, s + 0.015));
      const behind = trip.arc.at(Math.max(0, s - 0.015));
      // 弧线参数 s 始终由起点指向终点，回程要按运动方向取反，否则会倒着跑
      const tangent = ahead.x - behind.x >= 0 ? 1 : -1;
      const dir = carrying ? tangent : -tangent;

      const scale = figureScale();
      const cycleMs = carrying ? 430 : 380;
      const phase = (now / cycleMs) * Math.PI * 2 + slot.index * 2.1;
      const bob = moving ? Math.abs(Math.sin(phase)) * 0.6 : 0;

      slot.figure.setAttribute(
        "transform",
        `translate(${p.x.toFixed(2)},${(p.y - bob).toFixed(2)}) scale(${(dir * scale).toFixed(3)},${scale.toFixed(3)})`,
      );
      slot.figure.style.opacity = visible ? "1" : "0";
      // 站定时不该有速度线，否则像在原地蹭
      if (slot.speed) slot.speed.style.opacity = moving ? "1" : "0";

      // 上半身整体前倾（绕髋部旋转），用来表现弯腰放箱
      slot.upper?.setAttribute(
        "transform",
        bend > 0.001 ? `rotate(${((bend * 180) / Math.PI).toFixed(1)} 0 ${HIP_Y})` : "rotate(0 0 0)",
      );

      if (moving) {
        slot.legA?.setAttribute("d", legPath(phase));
        slot.legB?.setAttribute("d", legPath(phase + Math.PI));
        const armSwing = 24 * Math.sin(phase + Math.PI);
        slot.armBack?.setAttribute("transform", `rotate(${armSwing.toFixed(1)} 0.3 -8.9)`);
        if (carrying) {
          slot.armFront?.removeAttribute("transform");
        } else {
          slot.armFront?.setAttribute(
            "transform",
            `rotate(${(-armSwing * 0.9).toFixed(1)} 0.3 -8.9)`,
          );
        }
      } else {
        // 停留阶段站定，不要原地跑
        slot.legA?.setAttribute("d", STAND_A);
        slot.legB?.setAttribute("d", STAND_B);
        slot.armBack?.setAttribute("transform", "rotate(0 0.3 -8.9)");
        slot.armFront?.removeAttribute("transform");
      }

      slot.armFront?.setAttribute("d", carrying ? CARRY_ARM : PUMP_ARM);
      if (slot.box) {
        slot.box.style.opacity = carrying ? "1" : "0";
        slot.box.setAttribute("transform", `translate(0,${(BOX_DROP_DY * drop).toFixed(2)})`);
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // 静态帧：停在去程 55% 的空中姿态，不跑动画
      slots.forEach((slot) => {
        slot.trip = startTrip(slot, 0, new Set());
        if (slot.trip) slot.trip.start = -Math.round(slot.trip.outMs * 0.55);
        paint(slot, 0);
        if (slot.trail) slot.trail.style.opacity = "0";
        slot.figure.style.opacity = "0.92";
      });
      return () => window.removeEventListener("resize", onResize);
    }

    let frame = 0;
    // 用累计时钟而不是 performance.now() 差值：切后台回来不会因为跳时间而瞬移
    let elapsed = 0;
    let last = performance.now();
    let running = true;

    const tick = (now: number) => {
      elapsed += Math.min(64, now - last);
      last = now;
      slots.forEach((slot) => paint(slot, elapsed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };
    const resume = () => {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    // 标签页不可见 / 地图滚出视口时暂停，回来接着跑
    const onVisibility = () => (document.hidden ? stop() : resume());
    document.addEventListener("visibilitychange", onVisibility);

    const stage = root.closest("svg");
    let observer: IntersectionObserver | null = null;
    if (stage && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => (entries[0]?.isIntersecting ? resume() : stop()),
        { threshold: 0 },
      );
      observer.observe(stage);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [origin, destinations]);

  return (
    <g ref={rootRef} aria-hidden className="pointer-events-none">
      <defs>
        {/* 目的地灯的光晕：棕金 → 透明，代替高斯模糊 */}
        <radialGradient id="courier-target-halo">
          <stop offset="0%" stopColor="#b8933f" stopOpacity={0.34} />
          <stop offset="45%" stopColor="#b8933f" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#b8933f" stopOpacity={0} />
        </radialGradient>

        {/* 航迹渐变按「起点→终点」逐条定义：userSpaceOnUse 锁死方向，
            否则金色会被 objectBoundingBox 放到地理左侧 */}
        {Array.from({ length: SLOT_COUNT }, (_, index) => (
          <linearGradient
            key={index}
            id={`courier-trail-${index}`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={0}
            y2={0}
          >
            <stop offset="0%" stopColor="#2fb6c4" stopOpacity="0.25" />
            <stop offset="55%" stopColor="#2fb6c4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b8933f" stopOpacity="0.85" />
          </linearGradient>
        ))}

        {/* 文案避让：首屏左侧是大标题，虚线从字上穿过去会很脏。
            这里用一块柔边遮罩把标题区的航迹擦掉，小人本身不受影响
            （坐标按 1440 宽的版式换算，视野更宽时只会多擦掉一点空白）。 */}
        <radialGradient
          id="courier-type-hole"
          gradientUnits="userSpaceOnUse"
          cx={0}
          cy={0}
          r={1}
          gradientTransform="translate(288 262) scale(300 138)"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="62%" stopColor="#000000" stopOpacity={0.92} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </radialGradient>
        <mask
          id="courier-trail-mask"
          maskUnits="userSpaceOnUse"
          x={bvx}
          y={bvy}
          width={bvw}
          height={bvh}
        >
          <rect x={bvx} y={bvy} width={bvw} height={bvh} fill="#ffffff" />
          <ellipse cx={288} cy={262} rx={300} ry={138} fill="url(#courier-type-hole)" />
        </mask>
      </defs>

      {Array.from({ length: SLOT_COUNT }, (_, index) => (
        <g
          key={index}
          data-slot={index}
          /* 移动端只保留第一个小人（同屏路线过多会变成噪点） */
          className={index > 0 ? "hidden md:inline" : undefined}
        >
          {/* 这一趟的航迹，路径与渐变的端点由脚本按抽中的国家改写 */}
          <path
            className="trail animate-drift"
            fill="none"
            stroke={`url(#courier-trail-${index})`}
            strokeWidth={1.4}
            strokeDasharray="6 8"
            strokeLinecap="round"
            mask="url(#courier-trail-mask)"
            style={{ opacity: 0 }}
          />

          {/* 目的地那盏棕色灯：只有这一趟要送到的国家才亮，回程熄灭 */}
          <g className="target" style={{ opacity: 0 }}>
            <circle r={13} fill="url(#courier-target-halo)" />
            <circle
              className="target-ring animate-target"
              r={4.6}
              fill="none"
              stroke="#b8933f"
              strokeWidth={1}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <circle r={2.9} fill="#b8933f" />
            <circle r={1.1} fill="#fff3d6" />
          </g>

          {/* 送达后留在地上的箱子（放下之前不可见） */}
          <g className="dropped" style={{ opacity: 0 }}>
            <ellipse cx={5.5} cy={0.45} rx={2.9} ry={0.72} fill="#0a1526" opacity={0.1} />
            <rect
              x={3.3}
              y={-3.4}
              width={4.4}
              height={3.4}
              rx={0.5}
              fill="#f7edda"
              stroke="#b8933f"
              strokeWidth={0.85}
            />
            <path d="M3.3,-1.7 L7.7,-1.7" stroke="#b8933f" strokeWidth={0.6} />
          </g>

          <g data-courier style={{ opacity: 0, transition: "opacity 160ms linear" }}>
            {/* 地面投影 */}
            <ellipse cx={0} cy={1.4} rx={3.6} ry={0.9} fill="#0a1526" opacity={0.12} />
            {/* 速度线：只给一点点，够读成「在跑」即可 */}
            <g className="speed" stroke="#178f9c" strokeWidth={0.9} strokeLinecap="round" fill="none">
              <path d="M-2.6,-6.6 L-5.4,-6.2" opacity={0.22} />
              <path d="M-2.2,-4.2 L-4.4,-4.0" opacity={0.16} />
            </g>
            {/* 双腿：脚本每帧写 d，膝盖随相位弯曲；站定时换成站姿 */}
            <path
              className="leg-a"
              d={STAND_A}
              stroke="#0a1526"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              className="leg-b"
              d={STAND_B}
              stroke="#0a1526"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* 上半身：整体绕髋部旋转，用来做「弯腰放箱」 */}
            <g className="upper">
              {/* 头（前倾，落在肩前方，配合躯干倾角读成奔跑） */}
              <circle cx={1.15} cy={-10.6} r={1.6} fill="#0a1526" />
              {/* 躯干：肩在髋前方，形成前倾 */}
              <path
                d="M0.3,-8.9 L0,-4.4"
                stroke="#0a1526"
                strokeWidth={1.75}
                strokeLinecap="round"
                fill="none"
              />
              {/* 后摆臂（持箱时反向摆，空手时同步摆） */}
              <path
                className="arm-back"
                d={PUMP_ARM}
                stroke="#0a1526"
                strokeWidth={1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* 前臂：抱箱时托举，空手时摆臂 */}
              <path
                className="arm-front"
                d={CARRY_ARM}
                stroke="#0a1526"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* 纸箱：放箱动画里沿本地下落，落地后立刻交给 .dropped 接棒
                  （这里不能做淡出过渡，否则会与地上的箱子同时出现两帧） */}
              <g className="box">
                <rect
                  x={3.3}
                  y={-9}
                  width={4.4}
                  height={3.4}
                  rx={0.5}
                  fill="#f7edda"
                  stroke="#b8933f"
                  strokeWidth={0.85}
                />
                <path d="M3.3,-7.3 L7.7,-7.3" stroke="#b8933f" strokeWidth={0.6} />
              </g>
            </g>
          </g>

          {/* 目的地国名：纯文字 + 白色描边压住底图，不加底板，回程自动隐去 */}
          <g className="dest-label" style={{ opacity: 0 }}>
            <text
              className="dest-label-text"
              x={0}
              y={-15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={500}
              letterSpacing="0.06em"
              fill="#8a6a24"
              stroke="#ffffff"
              strokeWidth={2.8}
              strokeOpacity={0.9}
              strokeLinejoin="round"
              paintOrder="stroke"
            />
          </g>
        </g>
      ))}
    </g>
  );
}
