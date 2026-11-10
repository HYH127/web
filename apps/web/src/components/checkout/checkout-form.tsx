"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { formatPrice } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import {
  buildRows,
  demoInquiryLines,
  readInquiryLines,
  sumAmount,
  sumUnits,
  type InquiryLine,
} from "@/lib/inquiry-store";

const terms = ["FOB 宁波", "CIF 目的港", "EXW 工厂", "DDP 门到门"];
const leadOptions = ["30 天内", "45 天内", "60 天内", "不着急，按最优排产"];

interface InquiryResult {
  reference: string;
  accepted: boolean;
  replyWithin: string;
}

export function CheckoutForm() {
  const [lines, setLines] = useState<InquiryLine[]>(demoInquiryLines);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<InquiryResult | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    setLines(readInquiryLines());
  }, []);

  const rows = buildRows(lines);
  const amount = sumAmount(rows);
  const units = sumUnits(rows);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    if (!name || !email) {
      setError("联系人与邮箱必填，报价单要发到邮箱。");
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
          message: String(data.get("note") ?? "").trim() || "请求正式报价单。",
          source: "checkout",
          website: "",
          formStartedAt: startedAt.current,
          items: rows.map((row) => ({
            slug: row.product.slug,
            name: row.product.name,
            qty: row.qty,
          })),
        }),
      });
      setReference(result);
    } catch (err) {
      const payload = err as { message?: string };
      setError(payload.message ?? "提交失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  };

  if (reference) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel rounded-lg p-8 md:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-lumen-500/40 bg-lumen-300/40 text-lumen-700">
            <Check className="h-5 w-5" />
          </span>
          <h2 className="text-h2 mt-6 font-semibold text-ink-900">询盘已提交</h2>
          <p className="mt-3 text-ink-500">
            {`编号 `}
            <span className="font-display text-ink-900">{reference.reference}</span>
            {`。报价单会在 ${reference.replyWithin}发到你的邮箱，含阶梯价、包装方案与可行船期。`}
          </p>
          <ul className="mt-6 space-y-2 text-small text-ink-700">
            <li>· 数量超过 2,000 件的行项会单独核算阶梯价。</li>
            <li>· 需要开模或改包装的，报价单里会注明打样费与周期。</li>
            <li>· 加急可以打电话，报编号即可。</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop" variant="ghost">
              继续看产品
            </ButtonLink>
            <ButtonLink href="/cases" variant="ghost">
              看合作案例
            </ButtonLink>
          </div>
        </div>

        <aside className="glass-panel h-fit rounded-lg p-7">
          <p className="label-micro">提交明细</p>
          <ul className="mt-6 space-y-4">
            {rows.map((row) => (
              <li key={row.product.slug} className="flex items-start justify-between gap-3 text-small">
                <span className="min-w-0">
                  <span className="block truncate text-ink-900">{row.product.name}</span>
                  <span className="mt-0.5 block text-micro text-ink-400">
                    {row.qty.toLocaleString("en-US")} {row.product.unit} ×{" "}
                    {formatPrice(row.product.price)}
                  </span>
                </span>
                <span className="shrink-0 text-ink-700">{formatPrice(row.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <span className="text-ink-900">预估合计</span>
            <span className="font-display text-xl text-champagne-700">{formatPrice(amount)}</span>
          </div>
          <p className="mt-4 text-micro text-ink-400">FOB 宁波 · 不含运费与保险</p>
        </aside>
      </div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1.5fr_1fr]" onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        <fieldset className="space-y-5">
          <legend className="label-micro mb-4">收货与联系信息</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="联系人 *" name="name" defaultValue="Martin Weber" autoComplete="name" />
            <Field
              label="公司"
              name="company"
              defaultValue="Kessler Antriebstechnik GmbH"
              autoComplete="organization"
            />
            <Field
              label="邮箱 *"
              name="email"
              type="email"
              defaultValue="m.weber@kessler-at.de"
              autoComplete="email"
            />
            <Field label="电话" name="phone" defaultValue="+49 711 4580 220" />
          </div>
          <Field label="地址" name="address" defaultValue="Industriestraße 42" />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="城市" name="city" defaultValue="Stuttgart" />
            <Field label="邮编" name="postal" defaultValue="70565" />
            <SelectField
              label="国家 / 地区"
              name="country"
              options={["德国", "美国", "荷兰", "阿联酋", "澳大利亚", "巴西", "日本", "南非"]}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="label-micro mb-4">贸易与交期</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="贸易条款" name="terms" options={terms} />
            <Field label="目的港" name="port" defaultValue="Hamburg" />
          </div>
          <SelectField label="期望交期" name="lead" options={leadOptions} />
          <TextareaField
            label="订单备注"
            name="note"
            defaultValue="需要木箱包装，随货提供 3.1 检验证书与材质单；铭牌按我方图纸做激光打标。"
          />
        </fieldset>

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

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            提交询盘
          </Button>
          <span className="text-small text-ink-400">提交后 24 小时内收到正式报价单。</span>
        </div>
      </div>

      <aside className="glass-panel h-fit rounded-lg p-7 lg:sticky lg:top-24">
        <p className="label-micro">询盘明细</p>
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li key={row.product.slug} className="flex items-start justify-between gap-3 text-small">
              <span className="min-w-0">
                <span className="block truncate text-ink-900">{row.product.name}</span>
                <span className="mt-0.5 block text-micro text-ink-400">
                  {row.qty.toLocaleString("en-US")} {row.product.unit} ×{" "}
                  {formatPrice(row.product.price)}
                </span>
              </span>
              <span className="shrink-0 text-ink-700">{formatPrice(row.amount)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-3 border-t border-line pt-4 text-small">
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">件数</dt>
            <dd className="text-ink-700">{units.toLocaleString("en-US")}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">运费</dt>
            <dd className="text-ink-700">按柜型另计</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-900">预估合计</dt>
            <dd className="font-display text-xl text-champagne-700">{formatPrice(amount)}</dd>
          </div>
        </dl>

        <Link
          href="/cart"
          className="mt-6 block text-center text-small text-ink-500 transition-colors hover:text-ink-900"
        >
          返回修改数量
        </Link>
      </aside>
    </form>
  );
}
