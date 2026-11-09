import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY, type RequestUser } from "../decorators/auth.decorators";

export const SESSION_COOKIE = "nordel_at";

interface JwtPayload {
  sub: string;
  ver?: number;
  typ?: string;
}

/**
 * 全局会话守卫：
 * 1. 默认所有接口都要登录，公开接口用 @Public() 显式放开；
 * 2. 会话凭证来自 HttpOnly Cookie（浏览器）或 Authorization: Bearer（脚本 / 移动端）；
 * 3. 每次请求比对 tokenVersion —— 改密或强制下线后旧 token 立刻失效；
 * 4. 未验证邮箱的账号即使拿到 token 也拒绝（注册流程的最后一道闸）。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "请先登录",
      });
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException({
        code: "SESSION_EXPIRED",
        message: "登录已过期，请重新登录",
      });
    }

    if (payload.typ !== "access" || !payload.sub) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "请先登录" });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        country: true,
        role: true,
        emailVerifiedAt: true,
        tokenVersion: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "请先登录" });
    }
    if (user.tokenVersion !== (payload.ver ?? 0)) {
      throw new UnauthorizedException({
        code: "SESSION_REVOKED",
        message: "账号已在其他设备修改密码，请重新登录",
      });
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException({
        code: "ACCOUNT_LOCKED",
        message: "账号暂时锁定，请稍后再试",
      });
    }
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException({
        code: "EMAIL_NOT_VERIFIED",
        message: "请先完成邮箱验证",
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      country: user.country,
      role: user.role,
      emailVerified: true,
      tokenVersion: user.tokenVersion,
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice(7).trim() || null;
    }

    const cookieHeader = request.headers.cookie;
    if (typeof cookieHeader === "string" && cookieHeader.length > 0) {
      for (const part of cookieHeader.split(";")) {
        const index = part.indexOf("=");
        if (index === -1) continue;
        if (part.slice(0, index).trim() === SESSION_COOKIE) {
          return decodeURIComponent(part.slice(index + 1).trim()) || null;
        }
      }
    }
    return null;
  }
}
