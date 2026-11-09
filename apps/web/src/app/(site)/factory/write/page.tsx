import type { Metadata } from "next";
import { Section } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PostEditor, type EditablePost } from "@/components/factory/post-editor";
import { ApiError } from "@/lib/api";
import { getFactoryPost } from "@/lib/factory";

export const metadata: Metadata = {
  title: "写一篇工厂记录",
  description: "像写日报一样记录现场：标题、摘要、图片与正文区块。",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ edit?: string }> };

export default async function FactoryWritePage({ searchParams }: PageProps) {
  const { edit } = await searchParams;

  // ?edit=<slug> 进入编辑模式：把既有记录灌进编辑器，保存走 PATCH
  let initial: EditablePost | undefined;
  if (edit) {
    try {
      const post = await getFactoryPost(edit, { fresh: true });
      initial = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        factoryName: post.factoryName,
        location: post.location,
        category: post.category,
        summary: post.summary,
        coverImage: post.coverImage,
        gallery: post.gallery,
        tags: post.tags,
        content: post.content,
      };
    } catch (error) {
      // 记录不存在就当作新建，不把用户挡在错误页
      if (!(error instanceof ApiError)) throw error;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={initial ? "EDIT FIELD NOTE" : "NEW FIELD NOTE"}
        title={initial ? "编辑工厂记录" : "写一篇工厂记录"}
        description={
          initial
            ? `正在修改《${initial.title}》。保存后详情页立即更新；链接（slug）改动后旧地址会失效。`
            : "像写日报一样：先写标题与摘要，再按顺序插入段落、图片、列表与引用。图片会直接上传到本地 /uploads，发布后立即生成独立页面。"
        }
      />

      <Section className="pt-0">
        <div className="mx-auto w-full max-w-4xl px-6 md:px-10">
          <PostEditor initial={initial} />
        </div>
      </Section>
    </>
  );
}
