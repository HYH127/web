import { FactoryCategory } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

/** 正文块：段落 / 小标题 / 图片 / 引用 / 列表 */
export type FactoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export class ListFactoryPostsQueryDto {
  @IsOptional()
  @IsEnum(FactoryCategory)
  category?: FactoryCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class CreateFactoryPostDto {
  @IsString()
  @Length(2, 120)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  slug?: string;

  @IsString()
  @Length(1, 60)
  factoryName!: string;

  @IsString()
  @Length(1, 60)
  location!: string;

  @IsEnum(FactoryCategory)
  category!: FactoryCategory;

  @IsString()
  @Length(4, 400)
  summary!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  content?: FactoryBlock[];

  @IsOptional()
  @IsString()
  @Length(1, 40)
  author?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
