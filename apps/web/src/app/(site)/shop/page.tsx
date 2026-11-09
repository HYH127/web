import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { pages } from "@/lib/messages";
import { formatPrice } from "@/lib/utils";
import { categoryLabel, productCategories, products } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "产品目录",
  description: pages.shop.description,
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = productCategories.find((item) => item.value === category);
  const list = active ? products.filter((item) => item.category === active.value) : products;

  const categoryCounts = products.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow={pages.shop.eyebrow}
        title={pages.shop.title}
        description={pages.shop.description}
      >
        <div className="mt-10 flex flex-col gap-5">
          <FilterChips
            items={productCategories}
            active={category}
            basePath="/shop"
            paramKey="category"
            allLabel="全部分类"
            counts={categoryCounts}
          />
          <p className="text-micro tracking-[0.14em] text-ink-400 uppercase">
            共 {list.length} 个 SKU
            {active ? ` · 当前：${active.label}` : " · 4 大品类"}
            <span className="ml-3 text-ink-300">价格为 FOB 宁波参考价</span>
          </p>
        </div>
      </PageHeader>

      <Section tight>
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/product/${product.slug}`}
                  className="glass-panel group flex h-full flex-col overflow-hidden rounded-lg transition-colors duration-300 hover:border-lumen-500/40"
                >
                  <div className="relative aspect-4/5 overflow-hidden border-b border-line bg-surface">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-lumen group-hover:scale-[1.04]"
                    />
                    {product.badge ? (
                      <span className="absolute left-3 top-3">
                        <Badge tone="gold">{product.badge}</Badge>
                      </span>
                    ) : null}
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper/85 text-ink-500 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
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
              </li>
            ))}
          </ul>

          <div className="mt-16 flex flex-col gap-5 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-h3 font-light text-ink-900">没有找到合适的规格？</p>
              <p className="mt-2 text-small text-ink-500">
                常备 SKU 之外，支持按图纸打样与 OEM。发图纸或样品照片，24 小时内给可行性与报价。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">发图纸询价</ButtonLink>
              <ButtonLink href="/cases" variant="ghost">
                看合作案例
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
