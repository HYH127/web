"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { categoryLabel } from "@/lib/content/products";
import {
  buildRows,
  demoInquiryLines,
  readInquiryLines,
  sumAmount,
  sumUnits,
  writeInquiryLines,
  type InquiryLine,
} from "@/lib/inquiry-store";

export function InquiryCart() {
  const [lines, setLines] = useState<InquiryLine[]>(demoInquiryLines);

  useEffect(() => {
    setLines(readInquiryLines());
  }, []);

  const update = (next: InquiryLine[]) => {
    setLines(next);
    writeInquiryLines(next);
  };

  const changeQty = (slug: string, delta: number) => {
    update(
      lines.map((line) =>
        line.slug === slug
          ? { ...line, qty: Math.max(1, line.qty + delta) }
          : line,
      ),
    );
  };

  const remove = (slug: string) => {
    update(lines.filter((line) => line.slug !== slug));
  };

  const rows = buildRows(lines);
  const amount = sumAmount(rows);
  const units = sumUnits(rows);

  if (rows.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-lg px-6 py-20 text-center">
        <div
          aria-hidden
          className="mb-6 h-10 w-10 rounded-full border border-lumen-500/40 bg-lumen-300/40 shadow-glow-cyan"
        />
        <p className="text-h3 text-ink-900">询盘单是空的</p>
        <p className="mt-3 max-w-sm text-small text-ink-500">
          从产品目录里挑几个规格放进来，提交后我们会按数量核算阶梯价与交期。
        </p>
        <ButtonLink href="/shop" className="mt-8" variant="ghost">
          浏览产品目录
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {rows.map((row) => (
          <article
            key={row.product.slug}
            className="glass-panel flex gap-4 rounded-lg p-4 sm:gap-5 sm:p-5"
          >
            <Link
              href={`/product/${row.product.slug}`}
              className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-surface sm:h-28 sm:w-28"
            >
              <img
                src={row.product.image}
                alt={row.product.name}
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-micro tracking-[0.12em] text-ink-400 uppercase">
                    {categoryLabel(row.product.category)}
                  </p>
                  <Link
                    href={`/product/${row.product.slug}`}
                    className="mt-1 block truncate text-small text-ink-900 hover:text-lumen-700"
                  >
                    {row.product.name}
                  </Link>
                  <p className="mt-1 text-micro text-ink-400">
                    {formatPrice(row.product.price)} / {row.product.unit} · MOQ{" "}
                    {row.product.moq} · 交期 {row.product.leadTime}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(row.product.slug)}
                  aria-label={`从询盘单移除 ${row.product.name}`}
                  className="rounded-sm p-1.5 text-ink-300 transition-colors hover:bg-surface-strong hover:text-ink-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                <div className="inline-flex items-center rounded-sm border border-line-strong">
                  <button
                    type="button"
                    onClick={() => changeQty(row.product.slug, -Math.max(1, Math.round(row.product.moq / 4)))}
                    aria-label="减少数量"
                    className="flex h-8 w-8 items-center justify-center text-ink-500 transition-colors hover:text-ink-900"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-16 px-2 text-center text-small text-ink-900">
                    {row.qty.toLocaleString("en-US")}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(row.product.slug, Math.max(1, Math.round(row.product.moq / 4)))}
                    aria-label="增加数量"
                    className="flex h-8 w-8 items-center justify-center text-ink-500 transition-colors hover:text-ink-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-display text-lg text-champagne-700">
                  {formatPrice(row.amount)}
                </p>
              </div>
            </div>
          </article>
        ))}

        <p className="text-micro text-ink-400">
          数量按起订量的 1/4 增减；也可以直接提交后让我们按整批核算。
        </p>
      </div>

      <aside className="glass-panel h-fit rounded-lg p-7 lg:sticky lg:top-24">
        <p className="label-micro">询盘摘要</p>
        <dl className="mt-6 space-y-4 text-small">
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">
              商品小计 <span className="text-ink-400">（{units.toLocaleString("en-US")} 件）</span>
            </dt>
            <dd className="text-ink-700">{formatPrice(amount)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">参考价口径</dt>
            <dd className="text-ink-700">FOB 宁波</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">运费</dt>
            <dd className="text-ink-700">按柜型另计</dd>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-4">
            <dt className="text-ink-900">预估合计</dt>
            <dd className="font-display text-xl text-champagne-700">{formatPrice(amount)}</dd>
          </div>
        </dl>

        <ButtonLink href="/checkout" className="mt-8 w-full">
          去提交询盘
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <Link
          href="/shop"
          className="mt-3 block text-center text-small text-ink-500 transition-colors hover:text-ink-900"
        >
          继续选型
        </Link>

        <p className="mt-6 border-t border-line pt-4 text-micro leading-relaxed text-ink-400">
          页面价格为参考价，正式报价会按数量、包装与汇率重新核算；2,000 件以上可谈阶梯价。
        </p>
      </aside>
    </div>
  );
}
