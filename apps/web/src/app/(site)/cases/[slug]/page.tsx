import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { continents } from "@/lib/messages";
import { caseStudies, getAdjacentCases, getCase } from "@/lib/content/cases";

export function generateStaticParams() {
  return caseStudies.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) return { title: "案例详情" };
  return {
    title: `${study.title} · ${study.clientName}`,
    description: study.summary,
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) notFound();

  const { prev, next } = getAdjacentCases(slug);
  const continentLabel = continents.find((item) => item.value === study.continent)?.label;

  return (
    <>
      <div className="relative overflow-hidden pt-32 pb-10 md:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-52 left-1/2 h-[30rem] w-[48rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[120px]"
        />
        <Container className="relative">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-small text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回案例列表
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge tone="gold">{continentLabel}</Badge>
            <Badge>{study.industry}</Badge>
            {study.categories.map((category) => (
              <span key={category} className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                {category}
              </span>
            ))}
          </div>

          <h1 className="text-h1 mt-6 max-w-4xl font-semibold text-ink-900">{study.title}</h1>
          <p className="mt-5 max-w-2xl text-ink-500">{study.summary}</p>

          <p className="mt-8 flex flex-wrap items-center gap-3 text-micro tracking-[0.14em] text-ink-400 uppercase">
            <span>{study.clientName}</span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <span>
              {study.country} · {study.city}
            </span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <span>{study.since} 年起合作</span>
          </p>
        </Container>
      </div>

      {/* 成果指标 */}
      <Section className="py-12">
        <Container>
          <dl className="grid gap-4 sm:grid-cols-3">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="glass-panel rounded-lg p-7">
                <dt className="text-micro tracking-[0.16em] text-ink-400 uppercase">
                  {metric.label}
                </dt>
                <dd className="mt-3 text-4xl font-semibold tracking-[-0.03em] tabular-nums text-champagne-700">
                  {metric.value}
                </dd>
                {metric.note ? (
                  <p className="mt-2 text-micro tracking-[0.1em] text-ink-400">{metric.note}</p>
                ) : null}
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* 正文区块 + 侧栏 */}
      <Section className="pt-0">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="max-w-3xl space-y-14">
              {study.blocks.map((block) => (
                <article key={block.heading}>
                  <h2 className="text-h2 font-semibold text-ink-900">{block.heading}</h2>
                  {block.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 18)} className="mt-4 text-ink-500">
                      {paragraph}
                    </p>
                  ))}
                  {block.list ? (
                    <ul className="mt-5 space-y-2.5 border-l border-line pl-5">
                      {block.list.map((item) => (
                        <li key={item} className="text-small text-ink-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {block.quote ? (
                    <blockquote className="mt-6 border-l-2 border-champagne-500 pl-5 font-display text-xl font-medium text-ink-900">
                      “{block.quote}”
                    </blockquote>
                  ) : null}
                </article>
              ))}

              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-10">
                <ButtonLink href="/contact">聊一个类似的项目</ButtonLink>
                <ButtonLink href="/cases" variant="ghost">
                  继续浏览案例
                </ButtonLink>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="glass-panel rounded-lg p-7">
                <p className="label-micro">项目速览</p>
                <dl className="mt-6 space-y-4 text-small">
                  {[
                    { label: "客户", value: study.clientName },
                    { label: "所在地", value: `${study.country} · ${study.city}` },
                    { label: "行业", value: study.industry },
                    { label: "合作起始", value: `${study.since} 年` },
                    { label: "涉及品类", value: study.categories.join(" / ") },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-ink-700">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-4 rounded-lg border border-line bg-surface p-7">
                <p className="text-small text-ink-500">
                  案例中的数字来自订单、验货与出运记录。需要看原始验货报告，可以在询盘时说明。
                </p>
                <ButtonLink href="/contact" variant="ghost" className="mt-5 w-full">
                  索取详细资料
                </ButtonLink>
              </div>
            </aside>
          </div>

          {/* 上下篇 */}
          <nav
            aria-label="案例翻页"
            className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/cases/${prev.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-line p-5 transition-colors hover:border-lumen-500/40"
              >
                <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  <span className="block text-micro tracking-[0.14em] text-ink-400 uppercase">
                    上一个案例
                  </span>
                  <span className="mt-1 block text-small text-ink-900">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/cases/${next.slug}`}
                className="group flex items-start justify-end gap-3 rounded-lg border border-line p-5 text-right transition-colors hover:border-lumen-500/40"
              >
                <span>
                  <span className="block text-micro tracking-[0.14em] text-ink-400 uppercase">
                    下一个案例
                  </span>
                  <span className="mt-1 block text-small text-ink-900">{next.title}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </nav>
        </Container>
      </Section>
    </>
  );
}
