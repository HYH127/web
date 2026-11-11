import { SetMetadata, createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Role } from "@prisma/client";

export const IS_PUBLIC_KEY = "is_public";
export const ROLES_KEY = "roles";
export const ADMIN_ONLY_KEY = "admin_only";

/** 标记为公开接口（默认所有接口都需要登录，安全默认） */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** 限定角色，例如 @Roles("ADMIN") */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * 管理员写接口：允许「登录管理员」或「x-admin-key」两种凭证。
 *
 * 不加这个标记时，全局 JwtAuthGuard 会先要求登录，带 x-admin-key 的
 * 请求根本到不了方法级的 AdminKeyGuard —— 编辑台那条路等于形同虚设。
 * 标记后 JwtAuthGuard 改为「有凭证就解析、没凭证就交给 AdminKeyGuard」，
 * 最终放行与否仍由 AdminKeyGuard 判定，不会因为少一道闸而变松。
 */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);

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
