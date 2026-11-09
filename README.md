# NORDEL · 外贸独立站 MVP

B2B 外贸独立站 MVP，Monorepo：**Next.js 16 + NestJS 12 + Prisma 6 + PostgreSQL 16**。
内容为售前演示用真实感文案与实拍风格配图；不接真实支付 / 物流，询盘与表单为前端演示态。

---

## 一、本机环境（已验证）

| 组件 | 版本 | 状态 |
| --- | --- | --- |
| Node.js | v22.22.2 | ✅ 已装 |
| pnpm | 10.34.9 | ✅ 已装 |
| Git | 2.55.0 | ✅ 已装 |
| Docker Desktop | 29.9.1（`D:\Docker`） | ✅ 守护进程已启动 |
| PostgreSQL | 16（容器 `wem-postgres`） | ✅ Up (healthy)，端口 5432 |

npm 源已在本项目 `.npmrc` 内指向 npmmirror，不影响全局配置。

---

## 二、首次启动

### 1) 启动数据库（需先打开 Docker Desktop）

```bash
pnpm db:up          # 拉起 postgres:16-alpine，映射 5432
pnpm db:logs        # 看到 "database system is ready to accept connections" 即可
```

### 2) 建表 + 灌种子数据

```bash
pnpm db:migrate     # 首次会生成 prisma/migrations
pnpm db:seed        # 写入分类/商品/案例/交易数据/工厂记录/站点配置
```

### 3) 起服务

```bash
pnpm dev            # 同时启动 web(3000) + api(4000)
# 或分开：
pnpm dev:web
pnpm dev:api
```

| 地址 | 说明 |
| --- | --- |
| http://localhost:3000 | 前端 |
| http://localhost:4000/api/health | 健康检查（含 DB 连通性） |
| http://localhost:4000/api/docs | Swagger 接口文档 |

演示账户（Seeder 写入）：`demo@example.com / demo1234`，`admin@example.com / admin1234`

---

## 三、目录结构

```
.
├── apps
│   ├── web                 # Next.js 16 App Router + Tailwind 4 + motion
│   │   ├── src/app         # 路由与页面
│   │   ├── src/components  # layout / ui / home（地图与小人）/ factory（正文与编辑器）
│   │   ├── scripts         # build-world.mjs（地图）
│   │   └── public
│   │       ├── map         # world-base.svg（静态底图，缓存友好）
│   │       ├── images/products  # 12 张产品图（1000×1000）
│   │       ├── images/factory   # 6 张现场照片（1600×900）
│   │       └── images/site      # 仓库照片等站点配图
│   └── api                 # NestJS 12
│       ├── src
│       │   ├── common      # 统一响应拦截器 / 统一异常过滤器 / AdminKeyGuard
│       │   ├── prisma      # PrismaService
│       │   ├── trade       # 首页地图数据
│       │   ├── factory     # 工厂实例：列表/详情/创建/上传
│       │   └── health
│       ├── prisma          # schema.prisma + seed.ts
│       └── uploads         # 本地上传目录（gitignore，运行时创建）
├── docs                    # Step 0 设计系统与契约
├── docker-compose.yml
└── pnpm-workspace.yaml
```

### 地图是怎么来的

底图不是运行时解析 GeoJSON，而是**构建期一次性生成**：

```bash
pnpm --filter @wem/web gen:world   # world-atlas → 投影 → SVG 路径
```

产出两个文件：

- `apps/web/public/map/world-base.svg`　176 个国家轮廓（78KB / gzip 26KB），静态资源，浏览器可缓存
- `apps/web/src/lib/world-map.generated.json`　同一批路径 + 投影参数（供染色层与经纬度换算使用）

浏览器端只有十几行纯数学（`src/lib/world-geometry.ts`）负责经纬度 → 屏幕坐标，
不打包 d3-geo / topojson。这样首屏 HTML 不会因为地图膨胀（内联方案会到 340KB）。

### 工厂实例是怎么组织的

一条记录 = 一篇现场日志，数据模型 `FactoryPost`：

- 列表字段：`title / factoryName / location / category / summary / coverImage / tags / publishedAt`
- 正文 `content` 为结构化块数组，白名单：`paragraph / heading / image / quote / list`
- 图集 `gallery` 为图片地址数组，正文里也可以插入图片块并带说明

