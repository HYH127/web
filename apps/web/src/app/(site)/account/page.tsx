import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, FileCheck2, MapPin, Ship } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { NodeProgress } from "@/components/ui/data-viz";
import { AccountProfile } from "@/components/auth/account-profile";
import { pages } from "@/lib/messages";
import { formatPrice } from "@/lib/utils";
import { getProduct } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "用户中心",
  description: pages.account.description,
};

/** 与「四项能力」里的 7 个交付节点一致 */
const ORDER_NODES = ["确认", "备料", "投产", "首件", "量产", "验货", "出运"] as const;

const orders = [
  {
    no: "ND-2604-118",
    date: "2026-10-28",
    status: "生产中",
    tone: "cyan" as const,
    amount: 7700,
    lines: "深沟球轴承单元 6205-2RS × 2,000 套",
    eta: "预计 11-18 出运",
    docs: "首件报告已上传",
    node: 5,
  },
  {
    no: "ND-2603-092",
    date: "2026-09-12",
    status: "已出运",
    tone: "gold" as const,
    amount: 19300,
    lines: "LoRaWAN 温湿度传感器 × 500 台",
    eta: "ETA 11-24 · Hamburg",
    docs: "提单 / 装箱单已上传",
    node: 7,
  },
  {
    no: "ND-2602-061",
    date: "2026-07-05",
    status: "已签收",
    tone: "neutral" as const,
    amount: 17040,
    lines: "五层瓦楞出口箱 600×400×400 × 12,000 只",
    eta: "2026-08-19 签收",
    docs: "验货报告 / 3.1 证书",
    node: 7,
  },
];

const addresses = [
  {
    name: "Kessler Antriebstechnik GmbH",
    contact: "Martin Weber",
    line: "Industriestraße 42, 70565 Stuttgart, Germany",
    phone: "+49 711 4580 220",
    primary: true,
  },
  {
    name: "Kessler 荷兰中转仓",
    contact: "Receiving Dept.",
    line: "Havenweg 18, 3011 Rotterdam, Netherlands",
    phone: "+31 10 412 8890",
    primary: false,
  },
];

export default function AccountPage() {
  const reorder = ["bearing-unit-6205-2rs", "lora-th-sensor", "carton-5ply-6040"]
    .map((slug) => getProduct(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      <PageHeader
        eyebrow={pages.account.eyebrow}
        title={pages.account.title}
        description={pages.account.description}
      />

      <Section tight>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside>
              <nav aria-label="用户中心导航" className="flex flex-col gap-1">
                {["账户资料", "订单记录", "收货地址", "常用规格"].map((tab, index) => (
                  <a
                    key={tab}
                    href={["#profile", "#orders", "#addresses", "#reorder"][index]}
                    className={
                      index === 0
                        ? "rounded-sm border border-champagne-400/60 bg-champagne-200/70 px-4 py-3 text-small text-champagne-700"
                        : "rounded-sm px-4 py-3 text-small text-ink-500 transition-colors hover:bg-surface-strong hover:text-ink-900"
                    }
                  >
                    {tab}
                  </a>
                ))}
              </nav>
              <div className="mt-6 rounded-lg border border-line bg-surface p-5">
                <p className="text-micro tracking-[0.14em] text-ink-400 uppercase">客户经理</p>
                <p className="mt-2 text-small text-ink-900">林雨</p>
                <p className="mt-1 text-micro text-ink-400">trade@nordel.cn</p>
                <p className="mt-1 text-micro text-ink-400">+86 579 8500 2168</p>
                <ButtonLink href="/contact" variant="ghost" size="sm" className="mt-4 w-full">
                  发消息
                </ButtonLink>
              </div>
            </aside>

            <div className="space-y-6">
              {/* 账户资料（真实会话） */}
              <AccountProfile />

              {/* 订单记录 */}
              <section id="orders" className="glass-panel rounded-lg p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="label-micro">订单记录</p>
                  <span className="text-micro text-ink-400">近 12 个月 · 3 单</span>
                </div>

                <ul className="mt-6 divide-y divide-line">
                  {orders.map((order) => (
                    <li key={order.no} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-display text-small text-ink-900">{order.no}</span>
                            <Badge tone={order.tone}>{order.status}</Badge>
                            <span className="text-micro text-ink-400">{order.date}</span>
                          </div>
                          <p className="mt-2 text-small text-ink-700">{order.lines}</p>
                          <NodeProgress
                            nodes={ORDER_NODES}
                            current={order.node}
                            label={order.status === "已签收" ? "已签收" : undefined}
                            className="mt-3 max-w-[300px]"
                          />
                          <p className="mt-2 text-micro text-ink-400">{order.eta}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-champagne-700">
                            {formatPrice(order.amount)}
                          </p>
                          <p className="mt-1 flex items-center justify-end gap-1.5 text-micro text-ink-400">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            {order.docs}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-micro text-ink-400">
                  <Ship className="h-3.5 w-3.5" />
                  出运节点在货代系统同步，周末也会更新；需要原始验货报告可以直接找客户经理。
                </p>
              </section>

              {/* 收货地址 */}
              <section id="addresses" className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <article key={address.name} className="glass-panel rounded-lg p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-small text-ink-900">{address.name}</p>
                      {address.primary ? <Badge tone="gold">默认</Badge> : null}
                    </div>
                    <p className="mt-3 text-small text-ink-500">{address.contact}</p>
                    <p className="mt-1 flex items-start gap-2 text-small text-ink-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                      {address.line}
                    </p>
                    <p className="mt-1 text-micro text-ink-400">{address.phone}</p>
                  </article>
                ))}
              </section>

              {/* 常用规格 */}
              <section id="reorder" className="glass-panel rounded-lg p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="label-micro">常用规格</p>
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-small text-lumen-700 hover:text-lumen-800"
                  >
                    加入询盘单
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {reorder.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/product/${item.slug}`}
                        className="group block overflow-hidden rounded-md border border-line transition-colors hover:border-lumen-500/40"
                      >
                        <span className="block aspect-4/3 overflow-hidden bg-surface">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-lumen group-hover:scale-[1.04]"
                          />
                        </span>
                        <span className="block p-3">
                          <span className="line-clamp-2 block text-micro leading-relaxed text-ink-900 group-hover:text-lumen-700">
                            {item.name}
                          </span>
                          <span className="mt-1.5 block text-micro text-ink-400">
                            {formatPrice(item.price)} · MOQ {item.moq}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
