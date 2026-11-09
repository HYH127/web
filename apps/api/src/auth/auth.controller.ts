import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CurrentUser, Public, type RequestUser } from "./decorators/auth.decorators";
import { AuthService, type SessionPayload } from "./auth.service";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from "./dto/auth.dto";
import { SESSION_COOKIE } from "./guards/jwt-auth.guard";

const isProduction = process.env.NODE_ENV === "production";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 10 * 60 * 1000 } })
  @ApiOperation({
    summary: "注册（发送邮箱验证码）",
    description:
      "校验邮箱格式 / 一次性邮箱 / 口令强度，创建未验证账号并下发 6 位验证码。非生产环境响应里带 devCode。",
  })
  async register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.auth.register(dto, this.context(request));
  }

  @Public()
  @Post("verify-email")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 10 * 60 * 1000 } })
  @ApiOperation({ summary: "校验邮箱验证码并建立会话" })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.verifyEmail(dto, this.context(request));
    this.setSessionCookie(response, session);
    return this.toClientSession(session);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(200)
  @Throttle({ default: { limit: 4, ttl: 10 * 60 * 1000 } })
  @ApiOperation({ summary: "重发验证码（60 秒冷却，每小时最多 6 次）" })
  async resendVerification(@Body() dto: ResendVerificationDto, @Req() request: Request) {
    return this.auth.resendVerification(dto.email, this.context(request));
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 5 * 60 * 1000 } })
  @ApiOperation({
    summary: "登录",
    description: "连续 5 次密码错误锁定 15 分钟；未验证邮箱返回 403 EMAIL_NOT_VERIFIED。",
  })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(dto, this.context(request));
    this.setSessionCookie(response, session);
    return this.toClientSession(session);
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "登出（清除会话 Cookie）" })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(SESSION_COOKIE, this.cookieOptions());
    return { ok: true };
  }

  @Get("me")
  @ApiOperation({ summary: "当前登录用户" })
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user.id);
  }

  @Patch("profile")
  @ApiOperation({ summary: "更新姓名 / 公司 / 国家" })
  updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.id, dto);
  }

  @Post("change-password")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 10 * 60 * 1000 } })
  @ApiOperation({
    summary: "修改密码",
    description: "校验当前密码与强度后，tokenVersion +1 让所有旧会话立即失效。",
  })
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.changePassword(user.id, dto, this.context(request));
    this.setSessionCookie(response, session);
    return this.toClientSession(session);
  }

  // ---------------------------------------------------------------- 内部

  private toClientSession(session: SessionPayload) {
    // 浏览器端只需要用户信息；令牌只放在 HttpOnly Cookie 里。
    // 纯 API 客户端（Swagger / 移动端）可从 Set-Cookie 或 EXPOSE_ACCESS_TOKEN 取。
    return {
      user: session.user,
      expiresAt: session.expiresAt,
      ...(process.env.EXPOSE_ACCESS_TOKEN === "true" ? { accessToken: session.token } : {}),
    };
  }

  private setSessionCookie(response: Response, session: SessionPayload): void {
    const maxAge = Math.max(
      0,
      Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000),
    );
    response.cookie(SESSION_COOKIE, session.token, {
      ...this.cookieOptions(),
      maxAge: maxAge * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };
  }

  private context(request: Request) {
    const forwarded = request.headers["x-forwarded-for"];
    const rawIp =
      typeof forwarded === "string" && forwarded.length > 0
        ? forwarded.split(",")[0].trim()
        : request.ip;
    return {
      ip: rawIp?.replace(/^::ffff:/, "").slice(0, 60),
      userAgent:
        typeof request.headers["user-agent"] === "string"
          ? request.headers["user-agent"].slice(0, 300)
          : undefined,
    };
  }
}
