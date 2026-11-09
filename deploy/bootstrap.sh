#!/usr/bin/env bash
#
# 阿里云 ECS（Ubuntu 22.04）一键初始化脚本
# 用法：sudo bash deploy/bootstrap.sh
#
# 做四件事：
#   1. 加 2G swap（2G 内存机型 build Next.js 必需，否则会被 OOM kill）
#   2. 装运行时：Node 22 / pnpm 10 / PM2 / Nginx / PostgreSQL 16
#   3. 建数据库与账号（幂等，可重复执行）
#   4. 打印后续手动步骤
#
set -euo pipefail

APP_DB_NAME="${APP_DB_NAME:-wem}"
APP_DB_USER="${APP_DB_USER:-wem}"
APP_DB_PASS="${APP_DB_PASS:-}"

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 root 或 sudo 执行：sudo bash deploy/bootstrap.sh" >&2
  exit 1
fi

# ---------------------------------------------------------------- 1. swap
log "检查 swap"
if swapon --show | grep -q '/swapfile'; then
  warn "swapfile 已存在，跳过"
else
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # 2G 内存机器上让内核更愿意用 swap，减少 build 被 kill 的概率
  sysctl -w vm.swappiness=30 >/dev/null
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=30' >> /etc/sysctl.conf
  echo "swap 2G 已启用"
fi

# ------------------------------------------------------------ 2. 系统依赖
log "安装系统依赖"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git build-essential ca-certificates gnupg \
  nginx postgresql postgresql-contrib ufw

# ---------------------------------------------------------------- 3. Node
log "安装 Node.js 22"
if command -v node >/dev/null && node -v | grep -q '^v22'; then
  warn "Node 22 已存在：$(node -v)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
node -v

log "启用 pnpm 10"
corepack enable
corepack prepare pnpm@10.34.9 --activate
pnpm -v

log "安装 PM2"
command -v pm2 >/dev/null || npm i -g pm2
pm2 -v

# ------------------------------------------------------------ 4. PostgreSQL
log "配置 PostgreSQL"
systemctl enable --now postgresql

if [ -z "$APP_DB_PASS" ]; then
  APP_DB_PASS="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
  warn "未提供 APP_DB_PASS，已随机生成，请记录下来"
fi

sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${APP_DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${APP_DB_USER} LOGIN PASSWORD '${APP_DB_PASS}'"

sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${APP_DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O "${APP_DB_USER}" "${APP_DB_NAME}" -E UTF8

# 让 prisma 在该库内能建表/建枚举
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${APP_DB_NAME} TO ${APP_DB_USER}" >/dev/null
sudo -u postgres psql -d "${APP_DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${APP_DB_USER}" >/dev/null

# ---------------------------------------------------------------- 5. 防火墙
# 云上已有安全组，ufw 默认不开启：远程操作时误配 ufw 会把 SSH 一起关掉。
# 需要主机级防火墙时用 ENABLE_UFW=1 显式开启。
if [ "${ENABLE_UFW:-0}" = "1" ]; then
  log "配置 ufw"
  ufw allow OpenSSH >/dev/null || true
  ufw allow 80,443/tcp >/dev/null || true
  ufw --force enable >/dev/null || true
  ufw status | head -6
else
  log "跳过 ufw（云安全组已负责入站，ENABLE_UFW=1 可开启）"
fi

# ---------------------------------------------------------------- 6. 收尾
log "完成。请记录以下信息："
cat <<EOF

  数据库名 : ${APP_DB_NAME}
  数据库账号: ${APP_DB_USER}
  数据库密码: ${APP_DB_PASS}
  DATABASE_URL=postgresql://${APP_DB_USER}:${APP_DB_PASS}@127.0.0.1:5432/${APP_DB_NAME}?schema=public

下一步：
  1) git clone 代码到 /var/www/wem
  2) 按 deploy/上线手册.md 写 apps/web/.env.production 与 apps/api/.env
  3) pnpm install --frozen-lockfile && pnpm --filter @wem/api prisma:generate
  4) cd apps/api && pnpm prisma migrate deploy
  5) pnpm --filter @wem/web build && pnpm --filter @wem/api build
  6) pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup

EOF
