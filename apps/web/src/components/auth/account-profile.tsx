"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { fetchMe, logout, type SessionUser } from "@/lib/auth-client";

const COUNTRY_NAME: Record<string, string> = {
  CN: "中国",
  DE: "德国",
  NL: "荷兰",
  US: "美国",
  AE: "阿联酋",
  AU: "澳大利亚",
  BR: "巴西",
  JP: "日本",
  ZA: "南非",
  FR: "法国",
  GB: "英国",
};

/** 账户资料区：读取真实会话，未登录则提示登录 */
export function AccountProfile() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((me) => {
      if (!cancelled) setUser(me);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    await logout();
    router.push("/login");
    router.refresh();
  };

  if (user === null) {
    return (
      <section id="profile" className="glass-panel flex items-center gap-3 rounded-lg p-7">
        <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
        <span className="text-small text-ink-500">正在读取账户信息…</span>
      </section>
    );
  }

  if (!user) {
    return (
      <section id="profile" className="glass-panel rounded-lg p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-micro">账户资料</p>
            <p className="text-h3 mt-2 font-light text-ink-900">尚未登录</p>
          </div>
          <ButtonLink href="/login">登录</ButtonLink>
        </div>
        <p className="mt-4 text-small text-ink-500">
          登录后即可查看历史订单、验货报告、出运单证与常用收货地址。
        </p>
      </section>
    );
  }

  return (
    <section id="profile" className="glass-panel rounded-lg p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-micro">账户资料</p>
          <p className="text-h3 mt-2 font-light text-ink-900">
            {user.name || user.email.split("@")[0]}
            {user.company ? ` · ${user.company}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="cyan">{user.emailVerified ? "已认证采购商" : "待验证"}</Badge>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={signingOut}>
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            退出登录
          </Button>
        </div>
      </div>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "邮箱", value: user.email },
          { label: "国家 / 地区", value: COUNTRY_NAME[user.country ?? ""] ?? (user.country || "未填写") },
          { label: "客户编号", value: `ND-C-${user.id.slice(-4).toUpperCase()}` },
          { label: "最近登录", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("zh-CN") : "—" },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-micro tracking-[0.14em] text-ink-400 uppercase">{item.label}</dt>
            <dd className="mt-2 text-small text-ink-700">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
