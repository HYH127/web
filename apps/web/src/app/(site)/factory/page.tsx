import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { pages, states } from "@/lib/messages";
import {
  FACTORY_CATEGORIES,
  FACTORY_CATEGORY_LABEL,
  formatFactoryDate,
  getFactoryPosts,
  type FactoryPostListItem,
} from "@/lib/factory";

export const metadata: Metadata = {
  title: "工厂实例",
  description: pages.factory.description,
};

function categoryLabel(item: FactoryPostListItem) {
  return FACTORY_CATEGORY_LABEL[item.category] ?? item.category;
}

function MetaLine({ item }: { item: FactoryPostListItem }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro tracking-[0.14em] text-ink-400 uppercase">
      <span>{item.factoryName}</span>
      <span aria-hidden className="h-px w-4 bg-line-strong" />
      <span>{item.location}</span>
    </p>
  );
}

export default async function FactoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const activeCategory = FACTORY_CATEGORIES.find((item) => item.value === category);
  const currentPage = Math.max(1, Number(page) || 1);

  const data = await getFactoryPosts({
    category: activeCategory?.value,
    page: currentPage,
    pageSize: 12,
  });

  const [featured, ...rest] = data.items;
  const latestDate = data.items[0]?.publishedAt;

  return (
    <>
      <PageHeader
        eyebrow={pages.factory.eyebrow}
        title={pages.factory.title}
        description={pages.factory.description}
        actions={
          <ButtonLink href="/factory/write" variant="gold">
            <PenLine className="h-4 w-4" />
            {pages.factory.cta}
          </ButtonLink>
        }
      >
        <div className="mt-10 flex flex-col gap-5">
          <FilterChips
            items={FACTORY_CATEGORIES}
            active={activeCategory?.value}
            basePath="/factory"
            paramKey="category"
            allLabel="全部"
          />
          <p className="text-micro tracking-[0.14em] text-ink-400 uppercase">
            共 {data.total} 篇
            {latestDate ? ` · 最新 ${formatFactoryDate(latestDate)}` : null}
            {activeCategory ? ` · 当前：${activeCategory.label}` : null}
          </p>
        </div>
      </PageHeader>

      <Section tight>
        <Container>
          {data.items.length === 0 ? (
            <EmptyState
              title={states.emptyTitle}
              body="该分类下还没有记录。可以切换分类，或先写一篇现场记录。"
              action={
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {activeCategory ? (
                    <Link
                      href="/factory"
                      className="text-small text-lumen-600 hover:text-lumen-700"
                    >
                      查看全部记录
                    </Link>
                  ) : null}
                  <ButtonLink href="/factory/write" size="sm" variant="ghost">
                    写一篇记录
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <div className="space-y-14">
              {featured ? (
                <Link
                  href={`/factory/${featured.slug}`}
                  className="glass-panel group grid overflow-hidden rounded-lg transition-colors duration-300 hover:border-lumen-500/40 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
                >
                  <div className="relative aspect-[3/2] overflow-hidden border-b border-line bg-surface md:aspect-auto md:min-h-[360px] md:border-b-0 md:border-r">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={`${featured.title} 封面`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-lumen group-hover:scale-[1.02]"
                      />
                    ) : null}
                    <span className="absolute left-5 top-5 rounded-xs border border-paper/60 bg-paper/85 px-2 py-1 text-micro tracking-[0.14em] text-ink-500 uppercase backdrop-blur-sm">
                      最新记录
                    </span>
                  </div>
                  <div className="flex flex-col justify-between p-7 md:p-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone="cyan">{categoryLabel(featured)}</Badge>
                        <time
                          dateTime={featured.publishedAt}
                          className="text-micro tracking-[0.14em] text-ink-400 uppercase"
                        >
                          {formatFactoryDate(featured.publishedAt)}
                        </time>
                      </div>
                      <h2 className="text-h2 mt-6 font-semibold text-ink-900">
                        {featured.title}
                      </h2>
                      <p className="mt-4 text-ink-500">{featured.summary}</p>
                    </div>
                    <div className="mt-8 flex items-end justify-between gap-6 border-t border-line pt-5">
                      <MetaLine item={featured} />
                      <span className="inline-flex shrink-0 items-center gap-2 text-small text-ink-700 transition-colors group-hover:text-lumen-700">
                        阅读记录
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : null}

              {rest.length > 0 ? (
                <div>
                  <div className="flex items-baseline justify-between gap-6">
                    <h2 className="text-micro tracking-[0.18em] text-ink-400 uppercase">
                      全部记录
                    </h2>
                    <span className="text-micro tracking-[0.14em] text-ink-300 uppercase">
                      {String(data.total).padStart(2, "0")} ENTRIES
                    </span>
                  </div>

                  <ul className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((item) => (
                      <li key={item.id}>
                        <article className="group h-full">
                          <Link href={`/factory/${item.slug}`} className="flex h-full flex-col">
                            <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-line bg-surface">
                              {item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={`${item.title} 封面`}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-700 ease-lumen group-hover:scale-[1.04]"
                                />
                              ) : null}
                              <span className="absolute left-4 top-4 rounded-xs border border-line bg-paper/90 px-2 py-1 text-micro tracking-[0.12em] text-ink-500 uppercase">
                                {categoryLabel(item)}
                              </span>
                            </div>

                            <div className="mt-5 flex items-center gap-3 text-micro tracking-[0.14em] text-ink-400 uppercase">
                              <time dateTime={item.publishedAt}>
                                {formatFactoryDate(item.publishedAt)}
                              </time>
                              <span aria-hidden className="h-px w-4 bg-line-strong" />
                              <span>{categoryLabel(item)}</span>
                            </div>

                            <h3 className="text-h3 mt-3 font-semibold text-ink-900 transition-colors group-hover:text-lumen-700">
                              {item.title}
                            </h3>
                            <p className="mt-3 line-clamp-2 flex-1 text-small text-ink-500">
                              {item.summary}
                            </p>
                            <div className="mt-5">
                              <MetaLine item={item} />
                            </div>
                          </Link>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.totalPages > 1 ? (
                <nav
                  aria-label="分页"
                  className="flex items-center justify-center gap-3 border-t border-line pt-10"
                >
                  <PageLink
                    disabled={currentPage <= 1}
                    href={buildPageHref(currentPage - 1, activeCategory?.value)}
                    label="上一页"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PageLink>
                  <span className="px-4 text-small text-ink-500">
                    {currentPage} / {data.totalPages}
                  </span>
                  <PageLink
                    disabled={currentPage >= data.totalPages}
                    href={buildPageHref(currentPage + 1, activeCategory?.value)}
                    label="下一页"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PageLink>
                </nav>
              ) : null}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function buildPageHref(page: number, category?: string) {
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/factory?${suffix}` : "/factory";
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const className = cn(
    "inline-flex h-9 items-center gap-1 rounded-sm border px-3 text-small transition-colors",
    disabled
      ? "pointer-events-none border-line text-ink-300"
      : "border-line-strong text-ink-700 hover:border-ink-400 hover:text-ink-900",
  );

  if (disabled) {
    return (
      <span aria-disabled className={className}>
        {children}
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
      {label}
    </Link>
  );
}
