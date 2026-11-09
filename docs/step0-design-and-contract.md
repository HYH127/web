# Step 0 · 设计系统 / 路由表 / 组件清单 / API 契约

> 状态：**v2 亮色基底**（2026-11-09 用户决策）。v1 深海暗色基底已废止，代码与文档均已同步。
>
> 阅读提示：本文是 Step 0 的设计契约，文中「占位」指当时为后续步骤预留的实现位（如「图片占位」「表单占位」）。
> 这些位置已在 Step 3.6 内容填充中全部换成真实内容与可用交互，实际实现状态以 `README.md` 的「五、当前进度」为准。

---

## 一、设计 Token

主色方向（最终）：**纸白基底 + 冷光青/冰蓝为主光 + 香槟金点缀**。

> 变更记录：
> v1 深海暗色 `#060B14`（金色主导）→ v2.0 冷光青为主、金色退为点缀（仍为暗底）→ **v2.1 纸白基底**（当前）。
> 亮底带来的关键约束：青色与金色必须整体压深才能满足对比度，光晕从「叠加发光」改为「低饱和染色阴影」。

### 1.1 色板

| 组 | Token | 值 | 用途 |
| --- | --- | --- | --- |
| 纸白基底 | `paper` | `#ffffff` | 页面底色 |
| | `surface` | `#f8fafc` | 区块底色、首屏舞台 |
| | `surface-soft` | `#f1f5f9` | 图片占位、次级面板 |
| | `surface-strong` | `#e6edf4` | hover、骨架屏 |
| 分隔 | `line` | `#e3eaf2` | 常规分割线、卡片描边 |
| | `line-strong` | `#ccd8e4` | 输入框、次级按钮描边 |
| 主光（冷光青） | `lumen-500` | `#2fb6c4` | 图形强调、地图高亮、光晕 |
| | `lumen-600` | `#178f9c` | 链接与可点击文字（4.6:1） |
| | `lumen-700` | `#106e79` | 小号强调文字、描边文字（6.3:1） |
| | `lumen-300` | `#b7eef4` | 浅色底（徽章底、光晕底） |
| 副光（冰蓝） | `ice-500` | `#3f96cf` | 次要数据、连线 |
| | `ice-600` | `#2a75a6` | 冰蓝文字 |
| 点缀（香槟金） | `champagne-500` | `#b8933f` | 金色实心按钮、地图航线终点 |
| | `champagne-600` | `#96742c` | 金色文字（5.4:1） |
| | `champagne-700` | `#745921` | 大标题金色、小号金文字（6.7:1） |
| | `champagne-200` | `#f7edda` | 金色底（徽章、CTA 底） |
| 文本 | `ink-900` | `#0a1526` | 主文本、主按钮底 |
| | `ink-700` | `#33475e` | 次文本 |
| | `ink-500` | `#566a80` | 辅助说明（5.9:1） |
| | `ink-400` | `#64768a` | 眉标、micro 标签（4.6:1，最低可用层级） |

> 规则：
> 1. 金色只做**点缀**（数字、分隔、CTA），不做大面积背景；
> 2. 青色只做**光与线**（光晕、描边、航线），实心按钮用 `ink-900`；
> 3. 亮底上禁止使用 `lumen-400` 及更浅的青色写正文（对比度不足）；
> 4. 所有正文对比度 ≥ 4.5:1，micro 标签最低 `ink-400`。

### 1.2 排版层级（编辑式）

| Token | 尺寸 | 行高 | 用途 |
| --- | --- | --- | --- |
| `display` | clamp(44px, 6.2vw, 84px) | 1.0 | 首页主标题，字重 300，字距 -0.035em |
| `h1` | clamp(32px, 3.6vw, 52px) | 1.06 | 页面标题 |
| `h2` | clamp(24px, 2.4vw, 36px) | 1.15 | 区块标题 |
| `h3` | clamp(18px, 1.5vw, 24px) | 1.3 | 卡片标题 |
| `body` | 16px | 1.7 | 正文 |
| `small` | 14px | 1.6 | 辅助 |
| `micro` | 11px / 字距 0.16em / 全大写 | 1.4 | 眉标、标签 |

