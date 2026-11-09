"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextareaField } from "@/components/ui/field";
import { API_BASE_URL } from "@/lib/api";
import {
  FACTORY_CATEGORIES,
  assetUrl,
  type FactoryBlock,
  type FactoryCategoryKey,
} from "@/lib/factory";
import { cn } from "@/lib/utils";

type EditableBlock =
  | { id: string; type: "paragraph" | "heading" | "quote"; text: string }
  | { id: string; type: "image"; url: string; caption: string }
  | { id: string; type: "list"; text: string };

const BLOCK_LABEL: Record<EditableBlock["type"], string> = {
  paragraph: "段落",
  heading: "小标题",
  image: "图片",
  quote: "引用",
  list: "列表",
};

function newBlock(type: EditableBlock["type"]): EditableBlock {
  const id = Math.random().toString(36).slice(2, 9);
  if (type === "image") return { id, type, url: "", caption: "" };
  if (type === "list") return { id, type, text: "" };
  return { id, type, text: "" };
}

const KEY_STORAGE = "nordel:factory-admin-key";

/** 编辑模式下传进来的既有记录 */
export interface EditablePost {
  id: string;
  slug: string;
  title: string;
  factoryName: string;
  location: string;
  category: FactoryCategoryKey;
  summary: string;
  coverImage: string | null;
  gallery: string[];
  tags: string[];
  content: FactoryBlock[];
}

/** 后端正文块 → 可编辑块（补上本地 id） */
function toEditableBlocks(blocks: FactoryBlock[]): EditableBlock[] {
  return blocks.map((block) => {
    const id = Math.random().toString(36).slice(2, 9);
    if (block.type === "image")
      return { id, type: "image", url: block.url, caption: block.caption ?? "" };
    if (block.type === "list") return { id, type: "list", text: block.items.join("\n") };
    return { id, type: block.type, text: block.text };
  });
}

