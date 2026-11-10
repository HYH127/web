import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { SwipeRow } from "@/components/ui/swipe-row";
import { ButtonLink } from "@/components/ui/button";
import { MixBars, MixDonut } from "@/components/ui/mix-charts";
import { WorldMap, CourierOverlay } from "@/components/home/world-map";
import { Badge } from "@/components/ui/badge";
import { apiGetSafe } from "@/lib/api";
import { emptyTradeMap, type TradeMapData } from "@/lib/trade";
import { hero } from "@/lib/messages";
import { formatPrice } from "@/lib/utils";
import {
  categoryLabel,
  productCategories,
  products,
} from "@/lib/content/products";
import { LEVEL_FILL } from "@/lib/world";
import {
  categoryMix,
  certifications,
  company,
  process,
  regionMix,
  scale,
  trackRecord,
} from "@/lib/content/company";
import {
  FACTORY_CATEGORY_LABEL,
  formatFactoryDate,
  getFactoryPosts,
} from "@/lib/factory";

export default async function HomePage() {
  const [map, factoryFeed] = await Promise.all([
    apiGetSafe<TradeMapData>("/trade/map", emptyTradeMap, { revalidate: 60 }),
    getFactoryPosts({ pageSize: 3 }),
  ]);
  const countryCount = map.totals.countries || 40;
  const latestPosts = factoryFeed.items;
  const maxStageDays = Math.max(...process.map((item) => item.days), 1);

  return (
    <>
      {/* ===== 首屏：非全屏舞台（约 74% 视口），透明前景文案层 ===== */}
      <section className="relative overflow-hidden pt-17">
        <div className="relative mx-auto h-[min(74vh,740px)] min-h-[540px] w-full max-w-[1440px] overflow-hidden border-b border-line bg-surface">
          {/* 世界地图：低精度轮廓 + 国家亮度光晕 */}
          <WorldMap data={map} />

          {/* 左侧提亮层：保证文案区干净，同时让右侧网络与光点保持清晰。
              调得比之前轻一些——美洲（美国 / 巴西等）也在小人的目的地里，
              全白会把左半张地图一起吃掉。 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_56%_112%_at_6%_46%,#ffffff_10%,rgba(255,255,255,0.92)_30%,rgba(255,255,255,0.72)_48%,rgba(255,255,255,0.34)_64%,rgba(255,255,255,0.08)_78%,transparent_88%)]"
          />

          {/* 小人层：压在提亮层之上，飞去哪边都看得见 */}
          <CourierOverlay data={map} />

          {/* 上下柔化地图裁切边：上边缘收得更短，避免导航下方出现一条白带 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[12%] bg-[linear-gradient(to_bottom,#ffffff_0%,rgba(255,255,255,0.94)_26%,rgba(255,255,255,0.66)_58%,rgba(255,255,255,0.24)_84%,transparent_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(to_top,#ffffff_0%,rgba(255,255,255,0.95)_26%,rgba(255,255,255,0.68)_56%,rgba(255,255,255,0.26)_82%,transparent_100%)]"
          />

          {/* 前景透明文案层：整块靠上，紧接导航，不再垂直居中留白 */}
          <div className="relative z-10 flex h-full items-start px-6 pt-10 md:px-10 md:pt-14">
            <div className="max-w-2xl">
              <p className="label-micro">{hero.eyebrow}</p>
              <h1 className="text-display mt-6 font-semibold text-ink-900">
                {hero.titleTop}
                <span className="mx-3 inline-block h-px w-14 translate-y-[-0.32em] bg-champagne-500 align-middle md:w-20" />
                <span className="whitespace-nowrap text-champagne-700">{hero.titleBottom}</span>
              </h1>
              <p className="mt-7 max-w-xl text-ink-500">{hero.subtitle}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <ButtonLink href={hero.primaryCta.href} size="lg">
                  {hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href={hero.secondaryCta.href} variant="ghost" size="lg">
                  {hero.secondaryCta.label}
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* 图例：与左侧眉标同一水平线 */}
          <div className="absolute right-6 top-10 z-10 hidden md:right-10 md:top-14 md:block">
            <p className="label-micro">交易密度</p>
            <div className="mt-3 flex items-center gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: LEVEL_FILL[level] }}
                />
              ))}
              <span className="ml-1.5 text-micro tracking-[0.12em] text-ink-300 uppercase">
                低 → 高
              </span>
            </div>
          </div>

          {/* 底部标注 */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2.5 md:left-10">
            <span className="h-1.5 w-1.5 rounded-full bg-lumen-600" />
            <span className="text-micro tracking-[0.14em] text-ink-500 uppercase">
              {countryCount} 个国家 / 地区
            </span>
          </div>

          <p className="absolute bottom-6 right-6 z-10 text-micro tracking-[0.16em] text-ink-400 uppercase md:right-10">
            {hero.mapNote}
          </p>
        </div>
      </section>

      {/* ===== B2B 信任区 ===== */}
      <Section className="border-b border-line">
        <Container>
          <SectionHeading
            eyebrow="TRUST & SCALE"
            title="以可核验的方式建立合作信任"
            description={`信任不靠承诺，靠翻得开的账。1,240 个标准柜、${countryCount} 个国家、87 家工厂，每一组数字背后都是能指到单、能查到柜的真实记录。`}
            action={
              <ButtonLink href="/cases" variant="gold">
                合作案例
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />

          {/* 资质条：采购方判断"能不能合作"的第一道门槛，放在数字之前 */}
          <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-4">
            {certifications.map((item) => (
              <li key={item.name} className="bg-paper px-5 py-5">
                <span className="flex items-center gap-2">
                  <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-lumen-600" />
                  <span className="text-small font-semibold text-ink-900">{item.name}</span>
                </span>
                <p className="mt-2.5 text-micro font-medium tracking-[0.1em] text-ink-400 uppercase">
                  {item.note}
                </p>
                <p className="mt-1 text-micro font-medium text-ink-500">自 {item.year} 年起有效</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-micro font-medium text-ink-400">
            证书原件、验厂报告与 AEO 信用等级编号可在签约前索取，不做截图交付。
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-10 md:grid-cols-4">
            {scale.map((item, index) => (
              <div key={item.label}>
                <dt className="text-micro tracking-[0.16em] text-ink-400 uppercase">
                  {item.label}
                </dt>
                <dd className="mt-3 font-display text-4xl text-champagne-700">
                  {index === 0 ? countryCount : item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div
            id="trust-charts"
            className="mt-14 grid gap-12 border-t border-line pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16"
          >
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <p className="label-micro">出口区域结构</p>
                <span className="text-micro tracking-[0.1em] text-ink-400 uppercase">
                  按出运柜量 · 2025
                </span>
              </div>
              <MixDonut items={regionMix} className="mt-8" />
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-4">
                <p className="label-micro">品类结构</p>
                <span className="text-micro tracking-[0.1em] text-ink-400 uppercase">
                  4 大品类
                </span>
              </div>
              <MixBars items={categoryMix} className="mt-8" />
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 md:grid-cols-4">
            {trackRecord.map((item) => (
              <div key={item.label}>
                <dd className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl text-ink-900">
                    {item.value}
                  </span>
                  <span className="text-micro text-champagne-700">{item.unit}</span>
                </dd>
                <dt className="mt-1 text-micro tracking-[0.1em] text-ink-400 uppercase">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>

          <p className="mt-8 border-t border-line pt-5 text-micro text-ink-400">
            口径说明：区域与品类按 2025 年 1,240 个标准柜拆分，混装柜归入主品类，一个柜只计一次。
          </p>
        </Container>
      </Section>

      {/* ===== 工厂现场记录 ===== */}
      {latestPosts.length > 0 ? (
        <Section className="border-b border-line">
          <Container>
            <SectionHeading
              eyebrow="FROM THE FLOOR"
              title="工厂现场记录"
              description="车间里每天发生的事，我们拍下来、记下来。不是摆拍，是货真的在做——图片、数据和那一刻的判断，都在。"
              action={
                <ButtonLink href="/factory" variant="goldSoft">
                  全部记录
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/factory/${post.slug}`} className="group">
                  <div className="overflow-hidden rounded-md border border-line bg-surface">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={`${post.title} 封面`}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-lumen group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-4 flex items-center gap-3 text-micro tracking-[0.14em] text-ink-400 uppercase">
                    <span className="text-champagne-700">
                      {FACTORY_CATEGORY_LABEL[post.category] ?? post.category}
                    </span>
                    <span aria-hidden className="h-px w-4 bg-line-strong" />
                    <time dateTime={post.publishedAt}>
                      {formatFactoryDate(post.publishedAt)}
                    </time>
                  </p>
                  <h3 className="text-h3 mt-3 font-semibold text-ink-900 transition-colors group-hover:text-lumen-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-small text-ink-500">
                    {post.factoryName} · {post.location}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ===== 产品展示 ===== */}
      <Section className="border-b border-line">
        <Container>
          <SectionHeading
            eyebrow="PRODUCT CATALOG"
            title="常备产品，四个品类"
            description="从一颗轴承到一套床品，四个品类都在手上。先看一个代表规格，价格、起订量、交期都写在了明处。"
            action={
              <ButtonLink href="/shop" variant="gold">
                产品目录
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <SwipeRow
            className="-mx-6 mt-12 flex snap-x snap-mandatory scroll-pl-6 gap-6 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
            hint="右滑看下一个品类"
          >
            {productCategories.map((cat) => {
              const product = products.find((item) => item.category === cat.value);
              if (!product) return null;
              return (
                <Link
                  key={cat.value}
                  href={`/product/${product.slug}`}
                  data-swipe-item
                  className="glass-panel group flex h-full w-[88%] shrink-0 snap-start flex-col overflow-hidden rounded-lg transition-colors duration-300 hover:border-lumen-500/40 sm:w-auto"
                >
                  <div className="relative aspect-4/5 overflow-hidden border-b border-line bg-surface">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover sm:transition-transform sm:duration-700 sm:ease-lumen sm:group-hover:scale-[1.04]"
                    />
                    {product.badge ? (
                      <span className="absolute left-3 top-3">
                        <Badge tone="gold">{product.badge}</Badge>
                      </span>
                    ) : null}
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper/85 text-ink-500 opacity-0 backdrop-blur-sm transition-opacity duration-300 sm:group-hover:opacity-100">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-micro tracking-[0.14em] text-ink-400 uppercase">
                      {categoryLabel(product.category)}
                    </p>
                    <p className="mt-2 text-small text-ink-900">{product.name}</p>
                    <p className="mt-2 line-clamp-2 flex-1 text-micro leading-relaxed text-ink-500">
                      {product.summary}
                    </p>

                    <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                      <span className="font-display text-lg text-champagne-700">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-micro tracking-[0.1em] text-ink-400 uppercase">
                        MOQ {product.moq} {product.unit}
                      </span>
                    </div>
                    <p className="mt-1.5 text-micro text-ink-400">
                      交期 {product.leadTime} · HS {product.hsCode}
                    </p>
                  </div>
                </Link>
              );
            })}
          </SwipeRow>
        </Container>
      </Section>

      {/* ===== 从询盘到交付 ===== */}
      <Section className="border-b border-line">
        <Container>
          <SectionHeading
            eyebrow="HOW WE WORK"
            title="从询盘到交付，四步"
            description="每一步都有明确的交付物和时间口径。做不了的地方，我们先把话说在前面，而不是先报一个好看的低价。"
            action={
              <ButtonLink href="/contact" variant="lumenSoft">
                发起询盘
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-14 flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-6">
            <p className="label-micro">典型订单周期 · 71 天</p>
            <p className="text-micro text-ink-400">
              条形长度按阶段天数，含量产与海运；实际排期以报价单为准
            </p>
          </div>

          <SwipeRow
            as="ol"
            className="-mx-6 mt-8 flex snap-x snap-mandatory scroll-pl-6 gap-6 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 [&::-webkit-scrollbar]:hidden"
            hint="右滑看下一步"
          >
            {process.map((item) => (
              <li
                key={item.step}
                data-swipe-item
                className="w-[86%] shrink-0 snap-start pt-5 sm:w-auto"
              >
                <div aria-hidden className="relative h-[3px] w-full bg-surface-strong">
                  <span
                    className="absolute inset-y-0 left-0 bg-champagne-500"
                    style={{ width: `${(item.days / maxStageDays) * 100}%` }}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <p className="font-display text-small text-champagne-600">{item.step}</p>
                  <p className="text-micro text-ink-400">{item.span}</p>
                </div>
                <p className="mt-3 text-h3 font-semibold text-ink-900">{item.title}</p>
                <p className="mt-3 text-small text-ink-500">{item.body}</p>
                <p className="mt-4 text-micro tracking-[0.12em] text-ink-400 uppercase">
                  {item.meta}
                </p>
              </li>
            ))}
          </SwipeRow>
        </Container>
      </Section>

      {/* ===== 内容入口 ===== */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="EXPLORE"
            title="三个入口，看清我们怎么做事"
            description="案例看结果，产品看能力，工厂记录看过程。看得见，才谈得上信任。"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                href: "/cases",
                eyebrow: "CASE STUDIES",
                title: "合作案例",
                desc: "8 个正在进行的合作，覆盖 6 个大洲，带批次与成本数据。",
                stat: "8 个案例",
                meta: "6 个大洲",
              },
              {
                href: "/shop",
                eyebrow: "PRODUCT CATALOG",
                title: "产品目录",
                desc: "4 大品类、12 个常备 SKU，标注起订量、交期与出口编码。",
                stat: "12 个 SKU",
                meta: "4 大品类",
              },
              {
                href: "/factory",
                eyebrow: "FIELD NOTES",
                title: "工厂实例",
                desc: "装配、质检、仓储与打样的现场记录，含照片与实测数据。",
                stat: "6 篇记录",
                meta: "每周更新",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-panel group relative flex flex-col overflow-hidden rounded-lg p-7 transition-colors duration-300 hover:border-lumen-500/40"
              >
                <p className="label-micro">{item.eyebrow}</p>
                <p className="mt-4 text-h3 text-ink-900">{item.title}</p>
                <p className="mt-2 text-small text-ink-500">{item.desc}</p>
                <div className="mt-6 flex items-end justify-between border-t border-line pt-4">
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-h3 text-champagne-700">
                      {item.stat}
                    </span>
                    <span className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                      {item.meta}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-lumen-600" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14 flex items-center justify-between gap-4 border-t border-line pt-8">
            <p className="text-small text-ink-400">
              {company.nameZh} · {company.positioning} · 每周更新现场记录
            </p>
            <a
              href="#site-top"
              className="group inline-flex shrink-0 items-center gap-1.5 text-micro tracking-[0.14em] text-ink-400 uppercase transition-colors duration-300 hover:text-ink-900"
            >
              回到顶部
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