写入路径：

1. `/factory/write` 上传图片 → `POST /api/factory/upload` → 落盘 `apps/api/uploads`，返回 `/uploads/xxx`
2. 提交表单 → `POST /api/factory/posts` → 生成 slug 并入库
3. `/factory/[slug]` 服务端读取并渲染，无需重新构建

工厂写入接口的鉴权二选一：管理员 JWT（`role=ADMIN`，正式方式）或请求头 `x-admin-key`
与 `apps/api/.env` 的 `ADMIN_KEY` 比对（兼容本地编辑台）。**不再有 `nordel-dev` 默认密钥**：
`ADMIN_KEY` 未配置或短于 12 位时写入接口直接拒绝，避免部署忘配就裸奔。

配图为现场照片（`public/images/factory`，1600×900），在 `/factory/write` 上传新照片即可替换。

---

## 四、接口约定

- 全局前缀 `/api`，Swagger 在 `/api/docs`
- 成功：`{ "success": true, "data": ..., "meta"?: {...} }`
- 失败：`{ "success": false, "error": { "code", "message", "details"?, "path", "timestamp" } }`
- 认证：JWT，会话凭证放 **HttpOnly Cookie**（浏览器）或 `Authorization: Bearer <token>`（脚本 / 移动端）
- **默认全部接口需登录**，公开接口用 `@Public()` 显式放开（health / trade / factory 读 / inquiries 提交 / auth）

### 认证与账户安全

- **注册**：邮箱格式 + 一次性邮箱域名拦截 + 口令强度（10–128 位、两类字符、弱口令黑名单、不含邮箱前缀）+ 蜜罐字段 + 最短填写时长（<1.5s 视为脚本，静默丢弃）。
- **邮箱验证**：6 位验证码，只存哈希（加 pepper）、10 分钟有效、最多 5 次尝试、60 秒重发冷却、每小时 6 次上限；验证通过才建会话。
- **登录**：连续 5 次密码错误锁定 15 分钟；账号不存在也跑一次等价的 scrypt，避免响应时间枚举邮箱；未验证邮箱登录返回 403 并补发验证码。
- **会话**：JWT + `tokenVersion`，改密 / 强制下线即让所有旧 token 失效；`rememberMe` 控制 2 天 / 30 天有效期。
- **口令存储**：scrypt（Node 内置，`scrypt$<salt>$<hash>`），不依赖 bcrypt/argon2 原生编译。

### 全站防护

- **限流**：`@nestjs/throttler` 全局限流（每 IP 每分钟 120 次）+ 敏感接口单独收紧（登录 10 次/5 分钟、验证码 5 次/10 分钟、询盘 4 次/小时）。
- **安全头**：helmet（HSTS / no-referrer / nosniff 等）；上传目录单独禁嗅探 + 限制 CSP。
- **请求体**：JSON / urlencoded 上限 100kb；`ValidationPipe` 开启 `whitelist` + `forbidNonWhitelisted`，未声明字段直接 400。
- **错误脱敏**：生产环境 5xx 不返回内部异常信息（防 SQL / 路径 / 堆栈泄露），统一 `{ code, message, details? }`。
- **询盘防刷**：蜜罐字段 + 最短填写时长 + 链接数量启发式 → 命中即「假成功」不落库；每 IP 每小时 4 次；风险评分留痕。
- **安全事件留痕**：注册拦截 / 登录失败 / 锁定 / 验证码异常 / 可疑询盘统一写入 `SecurityEvent`，便于事后审计。

---

## 五、当前进度

| Step | 内容 | 状态 |
| --- | --- | --- |
| 0 | 设计系统 / 路由表 / 组件清单 / API 契约 | ✅ 已完成（`docs/step0-design-and-contract.md`） |
| 1 | 前后端脚手架 + 数据库 + Seed | ✅ 已完成并验证 |
| 2 | 全站路由骨架 + 404/加载/空/错误态 | ✅ 已完成并验证 |
| 3 | 首页地图可视化 + 呼吸光效 + 小人动效 | ✅ 已完成并验证 |
| 3.5 | 工厂实例（图文记录 + 图片上传 + 写作页） | ✅ 已完成并验证 |
| 3.6 | 全站内容填充（真实感文案 / 产品图 / 现场照片） | ✅ 已完成并验证 |
| 4 | 案例模块（大洲筛选 + 详情） | ✅ 已完成（前端内容源，接口可选） |
| 5 | 商城与账户（询盘单 + 登录） | ✅ 已完成（真实认证 + 询盘入库 + 全站防护） |
| 6 | 后端数据与 API 完善 | ✅ 已完成（认证 / 询盘 / 安全加固） |
| 7 | 联调 / 性能 / 可访问性 | ⏳ |
| 8 | MVP 评审与内容填充准备 | ✅ 内容已填充 |

