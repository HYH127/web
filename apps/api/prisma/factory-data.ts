/**
 * 工厂实例（现场日志）种子数据
 * 一条记录 = 一篇图文记录：封面 + 结构化正文块 + 图集。
 * 与 prisma/seed.ts、prisma/seed-factory.ts 共用，改内容只改这里。
 */
export const factoryPosts = [
  {
    slug: "ningbo-assembly-week-45",
    title: "宁波装配一厂 · 第 45 周早班巡检记录",
    factoryName: "宁波装配一厂",
    location: "浙江 · 宁波",
    category: "ASSEMBLY" as const,
    summary:
      "两条装配线的节拍、停机与夹具压力复测。本周真正的问题不是产能，而是 3 号工位那只气动夹具。",
    coverImage: "/images/factory/assembly.jpg",
    gallery: ["/images/factory/quality.jpg", "/images/factory/warehouse.jpg"],
    tags: ["早班巡检", "节拍", "夹具"],
    author: "现场记录",
    publishedAt: new Date("2026-11-08T09:20:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "11 月 3 日 07:40，一号线与二号线同时开机。当日计划 1,240 台，实际完成 1,186 台，达成率 95.6%。数字不算差，但两条线的节拍都比上年同期慢了 2 秒。",
      },
      { type: "heading", text: "一、早班巡检" },
      {
        type: "paragraph",
        text: "一号线 3 号工位的气动夹具压力只有 0.42MPa，标准区间是 0.50–0.60MPa。压力不足会让工件在锁付时产生 0.3mm 左右的位移，外观看不出来，但扭矩曲线会抖。调压阀清洗后恢复，复测三次稳定在 0.54MPa。",
      },
      {
        type: "image",
        url: "/images/factory/quality.jpg",
        caption: "一号线 3 号工位 · 夹具压力复测，三次取值 0.53 / 0.54 / 0.54MPa",
      },
      { type: "heading", text: "二、节拍复盘" },
      {
        type: "list",
        items: [
          "一号线节拍 46 秒，比上周慢 2 秒，瓶颈在锁付工位",
          "二号线节拍 41 秒，换型后已连续三天稳定",
          "两条线合计停机 38 分钟，其中换料占 26 分钟",
        ],
      },
      {
        type: "quote",
        text: "异常写在当班，比写进月报有用。",
      },
      { type: "heading", text: "三、下周动作" },
      {
        type: "paragraph",
        text: "把换料动作从 26 分钟压到 15 分钟以内：物料车提前一班配好，换料时双人并行。锁付工位增加一次扭矩抽检，每两小时 5 件，记录进班组看板。",
      },
    ],
  },
  {
    slug: "taizhou-five-axis-changeover",
    title: "台州机加工中心 · 五轴换型：96 分钟是怎么压到 41 分钟的",
    factoryName: "台州精密机加工中心",
    location: "浙江 · 台州",
    category: "MACHINING" as const,
    summary:
      "没有买新设备，也没有加人。把 27 个换型动作拆开重排之后，五轴工位的换型时间从 96 分钟降到 41 分钟。",
    coverImage: "/images/factory/machining.jpg",
    gallery: ["/images/factory/quality.jpg", "/images/factory/warehouse.jpg"],
    tags: ["五轴", "换型", "SMED"],
    author: "现场记录",
    publishedAt: new Date("2026-11-06T16:05:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "换型时间是从停机到首件合格之间的全部时间。我们先连续记录了 6 次换型，把每个动作按秒拆开，才发现真正花时间的不是调机，而是找东西。",
      },
      { type: "heading", text: "一、原来的 96 分钟花在哪" },
      {
        type: "list",
        items: [
          "找刀与对刀：22 分钟",
          "找夹具、换快换板：18 分钟",
          "首件试切与补偿：31 分钟",
          "参数确认与记录：25 分钟",
        ],
      },
      {
        type: "image",
        url: "/images/factory/quality.jpg",
        caption: "五轴工位 · 换型看板与预排刀具车",
      },
      { type: "heading", text: "二、做了三件事" },
      {
        type: "paragraph",
        text: "第一，刀具车按工序预排，换型前由上一班配齐，刀柄位置贴编号；第二，夹具改成快换板，定位销从 4 个减到 2 个，重复定位精度仍有 0.008mm；第三，首件程序参数模板化，常用材料的进给与转速直接调用，不再现场试。",
      },
      {
        type: "quote",
        text: "换型不是技术问题，是摆放问题。",
      },
      { type: "heading", text: "三、遗留问题" },
      {
        type: "paragraph",
        text: "第四轴零点漂移仍需要人工复校，每次约 4 分钟。下一步计划加装在线测头，把这一步并进首件循环，目标是 35 分钟以内。",
      },
    ],
  },
  {
    slug: "shaoxing-batch-a17-inspection",
    title: "绍兴质检站 · 批次 A17 全检：三个尺寸项与一次返修",
    factoryName: "绍兴质检站",
    location: "浙江 · 绍兴",
    category: "QUALITY" as const,
    summary:
      "480 件全检，6 小时 40 分。外径超差 3 件，返修后复检通过；同轴度全部在范围内，粗糙度有两件贴着上限。",
    coverImage: "/images/factory/quality.jpg",
    gallery: ["/images/factory/warehouse.jpg", "/images/factory/packaging.jpg"],
    tags: ["全检", "尺寸", "返修"],
    author: "质检组",
    publishedAt: new Date("2026-11-03T18:40:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "批次 A17 共 480 件，客户要求全检而不是抽检。两人并行，从上午 09:10 到下午 15:50，含返修复检共 6 小时 40 分。",
      },
      { type: "heading", text: "一、检了什么" },
      {
        type: "list",
        items: [
          "外径 32.00 ±0.02mm，千分尺三点测量",
          "同轴度 0.015mm，偏摆仪打表",
          "端面粗糙度 Ra1.6，便携式粗糙度仪",
        ],
      },
      {
        type: "image",
        url: "/images/factory/warehouse.jpg",
        caption: "A17 批次 · 全检工位与量具台",
      },
      { type: "heading", text: "二、结果" },
      {
        type: "paragraph",
        text: "外径超差 3 件，均为 +0.025mm 左右，返修后复检通过；同轴度全部在 0.012mm 以内；粗糙度有两件为 Ra1.55，贴着上限但合格。",
      },
      { type: "heading", text: "三、判断" },
      {
        type: "paragraph",
        text: "三件超差全部出现在第三班，时间集中在换刀后的前 20 件。怀疑与换刀后首件确认不到位有关，已要求换刀首件留样并单独记录，下周开始执行。",
      },
    ],
  },
  {
    slug: "yiwu-warehouse-slotting",
    title: "义乌集货仓 · 旺季前把拣货路径缩短了 38%",
    factoryName: "义乌集货仓",
    location: "浙江 · 义乌",
    category: "WAREHOUSE" as const,
    summary:
      "1,800 个 SKU 重新排了一次库位：高频前移、按订单共现率成组、重货下移。平均拣货行走从 143 米降到 88 米。",
    coverImage: "/images/factory/warehouse.jpg",
    gallery: ["/images/factory/packaging.jpg", "/images/factory/sample.jpg"],
    tags: ["库位", "拣货", "旺季"],
    author: "仓储组",
    publishedAt: new Date("2026-10-29T11:15:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "旺季前两周，仓库停了一个夜班做库位重排。没有增加货架，只是把东西放到了该放的位置。",
      },
      {
        type: "image",
        url: "/images/factory/packaging.jpg",
        caption: "A 区 · 重排后的高频 SKU 拣货面",
      },
      { type: "heading", text: "一、三条规则" },
      {
        type: "list",
        items: [
          "近 30 天出货频次前 20% 的 SKU 前移到 A 区黄金位",
          "按订单共现率成组摆放，同一张订单的货尽量在同一通道",
          "单箱超过 18kg 的重货全部下移到腰部以下",
        ],
      },
      { type: "heading", text: "二、数据" },
      {
        type: "paragraph",
        text: "抽了 200 张真实订单做对比：平均拣货行走从 143 米降到 88 米，单均拣货时间从 6 分 12 秒降到 4 分 05 秒。错拣从 3 单降到 1 单。",
      },
      {
        type: "quote",
        text: "库位不是按品类排的，是按订单排的。",
      },
      { type: "heading", text: "三、代价" },
      {
        type: "paragraph",
        text: "重排后一周内，老员工找货明显变慢，前三天拣货效率反而下降 12%。第四天开始恢复，第二周稳定在新水平。这类改动必须挑低峰期做。",
      },
    ],
  },
  {
    slug: "hangzhou-linen-sample-v7",
    title: "杭州打样间 · 亚麻混纺第七版：手感、缩率与色差",
    factoryName: "杭州打样间",
    location: "浙江 · 杭州",
    category: "SAMPLE" as const,
    summary:
      "第七版样布出来了。缩率 3.1% 达标，色差 ΔE 0.8，手感评分 4.2/5。离客户要的「干爽但有垂感」还差一点。",
    coverImage: "/images/factory/sample.jpg",
    gallery: ["/images/factory/assembly.jpg", "/images/factory/quality.jpg"],
    tags: ["亚麻", "打样", "色差"],
    author: "打样组",
    publishedAt: new Date("2026-10-24T15:30:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "客户要的是一块「干爽但有垂感」的亚麻混纺，前六版不是太硬就是太软。第七版把亚麻比例从 55% 降到 48%，加了 12% 的天丝。",
      },
      {
        type: "image",
        url: "/images/factory/assembly.jpg",
        caption: "第七版 · 三组色卡与手感对比样",
      },
      { type: "heading", text: "一、三个指标" },
      {
        type: "list",
        items: [
          "水洗缩率 3.1%，目标 ≤3.5%",
          "色差 ΔE 0.8，目标 ≤1.0",
          "手感评分 4.2/5，客户目标 4.5",
        ],
      },
      { type: "heading", text: "二、还差什么" },
      {
        type: "paragraph",
        text: "手感评分主要丢在「回弹」这一项。天丝加多了会滑，加少了又不够垂。第八版计划把天丝拆成 8% 天丝 + 4% 莫代尔，同时把后整理的温度降 5℃。",
      },
      {
        type: "quote",
        text: "样布不是做给客户看的，是做给产线确认能不能稳定做出来的。",
      },
      { type: "heading", text: "三、时间" },
      {
        type: "paragraph",
        text: "第八版预计 10 月 31 日出样，客户确认后 15 天出大货首缸。色卡已寄出，等待确认。",
      },
    ],
  },
  {
    slug: "wenzhou-drop-test-18m",
    title: "温州包装线 · 跌落测试从 1.2 米做到 1.8 米",
    factoryName: "温州包装线",
    location: "浙江 · 温州",
    category: "PACKAGING" as const,
    summary:
      "客户把跌落高度从 1.2 米提到 1.8 米，成本只增加了 0.14 美元/箱。关键不是加厚纸板，而是四个角衬。",
    coverImage: "/images/factory/packaging.jpg",
    gallery: ["/images/factory/sample.jpg", "/images/factory/assembly.jpg"],
    tags: ["纸箱", "跌落测试", "出口"],
    author: "包装组",
    publishedAt: new Date("2026-10-18T10:10:00+08:00"),
    content: [
      {
        type: "paragraph",
        text: "出口渠道要求按 ISTA 1A 做跌落，客户把高度从 1.2 米提到 1.8 米。第一轮直接换七层纸板，成本涨了 0.61 美元/箱，测试还是没过。",
      },
      { type: "heading", text: "一、三轮测试" },
      {
        type: "list",
        items: [
          "1.2 米六面三棱一角：原五层箱通过",
          "1.5 米棱跌落：角部塌陷 6mm，未伤内件",
          "1.8 米角跌落：2 号箱角部开胶，内件完好",
        ],
      },
      {
        type: "image",
        url: "/images/factory/sample.jpg",
        caption: "刀版图与角衬位置 · 四个角衬各 40×40×120mm",
      },
      { type: "heading", text: "二、改法" },
      {
        type: "paragraph",
        text: "退回五层纸板，在四个竖角加 40×40×120mm 的蜂窝角衬，底部加一片瓦楞垫板。成本增加 0.14 美元/箱，1.8 米角跌落复测通过，箱体角部变形 3mm 以内。",
      },
      {
        type: "quote",
        text: "先保角，再保面。角立住了，面就不会塌。",
      },
      { type: "heading", text: "三、下一步" },
      {
        type: "paragraph",
        text: "角衬目前手工摆放，单箱多 18 秒。正在做定位治具，目标压到 6 秒以内，下月上线。",
      },
    ],
  },
];
