import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateFactoryPostDto,
  FactoryBlock,
  ListFactoryPostsQueryDto,
} from "./dto/create-factory-post.dto";
import { UpdateFactoryPostDto } from "./dto/update-factory-post.dto";

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  factoryName: true,
  location: true,
  category: true,
  summary: true,
  coverImage: true,
  tags: true,
  author: true,
  publishedAt: true,
} satisfies Prisma.FactoryPostSelect;

@Injectable()
export class FactoryService {
  constructor(private readonly prisma: PrismaService) {}

  /** 列表：只返回摘要字段，不带正文，避免列表接口过大 */
  async list(query: ListFactoryPostsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 9;
    const where: Prisma.FactoryPostWhereInput = {
      published: true,
      ...(query.category ? { category: query.category } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.factoryPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: LIST_SELECT,
      }),
      this.prisma.factoryPost.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /** 详情：正文块 + 图集 + 上下篇 */
  async detail(slug: string) {
    const post = await this.prisma.factoryPost.findUnique({ where: { slug } });
    if (!post || !post.published) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: `工厂记录不存在：${slug}`,
      });
    }

    const [newer, older] = await Promise.all([
      this.prisma.factoryPost.findFirst({
        where: { published: true, publishedAt: { gt: post.publishedAt } },
        orderBy: { publishedAt: "asc" },
        select: { slug: true, title: true },
      }),
      this.prisma.factoryPost.findFirst({
        where: { published: true, publishedAt: { lt: post.publishedAt } },
        orderBy: { publishedAt: "desc" },
        select: { slug: true, title: true },
      }),
    ]);

    return {
      ...post,
      content: (post.content ?? []) as unknown as FactoryBlock[],
      neighbors: {
        prev: newer ?? null,
        next: older ?? null,
      },
    };
  }

  async create(dto: CreateFactoryPostDto) {
    const slug = await this.uniqueSlug(dto.slug?.trim() || `factory-${Date.now().toString(36)}`);

    return this.prisma.factoryPost.create({
      data: {
        slug,
        title: dto.title.trim(),
        factoryName: dto.factoryName.trim(),
        location: dto.location.trim(),
        category: dto.category,
        summary: dto.summary.trim(),
        coverImage: dto.coverImage ?? null,
        gallery: dto.gallery ?? [],
        tags: dto.tags ?? [],
        content: (dto.content ?? []) as unknown as Prisma.InputJsonValue,
        author: dto.author ?? "现场记录",
        published: dto.published ?? true,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      },
      select: { id: true, slug: true, title: true, publishedAt: true },
    });
  }

  async update(id: string, dto: UpdateFactoryPostDto) {
    const existing = await this.prisma.factoryPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "NOT_FOUND", message: `工厂记录不存在：${id}` });
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.prisma.factoryPost.findUnique({ where: { slug: dto.slug } });
      if (conflict) {
        slug = await this.uniqueSlug(dto.slug);
      } else {
        slug = dto.slug;
      }
    }

    return this.prisma.factoryPost.update({
      where: { id },
      data: {
        slug,
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.factoryName !== undefined ? { factoryName: dto.factoryName.trim() } : {}),
        ...(dto.location !== undefined ? { location: dto.location.trim() } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary.trim() } : {}),
        ...(dto.coverImage !== undefined ? { coverImage: dto.coverImage } : {}),
        ...(dto.gallery !== undefined ? { gallery: dto.gallery } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.content !== undefined
          ? { content: dto.content as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.author !== undefined ? { author: dto.author } : {}),
        ...(dto.published !== undefined ? { published: dto.published } : {}),
        ...(dto.publishedAt !== undefined ? { publishedAt: new Date(dto.publishedAt) } : {}),
      },
      select: { id: true, slug: true, title: true, publishedAt: true },
    });
  }

  /** 删除：物理删除（占位阶段没有回收站，前端有二次确认） */
  async remove(id: string) {
    const existing = await this.prisma.factoryPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "NOT_FOUND", message: `工厂记录不存在：${id}` });
    }

    await this.prisma.factoryPost.delete({ where: { id } });
    return { id, slug: existing.slug, deleted: true };
  }

  private async uniqueSlug(base: string): Promise<string> {
    const normalized =
      base
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || `factory-${Date.now().toString(36)}`;

    let candidate = normalized;
    let index = 1;
    while (await this.prisma.factoryPost.findUnique({ where: { slug: candidate } })) {
      index += 1;
      candidate = `${normalized}-${index}`;
    }
    return candidate;
  }
}
