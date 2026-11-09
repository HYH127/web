/**
 * 工厂实例：类型、分类标签与读取接口
 * 数据来自 GET /api/factory/posts 与 /api/factory/posts/:slug
 */
import { API_BASE_URL, apiGet, apiGetSafe } from "./api";

export type FactoryCategoryKey =
  | "ASSEMBLY"
  | "MACHINING"
  | "QUALITY"
  | "WAREHOUSE"
  | "SAMPLE"
  | "PACKAGING";

export const FACTORY_CATEGORIES = [
  { value: "ASSEMBLY", label: "装配", en: "ASSEMBLY" },
  { value: "MACHINING", label: "机加工", en: "MACHINING" },
  { value: "QUALITY", label: "质检", en: "QUALITY" },
  { value: "WAREHOUSE", label: "仓储", en: "WAREHOUSE" },
  { value: "SAMPLE", label: "打样", en: "SAMPLE" },
  { value: "PACKAGING", label: "包装", en: "PACKAGING" },
] as const;

export const FACTORY_CATEGORY_LABEL: Record<FactoryCategoryKey, string> = {
  ASSEMBLY: "装配",
  MACHINING: "机加工",
  QUALITY: "质检",
  WAREHOUSE: "仓储",
  SAMPLE: "打样",
  PACKAGING: "包装",
};

export type FactoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface FactoryPostListItem {
  id: string;
  slug: string;
  title: string;
  factoryName: string;
  location: string;
  category: FactoryCategoryKey;
  summary: string;
  coverImage: string | null;
  tags: string[];
  author: string | null;
  publishedAt: string;
}

export interface FactoryPostDetail extends FactoryPostListItem {
  gallery: string[];
  content: FactoryBlock[];
  neighbors: {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  };
}

export interface FactoryListPayload {
  items: FactoryPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const EMPTY_FACTORY_LIST: FactoryListPayload = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 9,
  totalPages: 1,
};

/** 图片地址：/images 走前端静态资源，/uploads 走 API 域名 */
export function assetUrl(src?: string | null): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/images/") || src.startsWith("/map/")) return src;
  return `${new URL(API_BASE_URL).origin}${src}`;
}

export function formatFactoryDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

export async function getFactoryPosts(params?: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<FactoryListPayload> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.page) query.set("page", String(params.page));
  query.set("pageSize", String(params?.pageSize ?? 12));
  const suffix = query.toString();

  return apiGetSafe<FactoryListPayload>(
    `/factory/posts${suffix ? `?${suffix}` : ""}`,
    EMPTY_FACTORY_LIST,
    { revalidate: 60 },
  );
}

export async function getFactoryPost(
  slug: string,
  /** fresh: 编辑器要拿到刚改过的内容，跳过 60s 缓存 */
  options?: { fresh?: boolean },
): Promise<FactoryPostDetail> {
  return apiGet<FactoryPostDetail>(`/factory/posts/${encodeURIComponent(slug)}`, {
    revalidate: options?.fresh ? 0 : 60,
  });
}
