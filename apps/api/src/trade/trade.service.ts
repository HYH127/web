import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TradeMapCountry {
  code: string;
  name: string;
  continent: string;
  count: number;
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
  durationMs: number;
  stayMs: number;
  intervalMs: number;
}

export interface TradeMapPayload {
  origin: { code: string; name: string; lat: number; lng: number };
  countries: TradeMapCountry[];
  routes: TradeMapRoute[];
  totals: { countries: number; transactions: number; highlights: number };
}

/** 义乌 · 浙江（起运地：小商品集散中心） */
const ORIGIN = { code: "CN-ZJ", name: "义乌 · 浙江", lat: 29.3069, lng: 120.0755 };

@Injectable()
export class TradeService {
  constructor(private readonly prisma: PrismaService) {}

  /** 首页地图：国家亮度分级 + 小人动画路线 */
  async getMap(): Promise<TradeMapPayload> {
    const [stats, routeRows] = await Promise.all([
      this.prisma.tradeStat.findMany({
        orderBy: [{ brightnessLevel: "desc" }, { transactionCount: "desc" }],
      }),
      this.prisma.shipmentRoute.findMany({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const countries: TradeMapCountry[] = stats.map((s) => ({
      code: s.countryCode,
      name: s.countryName,
      continent: s.continent,
      count: s.transactionCount,
      level: Math.min(4, Math.max(0, s.brightnessLevel)),
      lat: s.lat,
      lng: s.lng,
      highlight: s.isHighlight,
    }));

    const routes: TradeMapRoute[] = routeRows.map((r) => ({
      originCode: r.originCode,
      originName: r.originName,
      destinationCode: r.destinationCode,
      destinationName: r.destinationName,
      durationMs: r.durationMs,
      stayMs: r.stayMs,
      intervalMs: r.intervalMs,
    }));

    return {
      origin: ORIGIN,
      countries,
      routes,
      totals: {
        countries: countries.length,
        transactions: countries.reduce((sum, c) => sum + c.count, 0),
        highlights: countries.filter((c) => c.highlight).length,
      },
    };
  }
}
