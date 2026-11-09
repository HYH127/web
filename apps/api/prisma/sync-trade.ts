/**
 * 只同步「首页地图」的贸易数据（TradeStat + ShipmentRoute），不动其它表。
 *
 * 用途：调整国家亮度 / 新增国家时，不必跑整库 seed（那会重置商品、案例、工厂记录与演示用户）。
 * 运行：pnpm --filter @wem/api trade:sync
 */
import { PrismaClient } from "@prisma/client";
import { routes, tradeStats } from "./trade-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.tradeStat.deleteMany();
  await prisma.shipmentRoute.deleteMany();
  await prisma.tradeStat.createMany({ data: tradeStats });
  await prisma.shipmentRoute.createMany({ data: routes });

  const [countries, listed] = await Promise.all([
    prisma.tradeStat.count(),
    prisma.tradeStat.findMany({
      where: { continent: "AFRICA" },
      orderBy: { transactionCount: "desc" },
      select: { countryName: true, brightnessLevel: true },
    }),
  ]);

  console.log(`[trade] ${countries} 个国家已写入`);
  console.log(
    `[trade] 非洲 ${listed.length} 国：${listed
      .map((c) => `${c.countryName}(L${c.brightnessLevel})`)
      .join("、")}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
