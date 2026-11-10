import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/components/auth/auth-forms";
import { pages } from "@/lib/messages";

export const metadata: Metadata = {
  title: "登录",
  description: pages.login.description,
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[110px]"
      />
      <Container size="narrow" className="relative max-w-md">
        <div className="glass-panel rounded-lg p-8 md:p-10">
          <p className="label-micro">{pages.login.eyebrow}</p>
          <h1 className="text-h2 mt-4 font-semibold text-ink-900">{pages.login.title}</h1>
          <p className="mt-3 text-small text-ink-500">{pages.login.description}</p>

          <LoginForm />

          <div className="mt-6 flex items-center justify-between text-small text-ink-500">
            <span>还没有账号？</span>
            <Link href="/register" className="text-lumen-600 hover:text-lumen-700">
              注册
            </Link>
          </div>

          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-micro text-ink-400">
            <li>· 订单节点与验货报告</li>
            <li>· 出运单证（提单、装箱单、3.1 证书）</li>
            <li>· 常用规格一键复购</li>
          </ul>
        </div>
      </Container>
    </div>
  );
}
