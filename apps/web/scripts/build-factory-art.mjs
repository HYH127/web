/**
 * 生成「工厂实例」占位配图（技术图纸风格）
 *
 * 为什么不用照片：MVP 阶段没有真实工厂影像，用外部图床既不可靠也有版权风险。
 * 这里用统一视觉语言的矢量插画，白底细线 + 冷光青 + 香槟金，
 * 与站点设计 Token 一致；后续在 /factory/write 上传真实照片即可替换。
 *
 * 运行：pnpm --filter @wem/web gen:factory-art
 * 产物：public/images/factory/<motif>-<variant>.svg
 */
import fs from "node:fs";
import path from "node:path";

const W = 1200;
const H = 800;

const C = {
  paper: "#ffffff",
  surface: "#f8fafc",
  line: "#e3eaf2",
  strong: "#ccd8e4",
  ink: "#0a1526",
  muted: "#93a3b4",
  teal: "#2fb6c4",
  tealSoft: "#b7eef4",
  tealWash: "#eaf9fb",
  gold: "#b8933f",
  goldSoft: "#ecd9b2",
  goldWash: "#f7edda",
};

const line = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke ?? C.strong}" stroke-width="${o.sw ?? 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.opacity ? ` opacity="${o.opacity}"` : ""}/>`;

const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 0}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;

const circle = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;

const svgPath = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? C.strong}" stroke-width="${o.sw ?? 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.opacity ? ` opacity="${o.opacity}"` : ""}/>`;

/* ---------------- 六个母题的线稿 ---------------- */

function assembly(accent, gold) {
  const parts = [];
  // 传送带
  parts.push(rect(10, 378, 860, 30, { fill: C.surface, stroke: C.strong, rx: 6 }));
  for (let x = 36; x < 860; x += 42) {
    parts.push(circle(x, 393, 7, { stroke: C.strong, sw: 1 }));
  }
  // 六个工位
  for (let i = 0; i < 6; i += 1) {
    const x = 40 + i * 138;
    const active = i === 2;
    parts.push(
      rect(x, 236, 96, 96, {
        fill: active ? accent.wash : C.paper,
        stroke: active ? accent.main : C.strong,
        rx: 8,
        sw: active ? 1.6 : 1.1,
      }),
    );
    parts.push(rect(x + 22, 268, 52, 30, { stroke: active ? accent.main : C.strong, sw: 1 }));
    parts.push(line(x + 48, 300, x + 48, 332, { stroke: active ? accent.main : C.strong, sw: 1.1 }));
    parts.push(circle(x + 48, 336, 4, { fill: active ? accent.main : C.strong }));
    // 机械臂（第 1、4 工位）
    if (i === 0 || i === 4) {
      parts.push(line(x + 96, 236, x + 96, 168, { stroke: C.ink, sw: 2 }));
      parts.push(line(x + 96, 168, x + 148, 168, { stroke: C.ink, sw: 2 }));
      parts.push(circle(x + 96, 168, 6, { fill: C.paper, stroke: C.ink, sw: 2 }));
      parts.push(line(x + 148, 168, x + 148, 210, { stroke: C.ink, sw: 2 }));
      parts.push(rect(x + 138, 210, 20, 12, { stroke: C.ink, sw: 1.4 }));
    }
  }
  // 工件
  [110, 390, 660, 810].forEach((x, i) => {
    parts.push(
      rect(x, 348, 40, 26, {
        fill: i === 2 ? gold.wash : C.paper,
        stroke: i === 2 ? gold.main : C.strong,
        sw: 1.2,
      }),
    );
    parts.push(line(x, 361, x + 40, 361, { stroke: i === 2 ? gold.main : C.strong, sw: 0.9 }));
  });
  // 节拍标注
  parts.push(line(40, 508, 454, 508, { stroke: accent.main, sw: 1, dash: "4 6" }));
  parts.push(line(40, 498, 40, 518, { stroke: accent.main, sw: 1 }));
  parts.push(line(454, 498, 454, 518, { stroke: accent.main, sw: 1 }));
  parts.push(circle(454, 508, 5, { fill: accent.main }));
  return parts.join("");
}

