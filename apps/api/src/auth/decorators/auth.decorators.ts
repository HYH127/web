import { SetMetadata, createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Role } from "@prisma/client";

export const IS_PUBLIC_KEY = "is_public";
export const ROLES_KEY = "roles";

/** 标记为公开接口（默认所有接口都需要登录，安全默认） */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** 限定角色，例如 @Roles("ADMIN") */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export interface RequestUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  role: Role;
  emailVerified: boolean;
  tokenVersion: number;
}

/** 从请求上下文取当前登录用户 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
