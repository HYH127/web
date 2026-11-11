import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { continents, pages, states } from "@/lib/messages";
import { caseStudies } from "@/lib/content/cases";

export const metadata: Metadata = {
  title: "合作案例",
  description: pages.cases.description,
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ continent?: string }>;
}) {
  const { continent } = await searchParams;
  const activeContinent = continents.find((item) => item.value === continent);
  const list = activeContinent
    ? caseStudies.filter((item) => item.continent === activeContinent.value)
    : caseStudies;

  const continentCounts = caseStudies.reduce<Record<string, number>>((acc, item) => {
    acc[item.continent] = (acc[item.continent] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow={pages.cases.eyebrow}
        title={pages.cases.title}
        description={pages.cases.description}
      >
        <div className="mt-10 flex flex-col gap-5">
          <FilterChips
            items={continents}
            active={continent}
            basePath="/cases"
            paramKey="continent"
            counts={continentCounts}
          />
          <p className="text-micro tracking-[0.14em] text-ink-400 uppercase">
            共 {list.length} 个案例
            {activeContinent ? ` · 当前：${activeContinent.label}` : " · 覆盖 6 个大洲"}
          </p>
        </div>
      </PageHeader>

      <Section tight>
        <Container>
          {list.length === 0 ? (
            <EmptyState
              title={states.emptyTitle}
              body={states.emptyBody}
              action={
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/cases" className="text-small text-lumen-600 hover:text-lumen-700">
                    查看全部案例
                  </Link>
                  <ButtonLink href="/contact" size="sm" variant="ghost">
                    直接聊需求
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <ul className="grid gap-5 lg:grid-cols-2">
              {list.map((item, index) => (
                <li key={item.slug}>
                  <Link
                    href={`/cases/${item.slug}`}
                    className="glass-panel group flex h-full flex-col rounded-lg p-7 transition-colors duration-300 hover:border-lumen-500/40 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="gold">
                          {continents.find((c) => c.value === item.continent)?.label}
                        </Badge>
                        <Badge>{item.industry}</Badge>
                      </div>
                      <span className="text-small font-semibold tabular-nums text-ink-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h2 className="text-h3 mt-6 font-semibold text-ink-900 transition-colors group-hover:text-lumen-700">
                      {item.title}
                    </h2>
                    <p className="mt-3 flex-1 text-small text-ink-500">{item.summary}</p>

                    <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-5">
                      {item.metrics.map((metric) => (
                        <div key={metric.label}>
                          <dt className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                            {metric.label}
                          </dt>
                          <dd className="mt-1.5 text-lg font-semibold tabular-nums text-ink-900">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <p className="flex flex-wrap items-center gap-2.5 text-micro tracking-[0.12em] text-ink-400 uppercase">
                        <span>{item.clientName}</span>
                        <span aria-hidden className="h-px w-3 bg-line-strong" />
                        <span>
                          {item.country} · {item.city}
                        </span>
                        <span aria-hidden className="h-px w-3 bg-line-strong" />
                        <span>{item.since} 年起</span>
                      </p>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-lumen-600" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-16 flex flex-col gap-5 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-h3 font-semibold text-ink-900">想看和你品类相近的案例？</p>
              <p className="mt-2 text-small text-ink-500">
                告诉我们品类、年采购量与目标市场，我们会挑 2–3 个可对标的合作发给你。
              </p>
            </div>
            <ButtonLink href="/contact">发起询盘</ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
