/**
 * 创建 / 重置管理员账号（不导演示数据，不动其它表）
 *
 * 用法（推荐用环境变量，避免密码留在 shell 历史里）：
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='xxx' ADMIN_NAME='张三' \
 *     pnpm --filter @wem/api admin:create
 *
 * 也可用参数：
 *   pnpm --filter @wem/api admin:create --email you@example.com --password 'xxx' --name '张三'
 *
 * 行为：
 * - 账号不存在 → 新建 ADMIN，邮箱标记为已验证（否则登录会被验证码拦住）
 * - 账号已存在 → 覆盖密码、提升为 ADMIN、重置失败次数与锁定状态
 * - 输出用 scrypt（与线上登录同一实现，Node 内置，无需原生编译）
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

/** 与 apps/api/src/common/crypto/password.ts 保持完全一致的算法与格式 */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const name = arg("name") ?? process.env.ADMIN_NAME ?? "管理员";

  if (!email || !password) {
    console.error("缺少参数：需要 email 与 password（环境变量 ADMIN_EMAIL / ADMIN_PASSWORD 亦可）");
    process.exit(1);
  }
  // 线上后台口令至少 8 位，太短的直接拒绝，避免又造出一个弱口令
  if (password.length < 8) {
    console.error("密码至少 8 位");
    process.exit(1);
  }

  const passwordHash = hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: "ADMIN",
        name: existing.name ?? name,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        // 让旧会话立即失效：改密后必须重新登录
        tokenVersion: { increment: 1 },
      },
    });
    console.log(`[admin] 已重置：${email}（ADMIN，旧会话已失效）`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
        emailVerifiedAt: new Date(),
        country: "CN",
      },
    });
    console.log(`[admin] 已创建：${email}（ADMIN，邮箱标记为已验证）`);
  }

  const total = await prisma.user.count({ where: { role: "ADMIN" } });
  console.log(`[admin] 当前管理员数量：${total}`);
}

main()
  .catch((error) => {
    console.error("[admin] 失败：", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
