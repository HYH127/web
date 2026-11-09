import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { diskStorage } from "multer";
import { AdminKeyGuard } from "../common/guards/admin-key.guard";
import { Public } from "../auth/decorators/auth.decorators";
import {
  CreateFactoryPostDto,
  ListFactoryPostsQueryDto,
} from "./dto/create-factory-post.dto";
import { UpdateFactoryPostDto } from "./dto/update-factory-post.dto";
import { FactoryService } from "./factory.service";

/** 上传目录：默认 apps/api/uploads，可通过 UPLOAD_DIR 覆盖 */
export const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

@ApiTags("factory")
@Controller("factory")
export class FactoryController {
  constructor(private readonly factory: FactoryService) {}

  @Get("posts")
  @Public()
  @ApiOperation({
    summary: "工厂实例列表",
    description: "按发布时间倒序，只返回摘要字段；支持 category 筛选与分页。",
  })
  list(@Query() query: ListFactoryPostsQueryDto) {
    return this.factory.list(query);
  }

  @Get("posts/:slug")
  @Public()
  @ApiOperation({ summary: "工厂实例详情（正文块 + 图集 + 上下篇）" })
  detail(@Param("slug") slug: string) {
    return this.factory.detail(slug);
  }

  @Post("posts")
  @UseGuards(AdminKeyGuard)
  @ApiOperation({
    summary: "新建工厂记录",
    description: "占位鉴权：请求头 x-admin-key 需与 ADMIN_KEY 一致。",
  })
  create(@Body() dto: CreateFactoryPostDto) {
    return this.factory.create(dto);
  }

  @Patch("posts/:id")
  @UseGuards(AdminKeyGuard)
  @ApiOperation({ summary: "修改工厂记录" })
  update(@Param("id") id: string, @Body() dto: UpdateFactoryPostDto) {
    return this.factory.update(id, dto);
  }

  @Delete("posts/:id")
  @UseGuards(AdminKeyGuard)
  @ApiOperation({
    summary: "删除工厂记录",
    description: "物理删除，不可恢复；x-admin-key 需与 ADMIN_KEY 一致。",
  })
  remove(@Param("id") id: string) {
    return this.factory.remove(id);
  }

  @Post("upload")
  @UseGuards(AdminKeyGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(UPLOAD_ROOT, { recursive: true });
          callback(null, UPLOAD_ROOT);
        },
        filename: (_request, file, callback) => {
          const ext = EXT_BY_MIME[file.mimetype] ?? "";
          callback(null, `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!EXT_BY_MIME[file.mimetype]) {
          callback(
            new BadRequestException({
              code: "UNSUPPORTED_MEDIA_TYPE",
              message: "仅支持 JPG / PNG / WebP / AVIF 图片，单张不超过 8MB",
            }),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: "上传图片（占位：本地磁盘，生产环境应换对象存储）" })
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: "NO_FILE",
        message: "请选择要上传的图片（字段名 file）",
      });
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