function machining(accent, gold) {
  const p = [];
  p.push(rect(238, 92, 404, 372, { fill: C.paper, stroke: C.strong, rx: 14 }));
  p.push(circle(440, 278, 132, { stroke: C.strong, sw: 1.4 }));
  p.push(circle(440, 278, 96, { stroke: accent.main, sw: 1.2, dash: "5 7" }));
  p.push(circle(440, 278, 58, { stroke: C.strong, sw: 1.1 }));
  p.push(circle(440, 278, 10, { fill: gold.main }));
  for (let a = 0; a < 360; a += 30) {
    const rad = (a * Math.PI) / 180;
    p.push(
      line(
        440 + Math.cos(rad) * 58,
        278 + Math.sin(rad) * 58,
        440 + Math.cos(rad) * 132,
        278 + Math.sin(rad) * 132,
        { stroke: C.line, sw: 1 },
      ),
    );
  }
  // 刀路
  p.push(
    svgPath("M312 372 L372 312 L508 312 L568 372 L508 432 L372 432 Z", {
      stroke: accent.main,
      sw: 1.4,
      dash: "6 5",
    }),
  );
  // 主轴
  p.push(rect(410, 40, 60, 52, { fill: C.surface, stroke: C.strong, rx: 6 }));
  p.push(line(440, 92, 440, 146, { stroke: C.ink, sw: 2 }));
  p.push(rect(428, 146, 24, 34, { fill: C.paper, stroke: C.ink, sw: 1.4, rx: 3 }));
  // 冷却液点
  [190, 220, 690, 720].forEach((x, i) => p.push(circle(x, 150 + i * 26, 4, { fill: accent.main, opacity: 0.5 })));
  // 尺寸线
  p.push(line(238, 508, 642, 508, { stroke: C.strong, sw: 1 }));
  p.push(line(238, 498, 238, 518, { stroke: C.strong, sw: 1 }));
  p.push(line(642, 498, 642, 518, { stroke: C.strong, sw: 1 }));
  p.push(line(238, 508, 238, 92, { stroke: C.line, sw: 1, dash: "3 5" }));
  return p.join("");
}

function quality(accent, gold) {
  const p = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const cx = 120 + col * 96;
      const cy = 132 + row * 96;
      const isFocus = row === 1 && col === 3;
      p.push(
        circle(cx, cy, 28, {
          fill: isFocus ? accent.wash : C.paper,
          stroke: isFocus ? accent.main : C.strong,
          sw: isFocus ? 1.8 : 1.1,
        }),
      );
      p.push(circle(cx, cy, 11, { stroke: isFocus ? accent.main : C.line, sw: 1 }));
      if (isFocus) {
        p.push(line(cx - 44, cy, cx + 44, cy, { stroke: accent.main, sw: 1, dash: "3 4" }));
        p.push(line(cx, cy - 44, cx, cy + 44, { stroke: accent.main, sw: 1, dash: "3 4" }));
      }
    }
  }
  // 放大镜
  p.push(circle(700, 300, 128, { fill: C.paper, stroke: C.ink, sw: 2.2 }));
  p.push(circle(700, 300, 112, { stroke: accent.main, sw: 1.2 }));
  p.push(line(700 - 112, 300, 700 + 112, 300, { stroke: accent.main, sw: 0.9, opacity: 0.7 }));
  p.push(line(700, 300 - 112, 700, 300 + 112, { stroke: accent.main, sw: 0.9, opacity: 0.7 }));
  p.push(circle(700, 300, 34, { fill: gold.wash, stroke: gold.main, sw: 1.4 }));
  p.push(line(792, 392, 872, 472, { stroke: C.ink, sw: 14 }));
  // 千分尺刻度
  p.push(rect(96, 500, 700, 22, { fill: C.surface, stroke: C.strong, rx: 4 }));
  for (let x = 110; x <= 780; x += 22) {
    const tall = (x - 110) % 110 === 0;
    p.push(line(x, 500, x, 500 + (tall ? 22 : 10), { stroke: tall ? C.ink : C.strong, sw: tall ? 1.4 : 1 }));
  }
  p.push(circle(670, 511, 6, { fill: gold.main }));
  return p.join("");
}