字体：拉丁文用 **Inter Tight**（正文/UI）+ **Playfair Display**（编辑感强调），中文回退 **Noto Sans SC** / PingFang / 微软雅黑。
字体采用**本地自托管**（`@fontsource`），不使用 `next/font/google`（国内网络不稳）。

### 1.3 间距 / 圆角 / 阴影 / 动效

- 间距：4 的倍数（4/8/12/16/24/32/48/64/96/128），区块纵向节奏 96–128px
- 圆角：`xs 4` / `sm 8` / `md 14` / `lg 22` / `xl 32`
- 阴影（亮底策略）：
  - 中性抬升 `card` / `raised`：`0 1px 2px rgb(10 21 38 / .04)` + `0 14px 36px -20px rgb(10 21 38 / .16)`，用于卡片与浮层
  - 染色光晕 `glow-cyan` / `glow-gold`：`rgb(47 182 196 / .45)` / `rgb(184 147 63 / .45)`，仅用于 hover 与强调元素
  - 亮底**不使用**深色大投影与白色发光（白底上不可见）
- 动效时长：`fast 180ms` / `base 320ms` / `slow 720ms` / `breath 6000ms`
- 缓动：`ease-lumen`(0.22,0.61,0.36,1) 用于位移；`ease-breath`(0.45,0,0.55,1) 用于呼吸
- 呼吸光效：周期 6s，opacity 0.35→0.62 + scale 1→1.03（亮底需降低振幅，否则视为闪烁）
- 降级：`prefers-reduced-motion: reduce` 时全部动画降至 0.001ms

---

## 二、路由表

| 路由 | 页面 | MVP 内容 | Step |
| --- | --- | --- | --- |
| `/` | 首页 | 非全屏首屏（70% 高）+ 透明文案层 + 全球地图 + 呼吸光效 + 小人动画 + 信任区 + 社媒 | 2/3 |
| `/cases` | 案例列表 | 大洲筛选、案例卡片、加载更多占位 | 4 |
| `/cases/[slug]` | 案例详情 | 客户背景 / 合作记录 / 成果指标 | 4 |
| `/factory` | 工厂实例 | 按分类筛选的现场记录列表（封面 + 摘要） | 3.5 |
| `/factory/[slug]` | 记录详情 | 封面、结构化正文块、图集、上下篇 | 3.5 |
| `/factory/write` | 写记录 | 标题/摘要/图片上传/正文块编辑（占位鉴权） | 3.5 |
| `/shop` | 商品列表 | 分类筛选、商品卡片 | 5 |
| `/product/[slug]` | 商品详情 | 图片占位、参数、加购 | 5 |
| `/cart` | 购物车 | 占位增删改 | 5 |
| `/checkout` | 结算 | 表单占位，不接支付 | 5 |
| `/login` | 登录 | 前后端联调 | 5 |
| `/register` | 注册 | 前后端联调 | 5 |
| `/account` | 用户中心 | 订单 / 资料占位 | 5 |
| `/about` | 关于 | 信任内容占位 | 可选 |
| `/contact` | 联系 | 表单占位 | 可选 |
| `not-found` | 404 | 统一错误页 | 2 |

社媒入口（YouTube / TikTok / Facebook / Instagram）统一跳 `/`，由 `SiteConfig.socialLinks` 配置驱动。

---

## 三、组件清单

**布局**
- `SiteHeader`（logo / 主导航 / 账户入口 / 移动端抽屉）
- `SiteFooter`（站点分组、社媒图标、版权占位）
- `Container`、`Section`（统一纵向节奏）

