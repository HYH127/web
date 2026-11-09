/**
 * 合作案例（售前演示内容）
 *
 * 8 个案例覆盖 6 个大洲，每个案例都带可核验的量级：批次、准时率、成本变化。
 * 客户名称为演示用名称，正式交付时替换为签约主体即可。
 */

export type ContinentKey =
  | "ASIA"
  | "EUROPE"
  | "NORTH_AMERICA"
  | "SOUTH_AMERICA"
  | "AFRICA"
  | "OCEANIA";

export interface CaseMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CaseBlock {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  quote?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  continent: ContinentKey;
  country: string;
  city: string;
  industry: string;
  clientName: string;
  since: string;
  categories: string[];
  summary: string;
  metrics: CaseMetric[];
  blocks: CaseBlock[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "germany-drive-components",
    title: "把 12 家供应商收成一个交付口径",
    continent: "EUROPE",
    country: "德国",
    city: "斯图加特",
    industry: "工业设备",
    clientName: "Kessler Antriebstechnik",
    since: "2021",
    categories: ["工业零部件", "钣金件", "检验报告"],
    summary:
      "一家 200 人的传动设备厂，原来从中国 12 家供应商分别采购铸件、轴承座和钣金件。合并到 4 家主供之后，到货合格率从 96.3% 提到 99.1%，仓库安全库存从 6 周降到 3.5 周。",
    metrics: [
      { label: "合作年限", value: "4 年", note: "2021 年起" },
      { label: "年供货批次", value: "86 批", note: "平均每月 7 批" },
      { label: "准时交付率", value: "98.4%", note: "2025 年数据" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Kessler 做的是中型传动设备，年产量 3,200 台左右，客户是欧洲的包装机械与输送线厂商。它的采购结构很典型：单件价值不高、品类碎、每一批数量都不大。",
          "原来的做法是每个零件找一家供应商。12 家供应商意味着 12 套图纸版本、12 种检验口径、12 个交期承诺。采购经理一半的时间花在对账和催货上，来料合格率常年在 96% 上下。",
        ],
        list: [
          "铸件 3 家、轴承座 4 家、钣金件 5 家，分布在不同省份",
          "图纸有中文、英文两个版本，改图后经常有一方没同步",
          "来料检验用厂内标准，AQL 与供应商不一致",
        ],
      },
      {
        heading: "我们做的三件事",
        paragraphs: [
          "第一步不是换供应商，而是把图纸版本和检验口径统一。所有零件按同一套图纸编号管理，改图走变更单，变更单同步到工厂、验货和客户三端。",
          "第二步是把 12 家合并成 4 家主供 + 1 家备选。合并的依据不是价格，是过去 18 个月的准时率与返工率。被合并掉的供应商并没有消失，而是转为二级供应，由主供统一排产。",
          "第三步是把检验前移。关键尺寸在工厂自检时就录入，出货前我们再做一次 AQL 1.0 抽检，随货提供 3.1 检验证书。",
        ],
        quote: "采购不再管 12 个交期，只对 1 个交付口径负责。",
      },
      {
        heading: "结果",
        paragraphs: [
          "合并后的第 4 个月，到货批次合格率稳定在 99% 以上；第 7 个月，Kessler 把安全库存从 6 周下调到 3.5 周，释放了大约 41 万欧元的在库资金。",
          "采购侧的对接人从 5 个减少到 1 个。2024 年双方把合作范围扩到钣金喷涂件，2026 年开始试单整机线束。",
        ],
        list: [
          "来料合格率 96.3% → 99.1%",
          "安全库存 6 周 → 3.5 周",
          "年供货批次 86 批，准时率 98.4%",
        ],
      },
    ],
  },
  {
    slug: "usa-outdoor-replenishment",
    title: "补货周期从 90 天压到 45 天",
    continent: "NORTH_AMERICA",
    country: "美国",
    city: "波特兰",
    industry: "零售消费品",
    clientName: "Northbay Outdoor",
    since: "2022",
    categories: ["户外用品", "混装", "海外仓"],
    summary:
      "户外自有品牌，42 个 SKU、单 SKU 量都不大。用义乌集货仓 + 洛杉矶海外仓两段备货，把平均补货周期从 90 天压到 45 天，缺货率从 8.6% 降到 1.9%。",
    metrics: [
      { label: "合作年限", value: "3 年", note: "2022 年起" },
      { label: "在售 SKU", value: "42 个", note: "A/B/C 三档" },
      { label: "平均补货", value: "45 天", note: "原 90 天" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Northbay 是波特兰的户外用品自有品牌，主要渠道是独立户外店和自建站。产品线宽：露营配件、收纳、炊具、照明，42 个 SKU，单个 SKU 一次只敢下 300–800 件。",
          "原来的节奏是「一次备三个月」：下单、生产、海运、入仓，前后 90 天。旺季一旦卖超，只能空运补货，一票空运的运费能把整季毛利吃掉一半。",
        ],
      },
      {
        heading: "拆成两段备货",
        paragraphs: [
          "我们把 42 个 SKU 按近 12 个月的出货频次分成 A/B/C 三档。A 档 9 个 SKU 常备 1,500 件在义乌集货仓，接到订单 48 小时内可出；B 档 18 个按季度补；C 档 15 个按单生产。",
          "海运不再整柜直发，而是把 A/B 档并成混装柜到洛杉矶海外仓，再由海外仓拆零发往各门店和自建站。集货仓负责「有货」，海外仓负责「快」。",
        ],
        list: [
          "A 档 9 个 SKU：集货仓常备，48 小时可出",
          "B 档 18 个 SKU：季度补货，混装柜出运",
          "C 档 15 个 SKU：按单生产，交期 35 天",
        ],
        quote: "库存不是越多越好，是放在离订单更近的地方。",
      },
      {
        heading: "结果",
        paragraphs: [
          "运行 12 个月后，平均补货周期从 90 天降到 45 天，缺货率从 8.6% 降到 1.9%，滞销库存下降 31%。2025 年旺季，Northbay 没有发过一票空运。",
        ],
      },
    ],
  },
  {
    slug: "netherlands-drop-test",
    title: "1.8 米跌落与 0.14 美元的成本账",
    continent: "EUROPE",
    country: "荷兰",
    city: "鹿特丹",
    industry: "包装与耗材",
    clientName: "Van Dijk Packaging",
    since: "2019",
    categories: ["瓦楞纸箱", "跌落测试", "出口包装"],
    summary:
      "渠道把跌落高度从 1.2 米提到 1.8 米。直接换七层纸板成本涨 0.61 美元/箱还是没过；改成五层箱加四角衬，只多 0.14 美元，测试一次通过。",
    metrics: [
      { label: "成本变化", value: "+$0.14", note: "每箱" },
      { label: "测试通过率", value: "100%", note: "首轮复测" },
      { label: "年用量", value: "46 万只", note: "2025 年" },
    ],
    blocks: [
      {
        heading: "问题",
        paragraphs: [
          "Van Dijk 给欧洲电商仓供货，纸箱里装的是小家电配件。渠道方按 ISTA 1A 做跌落，2024 年把高度从 1.2 米提到 1.8 米，第一次送测 12 只箱，有 5 只角部开胶。",
          "客户的第一反应是加厚：从五层换七层。成本涨了 0.61 美元/箱，第二次送测还是有 2 只失败——因为问题不在面，在角。",
        ],
      },
      {
        heading: "改法",
        paragraphs: [
          "角跌落时，冲击力集中在四个竖角。我们把七层退回五层，在四个角加 40×40×120mm 的蜂窝纸角衬，底部加一片瓦楞垫板，把冲击从角传到面。",
          "刀子没大改，只调整了角衬的定位线。单箱成本增加 0.14 美元，比七层方案省 0.47 美元。",
        ],
        list: [
          "五层 AB 楞，克重不变",
          "四角蜂窝角衬 40×40×120mm",
          "底部加一片三层垫板",
          "1.8 米六面三棱一角，首轮通过",
        ],
        quote: "先保角，再保面。角立住了，面就不会塌。",
      },
      {
        heading: "结果",
        paragraphs: [
          "复测 12 只全部通过，角部最大变形 3mm，内件无损。按 46 万只的年用量算，比七层方案一年省 21.6 万美元。",
          "角衬最初是手工摆放，单箱多 18 秒。后来做了一套定位治具，压到 6 秒，包装线没有加人。",
        ],
      },
    ],
  },
  {
    slug: "uae-transit-trade",
    title: "迪拜转口：一批货要过几道手",
    continent: "ASIA",
    country: "阿联酋",
    city: "迪拜",
    industry: "建材五金",
    clientName: "Gulf Line Trading",
    since: "2020",
    categories: ["建材五金", "转口", "单证"],
    summary:
      "货到迪拜不是终点，还要分发到沙特、阿曼、卡塔尔。按目的国分唛头、分托盘、混装柜，加上单证提前预审，清关滞留从 4.2 天降到 1.1 天。",
    metrics: [
      { label: "合作年限", value: "5 年", note: "2020 年起" },
      { label: "年出货", value: "210 柜", note: "转口 9 国" },
      { label: "清关滞留", value: "1.1 天", note: "原 4.2 天" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Gulf Line 是迪拜的建材五金贸易商，货从中国进，再分发到沙特、阿曼、卡塔尔、巴林和科威特。一票货常常要在迪拜拆成 4–6 份，每份的唛头、标签和单证都不一样。",
          "原来的做法是整柜到港再拆，结果经常是：一份货的标签贴错、一份的原产地证没带上，整柜压在港口等。平均滞留 4.2 天，滞港费一年十几万美元。",
        ],
      },
      {
        heading: "三条改动",
        paragraphs: [
          "第一，装柜前按目的国分唛头、分托盘。同一个托盘只放一个目的国的货，托盘外侧贴目的国色标，拆柜时不用再翻。",
          "第二，单证按目的国分包。原产地证、商业发票、装箱单在出货前 7 天完成预审，沙特需要的 SASO 文件单独走一条线。",
          "第三，混装柜按卸货顺序装。先卸的靠门，迪拜本地货装在最外侧，转口货装在里面并做二次固定。",
        ],
        list: [
          "按目的国分唛头、分托盘、色标管理",
          "单证出货前 7 天预审，SASO 单独通道",
          "按卸货顺序装柜，转口货二次固定",
        ],
        quote: "转口贸易赚的是效率，不是差价。",
      },
      {
        heading: "结果",
        paragraphs: [
          "清关滞留从平均 4.2 天降到 1.1 天，2024 年滞港费下降 74%。2025 年 Gulf Line 把转口目的国从 5 个扩到 9 个，年出货 210 柜。",
        ],
      },
    ],
  },
  {
    slug: "australia-linen-season",
    title: "亚麻季：把色差守在 ΔE 1.0 以内",
    continent: "OCEANIA",
    country: "澳大利亚",
    city: "悉尼",
    industry: "纺织家纺",
    clientName: "Linen & Co.",
    since: "2023",
    categories: ["亚麻", "家纺", "色差控制"],
    summary:
      "每季 6 个颜色、三季返单。提前 90 天锁坯布，每缸留缸样，色差按 ΔE ≤1.0 卡。三季零色差投诉，水洗缩率稳定在 3.1%。",
    metrics: [
      { label: "连续返单", value: "3 季", note: "2023–2026" },
      { label: "色差控制", value: "ΔE ≤1.0", note: "每缸检测" },
      { label: "水洗缩率", value: "3.1%", note: "目标 ≤3.5%" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Linen & Co. 是悉尼的家居品牌，主打亚麻四件套，每季 6 个颜色，单色 400–600 套。它的难点不是量，是颜色：同一季的 6 个颜色必须能摆在同一张陈列台上，缸差一眼就能看出来。",
          "2023 年第一次合作时，第二缸的雾灰比第一缸深了半个色阶，客户退了 180 套。",
        ],
      },
      {
        heading: "怎么守住颜色",
        paragraphs: [
          "第一，提前 90 天锁坯布。亚麻坯布同一批次的底色最稳，换批次就要重新打色卡。我们把一季的量一次性锁死，分批染色。",
          "第二，每缸留 1 米缸样，标注缸号、色号和ΔE 实测值，随货寄给客户。客户收货时先对缸样，再验大货。",
          "第三，色差按 ΔE ≤1.0 卡，超过就返染，不靠「看起来差不多」判断。",
        ],
        list: [
          "提前 90 天锁定同批坯布",
          "每缸留样，附 ΔE 实测值",
          "ΔE > 1.0 返染，不进入裁床",
          "水洗缩率每缸测 3 次取均值",
        ],
        quote: "颜色这件事，能测就不要靠眼睛。",
      },
      {
        heading: "结果",
        paragraphs: [
          "连续三季返单，零色差投诉。缩率稳定在 3.1%，裁床损耗从 6.4% 降到 4.1%。2026 春夏这一季，客户把品类从四件套扩到了窗帘和餐垫。",
        ],
      },
    ],
  },
  {
    slug: "brazil-60hz-rework",
    title: "圣保罗的 60Hz 与一次返工",
    continent: "SOUTH_AMERICA",
    country: "巴西",
    city: "圣保罗",
    industry: "智能硬件",
    clientName: "Cortex Automação",
    since: "2024",
    categories: ["边缘网关", "电源适配", "ANATEL"],
    summary:
      "第一批 300 台网关在 60Hz 电网上出现纹波超标，返工 300 台。换 60Hz 专用电源、加 4 小时老化、提前备 ANATEL 文件，第二批起零返工。",
    metrics: [
      { label: "首批返工", value: "300 台", note: "2024 年 3 月" },
      { label: "后续返工", value: "0 台", note: "第 2 批起" },
      { label: "ANATEL 认证", value: "6 周", note: "含测试与发证" },
    ],
    blocks: [
      {
        heading: "问题",
        paragraphs: [
          "Cortex 是圣保罗的自动化集成商，第一批 300 台 4G 边缘网关用在当地的包装线上。上线两周，有 27 台出现随机重启。",
          "查下来是电源适配器的纹波：国内按 50Hz 调的方案，到 60Hz 电网下纹波从 80mV 涨到 210mV，超过了模块的容忍范围。整批 300 台返工。",
        ],
      },
      {
        heading: "改法",
        paragraphs: [
          "换 60Hz 专用电源，输入范围放宽到 90–264V / 50–60Hz，纹波压到 60mV 以内。",
          "出厂测试加了 4 小时高温老化（45℃）和 20 次上下电循环，老化后再测一次纹波。ANATEL 认证文件提前 6 周启动，避免货到了证书还没到。",
        ],
        list: [
          "电源换 60Hz 专用型号，纹波 ≤60mV",
          "45℃ / 4 小时老化 + 20 次上下电循环",
          "ANATEL 认证提前启动，6 周发证",
          "固件增加看门狗与掉电保护",
        ],
        quote: "电网不是参数表上的一行字，是现场的第一道坎。",
      },
      {
        heading: "结果",
        paragraphs: [
          "第二批 500 台零返工，现场重启投诉归零。2025 年 Cortex 把网关的年采购量提到 2,400 台，并把配套的传感器一并转过来。",
          "这次返工的成本我们承担了一半——不是合同要求，是因为电源方案是我们选的。",
        ],
      },
    ],
  },
  {
    slug: "japan-drawing-change",
    title: "日本客户的图纸变更，48 小时响应",
    continent: "ASIA",
    country: "日本",
    city: "名古屋",
    industry: "精密零件",
    clientName: "Takumi Seiki",
    since: "2021",
    categories: ["精密加工", "小批量", "图纸变更"],
    summary:
      "小批量、多品种，一年 37 次图纸变更。开了一条变更专用通道：24 小时完成工艺评审，48 小时出首件，平均响应 46 小时，不良率 0.3%。",
    metrics: [
      { label: "年变更次数", value: "37 次", note: "2025 年" },
      { label: "平均响应", value: "46 小时", note: "目标 48 小时" },
      { label: "不良率", value: "0.3%", note: "全年" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Takumi Seiki 在名古屋做精密零件，客户是日本的半导体设备厂。特点是批量小、精度高、变更频繁：一批 80 件，公差 ±0.01mm，图纸一年改 30 多次。",
          "日本客户的习惯是变更前先电话沟通，变更后用邮件确认。语言与时差让响应经常拖到一周，产线等件。",
        ],
      },
      {
        heading: "变更通道",
        paragraphs: [
          "我们给它开了一条专用通道：中文图纸 24 小时内完成工艺评审，明确能不能做、要不要改夹具、交期变多少；48 小时内出首件，首件用三次元测全尺寸，报告当天发回。",
          "变更单有固定模板：变更点、影响工序、夹具调整、首件实测、交期。日方只需要看一页纸。",
        ],
        list: [
          "24 小时工艺评审，先回答「能不能做」",
          "48 小时出首件，三次元全尺寸报告",
          "一页纸变更单，日方可直接归档",
          "关键尺寸 SPC 数据随批提供",
        ],
        quote: "客户要的不是快，是「什么时候能给我确定答复」。",
      },
      {
        heading: "结果",
        paragraphs: [
          "2025 年 37 次变更，平均响应 46 小时，没有一次因为变更导致停线。全年 18.6 万件，不良率 0.3%，PPM 3,000 以内。",
        ],
      },
    ],
  },
  {
    slug: "south-africa-mixed-container",
    title: "一个 40HQ 装 28 个 SKU",
    continent: "AFRICA",
    country: "南非",
    city: "开普敦",
    industry: "纺织家纺",
    clientName: "Cape Textile Group",
    since: "2022",
    categories: ["家纺", "混装", "分箱贴标"],
    summary:
      "批发商一次要 28 个 SKU，每个量都不大。按门店分箱贴标、一个柜混装出运，单柜运费省 1,850 美元，清关一次完成。",
    metrics: [
      { label: "单柜 SKU", value: "28 个", note: "40HQ 混装" },
      { label: "单柜节省", value: "$1,850", note: "对比分票出运" },
      { label: "交付周期", value: "42 天", note: "下单到到港" },
    ],
    blocks: [
      {
        heading: "客户背景",
        paragraphs: [
          "Cape Textile 是开普敦的家纺批发商，下游是 60 多家独立家居店。它每次采购 28 个 SKU：浴巾、桌布、靠垫、毯子，每个 SKU 只有 200–600 件。",
          "如果每个 SKU 单独出运，运费按票计，28 票的运费比货值还高；如果等凑整柜，交期就要拖到 3 个月。",
        ],
      },
      {
        heading: "混装怎么做",
        paragraphs: [
          "所有货先进义乌集货仓，按门店订单分箱，箱外贴门店代码和 SKU 条码。装柜时按门店顺序排，卸货时不用二次分拣。",
          "报关按一个柜、一份提单出，到港后由客户自己的清关行一次清完，再按门店代码直接分发。",
        ],
        list: [
          "集货仓按门店分箱、贴码",
          "一个 40HQ 混装 28 个 SKU",
          "单票报关、单票提单",
          "到港后按门店代码直发",
        ],
        quote: "小批量的敌人不是量，是分摊。",
      },
      {
        heading: "结果",
        paragraphs: [
          "单柜运费比 28 票分运节省 1,850 美元，交付周期从 75 天缩到 42 天。2025 年 Cape Textile 的门店从 60 家扩到 94 家，采购频次从每季一次改成每月一次。",
        ],
      },
    ],
  },
];

export function getCase(slug: string): CaseStudy | undefined {
  return caseStudies.find((item) => item.slug === slug);
}

export function getAdjacentCases(slug: string) {
  const index = caseStudies.findIndex((item) => item.slug === slug);
  if (index < 0) return { prev: undefined, next: undefined };
  return {
    prev: index > 0 ? caseStudies[index - 1] : caseStudies[caseStudies.length - 1],
    next: index < caseStudies.length - 1 ? caseStudies[index + 1] : caseStudies[0],
  };
}
