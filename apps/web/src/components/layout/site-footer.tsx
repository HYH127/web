import Link from "next/link";
import { brand, footer, header } from "@/lib/messages";
import { contact } from "@/lib/content/company";
import { SocialRail } from "./social";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface">
      {/* 背景虚化光斑：柔和的品牌色晕，让页脚不再一片灰白 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-lumen-500/12 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-champagne-400/16 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-lumen-400/8 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lumen-500/30 to-transparent"
      />
      <Container className="relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="font-display text-2xl tracking-[0.14em] text-ink-900">
              {brand.name}
            </Link>
            <p className="mt-4 max-w-xs text-small text-ink-400">{footer.note}</p>

            <dl className="mt-6 space-y-1.5 text-small">
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-small text-ink-400">邮　箱</dt>
                <dd>
                  <a
                    href={contact.emailHref}
                    className="text-ink-500 transition-colors hover:text-ink-900"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-small text-ink-400">电　话</dt>
                <dd>
                  <a
                    href={contact.phoneHref}
                    className="text-ink-500 transition-colors hover:text-ink-900"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-small text-ink-400">WhatsApp</dt>
                <dd>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-ink-500 transition-colors hover:text-ink-900"
                  >
                    {contact.whatsapp}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <SocialRail />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <p className="label-micro mb-4">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-small text-ink-500 transition-colors duration-300 hover:text-ink-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-micro tracking-[0.14em] text-ink-400 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>{footer.copyright}</span>
          <span className="flex flex-wrap items-center gap-4">
            <span>{brand.legal}</span>
            <a href={contact.emailHref} className="hover:text-ink-700">
              询盘
            </a>
            <Link href="/login" className="hover:text-ink-700">
              {header.account}
            </Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