**通用**
- `Button`（primary 青描边发光 / ghost / gold 强调）
- `Card`（玻璃拟态面板，`glass-panel`）
- `Badge`、`LabelMicro`（全大写眉标）
- `Divider`（金线细分割）
- `Skeleton`、`EmptyState`、`ErrorState`、`Pagination` / `LoadMore`

**首页专用**
- `HeroStage`（非全屏大图容器，前景透明层）
- `HeroOverlay`（标题 / 副标题 / CTA）
- `WorldMap`（服务端底图：国界、亮度染色、光晕、起运地、国家节点）
- `CourierOverlay`（客户端小人层：随机航线 + 奔跑/放箱/转身，压在左侧提亮层之上）
- `CountryGlowLayer`（国家亮度光晕，按 `brightnessLevel` 分级）
- `BreathLayer`（呼吸光效层，独立于地图层）
- `CourierRunner`（小人奔跑动画：义乌 → 随机抽中的已交易国家（含美洲）→ 弯腰放箱 → 转身空手跑回）
- `TrustStrip`（B2B 信任数据条）
- `SocialRail`（社媒图标组）

**案例**
- `CaseCard`、`ContinentFilter`、`MetricCard`、`CaseTimeline`、`ClientLogoPlaceholder`

**商城**
- `ProductCard`、`ProductGallery`、`CategoryTabs`、`QtyStepper`、`CartLineItem`、`CartSummary`、`CheckoutForm`

**账户**
- `AuthForm`（登录/注册复用）、`AccountSidebar`、`OrderListPlaceholder`

---

## 四、API 契约（草案，Step 1 起以 Swagger 为唯一事实源）

统一前缀 `/api`，统一响应/错误结构见 README。

### 认证
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password, name?, company? }` → `{ user, accessToken }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ user, accessToken }` |
| GET | `/api/auth/me` | 需 Bearer，返回当前用户 |

### 商品
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/products?category=&page=&pageSize=` | 商品列表（分页） |
| GET | `/api/products/:slug` | 商品详情 |

### 购物车 / 订单（占位）
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/cart` | 当前购物车（登录用户或 sessionId） |
| POST | `/api/cart/items` | `{ productId, quantity }` |
| PATCH | `/api/cart/items/:id` | 改数量 |
| DELETE | `/api/cart/items/:id` | 删除 |
| POST | `/api/orders` | 创建占位订单，状态 `PENDING` |
| GET | `/api/orders` | 订单列表占位 |

### 案例
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/cases?continent=&page=&pageSize=` | 案例列表，支持大洲筛选 |
| GET | `/api/cases/:slug` | 案例详情 |

