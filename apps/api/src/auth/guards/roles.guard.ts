import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@prisma/client";
import { ROLES_KEY, type RequestUser } from "../decorators/auth.decorators";

/** 角色守卫：只对声明了 @Roles() 的接口生效 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const role = request.user?.role;

    if (!role || !required.includes(role)) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "当前账号没有该操作权限",
      });
    }
    return true;
  }
}