function warehouse(accent, gold) {
  const p = [];
  const iso = (x, y, w, h) => {
    const d = 26;
    return {
      top: `${x},${y} ${x + w},${y - d} ${x + w + d},${y} ${x},${y + d}`,
      left: `M${x},${y + d} L${x},${y + d + h} L${x + w},${y + h} L${x + w},${y} Z`,
      right: `M${x + w},${y} L${x + w},${y + h} L${x + w + d},${y + h - d} L${x + w + d},${y - d} Z`,
    };
  };
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = 120 + col * 150 + (row % 2) * 26;
      const y = 160 + row * 120;
      const box = iso(x, y, 104, 72);
      const hot = row === 1 && col === 2;
      p.push(
        `<polygon points="${box.top}" fill="${hot ? accent.wash : C.paper}" stroke="${hot ? accent.main : C.strong}" stroke-width="1.3"/>`,
        `<polygon points="${box.left.replace(/M/g, "").replace(/ L/g, " ").replace(/ Z/g, "")}" fill="${hot ? accent.wash : C.surface}" stroke="${hot ? accent.main : C.strong}" stroke-width="1.3"/>`,
        `<polygon points="${box.right.replace(/M/g, "").replace(/ L/g, " ").replace(/ Z/g, "")}" fill="${hot ? accent.wash : C.paper}" stroke="${hot ? accent.main : C.strong}" stroke-width="1.3"/>`,
      );
      p.push(line(x + 14, y + 20, x + 90, y + 20, { stroke: hot ? accent.main : C.line, sw: 1 }));
    }
  }
  // 货架
  [92, 812].forEach((x) => {
    p.push(line(x, 120, x, 540, { stroke: C.strong, sw: 1.4 }));
    p.push(line(x, 120, x + 26, 120, { stroke: C.strong, sw: 1.4 }));
    p.push(line(x, 540, x + 26, 540, { stroke: C.strong, sw: 1.4 }));
  });
  // 拣货路径
  p.push(
    svgPath("M150 560 L150 520 L450 520 L450 300 L700 300", {
      stroke: gold.main,
      sw: 1.6,
      dash: "7 6",
    }),
  );
  p.push(circle(700, 300, 7, { fill: gold.main }));
  p.push(line(40, 600, 880, 600, { stroke: C.line, sw: 1 }));
  return p.join("");
}

function sample(accent, gold) {
  const p = [];
  const fills = ["#ffffff", C.surface, "#e6edf4", C.tealWash, accent.wash, C.goldWash, "#f1f5f9"];
  const strokes = [C.strong, C.strong, C.strong, accent.main, accent.main, gold.main, C.strong];
  for (let i = 0; i < 7; i += 1) {
    const angle = -24 + i * 8;
    p.push(
      `<g transform="rotate(${angle} 440 520)">` +
        rect(380, 140, 120, 380, {
          fill: fills[i],
          stroke: strokes[i],
          rx: 8,
          sw: i === 3 || i === 5 ? 1.6 : 1.1,
        }) +
        circle(440, 172, 7, { stroke: C.strong, sw: 1.2 }) +
        line(404, 214, 476, 214, { stroke: C.line, sw: 1 }) +
        line(404, 470, 476, 470, { stroke: C.line, sw: 1 }) +
        `${i % 2 === 0 ? rect(404, 380, 72, 60, { fill: C.paper, stroke: C.line, rx: 2 }) : ""}` +
        `</g>`,
    );
  }
  p.push(circle(440, 520, 8, { fill: C.ink }));
  p.push(line(440, 528, 440, 600, { stroke: C.ink, sw: 1.4 }));
  p.push(line(408, 600, 472, 600, { stroke: C.ink, sw: 1.4 }));
  // 色卡注释
  p.push(line(760, 220, 830, 220, { stroke: gold.main, sw: 1.2 }));
  p.push(circle(830, 220, 5, { fill: gold.main }));
  p.push(line(760, 320, 850, 320, { stroke: accent.main, sw: 1.2 }));
  p.push(circle(850, 320, 5, { fill: accent.main }));
  return p.join("");
}