已实现路由：`/`、`/cases`、`/cases/[slug]`、`/factory`、`/factory/[slug]`、`/factory/write`、`/shop`、`/product/[slug]`、`/cart`、`/checkout`、`/login`、`/register`、`/account`、`/about`、`/contact`，含 404 / loading / error 三类状态页。

Step 3 已落地：低精度世界地图（Natural Earth 投影 / 176 国）、30 个国家亮度分级染色与光晕、6s 呼吸、义乌起运的随机航线与「抱箱奔跑去 → 弯腰放箱 → 转身空手跑回」的小人动画（30 个已交易国家按交易量加权抽签，含美洲 / 美国，同屏 2 个，移动端降到 1 个）。小人单独成层、压在左侧提亮层之上，飞到左半屏也清晰；航迹在标题区被柔边遮罩擦掉，不压字。数据来自 `GET /api/trade/map`，接口不可用时降级为纯轮廓地图。

地名的显示规则：全图只常驻起运地「义乌」。其余国家不常驻——小人这一趟飞向哪国，就在该国光点亮一盏棕色灯（金点 + 缓慢扩散的光圈），并在旁边写出中文国名；送达后回程途中熄灯、国名淡出，下一趟换国再亮。国名是**纯文字 + 白色描边**，不加底板，避免遮住地图；默认在光点上方，贴地图顶边的国家翻到下方，两只小人各错开一行，避免荷兰 / 波兰这类邻近国家叠字。落在左侧大标题区的目的地不写国名、也不点灯（那块被柔边遮罩压白，叠字会与标题打架），只留航迹和奔跑的小人；鼠标悬停光点仍可看「国名 · 笔数」，提示固定放在光点下方。

Step 3.5 已落地：工厂实例栏目（`/factory`），含分类筛选、封面大卡、图文详情（正文块 + 图集 + 上下篇），以及 `/factory/write` 写作页（多图上传、块式编辑、发布即生成详情页），并支持「编辑本篇」（`/factory/write?edit=<slug>` → PATCH）与删除（`DELETE /api/factory/posts/:id`，前端二次确认）。Seed 写入 6 篇现场记录，配图为现场照片。

Step 3.6 已落地：全站内容填充。

- **单一内容源**：`apps/web/src/lib/content/{company,cases,products}.ts`，首页 / 关于 / 联系 / 案例 / 产品 / 页脚统一引用，避免同一数字写两遍。`apps/api/prisma/content.ts` 由它生成，保证 API 种子与前台同源。
- **文案**：企业事实（2016 年创立、87 家工厂、30 个国家、1,240 柜/年、5.2 年平均合作年限）、8 个跨 6 大洲案例、12 个 SKU、四步交付流程、资质与时间线，全部为可读叙述，不含「占位 / Step N」。刻意不写「准时率 99.x%」这类过于完美又无法佐证的指标，改用可指着流程说清的口径（4 类在营品类 / 7 个交付节点留痕 / 单柜最多 28 个 SKU / 24 小时报价）。
- **可视化**（`components/ui/mix-charts.tsx` / `data-viz.tsx`，纯 CSS + SVG，无图表库）：首页信任区「出口区域结构」环形图（滚动进入视口后顺时针生长，悬停图例高亮分区、中心读数与代表国家同步切换）+「品类结构」增长条；四步流程按天数比例的长条；关于页团队构成堆叠条；用户中心订单 7 节点进度；案例 / 产品筛选标签带数量。
- **图片**：12 张统一影棚风格产品图（1000×1000）+ 6 张工厂现场照片（1600×900）+ 1 张仓库纪实照片。
- **交互**：询盘表单（真实提交 → 编号 → 成功态，含蜜罐 + 防刷）、询盘单（localStorage 持久化 + 按 MOQ 步进）、提交询盘（预填客户信息 → 真实入库）、登录（真实 JWT + HttpOnly Cookie）、注册（两步：资料 + 邮箱验证码，含密码强度条）。

