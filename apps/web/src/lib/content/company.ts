/**
 * 企业信息与站点内容（单一来源）
 *
 * 这里的数字、地址与流程用于售前演示，前后各页共用同一份，
 * 避免"首页与关于页的国家数必须一致"这类不一致。
 */

export const company = {
  name: "NORDEL",
  nameZh: "诺德尔",
  legalName: "义乌诺德尔进出口有限公司",
  legalNameEn: "NORDEL IMP. & EXP. CO., LTD.",
  tagline: "Global Supply Partnership",
  founded: 2016,
  positioning: "多品类供应链整合与出口交付",
  intro:
    "NORDEL 是一家从义乌起步的供应链服务商。我们不生产，但把 87 家工厂的产能组织成一条可核验的交付链：报价、打样、量产、验货、出运，每一段都有记录。",
  shortIntro:
    "从义乌出发，为 30 个国家的采购方整合 4 大品类的工厂产能，把「多品类、小批量、要交期」这三件事同时做到。",
};

export const facts = [
  { value: "2016", label: "成立年份", note: "义乌国际商贸城起家" },
  { value: "87", label: "合作工厂", note: "4 大品类 · 12 家深度绑定" },
  { value: "30", label: "覆盖国家 / 地区", note: "欧、美、中东、东南亚为主" },
  { value: "46", label: "团队规模", note: "外贸 18 · 品控 9 · 跟单 7 · 仓储 12" },
];

/** 首页顶部四个大数字（规模类，客户一眼能判断体量） */
export const scale = [
  { value: "30", label: "覆盖国家 / 地区" },
  { value: "87", label: "合作工厂" },
  { value: "1,240", label: "年出运柜量" },
  { value: "5.2", label: "平均合作年限（年）" },
];

/** 规模之外的口径事实：都是能指着流程说清楚的事，不吹完美率 */
export const trackRecord = [
  { value: "4", unit: "类", label: "在营品类" },
  { value: "7", unit: "个", label: "交付节点留痕" },
  { value: "28", unit: "个", label: "单柜最多 SKU" },
  { value: "24", unit: "小时", label: "报价响应" },
];

/** 出口区域结构：按 2025 年出运柜量拆分，合计 100 */
export const regionMix = [
  { label: "欧洲", value: 34, note: "德国 · 荷兰 · 意大利 · 波兰" },
  { label: "北美", value: 22, note: "美国 · 加拿大 · 墨西哥" },
  { label: "中东", value: 18, note: "阿联酋 · 沙特 · 以色列" },
  { label: "东南亚", value: 15, note: "越南 · 泰国 · 印尼" },
  { label: "其他", value: 11, note: "南美 · 非洲 · 大洋洲" },
];

/** 品类结构：同上口径，混装柜按主品类归类 */
export const categoryMix = [
  { label: "五金与传动", value: 38 },
  { label: "电子与电气", value: 27 },
  { label: "包装与物流耗材", value: 20 },
  { label: "家纺与布艺", value: 15 },
];

/** 团队构成：合计 46 人 */
export const teamMix = [
  { label: "外贸", value: 18 },
  { label: "仓储", value: 12 },
  { label: "品控", value: 9 },
  { label: "跟单", value: 7 },
];

export const capabilities = [
  {
    key: "01",
    title: "供应商整合",
    body: "87 家工厂按品类、工艺与产能分层，每个品类保持「1 家主供 + 1 家备选」。同一张订单只有一个对接人，图纸版本、检验口径与包装标准由我们统一。",
    points: ["4 大品类 · 12 家深度绑定", "主供 / 备选双线", "统一图纸与检验口径"],
  },
  {
    key: "02",
    title: "交付可视化",
    body: "每张订单拆成 7 个节点：确认、备料、投产、首件、量产、验货、出运。节点有照片、有时间、有责任人，客户在自己的时区就能看到进度。",
    points: ["7 个节点全程留痕", "关键节点拍照上传", "异常 24 小时内给方案"],
  },
  {
    key: "03",
    title: "出口合规",
    body: "原产地证、CE / RoHS、ISTA 包装测试，以及 SASO、ANATEL 等目的国准入文件，出货前 7 天完成预审，避免到港后才发现少一张纸。",
    points: ["单证出货前 7 天预审", "目的国准入代办", "AEO 一般认证企业"],
  },
  {
    key: "04",
    title: "小批量混装",
    body: "义乌集货仓 3,200㎡，支持多品类混装、按门店分箱贴标。一个 40HQ 最多装过 28 个 SKU，让小批量订单也能摊薄运费。",
    points: ["3,200㎡ 集货仓", "按门店 / 目的国分箱", "单柜最多 28 个 SKU"],
  },
];