function packaging(accent, gold) {
  const p = [];
  // 刀版展开图
  p.push(rect(200, 130, 480, 320, { fill: C.paper, stroke: C.ink, sw: 1.6, rx: 2 }));
  p.push(line(200, 240, 680, 240, { stroke: C.strong, sw: 1.1, dash: "6 6" }));
  p.push(line(200, 340, 680, 340, { stroke: C.strong, sw: 1.1, dash: "6 6" }));
  p.push(line(320, 130, 320, 450, { stroke: C.strong, sw: 1.1, dash: "6 6" }));
  p.push(line(560, 130, 560, 450, { stroke: C.strong, sw: 1.1, dash: "6 6" }));
  // 摇盖
  p.push(line(200, 130, 240, 90, { stroke: C.ink, sw: 1.2 }));
  p.push(line(680, 130, 640, 90, { stroke: C.ink, sw: 1.2 }));
  p.push(line(240, 90, 640, 90, { stroke: C.ink, sw: 1.2 }));
  // 印刷标记
  p.push(rect(356, 262, 168, 56, { fill: accent.wash, stroke: accent.main, sw: 1.3 }));
  p.push(line(380, 290, 500, 290, { stroke: accent.main, sw: 1.1 }));
  p.push(line(404, 306, 476, 306, { stroke: accent.main, sw: 1, opacity: 0.6 }));
  // 堆叠示意
  p.push(rect(760, 260, 110, 110, { fill: C.paper, stroke: C.strong, rx: 4 }));
  p.push(rect(772, 288, 86, 12, { fill: C.goldSoft, stroke: gold.main, sw: 1 }));
  p.push(rect(760, 150, 110, 96, { fill: C.surface, stroke: C.strong, rx: 4 }));
  p.push(line(760, 196, 870, 196, { stroke: C.line, sw: 1 }));
  // 跌落高度
  p.push(line(940, 130, 940, 400, { stroke: gold.main, sw: 1.2, dash: "6 6" }));
  p.push(line(930, 400, 950, 400, { stroke: gold.main, sw: 1.6 }));
  p.push(circle(940, 400, 6, { fill: gold.main }));
  p.push(line(40, 540, 900, 540, { stroke: C.line, sw: 1 }));
  return p.join("");
}

const MOTIFS = {
  assembly: { draw: assembly, label: "01" },
  machining: { draw: machining, label: "02" },
  quality: { draw: quality, label: "03" },
  warehouse: { draw: warehouse, label: "04" },
  sample: { draw: sample, label: "05" },
  packaging: { draw: packaging, label: "06" },
};

function buildSvg(name, variant) {
  const { draw, label } = MOTIFS[name];
  const accent =
    variant === "b"
      ? { main: C.gold, wash: C.goldWash }
      : { main: C.teal, wash: C.tealWash };
  const gold = variant === "b" ? { main: C.teal, wash: C.tealWash } : { main: C.gold, wash: C.goldWash };

  const art = draw(accent, gold)
    // 卡片尺寸下会缩小到 1/3，线宽整体提一档才看得清
    .replace(/stroke-width="([\d.]+)"/g, (_, value) => `stroke-width="${(Number(value) * 1.55).toFixed(2)}"`);

  const transform =
    variant === "b"
      ? "translate(72,26) scale(1.13) rotate(-1 440 300)"
      : "translate(68,30) scale(1.14)";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="工厂实例占位插画">
  <defs>
    <pattern id="fgrid-${name}-${variant}" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${C.line}" stroke-width="1" opacity="0.55"/>
    </pattern>
    <radialGradient id="fsoft-${name}-${variant}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent.main}" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="${accent.main}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${accent.main}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fglow-${name}-${variant}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${gold.main}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${gold.main}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.surface}"/>
  <rect width="${W}" height="${H}" fill="url(#fgrid-${name}-${variant})"/>
  <rect x="64" y="64" width="1072" height="672" rx="26" fill="${C.paper}" stroke="${C.line}"/>
  <ellipse cx="${variant === "b" ? 540 : 660}" cy="352" rx="430" ry="300" fill="url(#fsoft-${name}-${variant})"/>
  <ellipse cx="${variant === "b" ? 900 : 260}" cy="600" rx="300" ry="200" fill="url(#fglow-${name}-${variant})"/>
  <text x="1088" y="712" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="168" fill="${accent.main}" opacity="0.13">${label}</text>
  <g transform="${transform}">${art}</g>
  <g>
    <rect x="96" y="96" width="46" height="4" fill="${C.gold}"/>
    <rect x="96" y="96" width="4" height="46" fill="${C.teal}"/>
    <line x1="96" y1="700" x2="240" y2="700" stroke="${C.gold}" stroke-width="2"/>
    <line x1="1040" y1="104" x2="1104" y2="104" stroke="${C.strong}" stroke-width="1"/>
    <line x1="1104" y1="104" x2="1104" y2="140" stroke="${C.strong}" stroke-width="1"/>
    <circle cx="1104" cy="148" r="4" fill="${C.gold}"/>
  </g>
</svg>
`;
}

const OUT_DIR = path.resolve("public/images/factory");
fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const name of Object.keys(MOTIFS)) {
  for (const variant of ["a", "b"]) {
    const file = path.join(OUT_DIR, `${name}-${variant}.svg`);
    fs.writeFileSync(file, buildSvg(name, variant), "utf8");
    count += 1;
  }
}
console.log(`✔ 生成 ${count} 张占位插画 → ${path.relative(process.cwd(), OUT_DIR)}`);
