import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { safeEqual } from "../crypto/password";
import type { RequestUser } from "../../auth/decorators/auth.decorators";

/**
 * 写入接口的鉴权，两种方式取其一：
 * 1. 管理员 JWT（浏览器登录 admin 账号，role = ADMIN）——正式方式；
 * 2. `x-admin-key` 请求头 —— 兼容 /factory/write 这套本地编辑台。
 *
 * 与旧实现的区别：不再有 "nordel-dev" 这种默认密钥。
 * ADMIN_KEY 未配置或过短时直接拒绝，避免部署时忘配就变成裸奔。
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();

    if (request.user?.role === "ADMIN") return true;

    const expected = process.env.ADMIN_KEY ?? "";
    if (expected.length < 12) {
      throw new UnauthorizedException({
        code: "ADMIN_KEY_NOT_CONFIGURED",
        message: "服务端未配置管理员密钥（ADMIN_KEY 至少 12 位），写入接口已关闭",
      });
    }

    const provided = request.headers["x-admin-key"];
    if (typeof provided === "string" && provided.length > 0 && safeEqual(provided, expected)) {
      return true;
    }

    throw new UnauthorizedException({
      code: "UNAUTHORIZED",
      message: "需要管理员权限",
    });
  }
}
