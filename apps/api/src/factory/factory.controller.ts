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
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { memoryStorage } from "multer";
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

/**
 * 按文件头判断真实类型。
 *
 * 客户端声明的 Content-Type 完全可伪造：把一段 HTML 或 SVG 标成
 * image/png 一样能过 fileFilter。真正的防线是读前 12 字节的魔术数字，
 * 对不上就拒绝，且落盘扩展名也由真实类型决定（而不是声明的类型）。
 */
function detectImageExt(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return ".jpg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(PNG_SIG)) return ".png";

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return ".webp";
  }

  // AVIF: 第 4–7 字节 "ftyp"，品牌为 avif / avis
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return ".avif";
  }

  return null;
}

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
      // 先放内存再校验：diskStorage 会把未经检查的内容直接写到磁盘，
      // 一旦 fileFilter 判断失误，恶意文件就已经在 web 目录里了。
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
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
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: "NO_FILE",
        message: "请选择要上传的图片（字段名 file）",
      });
    }

    const ext = detectImageExt(file.buffer);
    if (!ext) {
      throw new BadRequestException({
        code: "INVALID_IMAGE",
        message: "文件内容不是有效的图片，请重新导出后再上传",
      });
    }

    mkdirSync(UPLOAD_ROOT, { recursive: true });
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    await writeFile(join(UPLOAD_ROOT, filename), file.buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
