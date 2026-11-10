import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StackedMix } from "@/components/ui/data-viz";
import { pages } from "@/lib/messages";
import {
  capabilities,
  certifications,
  company,
  facts,
  heritage,
  milestones,
  process,
  teamMix,
} from "@/lib/content/company";

export const metadata: Metadata = {
  title: "关于",
  description: pages.about.description,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={pages.about.eyebrow}
        title={pages.about.title}
        description={pages.about.description}
      />

      {/* 起点 */}
      <Section tight>
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[1.08fr_1fr]">
            <div>
              <p className="label-micro">{heritage.eyebrow}</p>
              <h2 className="text-h2 mt-4 font-semibold text-ink-900">{heritage.title}</h2>
              <p className="mt-6 text-ink-500">{heritage.lead}</p>
              <p className="mt-4 text-ink-500">
                {company.intro}
              </p>
              <p className="mt-4 text-ink-500">
                我们不追求把 SKU 做得最多，而是把每个品类的「能做」和「做不了」说清楚。客户下单前就知道风险在哪、交期怎么排、出了问题谁负责。
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dd className="font-display text-3xl text-champagne-700">
                      {fact.value}
                    </dd>
                    <dt className="mt-2 text-micro tracking-[0.14em] text-ink-500 uppercase">
                      {fact.label}
                    </dt>
                    <p className="mt-1 text-micro text-ink-400">{fact.note}</p>
                  </div>
                ))}
              </dl>

              <div className="mt-8 border-t border-line pt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="label-micro">团队构成</p>
                  <span className="text-micro text-ink-400">46 人 · 按职能</span>
                </div>
                <StackedMix items={teamMix} compact className="mt-4" />
              </div>
            </div>

            <figure className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-lg border border-line bg-surface">
                <img
                  src="/images/site/warehouse-yiwu.jpg"
                  alt="义乌集货仓的货架与分箱贴标工位"
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex items-start justify-between gap-4 text-micro text-ink-400">
                <span>义乌集货仓 · 混装前的分箱与贴标工位</span>
                <span className="shrink-0 tracking-[0.12em] uppercase">Yiwu · 2026</span>
              </figcaption>
            </figure>
          </div>
        </Container>
      </Section>

      {/* 四项能力 */}
      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            eyebrow="WHAT WE DO"
            title="四件事，做深"
            description="整合、可视化、合规、混装——这四件事决定了多品类小批量订单能不能按时、按质、按成本交付。"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {capabilities.map((item) => (
              <article key={item.key} className="glass-panel rounded-lg p-7">
                <div className="flex items-baseline justify-between">
                  <p className="text-h3 font-semibold text-ink-900">{item.title}</p>
                  <span className="font-display text-small text-champagne-600">{item.key}</span>
                </div>
                <p className="mt-3 text-small text-ink-500">{item.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <li key={point}>
                      <Badge>{point}</Badge>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* 资质 */}
      <Section className="border-t border-line py-14 md:py-16">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="label-micro">CERTIFICATIONS</p>
              <h2 className="text-h3 mt-3 font-semibold text-ink-900">资质与体系</h2>
            </div>
            <dl className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certifications.map((item) => (
                <div key={item.name} className="border-l border-line pl-5">
                  <dt className="text-small text-ink-900">{item.name}</dt>
                  <dd className="mt-1 text-micro text-ink-400">
                    {item.note} · {item.year}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      {/* 时间线 */}
      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            eyebrow="TIMELINE"
            title="十年，四个节点"
            description="从半个摊位到 30 个国家，中间没有跳跃，只有一件件把交付做扎实。"
          />
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {milestones.map((item) => (
              <li key={item.year} className="relative border-t border-line pt-6">
                <span
                  aria-hidden
                  className="absolute -top-px left-0 h-px w-10 bg-champagne-500"
                />
                <p className="font-display text-h3 text-champagne-700">{item.year}</p>
                <p className="mt-3 text-small text-ink-900">{item.title}</p>
                <p className="mt-2 text-small text-ink-500">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 合作方式 */}
      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            eyebrow="HOW WE START"
            title="第一次合作，通常这样开始"
            description="不需要先签长约。先用一个小单验证一次交付，再决定要不要长期做。"
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {process.map((item) => (
              <li key={item.step} className="flex flex-col rounded-lg border border-line p-6">
                <span className="font-display text-small text-champagne-600">{item.step}</span>
                <p className="mt-3 text-small text-ink-900">{item.title}</p>
                <p className="mt-2 flex-1 text-micro leading-relaxed text-ink-500">{item.body}</p>
                <p className="mt-4 text-micro tracking-[0.1em] text-ink-400 uppercase">
                  {item.meta}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col gap-5 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-h3 font-semibold text-ink-900">先聊一次，不一定要下单</p>
              <p className="mt-2 text-small text-ink-500">
                告诉我们品类与目标市场，我们会先说哪些能做、哪些不建议做。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">发起询盘</ButtonLink>
              <ButtonLink href="/factory" variant="ghost">
                看工厂现场
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
