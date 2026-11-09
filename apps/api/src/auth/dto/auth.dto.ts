import { Transform } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { normalizeEmail } from "../../common/security/password-policy";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const lower = ({ value }: { value: unknown }) =>
  typeof value === "string" ? normalizeEmail(value) : value;

export class RegisterDto {
  @Transform(trim)
  @IsString({ message: "姓名格式不正确" })
  @Length(2, 60, { message: "姓名需为 2–60 个字符" })
  name!: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: "公司名称格式不正确" })
  @Length(2, 120, { message: "公司名称需为 2–120 个字符" })
  company?: string;

  @Transform(lower)
  @IsEmail({}, { message: "邮箱格式不正确" })
  @MaxLength(254, { message: "邮箱过长" })
  email!: string;

  @IsString({ message: "密码格式不正确" })
  @Length(10, 128, { message: "密码需为 10–128 位" })
  password!: string;

  @IsBoolean({ message: "请先同意隐私与联系条款" })
  @Equals(true, { message: "请先同意隐私与联系条款" })
  acceptTerms!: boolean;

  /** 蜜罐字段：正常用户看不到，机器人会填。填了就静默丢弃。 */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  /** 表单渲染时间戳：填得太快（< 2s）视为脚本提交 */
  @IsOptional()
  @IsInt()
  @Min(0)
  formStartedAt?: number;
}

export class LoginDto {
  @Transform(lower)
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;

  @IsString({ message: "密码格式不正确" })
  @Length(1, 128, { message: "密码需为 1–128 位" })
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class VerifyEmailDto {
  @Transform(lower)
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;

  @Transform(trim)
  @IsString({ message: "验证码格式不正确" })
  @Matches(/^\d{6}$/, { message: "验证码是 6 位数字" })
  code!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class ResendVerificationDto {
  @Transform(lower)
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;
}

export class ChangePasswordDto {
  @IsString({ message: "当前密码格式不正确" })
  @Length(1, 128, { message: "请输入当前密码" })
  currentPassword!: string;

  @IsString({ message: "新密码格式不正确" })
  @Length(10, 128, { message: "新密码需为 10–128 位" })
  newPassword!: string;

  @IsOptional()
  @IsBoolean()
  revokeOtherSessions?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 60, { message: "姓名需为 2–60 个字符" })
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 120, { message: "公司名称需为 2–120 个字符" })
  company?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 2, { message: "国家代码为 2 位" })
  country?: string;
}
