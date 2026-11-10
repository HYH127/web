import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Package } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { AddToInquiry } from "@/components/inquiry/add-to-inquiry";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  categoryLabel,
  getProduct,
  getRelatedProducts,
  products,
} from "@/lib/content/products";

export function generateStaticParams() {
  return products.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "商品详情" };
  return { title: product.name, description: product.summary };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  return (
    <>
      <div className="pt-28 md:pt-32">
        <Container>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-small text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回产品目录
          </Link>
        </Container>
      </div>

      <Section className="pt-8">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.02fr_1fr]">
            {/* 图片 */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.badge ? (
                  <span className="absolute left-4 top-4">
                    <Badge tone="gold">{product.badge}</Badge>
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: "起订量", value: `${product.moq} ${product.unit}` },
                  { label: "生产交期", value: product.leadTime },
                  { label: "出口编码", value: product.hsCode },
                ].map((item) => (
                  <div key={item.label} className="rounded-sm border border-line p-4">
                    <p className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-small text-ink-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 flex items-center gap-2 text-micro text-ink-400">
                <Package className="h-3.5 w-3.5" />
                出口包装：五层瓦楞箱 + 托盘缠膜；可按目的国分唛头、分托盘
              </p>
            </div>

            {/* 信息区 */}
            <div>
              <p className="label-micro">{categoryLabel(product.category)}</p>
              <h1 className="text-h2 mt-4 font-semibold text-ink-900 md:text-[2.6rem] md:leading-[1.15]">
                {product.name.split(" ").map((part, index, arr) => (
                  <span key={`${part}-${index}`} className="whitespace-nowrap">
                    {part}
                    {index < arr.length - 1 ? " " : null}
                  </span>
                ))}
              </h1>
              <p className="mt-2 text-small text-ink-400">{product.nameEn}</p>
              <p className="mt-4 text-ink-500">{product.summary}</p>

              <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-y border-line py-6">
                <span className="font-display text-3xl text-champagne-700">
                  {formatPrice(product.price)}
                </span>
                <span className="text-small text-ink-400">
                  / {product.unit} · FOB {product.port}
                </span>
                <span className="ml-auto text-micro tracking-[0.14em] text-ink-400 uppercase">
                  MOQ {product.moq} {product.unit}
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="border-b border-line pb-3">
                    <dt className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                      {spec.label}
                    </dt>
                    <dd className="mt-1.5 text-small text-ink-700">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-7 space-y-2.5">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-small text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lumen-600" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AddToInquiry slug={product.slug} />
                <ButtonLink href="/contact" variant="ghost">
                  索取正式报价
                </ButtonLink>
              </div>
              <p className="mt-4 text-micro text-ink-400">
                报价按数量与包装方式核算，2,000 件以上可谈阶梯价；样品 5–7 天寄出。
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 详情 */}
      <Section className="border-t border-line pt-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div>
              <p className="label-micro">DETAILS</p>
              <h2 className="text-h2 mt-4 font-semibold text-ink-900">产品说明</h2>
              <dl className="mt-8 space-y-3 text-small">
                {[
                  { label: "品类", value: categoryLabel(product.category) },
                  { label: "出口口岸", value: `${product.port}（宁波）` },
                  { label: "HS 编码", value: product.hsCode },
                  { label: "起订量", value: `${product.moq} ${product.unit}` },
                  { label: "生产交期", value: product.leadTime },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-400">{row.label}</dt>
                    <dd className="text-right text-ink-700">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="max-w-2xl space-y-4">
              {product.description.map((paragraph) => (
                <p key={paragraph.slice(0, 16)} className="text-ink-500">
                  {paragraph}
                </p>
              ))}
              <div className="mt-8 rounded-lg border border-line bg-surface p-6">
                <p className="text-small text-ink-700">
                  需要改规格、换包装或做客户品牌？把图纸或样品照片发给我们，24 小时内回复可行性与报价。
                </p>
                <ButtonLink href="/contact" variant="ghost" size="sm" className="mt-4">
                  发图纸询价
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 相关产品 */}
      <Section className="border-t border-line">
        <Container>
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="text-h2 font-semibold text-ink-900">同类产品</h2>
            <Link href="/shop" className="text-small text-lumen-700 hover:text-lumen-800">
              查看全部
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/product/${item.slug}`}
                  className="glass-panel group flex h-full items-center gap-4 rounded-lg p-4 transition-colors hover:border-lumen-500/40"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                      {categoryLabel(item.category)}
                    </p>
                    <p className="mt-1 truncate text-small text-ink-900">{item.name}</p>
                    <p className="mt-2 font-display text-small text-champagne-700">
                      {formatPrice(item.price)}
                      <span className="ml-2 text-micro text-ink-400">MOQ {item.moq}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
