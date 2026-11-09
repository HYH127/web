import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pencil } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FactoryContent } from "@/components/factory/factory-content";
import { ApiError } from "@/lib/api";
import {
  FACTORY_CATEGORY_LABEL,
  assetUrl,
  formatFactoryDate,
  getFactoryPost,
} from "@/lib/factory";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getFactoryPost(slug);
    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        type: "article",
        publishedTime: post.publishedAt,
      },
    };
  } catch (error) {
    // 在 metadata 阶段就抛出 404，避免流式响应先把 200 发出去
    if (error instanceof ApiError && error.status === 404) notFound();
    return { title: "工厂实例" };
  }
}

export default async function FactoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 接口不可用（例如后端尚未部署）或该案例不存在时，一律按 404 处理，
  // 避免线上直接抛 500 白屏。
  const post = await getFactoryPost(slug).catch(() => null);
  if (!post) notFound();

  const category = FACTORY_CATEGORY_LABEL[post.category] ?? post.category;
  const cover = assetUrl(post.coverImage);

  const meta = [
    { label: "工厂", value: post.factoryName },
    { label: "地点", value: post.location },
    { label: "分类", value: category },
    { label: "记录时间", value: formatFactoryDate(post.publishedAt) },
    { label: "记录人", value: post.author ?? "现场记录" },
  ];

  return (
    <>
      <div className="relative overflow-hidden pt-32 pb-10 md:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-52 left-1/2 h-[30rem] w-[48rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[120px]"
        />
        <Container className="relative">
          <Link
            href="/factory"
            className="inline-flex items-center gap-2 text-small text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回工厂实例
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge tone="cyan">{category}</Badge>
            <Badge>现场记录</Badge>
          </div>

          <h1 className="text-h1 mt-6 max-w-4xl font-light text-ink-900">{post.title}</h1>
          <p className="mt-5 max-w-2xl text-ink-500">{post.summary}</p>

          <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-micro tracking-[0.14em] text-ink-400 uppercase">
            <span>{post.factoryName}</span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <span>{post.location}</span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <time dateTime={post.publishedAt}>{formatFactoryDate(post.publishedAt)}</time>
          </p>
        </Container>
      </div>

      {cover ? (
        <Container>
          <figure className="overflow-hidden rounded-lg border border-line bg-surface">
            <img
              src={cover}
              alt={`${post.title} 封面`}
              className="aspect-[3/2] w-full object-cover"
            />
          </figure>
        </Container>
      ) : null}

      <Section className="pt-14 md:pt-16">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0 max-w-[70ch]">
            <FactoryContent blocks={post.content} />

            {post.gallery.length > 0 ? (
              <div className="mt-16 border-t border-line pt-10">
                <h2 className="text-micro tracking-[0.18em] text-ink-400 uppercase">
                  现场图集 · {post.gallery.length} 张
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {post.gallery.map((image, index) => {
                    const src = assetUrl(image);
                    if (!src) return null;
                    return (
                      <img
                        key={`${image}-${index}`}
                        src={src}
                        alt={`${post.title} 现场图 ${index + 1}`}
                        loading="lazy"
                        className="aspect-[3/2] w-full rounded-md border border-line bg-surface object-cover"
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-line pt-8">
              <ButtonLink href="/contact">询问这家工厂</ButtonLink>
              <ButtonLink href="/factory" variant="ghost">
                继续浏览记录
              </ButtonLink>
            </div>
            <p className="mt-6 text-micro tracking-[0.08em] text-ink-400">
              数据来自当天的现场实测与批次记录，照片为现场拍摄；涉及客户的参数已做脱敏。
            </p>
          </article>

          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <dl className="glass-panel rounded-lg p-6">
              <p className="text-micro tracking-[0.18em] text-ink-400 uppercase">记录信息</p>
              <div className="mt-5 space-y-4">
                {meta.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-micro tracking-[0.12em] text-ink-400 uppercase">
                      {row.label}
                    </dt>
                    <dd className="text-right text-small text-ink-700">{row.value}</dd>
                  </div>
                ))}
              </div>
            </dl>

            {post.tags.length > 0 ? (
              <div>
                <p className="text-micro tracking-[0.18em] text-ink-400 uppercase">标签</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xs border border-line px-2.5 py-1 text-micro text-ink-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3 border-t border-line pt-6">
              {post.neighbors.prev ? (
                <Link
                  href={`/factory/${post.neighbors.prev.slug}`}
                  className="group block"
                >
                  <span className="flex items-center gap-2 text-micro tracking-[0.14em] text-ink-400 uppercase">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    更新一篇
                  </span>
                  <span className="mt-2 block text-small text-ink-700 transition-colors group-hover:text-lumen-700">
                    {post.neighbors.prev.title}
                  </span>
                </Link>
              ) : null}
              {post.neighbors.next ? (
                <Link
                  href={`/factory/${post.neighbors.next.slug}`}
                  className="group block pt-3"
                >
                  <span className="flex items-center gap-2 text-micro tracking-[0.14em] text-ink-400 uppercase">
                    <ArrowRight className="h-3.5 w-3.5" />
                    更早一篇
                  </span>
                  <span className="mt-2 block text-small text-ink-700 transition-colors group-hover:text-lumen-700">
                    {post.neighbors.next.title}
                  </span>
                </Link>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
              <Link
                href={`/factory/write?edit=${post.slug}`}
                className="group inline-flex items-center gap-2 text-small text-ink-500 transition-colors hover:text-ink-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                编辑本篇
              </Link>
              <Link
                href="/factory/write"
                className="group inline-flex items-center gap-2 text-small text-lumen-700"
              >
                写一篇现场记录
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
