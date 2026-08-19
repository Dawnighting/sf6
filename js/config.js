/* =========================================================
   商家配置（价格 / 联系方式 / 收款码都在这里改）
   ========================================================= */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.SITE_CONFIG = api.SITE_CONFIG;
    root.RANK_ORDER = api.RANK_ORDER;
    root.PRICE_TABLE = api.PRICE_TABLE;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- 基本配置 ---------- */
  var SITE_CONFIG = {
    // 客服 QQ 号
    qq: "2748093282",
    qqLink: "https://wpa.qq.com/msgrd?v=3&uin=2748093282&site=qq&menu=yes",

    // 收款码图片路径（把图片放进 images/ 文件夹后在这里填路径）
    // 例：wechatQr: "images/wechat-qr.png"   alipayQr: "images/alipay-qr.png"
    wechatQr: null,
    alipayQr: null,

    // 大师 M 分计价（默认目标为 M1500）：
    // 按 M 分所在区间每 1 分计价（单位：元/分）。
    //   [0,1500)     0.4 元/分
    //   [1500,1600)  0.6 元/分
    //   [1600,1700)  0.8 元/分
    //   [1700,1800)  1.0 元/分
    //   [1800,2400]  1.3 元/分（超过 2000 的部分暂按 1.3 元/分计）
    masterMRate: [
      { upTo: 1500, rate: 0.4 },
      { upTo: 1600, rate: 0.6 },
      { upTo: 1700, rate: 0.8 },
      { upTo: 1800, rate: 1.0 },
      { upTo: 2400, rate: 1.3 }
    ],
    // 目标 M 分超过该阈值时弹窗提示私聊
    masterTooHighThreshold: 1800,
    masterTooHighPopup: "分数过高请加我qq：2748093282私聊",
    // 大师 M 分部分：每 8 M 分折算 1 场连胜。
    // 例：未定级(12连胜)上大师 M1600 = 12 + 100/8 ≈ 25 连胜
    masterMPerWin: 8,

    // 赛季末保传奇：价格区间（元），与当前分数无关
    legendPriceMin: 1000,
    legendPriceMax: 1100,
    legendLabel: "赛季末保传奇拿传奇标",
    legendNote: "具体价格建议联系客服qq2748093282",

    // 上分界面：选择"现代"操作模式时，最终价格 × 该倍数（传奇固定价不参与）
    modernPriceMultiplier: 1.5,

    // 教学界面：选择"现代"时角色下拉只保留这一个角色
    coachModernOnlyCharacter: "杰米",

    // 未定级 → 钻石（任意星）：固定价（元）
    newchallengerToDiamondPrice: 22,

    // 对练陪玩：目标段位筛选阈值（M分）
    sparRankThreshold: 1800,

    // 对练陪玩资料库（可继续往数组里加人）
    // characters 里 value 是用于筛选的数值：大师写 M 分；其他段位写段位分值（如钻石5=805）
    sparPlayers: [
      {
        id: "cq",
        mode: ["经典"],
        characters: [
          { name: "拉希德", rankLabel: "M2000", value: 2000 },
          { name: "亚思敏", rankLabel: "M1800", value: 1800 }
        ],
        activeTime: "每晚 20:00 ~ 24:00（可约）"
      }
    ],

    // 教学 / 对练陪玩 单价（元/小时）
    coachPricePerHour: 60,
    sparPricePerHour: 40,

    // 经典模式限定角色（选这些角色 + 现代模式 = 不接单）
    classicOnlyCharacters: ["DJ", "达尔西姆", "金柏莉", "春丽", "布兰卡", "阿鬼", "拉希德"]
  };

  /* ---------- 段位（按当前段位下拉的显示顺序排列） ----------
     order 用于比较大小：数值越大段位越高。
     inTarget=false 的段位不会出现在"目标段位"下拉里（未定级、新手）。 */
  var RANK_ORDER = [
    { value: "newchallenger", label: "New Challenger 未定级（要一把没打）", order: 0,  inTarget: false },
    { value: "master",        label: "Master 大师",                         order: 100, inTarget: true  },
    { value: "diamond",       label: "Diamond 钻石",                        order: 80,  inTarget: true  },
    { value: "platinum",      label: "Platinum 铂金",                       order: 60,  inTarget: true  },
    { value: "gold",          label: "Gold 黄金",                           order: 50,  inTarget: true  },
    { value: "silver",        label: "Silver 白银",                         order: 40,  inTarget: true  },
    { value: "bronze",        label: "Bronze 青铜",                         order: 30,  inTarget: true  },
    { value: "iron",          label: "Iron 黑铁",                           order: 20,  inTarget: true  },
    { value: "rookie",        label: "Rookie 新手",                         order: 10,  inTarget: false }
  ];

  /* ---------- 价格表 ----------
     表格含义：从"该起点段位"打到"大师 M1500"的价格（元）与至少连胜场数。
     实际报价 = 当前段位价格 - 目标段位价格（目标为大师 M1500 时价格为 0）。 */
  var PRICE_TABLE = {
    /* 未定级（一把没打）：上大师固定基础价 25 元 */
    newchallenger: {
      1: { price: 25, wins: 12 }
    },
    rookie: {
      1: { price: 95, wins: 47 }, 2: { price: 95, wins: 47 },
      3: { price: 95, wins: 46 }, 4: { price: 90, wins: 46 }, 5: { price: 90, wins: 45 }
    },
    iron: {
      1: { price: 90, wins: 45 }, 2: { price: 88, wins: 44 },
      3: { price: 85, wins: 43 }, 4: { price: 85, wins: 42 }, 5: { price: 82, wins: 41 }
    },
    bronze: {
      1: { price: 80, wins: 40 }, 2: { price: 80, wins: 40 },
      3: { price: 78, wins: 39 }, 4: { price: 76, wins: 38 }, 5: { price: 74, wins: 37 }
    },
    silver: {
      1: { price: 72, wins: 36 }, 2: { price: 68, wins: 34 },
      3: { price: 65, wins: 32 }, 4: { price: 62, wins: 31 }, 5: { price: 58, wins: 29 }
    },
    gold: {
      1: { price: 55, wins: 27 }, 2: { price: 50, wins: 25 },
      3: { price: 48, wins: 24 }, 4: { price: 45, wins: 22 }, 5: { price: 45, wins: 22 }
    },
    platinum: {
      1: { price: 45, wins: 21 }, 2: { price: 40, wins: 19 },
      3: { price: 38, wins: 18 }, 4: { price: 35, wins: 17 }, 5: { price: 35, wins: 16 }
    },
    diamond: {
      1: { price: 35, wins: 15 }, 2: { price: 30, wins: 14 },
      3: { price: 30, wins: 12 }, 4: { price: 30, wins: 11 }, 5: { price: 25, wins: 10 }
    }
  };

  return { SITE_CONFIG: SITE_CONFIG, RANK_ORDER: RANK_ORDER, PRICE_TABLE: PRICE_TABLE };
});
