/**
 * 产品目录（售前演示内容）
 *
 * 价格为 FOB 宁波参考价，随汇率与批量浮动；MOQ 与交期为实际排产口径。
 * 每个品类 3 个 SKU，覆盖工业零部件、智能硬件、包装耗材、纺织家纺。
 */

export type ProductCategoryKey =
  | "industrial-components"
  | "smart-hardware"
  | "packaging"
  | "textile-home";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  nameEn: string;
  category: ProductCategoryKey;
  summary: string;
  price: number;
  moq: number;
  unit: string;
  leadTime: string;
  hsCode: string;
  port: string;
  badge?: string;
  image: string;
  specs: ProductSpec[];
  highlights: string[];
  description: string[];
}

export const productCategories: { value: ProductCategoryKey; label: string }[] = [
  { value: "industrial-components", label: "工业零部件" },
  { value: "smart-hardware", label: "智能硬件" },
  { value: "packaging", label: "包装与耗材" },
  { value: "textile-home", label: "纺织家纺" },
];

export const products: Product[] = [
  {
    slug: "bearing-unit-6205-2rs",
    name: "深沟球轴承单元 6205-2RS",
    nameEn: "Deep Groove Ball Bearing Unit 6205-2RS",
    category: "industrial-components",
    summary:
      "双面密封、P6 精度，适配输送线与风机。出厂逐个测振动值，随批提供 3.1 检验证书。",
    price: 3.85,
    moq: 500,
    unit: "套",
    leadTime: "18 天",
    hsCode: "8482.10",
    port: "宁波",
    badge: "主推",
    image: "/images/products/bearing-unit-6205-2rs.jpg",
    specs: [
      { label: "内径 × 外径 × 宽度", value: "25 × 52 × 15 mm" },
      { label: "精度等级", value: "P6（ABEC-3）" },
      { label: "密封形式", value: "双面丁腈橡胶密封 2RS" },
      { label: "额定动载荷", value: "14.0 kN" },
      { label: "极限转速", value: "9,000 rpm（脂润滑）" },
      { label: "工作温度", value: "-30℃ ~ +120℃" },
    ],
    highlights: [
      "100% 振动值检测，振动加速度 ≤ 28 dB",
      "轴承钢 GCr15，热处理硬度 60–64 HRC",
      "随批提供材质单与 3.1 检验证书",
      "可做客户品牌激光打标（MOQ 2,000 套）",
    ],
    description: [
      "6205-2RS 是输送线、风机和小型减速机上最常见的规格。看起来是标准件，实际差异在密封和游隙：密封唇口不好，三个月就进灰；游隙选错，装上去就发热。",
      "我们按用途分三档供货：通用档用标准游隙，适合常温轻载；风机档用 C3 游隙，补偿温升；重载档配加强保持架，用于冲击载荷。下单时说明用途即可，不需要自己算。",
      "出厂前逐个测振动值，抽检做温升试验（连续运转 2 小时，温升 ≤ 25K）。包装为单个纸盒 + 出口五层箱，每箱 100 套。",
    ],
  },
  {
    slug: "servo-kit-750w",
    name: "伺服驱动套装 750W",
    nameEn: "Servo Motor & Drive Kit 750W",
    category: "industrial-components",
    summary:
      "电机 + 驱动器 + 3 米编码器线成套供货，支持脉冲 / EtherCAT 两种控制方式，配调试手册。",
    price: 268,
    moq: 10,
    unit: "套",
    leadTime: "25 天",
    hsCode: "8501.31",
    port: "宁波",
    image: "/images/products/servo-kit-750w.jpg",
    specs: [
      { label: "额定功率", value: "750 W" },
      { label: "额定转矩", value: "2.39 N·m" },
      { label: "额定转速", value: "3,000 rpm" },
      { label: "编码器", value: "17 bit 绝对值" },
      { label: "控制方式", value: "脉冲 / EtherCAT（选配）" },
      { label: "防护等级", value: "IP65（电机）" },
    ],
    highlights: [
      "成套供货，电机、驱动器、线缆阻抗已匹配",
      "内置惯量辨识与自整定，上电 10 分钟可跑",
      "EtherCAT 版本支持 1ms 同步周期",
      "提供中文 / 英文调试手册与参数模板",
    ],
    description: [
      "单买电机再配驱动器，最容易出问题的是线缆和参数：编码器线阻抗不匹配会丢脉冲，增益没整定好会啸叫。这套按整机匹配好供货，开箱按参数模板导入即可运行。",
      "驱动器支持位置、速度、转矩三种模式，脉冲版本兼容三菱 / 台达的接线习惯；EtherCAT 版本通过一致性测试，可接入主流 PLC。",
      "每套含 3 米编码器线与电源线，可加长到 10 米（需注明，线径相应加粗）。木箱包装，单箱 4 套。",
    ],
  },
  {
    slug: "linear-rail-hgr20",
    name: "直线导轨副 HGR20",
    nameEn: "Linear Guide Rail HGR20",
    category: "industrial-components",
    summary:
      "四列圆弧接触，单根 1 米，配 2 个滑块。行走平行度 0.01mm/300mm，适合自动化模组。",
    price: 42.5,
    moq: 50,
    unit: "根",
    leadTime: "20 天",
    hsCode: "8482.80",
    port: "宁波",
    image: "/images/products/linear-rail-hgr20.jpg",
    specs: [
      { label: "轨宽", value: "20 mm" },
      { label: "标准长度", value: "1,000 mm（可切割）" },
      { label: "滑块配置", value: "每根 2 个 HGH20CA" },
      { label: "额定动载荷", value: "17.75 kN / 滑块" },
      { label: "行走平行度", value: "0.01 mm / 300 mm" },
      { label: "预压等级", value: "ZA（微间隙）/ Z0（轻预压）" },
    ],
    highlights: [
      "导轨与滑块同批配对研磨，不混批",
      "端面加工可对接，多根拼接无台阶",
      "可切长度并做端面攻丝（免费）",
      "防尘刮板 + 侧密封，适合木工与粉尘环境",
    ],
    description: [
      "HGR20 是自动化模组里最通用的规格。选型时容易忽略的是预压：轻载高速选 ZA，刚性要求高选 Z0，选错会出现爬行或发热。",
      "我们按根供货，每根配 2 个滑块，滑块与导轨同批配对，避免不同批次混装导致的间隙。需要更长行程时，可做端面对接加工，拼接处台阶控制在 3μm 以内。",
      "可按图纸切割长度并做端面攻丝，切割后重新测行走平行度。单根独立纸筒 + 木箱，50 根一托。",
    ],
  },
  {
    slug: "lora-th-sensor",
    name: "LoRaWAN 温湿度传感器",
    nameEn: "LoRaWAN Temperature & Humidity Sensor",
    category: "smart-hardware",
    summary:
      "内置 SX1262，空旷传输 3 公里，电池寿命 3 年。IP65 外壳，适合仓储与冷链监测。",
    price: 38.6,
    moq: 100,
    unit: "台",
    leadTime: "22 天",
    hsCode: "8517.62",
    port: "宁波",
    badge: "畅销",
    image: "/images/products/lora-th-sensor.jpg",
    specs: [
      { label: "通信方式", value: "LoRaWAN Class A（CN470 / EU868 / US915）" },
      { label: "温度范围", value: "-30℃ ~ +70℃，±0.3℃" },
      { label: "湿度范围", value: "0–100% RH，±2% RH" },
      { label: "传输距离", value: "空旷 3 km" },
      { label: "电池寿命", value: "3 年（10 分钟上报一次）" },
      { label: "防护等级", value: "IP65" },
    ],
    highlights: [
      "支持 CN470 / EU868 / US915 三个频段",
      "本地缓存 2,000 条，断网自动补传",
      "磁吸 / 挂墙 / 扎带三种安装方式",
      "可预置客户网关的 DevEUI 与 AppKey",
    ],
    description: [
      "仓储和冷链场景最怕两件事：信号穿不透货架、电池撑不到一年。这台用 SX1262 射频前端，货架间实测穿透 4 层；10 分钟上报一次的前提下，电池寿命 3 年。",
      "断网时本地缓存 2,000 条数据，网络恢复后按时间顺序补传，不会丢温区的连续记录。适合需要留档的冷链客户。",
      "出厂可预置 DevEUI、AppKey 与频段，到现场通电即入网。外壳为 PC + ABS，配防拆螺丝。单台彩盒，100 台一箱。",
    ],
  },
  {
    slug: "edge-gateway-eg4",
    name: "4G 边缘网关 EG-4",
    nameEn: "4G Edge Gateway EG-4",
    category: "smart-hardware",
    summary:
      "Modbus / MQTT / OPC UA 三协议接入，本地规则引擎，断网续传。支持 90–264V 宽压输入。",
    price: 118,
    moq: 20,
    unit: "台",
    leadTime: "28 天",
    hsCode: "8517.62",
    port: "宁波",
    image: "/images/products/edge-gateway-eg4.jpg",
    specs: [
      { label: "处理器", value: "四核 ARM Cortex-A55 1.5GHz" },
      { label: "内存 / 存储", value: "1GB DDR4 / 16GB eMMC" },
      { label: "接口", value: "2×RS485、1×RS232、2×千兆网口" },
      { label: "无线", value: "4G Cat.4（全网通）/ Wi-Fi 2.4G" },
      { label: "协议", value: "Modbus RTU/TCP、MQTT、OPC UA" },
      { label: "供电", value: "DC 12–24V / AC 90–264V（双版本）" },
    ],
    highlights: [
      "本地规则引擎，断网时按规则本地联锁",
      "断网续传，缓存 30 天数据",
      "支持 60Hz 电网，纹波 ≤ 60mV（出口巴西 / 美国）",
      "45℃ 4 小时老化 + 20 次上下电循环",
    ],
    description: [
      "网关的价值不在硬件参数，在断网的那几分钟能不能顶住。EG-4 带本地规则引擎，网络断了仍可按预设规则做联锁和报警，数据缓存 30 天，恢复后补传。",
      "出口不同国家要注意电源：巴西、美国是 60Hz 电网，普通适配器纹波会翻倍。这台提供 60Hz 专用电源版本，出厂做 4 小时 45℃ 老化与 20 次上下电循环。",
      "预装设备接入模板，主流 PLC（西门子 S7、三菱 MC、汇川 Modbus）勾选即可。支持定制开机画面与远程升级。",
    ],
  },
  {
    slug: "hmi-101-industrial",
    name: '10.1" 工业触控一体机',
    nameEn: '10.1" Industrial Touch Panel PC',
    category: "smart-hardware",
    summary:
      "Android 11 / Linux 双固件，十点电容触控，前面板 IP65。铝合金外壳，支持 VESA 与嵌入式安装。",
    price: 146,
    moq: 30,
    unit: "台",
    leadTime: "30 天",
    hsCode: "8471.41",
    port: "宁波",
    image: "/images/products/hmi-101-industrial.jpg",
    specs: [
      { label: "屏幕", value: '10.1" IPS，1280 × 800' },
      { label: "触控", value: "十点电容，手套模式可选" },
      { label: "系统", value: "Android 11 / Linux（双固件）" },
      { label: "接口", value: "2×USB、1×RJ45、1×RS485、HDMI" },
      { label: "防护", value: "前面板 IP65，整机 IP54" },
      { label: "供电", value: "DC 12–24V，功耗 ≤ 12W" },
    ],
    highlights: [
      "铝合金一体外壳，无风扇被动散热",
      "前面板 IP65，可用湿布直接擦拭",
      "支持开机自启指定应用与看门狗",
      "VESA 75 / 100 与嵌入式卡扣两种安装",
    ],
    description: [
      "车间里的屏，坏得最多的是风扇和触控。这台用无风扇被动散热，铝合金外壳导热，整机没有运动部件；触控支持手套模式，戴劳保手套也能操作。",
      "Android 11 与 Linux 双固件，出厂按需烧录。可设置开机自启指定应用、隐藏系统栏、锁屏密码，做成专用终端。",
      "接口按现场常见配置：双 USB 接扫码枪与 U 盘，RS485 直连 PLC，网口上行 MES。前面板 IP65，油污可用湿布擦。",
    ],
  },
  {
    slug: "carton-5ply-6040",
    name: "五层瓦楞出口箱 600×400×400",
    nameEn: "5-Ply Corrugated Export Carton",
    category: "packaging",
    summary:
      "AB 楞、K=K 面纸，5 层加强。可按 ISTA 1A 做 1.8 米跌落验证，支持双色印刷与唛头定制。",
    price: 1.42,
    moq: 1000,
    unit: "只",
    leadTime: "12 天",
    hsCode: "4819.10",
    port: "宁波",
    badge: "出口标准",
    image: "/images/products/carton-5ply-6040.jpg",
    specs: [
      { label: "内径尺寸", value: "600 × 400 × 400 mm" },
      { label: "楞型", value: "AB 楞（五层）" },
      { label: "面纸", value: "K=K，200g 牛卡" },
      { label: "耐破强度", value: "≥ 1,800 kPa" },
      { label: "边压强度", value: "≥ 7.5 kN/m" },
      { label: "印刷", value: "双色水性印刷 / 唛头定制" },
    ],
    highlights: [
      "可按 ISTA 1A 做 1.8 米跌落验证",
      "四角可加蜂窝角衬（另配，$0.06/只）",
      "支持按目的国分唛头、分托盘",
      "100 只一捆，托盘缠膜出货",
    ],
    description: [
      "出口箱的成本差在克重和楞型，风险也在那里。K=K 面纸配 AB 楞，耐破 ≥1,800kPa，适合 15kg 以内的家电配件与五金件。",
      "如果渠道要求 1.8 米跌落，不需要换七层：五层箱加四角蜂窝角衬即可通过，成本只增加 0.06 美元/只。我们可以代为做跌落测试并出报告。",
      "印刷支持双色水性油墨，唛头按目的国分开排版。出货按 100 只一捆，托盘缠膜，也可按门店分箱贴标。",
    ],
  },
  {
    slug: "honeycomb-corner-40",
    name: "蜂窝纸角衬 40×40×120",
    nameEn: "Honeycomb Paper Corner Protector",
    category: "packaging",
    summary:
      "把角跌落的冲击从角传到面。配合五层箱可过 1.8 米 ISTA 1A，单只成本 6 美分。",
    price: 0.06,
    moq: 20000,
    unit: "只",
    leadTime: "10 天",
    hsCode: "4823.90",
    port: "宁波",
    image: "/images/products/honeycomb-corner-40.jpg",
    specs: [
      { label: "展开尺寸", value: "40 × 40 × 120 mm" },
      { label: "芯材", value: "蜂窝纸芯，孔径 8mm" },
      { label: "面纸", value: "120g 再生牛卡" },
      { label: "静态抗压", value: "≥ 2.2 kN" },
      { label: "含水率", value: "8–12%" },
      { label: "包装", value: "500 只一捆，20,000 只一托" },
    ],
    highlights: [
      "四角一装，1.8 米角跌落通过率 100%",
      "比七层纸板方案省 0.47 美元/箱",
      "可预涂胶，产线贴合省一道工序",
      "环保纸基，可随箱一起回收",
    ],
    description: [
      "角部是纸箱最脆弱的位置。角跌落时冲击力集中在四个竖角，靠加厚面纸解决不了，得把力传出去。",
      "40×40×120mm 是通用尺寸，适配 400–600mm 高的箱子。装在四个竖角，用胶带或预涂胶固定，箱体角部变形可控制在 3mm 以内。",
      "出口按 500 只一捆、20,000 只一托。可做预涂胶版本，产线撕开即贴，单箱装配时间从 18 秒压到 6 秒。",
    ],
  },
  {
    slug: "stretch-film-500",
    name: "PE 缠绕膜 500mm × 20μm",
    nameEn: "PE Stretch Film 500mm × 20μm",
    category: "packaging",
    summary:
      "三层共挤，预拉伸 300%，抗穿刺。适合海运长周期托盘包装，单卷净重 2.5kg。",
    price: 6.9,
    moq: 200,
    unit: "卷",
    leadTime: "12 天",
    hsCode: "3920.10",
    port: "宁波",
    image: "/images/products/stretch-film-500.jpg",
    specs: [
      { label: "宽度", value: "500 mm" },
      { label: "厚度", value: "20 μm" },
      { label: "净重", value: "2.5 kg / 卷" },
      { label: "拉伸率", value: "300%（预拉伸）" },
      { label: "抗穿刺", value: "≥ 8 N" },
      { label: "粘性", value: "单面粘，可调" },
    ],
    highlights: [
      "三层共挤，中层加茂金属提韧性",
      "300% 预拉伸，单托用量省 18%",
      "海运 40 天不松卷、不塌托",
      "可做黑色遮光与防紫外线版本",
    ],
    description: [
      "缠绕膜看起来都一样，差别在拉伸率和抗穿刺。拉伸率不够，一卷顶不了几托；抗穿刺差，棱角一顶就破，海运一个月下来托盘就散了。",
      "这款三层共挤，中层加茂金属，抗穿刺 ≥8N，预拉伸 300%。实测一个标准托盘用量比普通膜少 18%。",
      "单面粘，粘性可按季节调（夏季降粘、冬季增粘）。可做黑色遮光与防紫外线版本，用于户外堆放。",
    ],
  },
  {
    slug: "linen-bedding-set",
    name: "亚麻混纺四件套",
    nameEn: "Linen Blend Bedding Set",
    category: "textile-home",
    summary:
      "48% 亚麻 + 12% 天丝 + 40% 棉，水洗缩率 3.1%，色差 ΔE ≤1.0。支持 OEM 花型与定制包装。",
    price: 32.8,
    moq: 200,
    unit: "套",
    leadTime: "35 天",
    hsCode: "6302.21",
    port: "宁波",
    badge: "OEM",
    image: "/images/products/linen-bedding-set.jpg",
    specs: [
      { label: "成分", value: "48% 亚麻 / 12% 天丝 / 40% 棉" },
      { label: "克重", value: "165 g/㎡（水洗后）" },
      { label: "规格", value: "Queen：200×230cm 被套 + 2 枕套 + 床单" },
      { label: "水洗缩率", value: "3.1%（目标 ≤3.5%）" },
      { label: "色差", value: "ΔE ≤1.0（每缸实测）" },
      { label: "工艺", value: "酵素水洗，预缩定型" },
    ],
    highlights: [
      "每缸留缸样，随货附 ΔE 实测值",
      "酵素水洗，手感柔软不起球",
      "支持 OEM 花型、织标与包装定制",
      "可做 Queen / King / 欧标三种规格",
    ],
    description: [
      "亚麻的好处在透气，坏处是容易皱、缩率大。这套把亚麻降到 48%，加 12% 天丝提垂感，40% 棉稳住尺寸，水洗缩率控制在 3.1%。",
      "颜色是这套的重点。每缸留 1 米缸样，标注缸号与 ΔE 实测值随货寄出，客户收货先对缸样再验大货，避免整批返工。",
      "支持 OEM：花型、织标、洗标、包装袋都可定制，起订 200 套/色。常规规格 Queen 与 King，也可按欧标 200×200cm 做。",
    ],
  },
  {
    slug: "cotton-bath-towel",
    name: "长绒棉浴巾 600gsm",
    nameEn: "Long-Staple Cotton Bath Towel 600gsm",
    category: "textile-home",
    summary:
      "新疆长绒棉，600gsm 毛圈，吸水 4.2 秒。色牢度 4 级，适合酒店与零售渠道。",
    price: 4.75,
    moq: 1000,
    unit: "条",
    leadTime: "28 天",
    hsCode: "6302.60",
    port: "宁波",
    image: "/images/products/cotton-bath-towel.jpg",
    specs: [
      { label: "尺寸", value: "70 × 140 cm" },
      { label: "克重", value: "600 g/㎡" },
      { label: "成分", value: "100% 新疆长绒棉" },
      { label: "吸水时间", value: "≤ 4.2 秒" },
      { label: "色牢度", value: "4 级（GB/T 3921）" },
      { label: "工艺", value: "无捻纱毛圈，双针包边" },
    ],
    highlights: [
      "600gsm 高克重，三次水洗后不掉毛",
      "色牢度 4 级，酒店高温洗涤不褪色",
      "可做绣标、缎档与提花 LOGO",
      "单条独立包装或 10 条一捆",
    ],
    description: [
      "酒店用毛巾的寿命取决于两件事：毛圈牢固度和色牢度。无捻纱手感好但容易掉毛，这套用半无捻结构，兼顾手感和强度，三次水洗后掉毛量 <0.3%。",
      "600gsm 是酒店标准克重，吸水 4.2 秒以内。色牢度 4 级，能扛住 80℃ 工业洗涤。",
      "支持绣标、缎档、提花 LOGO，起订 1,000 条/色。常规 70×140cm，也可做 80×160cm 与面巾、方巾配套。",
    ],
  },
  {
    slug: "washed-linen-runner",
    name: "水洗棉麻桌旗",
    nameEn: "Washed Cotton-Linen Table Runner",
    category: "textile-home",
    summary:
      "棉麻混纺，酵素水洗做旧，垂感好不易卷边。支持尺寸与颜色定制，适合家居零售与民宿。",
    price: 6.2,
    moq: 500,
    unit: "条",
    leadTime: "30 天",
    hsCode: "6302.59",
    port: "宁波",
    image: "/images/products/washed-linen-runner.jpg",
    specs: [
      { label: "尺寸", value: "35 × 180 cm（可定制）" },
      { label: "成分", value: "55% 亚麻 / 45% 棉" },
      { label: "克重", value: "210 g/㎡" },
      { label: "工艺", value: "酵素水洗、做旧毛边" },
      { label: "缩率", value: "≤ 3%" },
      { label: "颜色", value: "12 个常备色，可打样" },
    ],
    highlights: [
      "酵素水洗，垂感好、不卷边",
      "毛边做旧，不用锁边也有质感",
      "12 个常备色，7 天出样",
      "可配套餐垫、 napkin 成套供货",
    ],
    description: [
      "桌旗最容易翻车的是卷边和缩水。棉麻混纺加酵素水洗，布面软化、内应力释放，洗后不卷边，缩率控制在 3% 以内。",
      "毛边做旧是这套的卖点，省掉锁边工序，反而更有手工感。12 个常备色覆盖米白、燕麦、灰绿、赭石等家居主流色系，7 天可出样。",
      "支持尺寸定制，常规 35×180cm，也可做 35×240cm 长桌款。可与餐垫、餐巾成套供货，统一色号。",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((item) => item.slug === slug);
}

export function getRelatedProducts(product: Product, count = 3): Product[] {
  const sameCategory = products.filter(
    (item) => item.category === product.category && item.slug !== product.slug,
  );
  const others = products.filter(
    (item) => item.category !== product.category && item.slug !== product.slug,
  );
  return [...sameCategory, ...others].slice(0, count);
}

export function categoryLabel(key: ProductCategoryKey): string {
  return productCategories.find((item) => item.value === key)?.label ?? key;
}
