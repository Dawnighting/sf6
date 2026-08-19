/* =========================================================
   页面交互
   ========================================================= */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var activeTab = "boost";
  var lastErrorKey = { boost: null, coach: null, spar: null };

  /* ---------- 角色名单（经典模式限定角色放在最后） ---------- */
  var CHARACTER_GROUPS = [
    {
      label: "首发角色",
      names: [
        { v: "隆", l: "隆" }, { v: "卢克", l: "卢克" }, { v: "杰米", l: "杰米" },
        { v: "曼侬", l: "曼侬" }, { v: "朱莉", l: "朱莉" }, { v: "肯", l: "肯" },
        { v: "本田", l: "本田" }, { v: "古烈", l: "古烈" }, { v: "玛丽莎", l: "玛丽莎" },
        { v: "JP", l: "JP" }, { v: "莉莉", l: "莉莉" }, { v: "桑吉尔夫", l: "桑吉尔夫" },
        { v: "嘉米", l: "嘉米" }
      ]
    },
    {
      label: "第一年 DLC",
      names: [{ v: "爱德", l: "爱德" }, { v: "豪鬼", l: "豪鬼" }]
    },
    {
      label: "第二年 DLC",
      names: [
        { v: "维加", l: "维加" }, { v: "特瑞", l: "特瑞" },
        { v: "舞", l: "舞" }, { v: "艾莲娜", l: "艾莲娜" }
      ]
    },
    {
      label: "第三年 DLC",
      names: [
        { v: "沙加特", l: "沙加特" }, { v: "深红毒蛇", l: "深红毒蛇" },
        { v: "阿里克斯", l: "阿里克斯" }, { v: "英格丽德", l: "英格丽德" }
      ]
    },
    {
      label: "第四年 DLC",
      names: [{ v: "亚思敏", l: "亚思敏" }]
    },
    {
      label: "经典模式限定角色",
      names: [
        { v: "DJ", l: "DJ（迪杰）" }, { v: "达尔西姆", l: "达尔西姆" },
        { v: "金柏莉", l: "金柏莉" }, { v: "春丽", l: "春丽" },
        { v: "布兰卡", l: "布兰卡" }, { v: "阿鬼", l: "阿鬼" },
        { v: "拉希德", l: "拉希德" }
      ]
    }
  ];

  /* ---------- 弹窗 ---------- */
  function showModal(title, message) {
    $("modal-title").textContent = title;
    $("modal-msg").textContent = message;
    $("modal").hidden = false;
  }

  function closeModal() {
    $("modal").hidden = true;
  }

  /* 同一个错误只弹一次，避免反复弹窗 */
  function alertOnce(section, key, message) {
    if (lastErrorKey[section] !== key) {
      lastErrorKey[section] = key;
      showModal("提示", message);
    }
  }

  /* ---------- 下拉选项 ---------- */
  function fillRanks(select, isCurrent) {
    select.innerHTML = "";
    RANK_ORDER.forEach(function (r) {
      if (!isCurrent && !r.inTarget) return;
      var opt = document.createElement("option");
      opt.value = r.value;
      opt.textContent = r.label;
      select.appendChild(opt);
    });
  }

  /* 目标段位：当前为未定级时只显示钻石和大师 */
  function fillTargetRanks() {
    var sel = $("tgt-rank");
    var previous = sel.value;
    sel.innerHTML = "";
    RANK_ORDER.forEach(function (r) {
      if (!r.inTarget) return;
      if ($("cur-rank").value === "newchallenger" && r.order !== 100 && r.order !== 80) return;
      var opt = document.createElement("option");
      opt.value = r.value;
      opt.textContent = r.label;
      sel.appendChild(opt);
    });
    if (previous && Array.prototype.some.call(sel.options, function (o) { return o.value === previous; })) {
      sel.value = previous;
    }
  }

  function fillStars(select) {
    select.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = i + " 颗星";
      select.appendChild(opt);
    }
  }

  function fillCharacters(select) {
    select.innerHTML = "";
    CHARACTER_GROUPS.forEach(function (group) {
      var og = document.createElement("optgroup");
      og.label = group.label;
      group.names.forEach(function (n) {
        var opt = document.createElement("option");
        opt.value = n.v;
        opt.textContent = n.l;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });
  }

  /* 对练陪玩：角色筛选默认"全部角色" */
  function fillSparCharacters() {
    var sel = $("spar-char");
    fillCharacters(sel);
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "全部角色";
    sel.insertBefore(empty, sel.firstChild);
    sel.value = "";
  }

  /* 教学界面：现代模式只保留配置的角色（默认杰米） */
  function fillCoachCharacters() {
    var sel = $("coach-char");
    var previous = sel.value;
    sel.innerHTML = "";
    if ($("coach-mode").value === "现代") {
      var opt = document.createElement("option");
      opt.value = SITE_CONFIG.coachModernOnlyCharacter;
      opt.textContent = SITE_CONFIG.coachModernOnlyCharacter;
      sel.appendChild(opt);
    } else {
      CHARACTER_GROUPS.forEach(function (group) {
        var og = document.createElement("optgroup");
        og.label = group.label;
        group.names.forEach(function (n) {
          var opt = document.createElement("option");
          opt.value = n.v;
          opt.textContent = n.l;
          og.appendChild(opt);
        });
        sel.appendChild(og);
      });
      if (previous) sel.value = previous;
    }
  }

  function fillOptionalRanks(select) {
    select.innerHTML = "";
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "请选择（选填）";
    select.appendChild(empty);
    RANK_ORDER.forEach(function (r) {
      var opt = document.createElement("option");
      opt.value = r.value;
      opt.textContent = r.label;
      select.appendChild(opt);
    });
  }

  /* 对练陪玩：目标段位筛选（不限 / 阈值及以下 / 阈值以上） */
  function fillSparRankFilter() {
    var sel = $("spar-rank");
    sel.innerHTML = "";
    [
      { v: "", l: "不限" },
      { v: "le", l: SITE_CONFIG.sparRankThreshold + "及以下" },
      { v: "gt", l: SITE_CONFIG.sparRankThreshold + "以上" }
    ].forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.v;
      opt.textContent = o.l;
      sel.appendChild(opt);
    });
  }

  /* ---------- 对练陪玩资料库 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getSparRankFilter() {
    var v = $("spar-rank").value;
    if (v === "le") return { op: "le", threshold: SITE_CONFIG.sparRankThreshold };
    if (v === "gt") return { op: "gt", threshold: SITE_CONFIG.sparRankThreshold };
    return null;
  }

  function playerMatches(player) {
    var mode = $("spar-mode").value;
    var char = $("spar-char").value;
    var rankFilter = getSparRankFilter();

    if (mode && player.mode.indexOf(mode) === -1) return false;

    var matchedChars = char
      ? player.characters.filter(function (c) { return c.name === char; })
      : player.characters;
    if (char && matchedChars.length === 0) return false;

    if (rankFilter) {
      return matchedChars.some(function (c) {
        return rankFilter.op === "le" ? c.value <= rankFilter.threshold : c.value > rankFilter.threshold;
      });
    }
    return true;
  }

  function matchedPlayerIds() {
    return SITE_CONFIG.sparPlayers.filter(playerMatches).map(function (p) { return p.id; });
  }

  function renderSparPlayers() {
    var list = $("spar-player-list");
    var matched = SITE_CONFIG.sparPlayers.filter(playerMatches);
    if (matched.length === 0) {
      list.innerHTML = '<p class="player-empty">暂无匹配的陪玩，可联系客服咨询</p>';
      return;
    }
    list.innerHTML = "";
    matched.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "player-card";
      var chips = p.characters.map(function (c) {
        return '<span class="chip">' + escapeHtml(c.name) + " " + escapeHtml(c.rankLabel) + "</span>";
      }).join("");
      card.innerHTML =
        '<div class="player-head">' +
        '<span class="player-id">' + escapeHtml(p.id) + "</span>" +
        '<span class="player-mode">' + escapeHtml(p.mode.join(" / ")) + "</span>" +
        "</div>" +
        '<div class="player-chips">' + chips + "</div>" +
        '<div class="player-active">活跃时间：' + escapeHtml(p.activeTime) + "</div>";
      list.appendChild(card);
    });
  }

  /* ---------- 段位控件联动 ---------- */
  function rankKind(rank) {
    var info = RANK_ORDER.find(function (r) { return r.value === rank; });
    if (!info) return "stars";
    if (info.order === 100) return "master";
    if (rank === "newchallenger") return "new";
    return "stars";
  }

  function syncRankWidgets() {
    [["cur", "cur"], ["tgt", "tgt"]].forEach(function (pair) {
      var p = pair[0];
      var rank = $(p + "-rank").value;
      var kind = rankKind(rank);
      $(p + "-star-wrap").hidden = kind !== "stars";
      $(p + "-m-wrap").hidden = kind !== "master";
      var hint = $(p + "-hint");
      if (hint) hint.hidden = kind !== "new";
    });
  }

  /* ---------- 分数框红字提示 ---------- */
  function clearErr() {
    ["cur", "tgt"].forEach(function (p) {
      var el = $(p + "-err");
      el.hidden = true;
      el.textContent = "";
    });
  }

  function setErr(field, message) {
    var el = $(field + "-err");
    el.textContent = message;
    el.hidden = false;
  }

  /* ---------- 代打上分报价 ---------- */
  function readBoostState() {
    return {
      curRank: $("cur-rank").value,
      curStar: $("cur-star").value,
      curM: $("cur-m").value,
      tgtRank: $("tgt-rank").value,
      tgtStar: $("tgt-star").value,
      tgtM: $("tgt-m").value,
      mode: $("boost-mode").value,
      character: $("boost-char").value,
      legend: $("tgt-legend").classList.contains("active")
    };
  }

  function updateBoostQuote() {
    var state = readBoostState();
    var result = Pricing.computeBoostQuote(state);

    if (!result.ok) {
      $("boost-price").textContent = "--";
      $("btn-order-boost").disabled = true;
      clearErr();
      if (result.code === "MODERN_LOCKED") {
        $("boost-detail").textContent = "已停止报价：" + result.message;
        $("boost-detail").classList.add("error");
        alertOnce("boost", result.code, result.message);
      } else if (result.field) {
        $("boost-detail").textContent = "无法报价，请检查填写";
        $("boost-detail").classList.remove("error");
        setErr(result.field, result.message);
      } else {
        $("boost-detail").textContent = "无法报价，请检查填写";
        $("boost-detail").classList.remove("error");
      }
      return;
    }

    lastErrorKey.boost = null;
    clearErr();
    $("boost-detail").classList.remove("error");
    $("boost-price").textContent = "¥" + result.price;
    if (result.legend) {
      $("boost-price").textContent = "¥" + result.priceMin + "~" + result.priceMax;
      $("boost-detail").textContent = result.tgtText + " · " + result.note;
    } else {
      $("boost-detail").textContent =
        result.curText + " → " + result.tgtText +
        (result.wins !== null ? " ｜ 参考连胜 ≥ " + result.wins + " 场" : "") +
        (result.note ? " ｜ " + result.note : "");
    }
    $("btn-order-boost").disabled = false;

    if (result.tooHigh) {
      alertOnce("boost", "M_TOO_HIGH", SITE_CONFIG.masterTooHighPopup);
    }
  }

  /* ---------- 教学 / 对练陪玩报价 ---------- */
  function isLocked(mode, character) {
    return mode === "现代" && SITE_CONFIG.classicOnlyCharacters.indexOf(character) !== -1;
  }

  function updateCoachQuote() {
    var locked = isLocked($("coach-mode").value, $("coach-char").value);
    var priceEl = $("coach-price");
    var detailEl = $("coach-detail");
    var btn = $("btn-order-coach");

    if (locked) {
      priceEl.textContent = "--";
      detailEl.textContent = "已停止报价：" + Pricing.LOCK_MSG;
      detailEl.classList.add("error");
      btn.disabled = true;
      alertOnce("coach", "MODERN_LOCKED", Pricing.LOCK_MSG);
      return;
    }

    lastErrorKey.coach = null;
    detailEl.classList.remove("error");
    var hours = parseInt($("coach-hours").value, 10);
    priceEl.textContent = "¥" + hours * SITE_CONFIG.coachPricePerHour;
    detailEl.textContent = SITE_CONFIG.coachPricePerHour + " 元/小时 × " + hours + " 小时";
    btn.disabled = false;
  }

  function updateSparQuote() {
    var priceEl = $("spar-price");
    var detailEl = $("spar-detail");
    var btn = $("btn-order-spar");

    lastErrorKey.spar = null;
    detailEl.classList.remove("error");
    var hours = parseInt($("spar-hours").value, 10);
    var ids = matchedPlayerIds();
    priceEl.textContent = "¥" + hours * SITE_CONFIG.sparPricePerHour;
    detailEl.textContent = SITE_CONFIG.sparPricePerHour + " 元/小时 × " + hours + " 小时" +
      (ids.length ? " ｜ 匹配陪玩：" + ids.join("、") : " ｜ 暂无匹配陪玩");
    btn.disabled = false;
  }

  /* ---------- 下单 / 复制 ---------- */
  function buildOrderText() {
    if (activeTab === "boost") {
      var state = readBoostState();
      var result = Pricing.computeBoostQuote(state);
      if (!result.ok) return "";
      if (result.legend) {
        return "【街霸6代打上分】服务：" + result.tgtText +
          " ｜ 操作模式：" + state.mode +
          " ｜ 角色：" + state.character +
          " ｜ 价格区间：" + result.priceMin + "~" + result.priceMax + " 元（" + result.note + "）";
      }
      return "【街霸6代打上分】当前分数：" + result.curText +
        " ｜ 目标分数：" + result.tgtText +
        " ｜ 操作模式：" + state.mode +
        " ｜ 角色：" + state.character +
        " ｜ 预估价格：" + result.price + " 元" +
        " ｜ 参考连胜：≥" + result.wins + " 场";
    }

    if (activeTab === "coach") {
      var coachRank = $("coach-rank").value ? $("coach-rank").selectedOptions[0].textContent : "";
      return "【街霸6游戏教学】类型：" + $("coach-type").value +
        " ｜ 时长：" + $("coach-hours").value + "小时" +
        " ｜ 操作模式：" + $("coach-mode").value +
        " ｜ 角色：" + $("coach-char").value +
        (coachRank ? " ｜ 当前段位：" + coachRank : "") +
        " ｜ 预估价格：" + parseInt($("coach-hours").value, 10) * SITE_CONFIG.coachPricePerHour + " 元";
    }

    if (activeTab === "spar") {
      var sparRank = $("spar-rank").value ? $("spar-rank").selectedOptions[0].textContent : "不限";
      var sparChar = $("spar-char").value ? $("spar-char").selectedOptions[0].textContent : "不限";
      var ids = matchedPlayerIds();
      return "【街霸6对练陪玩】时长：" + $("spar-hours").value + "小时" +
        " ｜ 操作模式：" + $("spar-mode").value +
        " ｜ 角色：" + sparChar +
        " ｜ 目标段位：" + sparRank +
        " ｜ 匹配陪玩：" + (ids.length ? ids.join("、") : "暂无") +
        " ｜ 预估价格：" + parseInt($("spar-hours").value, 10) * SITE_CONFIG.sparPricePerHour + " 元";
    }
    return "";
  }

  function placeOrder() {
    var text = buildOrderText();
    if (!text) return;
    $("order-text").textContent = text;
    $("contact-panel").hidden = false;
    $("contact-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  function copyText(text, btn, doneLabel) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = doneLabel;
      setTimeout(function () { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  /* ---------- 收款码 ---------- */
  function initQr(imgId, phId, path) {
    var img = $(imgId);
    var ph = $(phId);
    if (!path) {
      img.hidden = true;
      ph.hidden = false;
      return;
    }
    img.src = path;
    img.hidden = false;
    ph.hidden = true;
    img.onerror = function () {
      img.hidden = true;
      ph.hidden = false;
    };
  }

  /* ---------- 事件绑定 ---------- */
  function wire() {
    document.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeTab = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        document.querySelectorAll(".tab-panel").forEach(function (p) {
          p.classList.toggle("active", p.id === "tab-" + btn.dataset.tab);
        });
      });
    });

    ["cur", "tgt"].forEach(function (p) {
      $(p + "-rank").addEventListener("change", function () {
        syncRankWidgets();
        if (p === "cur") fillTargetRanks();
        updateBoostQuote();
      });
      $(p + "-star").addEventListener("change", updateBoostQuote);
      $(p + "-m").addEventListener("input", updateBoostQuote);
    });

    $("boost-mode").addEventListener("change", updateBoostQuote);
    $("boost-char").addEventListener("change", updateBoostQuote);
    $("tgt-legend").addEventListener("click", function () {
      this.classList.toggle("active");
      updateBoostQuote();
    });

    $("coach-type").addEventListener("change", updateCoachQuote);
    $("coach-hours").addEventListener("change", updateCoachQuote);
    $("coach-mode").addEventListener("change", function () {
      fillCoachCharacters();
      updateCoachQuote();
    });
    $("coach-char").addEventListener("change", updateCoachQuote);

    $("spar-hours").addEventListener("change", updateSparQuote);
    $("spar-mode").addEventListener("change", function () {
      renderSparPlayers();
      updateSparQuote();
    });
    $("spar-char").addEventListener("change", function () {
      renderSparPlayers();
      updateSparQuote();
    });
    $("spar-rank").addEventListener("change", function () {
      renderSparPlayers();
      updateSparQuote();
    });

    $("btn-order-boost").addEventListener("click", placeOrder);
    $("btn-order-coach").addEventListener("click", placeOrder);
    $("btn-order-spar").addEventListener("click", placeOrder);

    $("modal-ok").addEventListener("click", closeModal);
    $("modal").addEventListener("click", function (e) {
      if (e.target === $("modal")) closeModal();
    });

    $("btn-copy-qq").addEventListener("click", function () {
      copyText(SITE_CONFIG.qq, $("btn-copy-qq"), "已复制 ✓");
    });
    $("btn-copy-order").addEventListener("click", function () {
      copyText($("order-text").textContent, $("btn-copy-order"), "已复制 ✓");
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    fillRanks($("cur-rank"), true);
    fillTargetRanks();
    fillStars($("cur-star"));
    fillStars($("tgt-star"));
    fillCharacters($("boost-char"));
    fillCoachCharacters();
    fillSparCharacters();
    fillOptionalRanks($("coach-rank"));
    fillSparRankFilter();

    $("cur-rank").value = "newchallenger";
    $("cur-star").value = "3";
    $("tgt-rank").value = "master";
    $("tgt-star").value = "3";
    $("tgt-legend").textContent = SITE_CONFIG.legendLabel;

    $("qq-number").textContent = SITE_CONFIG.qq;
    $("qq-link").href = SITE_CONFIG.qqLink;
    $("qq-link").textContent = "QQ咨询";

    initQr("wechat-qr-img", "wechat-qr-ph", SITE_CONFIG.wechatQr);
    initQr("alipay-qr-img", "alipay-qr-ph", SITE_CONFIG.alipayQr);

    wire();
    syncRankWidgets();
    updateBoostQuote();
    updateCoachQuote();
    updateSparQuote();
    renderSparPlayers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
