import localFont from "next/font/local";

/**
 * 自托管字体（latin 子集，共约 82KB，构建期不联网）
 *
 * 背景：globals.css 的字体栈里一直写着 "Inter Tight" / "Playfair Display"，
 * 但项目从未真正加载过这两个字体 —— 全站实际用的是系统字体（Segoe UI / 雅黑），
 * 配上 font-weight 300 就显得发虚、不厚重。这里把两个可变字体放进仓库自托管，
 * 保证每台设备看到的字形、字宽、数字间距一致。
 *
 * 文件来源：@fontsource-variable/inter-tight、@fontsource-variable/playfair-display
 * （OFL-1.1）。只取 latin 子集，中文字形交给系统字体逐字回退。
 */
export const sansLatin = localFont({
  src: "../app/fonts/inter-tight-latin.woff2",
  weight: "300 800",
  style: "normal",
  variable: "--font-latin-sans",
  display: "swap",
  preload: true,
  // 关闭 Arial 度量修正：中文字符会回退到系统字体，套用 Arial 的度量反而会让
  // 回退字号忽大忽小
  adjustFontFallback: false,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "sans-serif",
  ],
});

export const displayLatin = localFont({
  src: "../app/fonts/playfair-display-latin.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-latin-display",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Noto Serif SC", "Songti SC", "STSong", "Georgia", "serif"],
});
