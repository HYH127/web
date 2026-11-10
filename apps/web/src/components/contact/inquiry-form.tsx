"use client";

import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { apiFetch } from "@/lib/api";

const categories = [
  "工业零部件",
  "智能硬件",
  "包装与耗材",
  "纺织家纺",
  "多个品类 / 尚未确定",
];

interface InquiryResult {
  reference: string;
  accepted: boolean;
  replyWithin: string;
}

export function InquiryForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<InquiryResult | null>(null);
  const startedAt = useRef(Date.now());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setError("联系人、邮箱与需求描述是必填项。");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("邮箱格式看起来不对，检查一下？");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const result = await apiFetch<InquiryResult>("/inquiries", {
        method: "POST",
        body: JSON.stringify({
          name,
          company: String(data.get("company") ?? "").trim() || undefined,
          email,
          phone: String(data.get("phone") ?? "").trim() || undefined,
          category: String(data.get("category") ?? "").trim() || undefined,
          volume: String(data.get("volume") ?? "").trim() || undefined,
          market: String(data.get("market") ?? "").trim() || undefined,
          message,
          source: "contact",
          website: "",
          formStartedAt: startedAt.current,
        }),
      });
      setDone(result);
    } catch (err) {
      const payload = err as { message?: string };
      setError(payload.message ?? "提交失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="glass-panel rounded-lg p-8 md:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-lumen-500/40 bg-lumen-300/40 text-lumen-700">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="text-h2 mt-6 font-semibold text-ink-900">询盘已收到</h2>
        <p className="mt-3 text-ink-500">
          {`编号 `}
          <span className="font-display text-ink-900">{done.reference}</span>
          {`。我们会在 ${done.replyWithin}回复，附上可行性与初步报价；如果涉及图纸，会一并说明需要确认的尺寸。`}
        </p>
        <ul className="mt-6 space-y-2 text-small text-ink-700">
          <li>· 回复会发到你填写的邮箱，注意查收（含垃圾箱）。</li>
          <li>· 需要加急，可以直接打电话或 WhatsApp，报编号即可。</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/shop" variant="ghost">
            先看看产品目录
          </ButtonLink>
          <ButtonLink href="/cases" variant="ghost">
            看合作案例
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="联系人 *" name="name" placeholder="怎么称呼你" autoComplete="name" />
        <Field label="公司" name="company" placeholder="公司名称" autoComplete="organization" />
        <Field
          label="邮箱 *"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
        />
        <Field label="电话 / WhatsApp" name="phone" placeholder="+86 138 0000 0000" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="合作方向" name="category" options={categories} />
        <Field label="预计年采购量" name="volume" placeholder="例如：20,000 件 / 年" />
      </div>

      <Field label="目标市场" name="market" placeholder="例如：德国、美国、阿联酋" />

      <TextareaField
        label="需求描述 *"
        name="message"
        placeholder="品类、规格、数量、目标交期，以及其他必须满足的条件（认证、包装、标签等）。"
      />

      {/* 蜜罐字段：真实用户不可见，机器人会填 */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error ? (
        <p role="alert" className="text-small text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          提交询盘
        </Button>
        <span className="text-small text-ink-400">工作日 4 小时内回复，非工作日次日上午。</span>
      </div>
    </form>
  );
}
