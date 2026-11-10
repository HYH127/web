/**
 * 世界地图数据（仅服务端使用）
 *
 * `world-map.generated.json` 由 `pnpm gen:world` 从 world-atlas 生成：
 * 176 个国家的 SVG 路径 + 投影参数，约 82KB（gzip 后约 29KB）。
 * 放在 SSR 里直接内联，浏览器无需下载地图数据或解析 TopoJSON。
 */
import generated from "./world-map.generated.json";
import { createProjection, type ProjectionParams } from "./world-geometry";

export const WORLD_VIEWBOX = generated.viewBox as [number, number, number, number];
export const WORLD_PROJECTION = generated.projection as ProjectionParams;
export const project = createProjection(WORLD_PROJECTION);

export interface WorldCountry {
  id: string;
  name: string;
  d: string;
}

export const worldCountries = generated.countries as WorldCountry[];

const pathById = new Map(worldCountries.map((c) => [c.id, c.d]));

/** ISO 3166-1 alpha-2 → 数字码（world-atlas 用数字码做 id） */
export const ISO_ALPHA2_TO_NUM: Record<string, string> = {
  CN: "156",
  DE: "276",
  US: "840",
  NL: "528",
  FR: "250",
  GB: "826",
  PL: "616",
  IT: "380",
  ES: "724",
  BR: "076",
  MX: "484",
  CA: "124",
  CL: "152",
  AE: "784",
  SA: "682",
  VN: "704",
  TH: "764",
  ID: "360",
  IN: "356",
  JP: "392",
  KR: "410",
  AU: "036",
  NZ: "554",
  ZA: "710",
  KE: "404",
  EG: "818",
  NG: "566",
  MA: "504",
  GH: "288",
  TZ: "834",
  ET: "231",
  RU: "643",
  TR: "792",
  KZ: "398",
  UZ: "860",
  PK: "586",
  CZ: "203",
  RO: "642",
  MY: "458",
  PH: "608",
  IL: "376",
  DZ: "012",
  AO: "024",
};

export function pathOfCountry(alpha2: string): string | undefined {
  const id = ISO_ALPHA2_TO_NUM[alpha2];
  return id ? pathById.get(id) : undefined;
}

/**
 * 亮度分级 → 填色（白底上由浅到深，控制饱和度避免成色块）
 *
 * 0 级（无贸易记录的国家）原来是 #eef3f8，在白底上几乎看不出边界，整张图
 * 显得「没画完」。压深到 #e3ebf4 并把描边提到 #8fc7d0，陆地轮廓才立得住，
 * 同时仍比 1 级浅，不会和贸易国抢视觉。
 */
export const LEVEL_FILL = [
  "#e3ebf4",
  "#e2f2f4",
  "#c8e9ed",
  "#a3dbe2",
  "#7bcbd6",
] as const;

/** 亮度分级 → 光晕半径（视图坐标系 1200×620） */
export const LEVEL_GLOW_RADIUS = [0, 26, 40, 58, 78] as const;
