import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import {
  burnPasswordTime,
  hashPassword,
  hashVerificationCode,
  randomVerificationCode,
  verifyPassword,
} from "../common/crypto/password";
import {
  assessPassword,
  isDisposableEmail,
  normalizeEmail,
} from "../common/security/password-policy";
import { PrismaService } from "../prisma/prisma.service";
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from "./dto/auth.dto";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const CODE_RESEND_COOLDOWN_MS = 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const CODE_MAX_PER_HOUR = 6;
const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const SESSION_TTL_SHORT = "2d";
const SESSION_TTL_LONG = "30d";

export interface RequestContext {
  ip?: string;
  userAgent?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface SessionPayload {
  user: PublicUser;
  token: string;
  expiresAt: string;
  rememberMe: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ---------------------------------------------------------------- 注册

  async register(dto: RegisterDto, ctx: RequestContext) {
    const email = normalizeEmail(dto.email);

    // 蜜罐命中：不报错、不落库，给机器人一个「成功」的假象
    if (dto.website && dto.website.trim().length > 0) {
      await this.logEvent("REGISTER_HONEYPOT", { email, ...ctx });
      return this.fakeRegisterResult(email);
    }

    // 填表过快（脚本通常 < 1s）
    if (typeof dto.formStartedAt === "number" && dto.formStartedAt > 0) {
      const elapsed = Date.now() - dto.formStartedAt;
      if (elapsed >= 0 && elapsed < 1500) {
        await this.logEvent("REGISTER_TOO_FAST", {
          email,
          ...ctx,
          detail: { elapsed },
        });
        return this.fakeRegisterResult(email);
      }
    }

    if (isDisposableEmail(email)) {
      await this.logEvent("REGISTER_DISPOSABLE_EMAIL", { email, ...ctx });
      throw new BadRequestException({
        code: "EMAIL_DOMAIN_NOT_ALLOWED",
        message: "请使用公司邮箱注册，临时邮箱无法接收报价与单证",
      });
    }

    const assessment = assessPassword(dto.password, email);
    if (!assessment.ok) {
      throw new BadRequestException({
        code: "WEAK_PASSWORD",
        message: assessment.issues[0],
        details: assessment.issues,
      });
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing?.emailVerifiedAt) {
      await this.logEvent("REGISTER_DUPLICATE", { email, ...ctx });
      throw new ConflictException({
        code: "EMAIL_TAKEN",
        message: "该邮箱已注册，可直接登录或找回密码",
      });
    }

    const passwordHash = await hashPassword(dto.password);

    // 未验证的旧记录：允许覆盖资料与口令，但必须重新走验证码（邮箱所有权仍是唯一凭证）
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name,
          company: dto.company ?? null,
        },
      }));

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: dto.name,
          company: dto.company ?? null,
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });
    }

    const sent = await this.issueCode(user, "VERIFY_EMAIL", ctx);
    return {
      email,
      expiresInSeconds: Math.round(CODE_TTL_MS / 1000),
      resendAfterSeconds: Math.round(CODE_RESEND_COOLDOWN_MS / 1000),
      ...(sent.devCode ? { devCode: sent.devCode } : {}),
    };
  }

  async resendVerification(rawEmail: string, ctx: RequestContext) {
    const email = normalizeEmail(rawEmail);
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 无论账号是否存在都返回同样的结果，避免邮箱枚举
    if (!user || user.emailVerifiedAt) {
      return {
        email,
        expiresInSeconds: Math.round(CODE_TTL_MS / 1000),
        resendAfterSeconds: Math.round(CODE_RESEND_COOLDOWN_MS / 1000),
      };
    }

    const sent = await this.issueCode(user, "VERIFY_EMAIL", ctx);
    return {
      email,
      expiresInSeconds: Math.round(CODE_TTL_MS / 1000),
      resendAfterSeconds: Math.round(CODE_RESEND_COOLDOWN_MS / 1000),
      ...(sent.devCode ? { devCode: sent.devCode } : {}),
    };
  }

  async verifyEmail(dto: VerifyEmailDto, ctx: RequestContext): Promise<SessionPayload> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException({
        code: "CODE_INVALID",
        message: "验证码不正确或已过期",
      });
    }

    const record = await this.prisma.emailVerificationCode.findFirst({
      where: {
        userId: user.id,
        purpose: "VERIFY_EMAIL",
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new BadRequestException({
        code: "CODE_EXPIRED",
        message: "验证码已过期，请重新获取",
      });
    }

    if (record.attempts >= CODE_MAX_ATTEMPTS) {
      await this.logEvent("CODE_ATTEMPTS_EXCEEDED", { email, ...ctx, detail: { id: record.id } });
      throw new BadRequestException({
        code: "CODE_ATTEMPTS_EXCEEDED",
        message: "验证码错误次数过多，请重新获取",
      });
    }

    const expected = hashVerificationCode(dto.code, email);
    if (expected !== record.codeHash) {
      await this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      await this.logEvent("CODE_MISMATCH", {
        email,
        ...ctx,
        detail: { attempts: record.attempts + 1 },
      });
      const left = CODE_MAX_ATTEMPTS - (record.attempts + 1);
      throw new BadRequestException({
        code: "CODE_INVALID",
        message: left > 0 ? `验证码不正确，还可尝试 ${left} 次` : "验证码错误次数过多，请重新获取",
      });
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      }),
      this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.emailVerificationCode.updateMany({
        where: { userId: user.id, purpose: "VERIFY_EMAIL", consumedAt: null },
        data: { consumedAt: new Date() },
      }),
    ]);

    await this.logEvent("EMAIL_VERIFIED", { email, ...ctx });
    return this.issueSession(updated, dto.rememberMe ?? true);
  }

  // ---------------------------------------------------------------- 登录

  async login(dto: LoginDto, ctx: RequestContext): Promise<SessionPayload> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // 账号不存在也跑一次 scrypt，避免通过响应时间枚举邮箱
      await burnPasswordTime(dto.password);
      await this.logEvent("LOGIN_UNKNOWN_EMAIL", { email, ...ctx });
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "邮箱或密码不正确",
      });
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const retryAfter = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
      throw new HttpException(
        {
          code: "ACCOUNT_LOCKED",
          message: `尝试次数过多，请 ${Math.ceil(retryAfter / 60)} 分钟后再试`,
          details: { retryAfterSeconds: retryAfter },
        },
        HttpStatus.LOCKED,
      );
    }

    const { ok } = await verifyPassword(dto.password, user.passwordHash);

    if (!ok) {
      await this.recordFailedLogin(user);
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "邮箱或密码不正确",
      });
    }

    if (!user.emailVerifiedAt) {
      // 密码正确但没验证：顺手补发一次验证码（受冷却时间约束，失败不阻塞）
      try {
        await this.issueCode(user, "VERIFY_EMAIL", ctx);
      } catch {
        /* 冷却中，忽略 */
      }
      throw new ForbiddenException({
        code: "EMAIL_NOT_VERIFIED",
        message: "邮箱还未验证，验证码已重新发送",
        details: { email, needsVerification: true },
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await this.logEvent("LOGIN_SUCCESS", { email, ...ctx });
    return this.issueSession(updated, dto.rememberMe ?? false);
  }

  // ---------------------------------------------------------------- 资料

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "请先登录" });
    }
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.country !== undefined ? { country: dto.country.toUpperCase() } : {}),
      },
    });
    return this.toPublicUser(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ctx: RequestContext,
  ): Promise<SessionPayload> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "请先登录" });
    }

    const { ok } = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!ok) {
      await this.logEvent("PASSWORD_CHANGE_WRONG_CURRENT", {
        email: user.email,
        ...ctx,
      });
      throw new UnauthorizedException({
        code: "CURRENT_PASSWORD_WRONG",
        message: "当前密码不正确",
      });
    }

    const assessment = assessPassword(dto.newPassword, user.email);
    if (!assessment.ok) {
      throw new BadRequestException({
        code: "WEAK_PASSWORD",
        message: assessment.issues[0],
        details: assessment.issues,
      });
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException({
        code: "PASSWORD_UNCHANGED",
        message: "新密码不能与当前密码相同",
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(dto.newPassword),
        // 全端下线：所有旧 token 立即失效，随后给当前设备重签一个
        tokenVersion: { increment: 1 },
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    await this.logEvent("PASSWORD_CHANGED", { email: user.email, ...ctx });
    return this.issueSession(updated, true);
  }

  // ---------------------------------------------------------------- 内部

  private async issueCode(
    user: User,
    purpose: "VERIFY_EMAIL" | "RESET_PASSWORD",
    ctx: RequestContext,
  ): Promise<{ devCode?: string }> {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.prisma.emailVerificationCode.count({
      where: { userId: user.id, purpose, createdAt: { gt: since } },
    });
    if (recentCount >= CODE_MAX_PER_HOUR) {
      await this.logEvent("CODE_RATE_LIMITED", { email: user.email, ...ctx });
      throw new HttpException(
        {
          code: "CODE_RATE_LIMITED",
          message: "验证码发送过于频繁，请一小时后再试",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const latest = await this.prisma.emailVerificationCode.findFirst({
      where: { userId: user.id, purpose },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < CODE_RESEND_COOLDOWN_MS) {
      const retryAfter = Math.ceil(
        (CODE_RESEND_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000,
      );
      throw new HttpException(
        {
          code: "RESEND_TOO_SOON",
          message: `${retryAfter} 秒后可重新获取验证码`,
          details: { retryAfterSeconds: retryAfter },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    // 新码生效前先作废旧码，避免并存多个可用验证码
    await this.prisma.emailVerificationCode.updateMany({
      where: { userId: user.id, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.prisma.emailVerificationCode.create({
      data: {
        userId: user.id,
        purpose,
        codeHash: hashVerificationCode(code, user.email),
        expiresAt,
        requestIp: ctx.ip ?? null,
      },
    });

    this.deliverCode(user.email, code, purpose);

    const expose = process.env.NODE_ENV !== "production" || process.env.EXPOSE_VERIFICATION_CODE === "true";
    return expose ? { devCode: code } : {};
  }

  /**
   * 验证码投递。
   * 当前 MVP 没有接 SMTP：开发环境打到日志 + 随响应返回（仅非生产），
   * 生产环境接邮件服务时把这里替换成真实发送即可。
   */
  private deliverCode(email: string, code: string, purpose: string): void {
    this.logger.log(`[verification] ${purpose} ${email} code=${code}`);
  }

  private async recordFailedLogin(user: User): Promise<void> {
    const nextCount = user.failedLoginCount + 1;
    const shouldLock = nextCount >= MAX_FAILED_LOGINS;

    await this.prisma.user.update({
      where: { id: user.id },
      data: shouldLock
        ? {
            failedLoginCount: 0,
            lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
          }
        : { failedLoginCount: nextCount },
    });

    await this.logEvent(shouldLock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED", {
      email: user.email,
      detail: { failedCount: nextCount },
    });
  }

  private async issueSession(user: User, rememberMe: boolean): Promise<SessionPayload> {
    const expiresIn = rememberMe ? SESSION_TTL_LONG : SESSION_TTL_SHORT;
    const token = await this.jwt.signAsync(
      {
        sub: user.id,
        role: user.role,
        ver: user.tokenVersion,
        typ: "access",
      },
      { expiresIn },
    );

    const decoded = this.jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    return {
      user: this.toPublicUser(user),
      token,
      expiresAt,
      rememberMe,
    };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      country: user.country,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private fakeRegisterResult(email: string) {
    return {
      email,
      expiresInSeconds: Math.round(CODE_TTL_MS / 1000),
      resendAfterSeconds: Math.round(CODE_RESEND_COOLDOWN_MS / 1000),
    };
  }

  /** 安全事件留痕：失败不影响主流程 */
  private async logEvent(
    kind: string,
    payload: RequestContext & { email?: string; detail?: Record<string, unknown> },
  ): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          kind,
          email: payload.email ?? null,
          ip: payload.ip ?? null,
          userAgent: payload.userAgent?.slice(0, 300) ?? null,
          detail: payload.detail ? (payload.detail as object) : undefined,
        },
      });
    } catch (error) {
      this.logger.warn(`安全事件写入失败：${kind} ${(error as Error).message}`);
    }
  }
}