export const certifications = [
  { name: "ISO 9001:2015", note: "质量管理体系", year: "2024" },
  { name: "BSCI", note: "社会责任审核", year: "2023" },
  { name: "AEO 一般认证", note: "海关信用等级", year: "2022" },
  { name: "ISTA 1A", note: "包装跌落测试能力", year: "2021" },
];

export const milestones = [
  {
    year: "2016",
    title: "半个摊位，两个客户",
    body: "在义乌国际商贸城二区租下半个摊位，做五金件的出口代采。第一年出了 11 个柜，全部是 FOB 宁波。",
  },
  {
    year: "2020",
    title: "把跟单变成记录",
    body: "客户进不来，验货只能靠拍。于是每个节点都拍下来、写下来——今天的「工厂实例」栏目，就是那时日报的积累。",
  },
  {
    year: "2023",
    title: "3,200㎡ 集货仓",
    body: "在稠江设集货仓，把多品类、小批量的订单并成一个柜。当年混装订单占比到 38%。",
  },
  {
    year: "2026",
    title: "30 个国家，87 家工厂",
    body: "四个品类跑通主供/备选双线，年出运 1,240 柜，平均合作年限 5.2 年。",
  },
];

export const process = [
  {
    step: "01",
    title: "询盘与报价",
    body: "收到图纸或样品照片后 24 小时内给出 FOB 报价与可行交期；不确定的工艺会先说明风险，不先报低价。",
    meta: "24 小时内响应",
    days: 1,
    span: "Day 0–1",
  },
  {
    step: "02",
    title: "打样与确认",
    body: "7–15 天出样，色卡、首件与工艺参数一并留档。样品确认后封样，量产以封样为准。",
    meta: "7–15 天出样",
    days: 10,
    span: "Day 1–11",
  },
  {
    step: "03",
    title: "量产与验货",
    body: "AQL 1.0 抽检，关键尺寸全检。验货报告含照片、实测数据与判定，不合格直接返工，不写「基本合格」。",
    meta: "AQL 1.0 + 关键件全检",
    days: 25,
    span: "Day 11–36",
  },
  {
    step: "04",
    title: "出运与单证",
    body: "订舱、报关、单证预审同步走。出运后提供提单、装箱单与验货报告，节点在系统里可查。",
    meta: "单证提前 7 天预审",
    days: 35,
    span: "Day 36–71 · 含海运",
  },
];

export const contact = {
  address: "浙江省义乌市稠江街道四海大道 266 号 NORDEL 中心 8 楼",
  postalCode: "322000",
  showroom: "义乌国际商贸城二区 17 街 3F-188",
  phone: "+86 579 8500 2168",
  phoneHref: "tel:+8657985002168",
  whatsapp: "+86 138 5790 2168",
  email: "trade@nordel.cn",
  emailHref: "mailto:trade@nordel.cn",
  hours: "周一至周六 08:30–18:00（GMT+8）",
  reply: "工作日 4 小时内回复，非工作日次日上午回复。",
};

export const socialLinks = [
  { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@nordelgroup" },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@nordelgroup" },
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/nordelgroup" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/nordelgroup" },
  { platform: "whatsapp", label: "WhatsApp", href: "https://wa.me/8613857902168" },
] as const;

export const heritage = {
  eyebrow: "SINCE 2016 · YIWU",
  title: "从义乌的一张柜台，到 30 个国家的交付",
  lead:
    "义乌的好处是，方圆 30 公里内几乎能找到所有轻工品类的工厂；坏处也是，工厂太多，采购方很难判断哪一家能把货按时做对。NORDEL 做的事，就是在中间把这件事变成可核验的。",
};
