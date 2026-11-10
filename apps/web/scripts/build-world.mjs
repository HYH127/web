/**
 * 构建期地图数据生成器
 *
 * 输入：world-atlas/countries-110m.json（TopoJSON，约 1:1.1 亿精度）
 * 输出：src/lib/world-map.generated.json
 *   { viewBox, projection: { scale, translate }, countries: [{ id, name, d }] }
 *
 * 为什么在构建期做：
 * 1. topojson 解析 + d3 投影只在 Node 跑一次，浏览器端零解析开销；
 * 2. 输出的是纯 SVG path 字符串，SSR 直接内联，首屏不需要等 JS；
 * 3. 投影参数一起导出，运行时用十几行纯函数即可把经纬度换算成坐标，
 *    这样浏览器不必打包 d3-geo。
 *
 * 运行：pnpm --filter @wem/web gen:world
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const TOPO_PATH = require.resolve("world-atlas/countries-110m.json");
const OUT_PATH = path.resolve(process.cwd(), "src/lib/world-map.generated.json");

const WIDTH = 1200;
const HEIGHT = 620;
const DIGITS = 0;

const topo = JSON.parse(fs.readFileSync(TOPO_PATH, "utf8"));
const all = feature(topo, topo.objects.countries).features;

// 去掉南极洲（id 010）：极地投影在 Natural Earth 上会被拉成一条长带，
// 视觉上抢戏且没有交易节点。
const land = all.filter((f) => String(f.id) !== "010");

const projection = geoNaturalEarth1().fitExtent(
  [
    [0, 0],
    [WIDTH, HEIGHT],
  ],
  { type: "FeatureCollection", features: land },
);

const pathGen = geoPath(projection).digits(DIGITS);

// 投影是等比的：fitExtent 之后总有一边留白（陆地比画布更宽），
// 直接按陆地实际外框裁 viewBox，避免首屏底部出现一条空海面。
const [[bx0, by0], [bx1, by1]] = pathGen.bounds({
  type: "FeatureCollection",
  features: land,
});
const PAD = 6;
const view = {
  x: Math.floor(bx0) - PAD,
  y: Math.floor(by0) - PAD,
  w: Math.ceil(bx1 - bx0) + PAD * 2,
  h: Math.ceil(by1 - by0) + PAD * 2,
};

const countries = land
  .map((f) => ({
    id: String(f.id),
    name: f.properties?.name ?? "",
    d: pathGen(f),
  }))
  .filter((c) => c.d && c.d.length > 4);

// 运行时用的纯函数投影，必须与 d3 的 geoNaturalEarth1 完全一致，
// 这里跑一次误差自检，超过 0.5 像素就报错，避免地图和光点错位。
function projectRaw(lambdaDeg, phiDeg) {
  const lambda = (lambdaDeg * Math.PI) / 180;
  const phi = (phiDeg * Math.PI) / 180;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  return [
    lambda *
      (0.8707 -
        0.131979 * phi2 +
        phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    phi *
      (1.007226 +
        phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))),
  ];
}

const [tx, ty] = projection.translate();
const k = projection.scale();
const toScreen = (lng, lat) => {
  const [x, y] = projectRaw(lng, lat);
  return [tx + k * x, ty - k * y];
};

const samples = [
  [121.55, 29.87], // 宁波
  [10.4, 51.1], // 德国
  [-98.6, 39.8], // 美国
  [-51.9, -14.2], // 巴西
  [133.8, -25.3], // 澳大利亚
];
let maxError = 0;
for (const [lng, lat] of samples) {
  const [x1, y1] = toScreen(lng, lat);
  const [x2, y2] = projection([lng, lat]);
  maxError = Math.max(maxError, Math.hypot(x1 - x2, y1 - y2));
}
if (maxError > 0.5) {
  throw new Error(`投影自检失败：最大误差 ${maxError.toFixed(3)}px`);
}

const payload = {
  viewBox: [view.x, view.y, view.w, view.h],
  projection: { scale: k, translate: [tx, ty] },
  countries,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(payload), "utf8");

// 底图另存为静态 SVG：176 条国界路径只在首屏加载一次，
// 不进入 RSC 数据流，也不会在客户端路由切换时被重复传输。
const PUBLIC_DIR = path.resolve(process.cwd(), "public/map");
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
const baseSvg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" width="${view.w}" height="${view.h}">`,
  `<g fill="#e3ebf4" stroke="#c7d6e5" stroke-width="0.5" stroke-linejoin="round">`,
  ...countries.map((c) => `<path d="${c.d}"/>`),
  "</g></svg>",
].join("");
fs.writeFileSync(path.join(PUBLIC_DIR, "world-base.svg"), baseSvg, "utf8");

const bytes = fs.statSync(OUT_PATH).size;
const svgBytes = fs.statSync(path.join(PUBLIC_DIR, "world-base.svg")).size;
console.log(
  [
    `countries: ${countries.length}`,
    `viewBox: ${view.x} ${view.y} ${view.w} ${view.h}`,
    `scale: ${k.toFixed(2)} translate: [${tx.toFixed(2)}, ${ty.toFixed(2)}]`,
    `projection error: ${maxError.toFixed(4)}px`,
    `output: ${path.relative(process.cwd(), OUT_PATH)} (${(bytes / 1024).toFixed(1)} KB)`,
    `static: public/map/world-base.svg (${(svgBytes / 1024).toFixed(1)} KB)`,
  ].join("\n"),
);
