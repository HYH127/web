import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { normalizeEmail } from "../../common/security/password-policy";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class InquiryItemDto {
  @IsString()
  @Length(1, 120)
  slug!: string;

  @IsString()
  @Length(1, 160)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(10_000_000)
  qty!: number;
}

export class CreateInquiryDto {
  @Transform(trim)
  @IsString({ message: "联系人格式不正确" })
  @Length(2, 60, { message: "联系人需为 2–60 个字符" })
  name!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 120, { message: "公司名称需为 2–120 个字符" })
  company?: string;

  @Transform(({ value }) => (typeof value === "string" ? normalizeEmail(value) : value))
  @IsEmail({}, { message: "邮箱格式不正确" })
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(5, 40, { message: "电话需为 5–40 个字符" })
  phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  category?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  volume?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  market?: string;

  @Transform(trim)
  @IsString({ message: "需求描述格式不正确" })
  @Length(10, 2000, { message: "需求描述需为 10–2000 个字符" })
  message!: string;

  @IsOptional()
  @IsIn(["contact", "checkout"])
  source?: "contact" | "checkout";

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => InquiryItemDto)
  items?: InquiryItemDto[];

  /** 蜜罐：正常表单里是隐藏字段，机器人会填 */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  /** 表单开始填写的时间戳（毫秒） */
  @IsOptional()
  @IsInt()
  @Min(0)
  formStartedAt?: number;
}

export class ListInquiriesQueryDto {
  @IsOptional()
  @IsIn(["NEW", "CONTACTED", "QUOTED", "CLOSED", "SPAM"])
  status?: "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "SPAM";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class UpdateInquiryStatusDto {
  @IsIn(["NEW", "CONTACTED", "QUOTED", "CLOSED", "SPAM"])
  status!: "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "SPAM";
}