### 工厂实例（已实现）
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/factory/posts?category=&page=&pageSize=` | 记录列表，按 `publishedAt` 倒序，只返回摘要字段 |
| GET | `/api/factory/posts/:slug` | 记录详情：`content` 块数组 + `gallery` + `neighbors{prev,next}` |
| POST | `/api/factory/posts` | 新建记录（需 `x-admin-key`） |
| PATCH | `/api/factory/posts/:id` | 修改记录（需 `x-admin-key`） |
| DELETE | `/api/factory/posts/:id` | 删除记录，物理删除不可恢复（需 `x-admin-key`） |
| POST | `/api/factory/upload` | 图片上传，字段名 `file`，≤8MB，JPG/PNG/WebP/AVIF（需 `x-admin-key`） |

正文块白名单：`paragraph {text}` / `heading {text}` / `image {url, caption?}` / `quote {text}` / `list {items[]}`。
图片存 `apps/api/uploads`，通过 `/uploads/*` 静态访问；占位鉴权为请求头 `x-admin-key`，默认值见 `apps/api/.env` 的 `ADMIN_KEY`。

### 地图 / 站点配置
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/trade/map` | **已实现**。`{ origin, countries[], routes[], totals }`，country 含 `code/name/continent/count/level/lat/lng/highlight` |
| GET | `/api/trade/stats` | 预留：只要国家统计时拆出 |
| GET | `/api/site/home` | 预留：首页聚合 `{ heroCopy, socialLinks, tradeStats, routes, trustMetrics }` |
| GET | `/api/site/config` | 预留：全量站点配置 |

### 亮度分级规则（占位）
`transactionCount` 取全站最大值 M，按 `count / M` 分段映射到 `brightnessLevel 0–4`，避免极值过曝：
`0–5% → 0`，`5–20% → 1`，`20–45% → 2`，`45–75% → 3`，`>75% → 4`。

### 4.1 地图图层规范（Step 3 落地）

| 层 | 实现 | 说明 |
| --- | --- | --- |
| 投影 | `geoNaturalEarth1`，视口按陆地外框裁切（约 1212×535） | 低精度、低纬变形的等面积观感，避免极地拉伸 |
| 底图 | `public/map/world-base.svg`，176 国，`#eef3f8` 填充 / `#dbe5f0` 描边 0.5 | 静态资源，缓存友好，gzip 26KB |
| 染色 | 亮度 0–4 → `#eef3f8 / #e2f2f4 / #c8e9ed / #a3dbe2 / #7bcbd6` | 白底上最高级也只到中浅青，不做实心重色块 |
| 光晕 | 径向渐变（非高斯模糊），半径 26/40/58/78 | 26 点同屏不用 filter，移动端也不掉帧 |
| 呼吸 | `glow-pulse` 6s，opacity 0.62→1，scale 1→1.035，仅 level ≥ 3 | 与全站 6s 呼吸节奏一致，不做高频闪烁 |
| 航迹 | 三次贝塞尔，控制点沿法线抬起（上限 140） | 长短途都自然，不会拱出画布 |
| 小人 | 几何剪影：头 r1.65 / 躯干 4.45 / 腿 4.6，纸箱 4.5×3.7 | 无五官、单色 `ink-900`，纸箱用香槟金 |
| 时序 | 去程 `durationMs` → 停留 `stayMs` → 空手返回 `durationMs / 1.55` → 间隔 1.5s | 返回比去程快，形成节奏差；同屏 2 条，移动端 1 条 |
| 降级 | `prefers-reduced-motion` → 小人静态停在目的地、光晕不动 | 满足「支持降级静态高亮」 |

**为什么底图是静态资源**：176 条路径内联进页面时，HTML 会到 338KB（页面 + RSC 数据各一份）；
改为静态 SVG 后首屏 HTML 降到 191KB（gzip 45KB），且路由切换不再重复传输地图数据。

---

## 五、数据模型

见 `apps/api/prisma/schema.prisma`，共 11 个模型：
`User`、`Category`、`Product`、`Cart`、`CartItem`、`Order`、`OrderItem`、`CaseStudy`、`TradeStat`、`ShipmentRoute`、`SiteConfig`。
枚举：`Role`、`Continent`、`ProductStatus`、`OrderStatus`。

---

## 六、待你确认的 6 项（任务书第九节）

| # | 问题 | 我的默认建议 |
| --- | --- | --- |
| 1 | 品牌主色倾向 | ✅ 最终确认：**纸白基底** + 冷光青/冰蓝为主光 + 香槟金点缀（2026-11-09 由暗底改为亮底） |
| 2 | 首屏大图高度 | 72%（落在任务书 65%–80% 区间中段） |
| 3 | 小人风格 | 几何剪影（简洁几何块 + 单色发光描边，不做五官） |
| 4 | 案例筛选维度 | 仅大洲（先做窄，行业作为卡片标签展示，不参与筛选） |
| 5 | 商城范围 | 仅展示 + 本地购物车 + 结算表单占位，不接支付 |
| 6 | 中英双语框架 | 预留 i18n 结构但不做完整翻译（文案集中到 `messages/` 单文件，路由暂不加 `[locale]`） |

未提出异议即按以上默认推进；其中 6 若你希望**路由层**就带语言前缀（`/en/...`），现在改成本最低，请明确告知。