export function PostEditor({ initial }: { initial?: EditablePost }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [adminKey, setAdminKey] = useState("");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [factoryName, setFactoryName] = useState(initial?.factoryName ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [category, setCategory] = useState<FactoryCategoryKey>(initial?.category ?? "ASSEMBLY");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [tags, setTags] = useState(initial?.tags.join("，") ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    initial && initial.content.length > 0
      ? toEditableBlocks(initial.content)
      : [newBlock("paragraph")],
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY_STORAGE);
    if (saved) setAdminKey(saved);
  }, []);

  const rememberKey = (value: string) => {
    setAdminKey(value);
    window.localStorage.setItem(KEY_STORAGE, value);
  };

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_BASE_URL}/factory/upload`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: form,
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "图片上传失败");
    }
    return payload.data.url as string;
  }

  async function handleCover(file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy("cover");
    try {
      setCoverImage(await uploadImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setBusy(null);
    }
  }

  async function handleGallery(files?: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy("gallery");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file));
      }
      setGallery((current) => [...current, ...urls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setBusy(null);
    }
  }

  async function handleBlockImage(id: string, file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy(id);
    try {
      const url = await uploadImage(file);
      updateBlock(id, (block) => (block.type === "image" ? { ...block, url } : block));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setBusy(null);
    }
  }

  function updateBlock(id: string, updater: (block: EditableBlock) => EditableBlock) {
    setBlocks((current) => current.map((block) => (block.id === id ? updater(block) : block)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function serialize(block: EditableBlock): FactoryBlock | null {
    if (block.type === "image") {
      if (!block.url) return null;
      return { type: "image", url: block.url, caption: block.caption || undefined };
    }
    if (block.type === "list") {
      const items = block.text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      return items.length > 0 ? { type: "list", items } : null;
    }
    const text = block.text.trim();
    if (!text) return null;
    return { type: block.type, text };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!adminKey) {
      setError("请先填写访问密钥（服务端 .env 中的 ADMIN_KEY）。");
      return;
    }
    if (title.trim().length < 2 || !factoryName.trim() || !location.trim()) {
      setError("标题、工厂名称、地点为必填项。");
      return;
    }
    if (summary.trim().length < 4) {
      setError("摘要至少 4 个字，会显示在列表卡片上。");
      return;
    }

    const content = blocks
      .map(serialize)
      .filter((block): block is FactoryBlock => block !== null);

    setBusy("submit");
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        factoryName: factoryName.trim(),
        location: location.trim(),
        category,
        summary: summary.trim(),
        coverImage: coverImage || undefined,
        gallery,
        tags: tags
          .split(/[,，\s]+/)
          .map((tag) => tag.trim())
          .filter(Boolean),
        content,
        published: true,
      };

      const response = await fetch(
        initial
          ? `${API_BASE_URL}/factory/posts/${initial.id}`
          : `${API_BASE_URL}/factory/posts`,
        {
          method: initial ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? (initial ? "保存失败" : "发布失败"));
      }
      setSuccess({ slug: payload.data.slug });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!adminKey) {
      setError("请先填写访问密钥（服务端 .env 中的 ADMIN_KEY）。");
      return;
    }
    // 二次确认：第一次点只是把按钮切成「确认删除」
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setError(null);
    setBusy("delete");
    try {
      const response = await fetch(`${API_BASE_URL}/factory/posts/${initial.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "删除失败");
      }
      router.push("/factory");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除失败");
      setConfirmDelete(false);
    } finally {
      setBusy(null);
    }
  }

  if (success) {
    return (
      <div className="glass-panel rounded-lg p-10 text-center">
        <p className="text-micro tracking-[0.18em] text-champagne-700 uppercase">
          {editing ? "已保存" : "已发布"}
        </p>
        <h2 className="text-h2 mt-4 font-light text-ink-900">
          {editing ? "修改已写入" : "记录已写入"}
        </h2>
        <p className="mt-3 text-ink-500">
          {editing
            ? "这篇现场记录已更新，详情页会立即反映新的内容。"
            : "这篇现场记录已生成独立页面，可以继续编辑或返回列表查看。"}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => router.push(`/factory/${success.slug}`)}>
            打开这篇记录
          </Button>
          {editing ? (
            <Button variant="ghost" onClick={() => router.push("/factory")}>
              返回列表
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setSuccess(null);
                setTitle("");
                setSummary("");
                setBlocks([newBlock("paragraph")]);
              }}
            >
              再写一篇
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 访问密钥 */}
      <section className="glass-panel rounded-lg p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-normal text-ink-900">访问密钥</h2>
          <span className="text-micro tracking-[0.14em] text-ink-400 uppercase">
            仅限内部
          </span>
        </div>
        <p className="mt-2 text-small text-ink-500">
          写入接口用 `x-admin-key` 校验，值来自 `apps/api/.env` 的 `ADMIN_KEY`（无默认值，未配置时拒绝写入）。
          密钥只保存在本机浏览器，不会随页面发送给第三方。
        </p>
        <div className="mt-4 max-w-md">
          <Field
            label="Admin Key"
            type="password"
            value={adminKey}
            placeholder="填入 .env 中的 ADMIN_KEY"
            onChange={(event) => rememberKey(event.target.value)}
            autoComplete="off"
          />
        </div>
      </section>

      {/* 基本信息 */}
      <section className="glass-panel rounded-lg p-6 md:p-8">
        <h2 className="text-h3 font-normal text-ink-900">基本信息</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="标题"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例：宁波装配一厂 · 第 45 周早班巡检记录"
              maxLength={120}
            />
          </div>
          <Field
            label="工厂名称"
            value={factoryName}
            onChange={(event) => setFactoryName(event.target.value)}
            placeholder="例：宁波装配一厂"
          />
          <Field
            label="地点"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="例：浙江 · 宁波"
          />
          <label className="block">
            <span className="mb-2 block text-micro tracking-[0.14em] text-ink-500 uppercase">
              分类
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as FactoryCategoryKey)}
              className="w-full appearance-none rounded-sm border border-line-strong bg-surface px-4 py-3 text-small text-ink-900 focus:border-lumen-500/50 focus:outline-none"
            >
              {FACTORY_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="自定义链接（可选）"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="留空自动生成"
            hint="只能包含字母、数字与连字符"
          />
          <div className="md:col-span-2">
            <TextareaField
              label="摘要"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="一到两句话，会显示在列表卡片与详情页头部"
              maxLength={400}
            />
          </div>
          <div className="md:col-span-2">
            <Field
              label="标签"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="早班巡检, 节拍, 夹具"
              hint="用逗号或空格分隔"
            />
          </div>
        </div>
      </section>

      {/* 封面与图集 */}
      <section className="glass-panel rounded-lg p-6 md:p-8">
        <h2 className="text-h3 font-normal text-ink-900">封面与图集</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-micro tracking-[0.14em] text-ink-500 uppercase">封面图</p>
            <div className="mt-3 overflow-hidden rounded-md border border-line bg-surface">
              {coverImage ? (
                <img
                  src={assetUrl(coverImage) ?? ""}
                  alt="封面预览"
                  className="aspect-[3/2] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 text-ink-400">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-micro">尚未选择</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-small text-ink-700 transition-colors hover:border-ink-400">
                {busy === "cover" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                上传封面
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) => handleCover(event.target.files?.[0])}
                />
              </label>
              {coverImage ? (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-small text-ink-400 hover:text-ink-700"
                >
                  移除
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-micro text-ink-400">JPG / PNG / WebP / AVIF，单张 ≤ 8MB</p>
          </div>

          <div>
            <p className="text-micro tracking-[0.14em] text-ink-500 uppercase">图集</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-sm border border-line">
                  <img
                    src={assetUrl(image) ?? ""}
                    alt={`图集 ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setGallery((current) => current.filter((_, i) => i !== index))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper/90 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="移除这张图"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line-strong text-ink-400 transition-colors hover:border-lumen-500 hover:text-lumen-600">
                {busy === "gallery" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span className="text-micro">添加</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) => handleGallery(event.target.files)}
                />
              </label>
            </div>
            <p className="mt-2 text-micro text-ink-400">可一次选多张，上传后自动插入图集</p>
          </div>
        </div>
      </section>

      {/* 正文 */}
      <section className="glass-panel rounded-lg p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-normal text-ink-900">正文</h2>
          <span className="text-micro tracking-[0.14em] text-ink-400 uppercase">
            {blocks.length} 个区块
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="rounded-md border border-line bg-paper p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-micro tracking-[0.14em] text-ink-400 uppercase">
                  {BLOCK_LABEL[block.type]}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-xs text-ink-400 hover:bg-surface hover:text-ink-700 disabled:opacity-30"
                    aria-label="上移"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-xs text-ink-400 hover:bg-surface hover:text-ink-700 disabled:opacity-30"
                    aria-label="下移"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBlocks((current) => current.filter((item) => item.id !== block.id))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-xs text-ink-400 hover:bg-surface hover:text-ink-900"
                    aria-label="删除区块"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {block.type === "image" ? (
                <div className="mt-3 space-y-3">
                  {block.url ? (
                    <img
                      src={assetUrl(block.url) ?? ""}
                      alt="正文配图预览"
                      className="aspect-[3/2] w-full rounded-sm border border-line object-cover"
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-line-strong px-3 py-1.5 text-small text-ink-700 hover:border-ink-400">
                      {busy === block.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-3.5 w-3.5" />
                      )}
                      {block.url ? "替换图片" : "上传图片"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        onChange={(event) => handleBlockImage(block.id, event.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <Field
                    label="图片说明"
                    value={block.caption}
                    onChange={(event) =>
                      updateBlock(block.id, (item) =>
                        item.type === "image" ? { ...item, caption: event.target.value } : item,
                      )
                    }
                    placeholder="例：一号线 3 号工位 · 夹具压力复测"
                  />
                </div>
              ) : block.type === "list" ? (
                <textarea
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, (item) =>
                      item.type === "list" ? { ...item, text: event.target.value } : item,
                    )
                  }
                  placeholder={"一行一条，例如：\n一号线节拍 46 秒，瓶颈在锁付工位\n二号线节拍 41 秒，已连续三天稳定"}
                  rows={4}
                  className="mt-3 w-full resize-y rounded-sm border border-line-strong bg-surface px-4 py-3 text-small text-ink-900 placeholder:text-ink-400 focus:border-lumen-500/50 focus:outline-none"
                />
              ) : (
                <textarea
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, (item) =>
                      item.type === "paragraph" || item.type === "heading" || item.type === "quote"
                        ? { ...item, text: event.target.value }
                        : item,
                    )
                  }
                  placeholder={
                    block.type === "heading"
                      ? "小标题，例：一、早班巡检"
                      : block.type === "quote"
                        ? "一句现场判断或原话"
                        : "正文段落"
                  }
                  rows={block.type === "heading" ? 1 : 4}
                  className={cn(
                    "mt-3 w-full resize-y rounded-sm border border-line-strong bg-surface px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-lumen-500/50 focus:outline-none",
                    block.type === "heading" ? "text-h3 font-light" : "text-small",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["paragraph", "heading", "image", "quote", "list"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBlocks((current) => [...current, newBlock(type)])}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-3 py-1.5 text-small text-ink-600 transition-colors hover:border-lumen-500 hover:text-lumen-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {BLOCK_LABEL[type]}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-small text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={busy !== null}>
          {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editing ? "保存修改" : "发布这篇记录"}
        </Button>
        <span className="text-micro tracking-[0.08em] text-ink-400">
          {editing
            ? `当前编辑：/factory/${initial?.slug}`
            : "发布后立即生成 /factory/[slug] 页面"}
        </span>
      </div>

      {/* 删除：只在编辑已有记录时出现，两次点击才真正删除 */}
      {editing ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-h3 font-normal text-ink-900">删除这篇记录</h2>
              <p className="mt-2 max-w-xl text-small text-ink-500">
                物理删除，不可恢复。图片文件会留在 /uploads 目录，需要时手动清理。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-sm border border-line-strong px-4 py-2 text-small text-ink-700 transition-colors hover:border-ink-400"
                >
                  取消
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy !== null}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm px-4 py-2 text-small transition-colors disabled:opacity-60",
                  confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-red-200 text-red-700 hover:bg-red-100",
                )}
              >
                {busy === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {confirmDelete ? "确认删除，无法恢复" : "删除"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </form>
  );
}
