"use client";

import { getProduct, type Product } from "@/lib/content/products";

/**
 * 询盘单的本地暂存（演示态）
 *
 * 用 localStorage 让「产品 → 询盘单 → 提交询盘」三步共用同一份数据，
 * 刷新页面也不会丢。正式接入后端时替换成购物车接口即可。
 */

export interface InquiryLine {
  slug: string;
  qty: number;
}

export const INQUIRY_STORAGE_KEY = "nordel:inquiry-lines";

export const demoInquiryLines: InquiryLine[] = [
  { slug: "bearing-unit-6205-2rs", qty: 1000 },
  { slug: "lora-th-sensor", qty: 200 },
  { slug: "carton-5ply-6040", qty: 2000 },
];

export function readInquiryLines(): InquiryLine[] {
  if (typeof window === "undefined") return demoInquiryLines;
  try {
    const raw = window.localStorage.getItem(INQUIRY_STORAGE_KEY);
    if (!raw) return demoInquiryLines;
    const parsed = JSON.parse(raw) as InquiryLine[];
    if (!Array.isArray(parsed)) return demoInquiryLines;
    return parsed.filter((line) => Boolean(getProduct(line.slug)) && line.qty > 0);
  } catch {
    return demoInquiryLines;
  }
}

export function writeInquiryLines(lines: InquiryLine[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* 隐私模式下写不进去，忽略即可 */
  }
}

/** 加入询盘单：已存在则按一个 MOQ 递增，不存在则新增一行 */
export function addInquiryLine(slug: string, qty?: number) {
  const product = getProduct(slug);
  if (!product) return;
  const step = qty ?? product.moq;
  const lines = readInquiryLines();
  const index = lines.findIndex((line) => line.slug === slug);
  if (index >= 0) {
    const next = lines.map((line, i) =>
      i === index ? { ...line, qty: line.qty + step } : line,
    );
    writeInquiryLines(next);
    return;
  }
  writeInquiryLines([...lines, { slug, qty: step }]);
}

export interface InquiryRow {
  product: Product;
  qty: number;
  amount: number;
}

export function buildRows(lines: InquiryLine[]): InquiryRow[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.slug);
    if (!product) return [];
    return [{ product, qty: line.qty, amount: product.price * line.qty }];
  });
}

export function sumAmount(rows: InquiryRow[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

export function sumUnits(rows: InquiryRow[]) {
  return rows.reduce((total, row) => total + row.qty, 0);
}
