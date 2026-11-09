import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SocialRail } from "@/components/layout/social";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { pages } from "@/lib/messages";
import { contact } from "@/lib/content/company";

export const metadata: Metadata = {
  title: "联系",
  description: pages.contact.description,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={pages.contact.eyebrow}
        title={pages.contact.title}
        description={pages.contact.description}
      />
      <Section tight>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <InquiryForm />

              <div className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "24 小时内回复",
                    body: "确认收到，说明还需要哪些信息；涉及图纸的会先看工艺可行性。",
                  },
                  {
                    step: "02",
                    title: "报价与打样",
                    body: "给 FOB 报价、可行交期与打样费用；不确定的工艺会明确写出风险。",
                  },
                  {
                    step: "03",
                    title: "小单验证",
                    body: "先做一个小批量，验一次交付质量与沟通节奏，再谈长期。",
                  },
                ].map((item) => (
                  <div key={item.step}>
                    <p className="font-display text-small text-champagne-600">{item.step}</p>
                    <p className="mt-2 text-small text-ink-900">{item.title}</p>
                    <p className="mt-1.5 text-micro leading-relaxed text-ink-500">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="glass-panel rounded-lg p-7">
                <p className="label-micro">直接联系</p>
                <dl className="mt-6 space-y-5 text-small">
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lumen-600" />
                    <div>
                      <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">邮箱</dt>
                      <dd className="mt-1">
                        <a
                          href={contact.emailHref}
                          className="text-ink-700 transition-colors hover:text-lumen-700"
                        >
                          {contact.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-lumen-600" />
                    <div>
                      <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">电话</dt>
                      <dd className="mt-1">
                        <a
                          href={contact.phoneHref}
                          className="text-ink-700 transition-colors hover:text-lumen-700"
                        >
                          {contact.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-lumen-600" />
                    <div>
                      <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">
                        WhatsApp
                      </dt>
                      <dd className="mt-1 text-ink-700">{contact.whatsapp}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lumen-600" />
                    <div>
                      <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">地址</dt>
                      <dd className="mt-1 text-ink-700">{contact.address}</dd>
                      <dd className="mt-1 text-micro text-ink-400">邮编 {contact.postalCode}</dd>
                    </div>
                  </div>
                </dl>
                <p className="mt-6 border-t border-line pt-4 text-micro text-ink-400">
                  {contact.hours}
                </p>
              </div>

              <div className="glass-panel rounded-lg p-7">
                <p className="label-micro">展厅与看厂</p>
                <p className="mt-3 text-small text-ink-500">
                  常备样品在义乌国际商贸城二区展厅；看厂需提前 2 天预约，我们安排车与翻译。
                </p>
                <p className="mt-4 text-small text-ink-700">{contact.showroom}</p>
                <p className="mt-1 text-micro text-ink-400">义乌国际商贸城二区 · 17 街 3F-188</p>
              </div>

              <div className="glass-panel rounded-lg p-7">
                <p className="label-micro">社交媒体</p>
                <p className="mt-3 text-small text-ink-500">
                  工厂日常与新样品优先发在 Instagram 与 TikTok。
                </p>
                <SocialRail className="mt-5" />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
