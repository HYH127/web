import Link from "next/link";
import { brand, footer, header } from "@/lib/messages";
import { certifications, contact } from "@/lib/content/company";
import { SocialRail } from "./social";
import { Container } from "@/components/ui/container";

/**
 * 页脚
 *
 * 2026-11-10：改为深墨蓝深底，与顶部导航形成"书挡"。
 * 浅灰页脚在长页面末尾会显得越读越飘；深色收口能把整页压住，也顺带
 * 让"认证 / 联系方式 / 备案"这些信任信息从背景里跳出来。
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-abyss-900 text-white/70">
      {/* 背景光斑：深底上比浅底更耐看，作为品牌色的低亮度回响 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 h-80 w-80 rounded-full bg-lumen-500/16 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-champagne-400/14 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne-400/40 to-transparent"
      />
      <Container className="relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="font-display text-2xl font-medium tracking-[0.14em] text-white">
              {brand.name}
            </Link>
            <p className="mt-4 max-w-xs text-small text-white/55">{footer.note}</p>

            <dl className="mt-6 space-y-1.5 text-small">
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-white/45">邮　箱</dt>
                <dd>
                  <a
                    href={contact.emailHref}
                    className="font-medium text-white/85 transition-colors hover:text-champagne-300"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-white/45">电　话</dt>
                <dd>
                  <a
                    href={contact.phoneHref}
                    className="font-medium text-white/85 transition-colors hover:text-champagne-300"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline">
                <dt className="w-24 shrink-0 text-white/45">WhatsApp</dt>
                <dd>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-white/85 transition-colors hover:text-champagne-300"
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
                <p className="mb-4 text-micro font-semibold tracking-[0.16em] text-white/40 uppercase">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-small text-white/70 transition-colors duration-300 hover:text-white"
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

        {/* 资质：一行带过，细节放在首页「以可核验的方式建立合作信任」区块 */}
        <ul className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-micro font-medium tracking-[0.12em] uppercase">
          {certifications.map((item) => (
            <li key={item.name} className="flex items-center gap-2 text-white/55">
              <span aria-hidden className="h-1 w-1 rounded-full bg-champagne-400" />
              <span className="text-white/80">{item.name}</span>
              <span className="text-white/35">{item.year}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-micro font-medium tracking-[0.14em] text-white/40 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>{footer.copyright}</span>
          <span className="flex flex-wrap items-center gap-4">
            <span>{brand.legal}</span>
            <a href={contact.emailHref} className="hover:text-white">
              询盘
            </a>
            <Link href="/login" className="hover:text-white">
              {header.account}
            </Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
