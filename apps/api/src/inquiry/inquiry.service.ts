import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import { countLinks, sanitizeText } from "../common/security/password-policy";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateInquiryDto, ListInquiriesQueryDto } from "./dto/inquiry.dto";

export interface InquiryContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto, ctx: InquiryContext) {
    const message = sanitizeText(dto.message, 2000);
    const links = countLinks(message);

    // 风险评分：命中蜜罐 / 填表过快 / 堆链接，都算可疑。
    // 蜜罐与过快直接「假成功」——不落库、不报错，让脚本以为自己成功了。
    let riskScore = 0;
    if (dto.website && dto.website.trim().length > 0) riskScore += 5;
    if (typeof dto.formStartedAt === "number" && dto.formStartedAt > 0) {
      const elapsed = Date.now() - dto.formStartedAt;
      if (elapsed >= 0 && elapsed < 2000) riskScore += 3;
    }
    if (links > 2) riskScore += 2;

    if (riskScore >= 5) {
      await this.logEvent("INQUIRY_HONEYPOT", dto.email, ctx, { riskScore, links });
      return this.fakeResponse();
    }

    const reference = await this.generateReference();
    const itemsMeta = dto.items
      ? { items: dto.items.map((item) => ({ slug: item.slug, name: item.name, qty: item.qty })) }
      : undefined;

    const inquiry = await this.prisma.inquiry.create({
      data: {
        reference,
        name: sanitizeText(dto.name, 60),
        company: dto.company ? sanitizeText(dto.company, 120) : null,
        email: dto.email,
        phone: dto.phone ? sanitizeText(dto.phone, 40) : null,
        category: dto.category ?? null,
        volume: dto.volume ?? null,
        market: dto.market ?? null,
        message,
        source: dto.source ?? "contact",
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent?.slice(0, 300) ?? null,
        riskScore,
        meta: itemsMeta as Prisma.InputJsonObject | undefined,
      },
    });

    if (riskScore > 0) {
      await this.logEvent("INQUIRY_SUSPICIOUS", dto.email, ctx, { riskScore, links, reference });
    }

    return {
      reference: inquiry.reference,
      accepted: true,
      replyWithin: dto.source === "checkout" ? "24 小时（工作日）" : "4 小时（工作日）",
    };
  }

  async list(query: ListInquiriesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = query.status ? { status: query.status } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async updateStatus(id: string, status: "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "SPAM") {
    const exists = await this.prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException({ code: "INQUIRY_NOT_FOUND", message: "询盘不存在" });
    }
    return this.prisma.inquiry.update({ where: { id }, data: { status } });
  }

  private async generateReference(): Promise<string> {
    const stamp = new Date();
    const prefix = `ND-${String(stamp.getFullYear()).slice(2)}${String(stamp.getMonth() + 1).padStart(2, "0")}`;

    // 碰撞概率极低，但唯一约束不能靠运气，最多重试 5 次
    for (let i = 0; i < 5; i += 1) {
      const candidate = `${prefix}-${randomInt(1000, 10000)}`;
      const clash = await this.prisma.inquiry.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      if (!clash) return candidate;
    }
    return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  }

  private fakeResponse() {
    const stamp = new Date();
    return {
      reference: `ND-${String(stamp.getFullYear()).slice(2)}${String(stamp.getMonth() + 1).padStart(2, "0")}-0000`,
      accepted: true,
      replyWithin: "4 小时（工作日）",
    };
  }

  private async logEvent(
    kind: string,
    email: string,
    ctx: InquiryContext,
    detail: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          kind,
          email,
          ip: ctx.ip ?? null,
          userAgent: ctx.userAgent?.slice(0, 300) ?? null,
          detail: detail as Prisma.InputJsonObject,
        },
      });
    } catch (error) {
      this.logger.warn(`安全事件写入失败：${kind} ${(error as Error).message}`);
    }
  }
}
