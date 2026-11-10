/**
 * 种子数据
 * 商品与案例来自 prisma/content.ts（由 apps/web/src/lib/content 同源生成），
 * 与前台展示保持同一套 SKU、价格、案例数字。工厂实例为现场记录。
 * 运行：pnpm db:seed（或 pnpm --filter @wem/api prisma:seed）
 */
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { seedCases, seedProducts } from "./content";
import { routes, tradeStats } from "./trade-data";
import { factoryPosts } from "./factory-data";

const prisma = new PrismaClient();

/** 与 auth 模块保持一致的 scrypt 口令格式：scrypt$<salt>$<hash> */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const categories = [
  { slug: "industrial-components", name: "工业零部件", sortOrder: 1 },
  { slug: "smart-hardware", name: "智能硬件", sortOrder: 2 },
  { slug: "packaging", name: "包装与耗材", sortOrder: 3 },
  { slug: "textile-home", name: "纺织家纺", sortOrder: 4 },
];

const products = seedProducts;

const caseStudies = seedCases;

const siteConfigs = [
  {
    key: "socialLinks",
    value: {
      note: "社媒主页，主页地址与前台页脚一致",
      items: [
        { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@nordelgroup" },
        { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@nordelgroup" },
        { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/nordelgroup" },
        { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/nordelgroup" },
      ],
    },
  },
  {
    key: "heroCopy",
    value: {
      eyebrow: "YIWU → GLOBAL",
      title: "从义乌出发，连接世界",
      subtitle:
        "87 家合作工厂、4 大品类、26 个国家的采购方。我们把报价、打样、量产、验货、出运串成一条可核验的交付链，每一段都有记录。",
      primaryCta: { label: "查看合作案例", href: "/cases" },
      secondaryCta: { label: "了解产品能力", href: "/shop" },
    },
  },
  {
    key: "contactInfo",
    value: {
      note: "业务联系",
      email: "trade@nordel.cn",
      phone: "+86 579 8500 2168",
      address: "浙江省义乌市稠江街道四海大道 266 号 NORDEL 中心 8 楼",
    },
  },
];

async function main() {
  console.log("→ 清理旧数据…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.factoryPost.deleteMany();
  await prisma.tradeStat.deleteMany();
  await prisma.shipmentRoute.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.emailVerificationCode.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ 写入演示账户…");
  await prisma.user.createMany({
    data: [
      {
        email: "m.weber@kessler-at.de",
        passwordHash: hashPassword("nordel2026"),
        name: "Martin Weber",
        company: "Kessler Antriebstechnik GmbH",
        country: "DE",
        role: "USER",
        emailVerifiedAt: new Date("2026-01-12T09:00:00Z"),
        lastLoginAt: new Date("2026-11-06T08:24:00Z"),
      },
      {
        email: "admin@nordel.cn",
        passwordHash: hashPassword("nordel2026"),
        name: "林雨",
        company: "义乌诺德尔进出口有限公司",
        country: "CN",
        role: "ADMIN",
        emailVerifiedAt: new Date("2025-12-02T03:10:00Z"),
        lastLoginAt: new Date("2026-11-09T01:40:00Z"),
      },
    ],
  });

  console.log("→ 写入分类与商品…");
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    const related = products.filter((p) => p.categorySlug === category.slug);
    for (const [index, product] of related.entries()) {
      await prisma.product.create({
        data: {
          slug: product.slug,
          name: product.name,
          summary: product.summary,
          description: product.description,
          price: product.price,
          currency: "USD",
          moq: product.moq,
          images: [...product.images],
          specs: product.specs,
          categoryId: created.id,
          status: "ACTIVE",
          sortOrder: index,
        },
      });
    }
  }

  console.log("→ 写入案例…");
  for (const [index, item] of caseStudies.entries()) {
    await prisma.caseStudy.create({
      data: {
        ...item,
        coverImage: null,
        sortOrder: index,
        published: true,
        content: { blocks: item.content },
      },
    });
  }

  console.log("→ 写入地图交易数据…");
  await prisma.tradeStat.createMany({ data: tradeStats });

  console.log("→ 写入工厂实例记录…");
  for (const post of factoryPosts) {
    await prisma.factoryPost.create({
      data: {
        ...post,
        published: true,
        tags: post.tags,
        gallery: post.gallery,
        content: post.content,
      },
    });
  }

  console.log("→ 写入运输路线…");
  await prisma.shipmentRoute.createMany({ data: routes });

  console.log("→ 写入站点配置…");
  for (const config of siteConfigs) {
    await prisma.siteConfig.create({ data: config });
  }

  const [users, cats, prods, cases, stats, posts] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.caseStudy.count(),
    prisma.tradeStat.count(),
    prisma.factoryPost.count(),
  ]);

  console.log(
    `✔ Seed 完成：用户 ${users} / 分类 ${cats} / 商品 ${prods} / 案例 ${cases} / 国家 ${stats} / 工厂记录 ${posts}`,
  );
}

main()
  .catch((error) => {
    console.error("✖ Seed 失败：", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
