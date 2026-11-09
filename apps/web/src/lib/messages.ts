/**
 * 集中文案（导航、首屏、页脚与页面级描述）
 * 企业事实与联系方式统一来自 `lib/content/company.ts`，这里只放文案。
 */

import { company, socialLinks } from "./content/company";

export const brand = {
  name: company.name,
  tagline: company.tagline,
  legal: `${company.legalName} · 浙江义乌`,
};

export const nav = [
  { href: "/", label: "首页" },
  { href: "/cases", label: "合作案例" },
  { href: "/factory", label: "工厂实例" },
  { href: "/shop", label: "产品" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export const header = {
  cart: "询盘单",
  login: "登录",
  account: "用户中心",
  cta: "发起询盘",
  menu: "菜单",
  close: "关闭",
};

export const hero = {
  eyebrow: "YIWU → GLOBAL",
  titleTop: "从义乌出发",
  titleBottom: "连接世界",
  subtitle:
    "一柜货，从图纸到到港，中间隔着 87 家工厂、4 大品类、30 个国家。我们把这条看不见的路，走成每一步都有记录的路。",
  primaryCta: { href: "/cases", label: "查看合作案例" },
  secondaryCta: { href: "/shop", label: "了解产品能力" },
  mapNote: "全球交易网络 · 2025 年出运数据",
};

export const social = socialLinks.map((item) => ({ ...item }));

export const footer = {
  note: "义乌 · 多品类供应链整合与出口交付。工厂现场记录每周更新，案例数据来自真实订单。",
  columns: [
    {
      title: "业务",
      links: [
        { href: "/cases", label: "合作案例" },
        { href: "/factory", label: "工厂实例" },
        { href: "/shop", label: "产品目录" },
        { href: "/contact", label: "询盘联系" },
      ],
    },
    {
      title: "账户",
      links: [
        { href: "/login", label: "登录" },
        { href: "/register", label: "注册" },
        { href: "/account", label: "用户中心" },
      ],
    },
    {
      title: "站点",
      links: [
        { href: "/about", label: "关于我们" },
        { href: "/cart", label: "询盘单" },
        { href: "/checkout", label: "提交询盘" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} ${company.legalName}`,
};

export const continents = [
  { value: "ASIA", label: "亚洲" },
  { value: "EUROPE", label: "欧洲" },
  { value: "NORTH_AMERICA", label: "北美洲" },
  { value: "SOUTH_AMERICA", label: "南美洲" },
  { value: "AFRICA", label: "非洲" },
  { value: "OCEANIA", label: "大洋洲" },
] as const;

export const pages = {
  cases: {
    eyebrow: "B2B CASE STUDIES",
    title: "合作案例",
    description:
      "8 个正在进行的合作：从把 12 家供应商收成一个口径，到 1.8 米跌落测试的成本账。每个案例都带批次、准时率与成本变化。",
  },
  factory: {
    eyebrow: "FACTORY FIELD NOTES",
    title: "工厂实例",
    description:
      "按时间记录的现场日志：装配、机加工、质检、仓储、打样与包装。每条记录包含现场照片、数据与当时的判断。",
    cta: "写一篇记录",
  },
  shop: {
    eyebrow: "PRODUCT CATALOG",
    title: "产品目录",
    description:
      "4 大品类、12 个常备 SKU。价格为 FOB 宁波参考价，标注起订量与交期，支持 OEM 与混装。",
  },
  cart: {
    eyebrow: "INQUIRY LIST",
    title: "询盘单",
    description: "把要询价的规格放进询盘单，提交后 24 小时内给到正式报价与可行交期。",
  },
  checkout: {
    eyebrow: "REQUEST QUOTE",
    title: "提交询盘",
    description: "填写收货信息与交期要求，我们会核对库存与排产，给出正式报价单。",
  },
  login: {
    eyebrow: "SIGN IN",
    title: "登录",
    description: "登录后可查看历史订单、验货报告与出运单证。",
  },
  register: {
    eyebrow: "CREATE ACCOUNT",
    title: "注册",
    description: "注册采购账号，报价单、验货报告与单证会同步到你的邮箱。",
  },
  account: {
    eyebrow: "ACCOUNT",
    title: "用户中心",
    description: "订单进度、验货报告、出运单证与常用收货地址。",
  },
  about: {
    eyebrow: "ABOUT NORDEL",
    title: "关于 NORDEL",
    description:
      "2016 年在义乌国际商贸城起步，现在为 30 个国家的采购方整合 4 大品类的工厂产能。",
  },
  contact: {
    eyebrow: "CONTACT",
    title: "联系我们",
    description: "告诉我们品类、数量与目标市场，工作日 4 小时内回复。",
  },
};

export const states = {
  emptyTitle: "这个筛选下还没有内容",
  emptyBody: "换一个筛选条件，或直接告诉我们你在找什么。",
  loading: "加载中…",
  errorTitle: "页面暂时打不开",
  errorBody: "刷新一下试试；如果还是不行，可以直接邮件联系我们。",
  notFoundTitle: "页面不存在",
  notFoundBody: "这个地址没有内容，可能已经下线或链接有误。",
  backHome: "返回首页",
  retry: "重试",
};
