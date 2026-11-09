/**
 * PM2 进程配置：Web（Next.js 生产服务）+ API（NestJS）
 *
 * 启动：pm2 start deploy/ecosystem.config.cjs
 * 重载：pm2 reload deploy/ecosystem.config.cjs
 *
 * 说明：
 * - 这里只注入「运行时」环境变量。NEXT_PUBLIC_* 是**构建期**注入，
 *   必须在 next build 之前写进 apps/web/.env.production，改这里没用。
 * - 仓库根目录执行，脚本会自动读取各应用目录下的 .env* 文件。
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** 极简 .env 解析：KEY=VALUE，忽略注释与引号 */
function loadEnv(...files) {
  const out = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
  }
  return out;
}

const webEnv = loadEnv(
  path.join(ROOT, "apps/web/.env.production"),
  path.join(ROOT, "apps/web/.env.local"),
);
const apiEnv = loadEnv(path.join(ROOT, "apps/api/.env"));

module.exports = {
  apps: [
    {
      name: "wem-web",
      cwd: path.join(ROOT, "apps/web"),
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      // 2G 内存机型给 Node 留出余量，避免被系统 OOM 杀掉
      node_args: "--max-old-space-size=1024",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        ...webEnv,
      },
      max_memory_restart: "900M",
      autorestart: true,
      exp_backoff_restart_delay: 200,
      out_file: path.join(ROOT, "logs/web.out.log"),
      error_file: path.join(ROOT, "logs/web.err.log"),
      merge_logs: true,
      time: true,
    },
    {
      name: "wem-api",
      cwd: path.join(ROOT, "apps/api"),
      script: "dist/main.js",
      node_args: "--max-old-space-size=512",
      env: {
        NODE_ENV: "production",
        ...apiEnv,
      },
      max_memory_restart: "600M",
      autorestart: true,
      exp_backoff_restart_delay: 200,
      out_file: path.join(ROOT, "logs/api.out.log"),
      error_file: path.join(ROOT, "logs/api.err.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
