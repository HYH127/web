/**
 * 首页地图接口的类型与降级数据（前后端共用形状，不引入后端依赖）
 */

export interface TradeMapCountry {
  code: string;
  name: string;
  continent: string;
  count: number;
  /** 亮度分级 0–4，避免极值过曝 */
  level: number;
  lat: number;
  lng: number;
  highlight: boolean;
}

export interface TradeMapRoute {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  /** 去程动画时长（ms） */
  durationMs: number;
  /** 到达后停留（ms） */
  stayMs: number;
  /** 相邻路线出发间隔（ms） */
  intervalMs: number;
}

export interface TradeMapData {
  origin: { code: string; name: string; lat: number; lng: number };
  countries: TradeMapCountry[];
  routes: TradeMapRoute[];
  totals: { countries: number; transactions: number; highlights: number };
}

/** 接口不可用时兜底：地图仍能画出轮廓，只是没有光点与小人 */
export const emptyTradeMap: TradeMapData = {
  origin: { code: "CN-ZJ", name: "义乌 · 浙江", lat: 29.3069, lng: 120.0755 },
  countries: [],
  routes: [],
  totals: { countries: 0, transactions: 0, highlights: 0 },
};

export function formatCount(value: number) {
  return value.toLocaleString("zh-CN");
}
