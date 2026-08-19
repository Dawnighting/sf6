/* =========================================================
   报价计算（纯逻辑，不依赖页面）
   ========================================================= */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("./config.js"));
  } else {
    root.Pricing = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (ctx) {
  "use strict";

  var SITE_CONFIG = ctx.SITE_CONFIG;
  var RANK_ORDER = ctx.RANK_ORDER;
  var PRICE_TABLE = ctx.PRICE_TABLE;

  var LOCK_MSG = "抱歉，这些角色只接经典模式（DJ 达尔西姆 金柏莉 春丽 布兰卡 阿鬼 拉希德）";

  function rankInfo(value) {
    return RANK_ORDER.find(function (r) { return r.value === value; });
  }

  function readM(raw) {
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim();
    if (s === "") return null;
    return Number(s);
  }

  function validM(m) {
    return typeof m === "number" && Number.isInteger(m) && m >= 0 && m <= 2400;
  }

  /* 计算一个点位的数值大小，用来比较"目标是否大于当前" */
  function pointScore(rank, star, m) {
    if (rank === "newchallenger") return 0;
    var info = rankInfo(rank);
    if (!info) return null;
    if (info.order === 100) return 1000 + (m == null ? 0 : m);
    return info.order * 10 + (parseInt(star, 10) || 0);
  }

  /* 从价格表取一行（未定级有独立定价行） */
  function tableRow(rank, star) {
    if (rank === "newchallenger") return PRICE_TABLE.newchallenger[1];
    var row = PRICE_TABLE[rank];
    return row ? row[star] || null : null;
  }

  function formatPoint(rank, star, m) {
    if (rank === "newchallenger") return "未定级（一把没打）";
    var info = rankInfo(rank);
    if (info.order === 100) return "大师 M" + m;
    var names = {
      rookie: "新手", iron: "铁", bronze: "青铜", silver: "白银",
      gold: "黄金", platinum: "铂金", diamond: "钻石"
    };
    return (names[rank] || rank) + star + "星";
  }

  /* 按 M 分段计价：从 fromM 到 toM（toM > fromM）的积分价格 */
  function mRateIntegral(fromM, toM) {
    var total = 0;
    var cur = fromM;
    var bands = SITE_CONFIG.masterMRate;
    for (var i = 0; i < bands.length; i++) {
      if (cur >= toM) break;
      var end = Math.min(toM, bands[i].upTo);
      if (end > cur) {
        total += (end - cur) * bands[i].rate;
        cur = end;
      }
    }
    return total;
  }

  /**
   * 计算代打上分报价
   * input: { curRank, curStar, curM, tgtRank, tgtStar, tgtM, mode, character }
   * 返回: { ok:true, price, wins, curText, tgtText, note }
   *       { ok:false, code, message }
   */
  function computeBoostQuote(input) {
    var curInfo = rankInfo(input.curRank);
    var tgtInfo = rankInfo(input.tgtRank);
    if (!curInfo || !tgtInfo) {
      return { ok: false, code: "PICK_RANK", message: "请选择段位" };
    }

    /* 1. 经典模式限定角色 */
    if (input.mode === "现代" && SITE_CONFIG.classicOnlyCharacters.indexOf(input.character) !== -1) {
      return { ok: false, code: "MODERN_LOCKED", message: LOCK_MSG };
    }

    /* 2. 赛季末保传奇：固定价，与当前分数无关 */
    if (input.legend) {
      return {
        ok: true,
        legend: true,
        price: null,
        priceMin: SITE_CONFIG.legendPriceMin,
        priceMax: SITE_CONFIG.legendPriceMax,
        wins: null,
        curText: "—",
        tgtText: SITE_CONFIG.legendLabel,
        note: SITE_CONFIG.legendNote,
        tooHigh: false
      };
    }

    /* 3. M 分（错误用分数框下的红字提示，不弹窗） */
    var curM = readM(input.curM);
    var tgtM = readM(input.tgtM);

    if (curInfo.order === 100 && curM === null) {
      return { ok: false, code: "MISSING_M", field: "cur", message: "请填写M分" };
    }
    if (curM !== null && !validM(curM)) {
      return { ok: false, code: "M_RANGE", field: "cur", message: "M分需为 0~2400 的整数" };
    }

    if (tgtInfo.order === 100) {
      if (tgtM === null) {
        if (curInfo.order === 100) {
          return { ok: false, code: "MISSING_M", field: "tgt", message: "请填写M分" };
        }
        tgtM = 1500; /* 当前不是大师且未填 M 分：默认打到 M1500 */
      } else if (!validM(tgtM)) {
        return { ok: false, code: "M_RANGE", field: "tgt", message: "M分需为 0~2400 的整数" };
      }
    }

    /* 4. 目标必须大于当前（红字提示，不弹窗） */
    var curScore = pointScore(input.curRank, input.curStar, curM);
    var tgtScore = pointScore(input.tgtRank, input.tgtStar, tgtM);
    if (tgtScore <= curScore) {
      return { ok: false, code: "TARGET_NOT_GREATER", field: "tgt", message: "目标分数需大于当前分数" };
    }

    /* 5. 价格与连胜场数 */
    var price, wins;
    if (input.curRank === "newchallenger" && tgtInfo.order === 80) {
      /* 未定级 → 钻石：任意星固定价 */
      price = SITE_CONFIG.newchallengerToDiamondPrice;
      wins = null;
    } else if (curInfo.order === 100 && tgtInfo.order === 100) {
      /* 大师 → 大师：按 M 分段计价 */
      price = Math.round(mRateIntegral(curM, tgtM));
      wins = Math.max(1, Math.ceil((tgtM - curM) / SITE_CONFIG.masterMPerWin));
    } else {
      var curRow = tableRow(input.curRank, input.curStar);
      if (!curRow) {
        return { ok: false, code: "NO_TABLE", message: "当前段位数据缺失，请联系客服" };
      }
      if (tgtInfo.order === 100) {
        /* 非大师 → 大师：基础价（到 M1500）+ 超过 1500 的 M 分段 */
        var extra = tgtM > 1500 ? mRateIntegral(1500, tgtM) : 0;
        var extraWins = tgtM > 1500 ? Math.ceil((tgtM - 1500) / SITE_CONFIG.masterMPerWin) : 0;
        price = Math.round(curRow.price + extra);
        wins = Math.max(1, curRow.wins + extraWins);
      } else {
        /* 非大师 → 非大师：基础价相减 */
        var tgtRow = tableRow(input.tgtRank, input.tgtStar);
        var tgtPrice = tgtRow ? tgtRow.price : 0;
        var tgtWins = tgtRow ? tgtRow.wins : 0;
        price = Math.max(0, Math.round(curRow.price - tgtPrice));
        wins = Math.max(1, Math.round(curRow.wins - tgtWins));
      }
    }

    /* 6. 现代模式加价（传奇固定价已在前面提前返回，不参与） */
    if (input.mode === "现代") {
      price = Math.round(price * SITE_CONFIG.modernPriceMultiplier);
    }

    return {
      ok: true,
      legend: false,
      price: price,
      wins: wins,
      curText: formatPoint(input.curRank, input.curStar, curM),
      tgtText: formatPoint(input.tgtRank, input.tgtStar, tgtM),
      note: tgtInfo.order === 100 && tgtM === 1500 && String(input.tgtM).trim() === ""
        ? "M分未填，默认 M1500"
        : "",
      tooHigh: tgtInfo.order === 100 && tgtM > SITE_CONFIG.masterTooHighThreshold
    };
  }

  return {
    computeBoostQuote: computeBoostQuote,
    pointScore: pointScore,
    LOCK_MSG: LOCK_MSG
  };
});