---

## 六、常见问题

**`docker: cannot connect to the Docker API`**
Docker Desktop 守护进程没启动。开始菜单打开 Docker Desktop，等托盘图标变绿。

**5432 端口被占用**
本机若已有 PostgreSQL 服务，改 `docker-compose.yml` 的映射为 `"5433:5432"`，并同步改 `apps/api/.env` 的 `DATABASE_URL`。

**Prisma 引擎下载慢**
`.npmrc` 已配源，若仍失败，安装时加环境变量：
`PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma pnpm install`

**端口 3000 / 4000 被占用**
`apps/web` 的 `dev` 脚本带 `--port 3000`，`apps/api` 读 `.env` 的 `PORT`，直接改即可。

---

## 七、推送到 Git 仓库并导入部署平台

对应平台首页那张 **「Import an existing Git repository → Get started」** 卡片：平台只能从 GitHub / GitLab / CNB 这类**远程 Git 仓库**拉代码，不能直接读本机目录。所以流程是「本地建仓 → 推到远程 → 平台授权 → 选仓库导入」。

本仓库已完成本地初始化与首次提交；`.gitignore` 已排除 `node_modules/`、`.next/`、`dist/`、`.tmp/`、`.env*`、`generated-images/`、`.workbuddy/` 等本地产物与密钥文件，推送前可用 `git status` 复核。

### 1) 在托管平台新建空仓库并推送

以 GitHub 为例（GitLab / CNB / Gitee 只是地址不同），**新建仓库时不要勾选 Add README / .gitignore / license**，避免与本地提交冲突：

```bash
cd D:/web_design_model
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git branch -M main
git push -u origin main
```

若还没有远程仓库，也可以把项目根目录打包（含 `.git` 目录）到别处解压后执行上面三条命令；`.git` 里已包含完整提交历史。

### 2) 平台导入时的关键设置

这是 monorepo，**只把 `apps/web` 作为前端项目导入**：

| 设置项 | 值 |
| --- | --- |
| Root Directory / 根目录 | `apps/web` |
| Framework | Next.js（自动识别） |
| Install Command | `pnpm install --frozen-lockfile`（用根目录 `pnpm-lock.yaml`） |
| Build Command | `pnpm --filter @wem/web build`（已写在 `apps/web/vercel.json`） |
| Node.js | 20.9+（建议 22） |
| Environment Variable | `NEXT_PUBLIC_API_BASE_URL=https://<后端域名>/api` |

`NEXT_PUBLIC_API_BASE_URL` 决定 `next.config.ts` 里 `/backend/:path*` 的代理目标。不配置时默认指向 `http://localhost:4000/api`，线上页面能渲染，但**登录 / 注册 / 提交询盘会失败**。

### 3) 后端需要单独部署

`apps/api` 是 NestJS + Prisma + PostgreSQL，不是静态站点，不能靠前端平台托管。需要一台常驻 Node 服务 + 一个 PostgreSQL（如 Neon / Supabase / RDS），然后：

```bash
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env   # 填 DATABASE_URL / CORS_ORIGIN / JWT_SECRET / ADMIN_KEY
pnpm --filter @wem/api prisma:migrate
pnpm --filter @wem/api prisma:seed
pnpm --filter @wem/api build && node apps/api/dist/main.js
```

`CORS_ORIGIN` 填前端正式域名；`JWT_SECRET`、`ADMIN_KEY` 必须换成随机长串（示例文件里只是占位符）。后端公开地址填回前端的 `NEXT_PUBLIC_API_BASE_URL`，两端齐了才是完整站点。

### 4) 安全提醒

- `.env`、`apps/api/.env` 均已被忽略，**任何情况下都不要提交真实密钥**；示例见 `apps/api/.env.example` 与 `apps/web/.env.example`。`docker-compose.yml` 里的数据库密码仅供本机开发，线上务必换成独立实例与强密码。
- 若仓库是公开的，种子数据里的演示账号与 6 位验证码逻辑仅用于展示，上线前应接入真实邮件服务并关闭演示账号。
- 推送后可用 `git log --oneline -3` 确认提交，用 `git status` 确认工作区干净。

