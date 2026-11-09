import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { Public, Roles } from "../auth/decorators/auth.decorators";
import {
  CreateInquiryDto,
  ListInquiriesQueryDto,
  UpdateInquiryStatusDto,
} from "./dto/inquiry.dto";
import { InquiryService } from "./inquiry.service";

@ApiTags("inquiry")
@Controller("inquiries")
export class InquiryController {
  constructor(private readonly inquiry: InquiryService) {}

  @Public()
  @Post()
  @HttpCode(201)
  @Throttle({ default: { limit: 4, ttl: 60 * 60 * 1000 } })
  @ApiOperation({
    summary: "提交询盘（公开）",
    description:
      "每 IP 每小时 4 次；带蜜罐字段与最短填写时长校验，命中即静默丢弃。返回询盘编号。",
  })
  create(@Body() dto: CreateInquiryDto, @Req() request: Request) {
    const forwarded = request.headers["x-forwarded-for"];
    const rawIp =
      typeof forwarded === "string" && forwarded.length > 0
        ? forwarded.split(",")[0].trim()
        : request.ip;
    return this.inquiry.create(dto, {
      ip: rawIp?.replace(/^::ffff:/, "").slice(0, 60),
      userAgent:
        typeof request.headers["user-agent"] === "string"
          ? request.headers["user-agent"]
          : undefined,
    });
  }

  @Get()
  @Roles("ADMIN")
  @ApiOperation({ summary: "询盘列表（管理员）" })
  list(@Query() query: ListInquiriesQueryDto) {
    return this.inquiry.list(query);
  }

  @Patch(":id/status")
  @Roles("ADMIN")
  @ApiOperation({ summary: "更新询盘状态（管理员）" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.inquiry.updateStatus(id, dto.status);
  }
}
