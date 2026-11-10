"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

/**
 * 移动端 App 唤起。
 *
 * 思路：<a href> 永远是 https 网页地址（SEO / 分享 / 无 JS 都能用），
 * 只在「移动端 + 该平台有 scheme」时拦截点击，先尝试唤起原生 App；
 * App 没装则 1.2s 后自动回落到网页，避免点了没反应。
 */

const MOBILE_UA = /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Mobile Safari/i;

/** 微信 / 微博 / QQ / 支付宝等内置浏览器不允许唤起外部 App，直接走网页更稳 */
const IN_APP_UA = /MicroMessenger|Weibo|QQ\/|AlipayClient|FBAN|FBAV|Instagram|Line\//i;

/** 超过这个时间还没离开页面，就认为没唤起成功 */
const HANDOFF_TIMEOUT = 1200;

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  const coarse =
    window.matchMedia?.("(hover: none) and (pointer: coarse)").matches ?? false;
  return MOBILE_UA.test(navigator.userAgent) || coarse;
}

export function SocialLink({
  href,
  appScheme,
  label,
  ariaLabel,
  className,
  children,
}: {
  href: string;
  appScheme?: string;
  label: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const [mobile, setMobile] = useState(false);

  // 首帧服务端渲染无法得知设备，挂载后再切换 target，
  // 避免移动端以 target=_blank 开新标签（会打断 Universal Link 的 App 跳转）
  useEffect(() => {
    setMobile(detectMobile());
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!mobile || !appScheme) return;
    // 内置浏览器唤起必失败，交给默认的 https 行为
    if (IN_APP_UA.test(navigator.userAgent)) return;
    // 用户按住 Cmd/Ctrl/Shift 或中键点击时，尊重其「新窗口打开」的意图
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }

    event.preventDefault();

    let handedOff = false;
    const onVisibility = () => {
      if (document.hidden) handedOff = true;
    };
    document.addEventListener("visibilitychange", onVisibility);
    const startedAt = Date.now();

    // 唤起 App。未安装时浏览器通常静默失败，由下面的定时器兜底回落。
    window.location.href = appScheme;

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (!handedOff && !document.hidden && Date.now() - startedAt < 3000) {
        window.location.href = href;
      }
    }, HANDOFF_TIMEOUT);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      // 桌面保持新标签打开；移动端同标签跳转，App 唤起成功率更高
      target={mobile ? undefined : "_blank"}
      rel={mobile ? "noopener" : "noreferrer noopener"}
      aria-label={ariaLabel}
      title={label}
      className={className}
    >
      {children}
    </a>
  );
}
