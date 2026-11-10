/**
 * 只灌「工厂实例」数据，不清库、不动用户与订单。
 *
 * 用途：生产环境第一次上线时 `prisma migrate deploy` 只建表不灌数据，
 * `/factory` 会是空的；而 `prisma/seed.ts` 会清空全库（含管理员账号），
 * 生产环境不能跑。这个脚本按 slug 幂等写入，可反复执行。
 *
 * 运行：pnpm --filter @wem/api factory:seed
 */
import { PrismaClient } from "@prisma/client";
import { factoryPosts } from "./factory-data";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;

  for (const post of factoryPosts) {
    const data = {
      ...post,
      published: true,
    };

    const existing = await prisma.factoryPost.findUnique({
      where: { slug: post.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.factoryPost.update({ where: { slug: post.slug }, data });
      updated += 1;
    } else {
      await prisma.factoryPost.create({ data });
      created += 1;
    }
  }

  const total = await prisma.factoryPost.count();
  console.log(
    `✔ 工厂实例同步完成：新增 ${created} 篇 / 更新 ${updated} 篇 / 库中共 ${total} 篇`,
  );
}

main()
  .catch((error) => {
    console.error("✘ 工厂实例同步失败：", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
