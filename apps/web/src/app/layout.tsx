import type { Metadata, Viewport } from "next";
import "./globals.css";
import { company } from "@/lib/content/company";
import { displayLatin, sansLatin } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://nordel.cn"),
  title: {
    default: "NORDEL · 全球供应链合作",
    template: "%s · NORDEL",
  },
  description:
    "NORDEL 从义乌出发，为 30 个国家的采购方整合 4 大品类、87 家工厂的产能：报价、打样、量产、验货、出运，每一段都有记录。",
  keywords: [
    "义乌外贸",
    "供应链整合",
    "B2B 采购",
    "工业零部件出口",
    "智能硬件代工",
    "出口包装",
    "家纺 OEM",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "NORDEL · 全球供应链合作",
    description: company.shortIntro,
    siteName: "NORDEL",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "NORDEL · 全球供应链合作",
    description: company.shortIntro,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1a2b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${sansLatin.variable} ${displayLatin.variable}`}
    >
      <body className="min-h-dvh bg-paper text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
