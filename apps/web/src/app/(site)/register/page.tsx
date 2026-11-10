import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "@/components/auth/auth-forms";
import { pages } from "@/lib/messages";

export const metadata: Metadata = {
  title: "注册",
  description: pages.register.description,
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lumen-400/[0.12] blur-[110px]"
      />
      <Container size="narrow" className="relative max-w-md">
        <div className="glass-panel rounded-lg p-8 md:p-10">
          <p className="label-micro">{pages.register.eyebrow}</p>
          <h1 className="text-h2 mt-4 font-semibold text-ink-900">{pages.register.title}</h1>
          <p className="mt-3 text-small text-ink-500">{pages.register.description}</p>

          <RegisterForm />

          <div className="mt-6 flex items-center justify-between text-small text-ink-500">
            <span>已有账号？</span>
            <Link href="/login" className="text-lumen-600 hover:text-lumen-700">
              登录
            </Link>
          </div>

          <p className="mt-8 border-t border-line pt-6 text-micro leading-relaxed text-ink-400">
            提交即表示同意我们仅为业务沟通使用你的联系方式；不会用于群发营销。
          </p>
        </div>
      </Container>
    </div>
  );
}
