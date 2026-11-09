/**
 * 首页世界地图的贸易数据（国家亮度分级）
 *
 * 单独成模块，是为了让「热点国家」可以脱离整库重置单独同步：
 * `pnpm --filter @wem/api trade:sync` 只重写 TradeStat 表，不动商品、案例、工厂记录与用户。
 *
 * 字段口径：
 * - `transactionCount`：2025 年该国出运笔数（不是柜量，柜量见 company.ts 的 1,240 柜）
 * - `brightnessLevel`：0–4，决定染色深浅与光晕半径；0 = 只有底图轮廓
 * - `isHighlight`：历史字段，界面已改为「航线飞到哪国，哪国亮灯」，不再常驻高亮
 */
export const tradeStats = [
  { countryCode: "DE", countryName: "德国", continent: "EUROPE" as const, transactionCount: 486, brightnessLevel: 4, lat: 51.1, lng: 10.4, isHighlight: false },
  { countryCode: "US", countryName: "美国", continent: "NORTH_AMERICA" as const, transactionCount: 512, brightnessLevel: 4, lat: 39.8, lng: -98.6, isHighlight: false },
  { countryCode: "NL", countryName: "荷兰", continent: "EUROPE" as const, transactionCount: 214, brightnessLevel: 3, lat: 52.1, lng: 5.3, isHighlight: false },
  { countryCode: "FR", countryName: "法国", continent: "EUROPE" as const, transactionCount: 168, brightnessLevel: 2, lat: 46.2, lng: 2.2, isHighlight: false },
  { countryCode: "GB", countryName: "英国", continent: "EUROPE" as const, transactionCount: 176, brightnessLevel: 2, lat: 54.0, lng: -2.0, isHighlight: false },
  { countryCode: "PL", countryName: "波兰", continent: "EUROPE" as const, transactionCount: 96, brightnessLevel: 2, lat: 51.9, lng: 19.1, isHighlight: false },
  { countryCode: "IT", countryName: "意大利", continent: "EUROPE" as const, transactionCount: 88, brightnessLevel: 1, lat: 41.9, lng: 12.6, isHighlight: false },
  { countryCode: "ES", countryName: "西班牙", continent: "EUROPE" as const, transactionCount: 74, brightnessLevel: 1, lat: 40.4, lng: -3.7, isHighlight: false },
  { countryCode: "BR", countryName: "巴西", continent: "SOUTH_AMERICA" as const, transactionCount: 142, brightnessLevel: 3, lat: -14.2, lng: -51.9, isHighlight: false },
  { countryCode: "MX", countryName: "墨西哥", continent: "NORTH_AMERICA" as const, transactionCount: 128, brightnessLevel: 2, lat: 23.6, lng: -102.5, isHighlight: false },
  { countryCode: "CA", countryName: "加拿大", continent: "NORTH_AMERICA" as const, transactionCount: 96, brightnessLevel: 2, lat: 56.1, lng: -106.3, isHighlight: false },
  { countryCode: "CL", countryName: "智利", continent: "SOUTH_AMERICA" as const, transactionCount: 42, brightnessLevel: 1, lat: -35.7, lng: -71.5, isHighlight: false },
  { countryCode: "AE", countryName: "阿联酋", continent: "ASIA" as const, transactionCount: 196, brightnessLevel: 3, lat: 23.4, lng: 53.8, isHighlight: false },
  { countryCode: "SA", countryName: "沙特", continent: "ASIA" as const, transactionCount: 112, brightnessLevel: 2, lat: 23.9, lng: 45.1, isHighlight: false },
  { countryCode: "VN", countryName: "越南", continent: "ASIA" as const, transactionCount: 148, brightnessLevel: 2, lat: 14.1, lng: 108.3, isHighlight: false },
  { countryCode: "TH", countryName: "泰国", continent: "ASIA" as const, transactionCount: 104, brightnessLevel: 2, lat: 15.9, lng: 100.9, isHighlight: false },
  { countryCode: "ID", countryName: "印尼", continent: "ASIA" as const, transactionCount: 86, brightnessLevel: 1, lat: -0.8, lng: 113.9, isHighlight: false },
  { countryCode: "IN", countryName: "印度", continent: "ASIA" as const, transactionCount: 132, brightnessLevel: 2, lat: 20.6, lng: 79.0, isHighlight: false },
  { countryCode: "JP", countryName: "日本", continent: "ASIA" as const, transactionCount: 92, brightnessLevel: 2, lat: 36.2, lng: 138.3, isHighlight: false },
  { countryCode: "KR", countryName: "韩国", continent: "ASIA" as const, transactionCount: 78, brightnessLevel: 1, lat: 35.9, lng: 127.8, isHighlight: false },
  { countryCode: "AU", countryName: "澳大利亚", continent: "OCEANIA" as const, transactionCount: 118, brightnessLevel: 2, lat: -25.3, lng: 133.8, isHighlight: false },
  { countryCode: "NZ", countryName: "新西兰", continent: "OCEANIA" as const, transactionCount: 34, brightnessLevel: 1, lat: -40.9, lng: 174.9, isHighlight: false },
  // 非洲：8 国，东非 / 西非 / 北非 / 南部非洲各有一点，地图上不再只有零星几颗
  { countryCode: "ZA", countryName: "南非", continent: "AFRICA" as const, transactionCount: 64, brightnessLevel: 2, lat: -30.6, lng: 22.9, isHighlight: false },
  { countryCode: "NG", countryName: "尼日利亚", continent: "AFRICA" as const, transactionCount: 52, brightnessLevel: 2, lat: 9.1, lng: 8.7, isHighlight: false },
  { countryCode: "EG", countryName: "埃及", continent: "AFRICA" as const, transactionCount: 46, brightnessLevel: 2, lat: 26.8, lng: 30.8, isHighlight: false },
  { countryCode: "KE", countryName: "肯尼亚", continent: "AFRICA" as const, transactionCount: 38, brightnessLevel: 2, lat: -0.0, lng: 37.9, isHighlight: false },
  { countryCode: "MA", countryName: "摩洛哥", continent: "AFRICA" as const, transactionCount: 58, brightnessLevel: 2, lat: 31.8, lng: -7.1, isHighlight: false },
  { countryCode: "GH", countryName: "加纳", continent: "AFRICA" as const, transactionCount: 44, brightnessLevel: 2, lat: 7.9, lng: -1.0, isHighlight: false },
  { countryCode: "TZ", countryName: "坦桑尼亚", continent: "AFRICA" as const, transactionCount: 36, brightnessLevel: 2, lat: -6.4, lng: 34.9, isHighlight: false },
  { countryCode: "ET", countryName: "埃塞俄比亚", continent: "AFRICA" as const, transactionCount: 32, brightnessLevel: 2, lat: 9.1, lng: 40.5, isHighlight: false },
];

/**
 * 演示航线（`ShipmentRoute`）
 * 小人实际不按这张表飞（前端按国家池加权抽签），这里只保留两条对外可查的固定航线。
 */
export const routes = [
  {
    destinationCode: "DE",
    destinationName: "德国 · 汉堡",
    durationMs: 6200,
    stayMs: 1600,
    intervalMs: 4200,
    active: true,
  },
  {
    destinationCode: "AE",
    destinationName: "阿联酋 · 迪拜",
    durationMs: 5400,
    stayMs: 1600,
    intervalMs: 4200,
    active: true,
  },
];
