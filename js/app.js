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

  /* 目标段位：只显示不低于当前段位的段位；当前为未定级时只显示钻石和大师 */
  function fillTargetRanks() {
    var sel = $("tgt-rank");
    var previous = sel.value;
    var curInfo = RANK_ORDER.find(function (r) { return r.value === $("cur-rank").value; });
    sel.innerHTML = "";
    RANK_ORDER.forEach(function (r) {
      if (!r.inTarget) return;
      if (curInfo && r.order < curInfo.order) return;
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

  /* 教学页角色筛选（全部角色） */
  function fillCoachCharFilter() {
    var sel = $("coach-char-filter");
    fillCharacters(sel);
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "全部角色";
    sel.insertBefore(empty, sel.firstChild);
    sel.value = "";
  }

  function coachCharMatches(teacher) {
    var char = $("coach-char-filter").value;
    if (!char) return true;
    var teaching = teacher.teachingChars || [];
    if (teaching.indexOf(char) !== -1) return true;
    var levels = teacher.levels || teacher.characters || [];
    return levels.some(function (c) { return c.name === char; });
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

  /* ---------- 教学老师资料库 ---------- */
  var TEACHER_EXTRA_KEY = "sf6_coach_teachers_extra";
  var extraTeachers = [];
  try {
    extraTeachers = JSON.parse(localStorage.getItem(TEACHER_EXTRA_KEY) || "[]") || [];
  } catch (e) {
    extraTeachers = [];
  }
  var selectedCoach = null;
  var currentTeacherDetail = null;

  function allCoachTeachers() {
    return SITE_CONFIG.coachTeachers.concat(extraTeachers);
  }

  function renderCoachTeachers() {
    var list = $("coach-player-list");
    var teachers = allCoachTeachers().filter(coachCharMatches);
    var title = $("coach-list-title");
    if (title) title.textContent = "老师列表（" + teachers.length + " 人）";
    if (teachers.length === 0) {
      list.innerHTML = '<p class="player-empty">暂无老师，可点右上角“添加老师”或联系客服</p>';
      selectedCoach = null;
      updateCoachQuote();
      return;
    }
    if (!selectedCoach || teachers.indexOf(selectedCoach) === -1) {
      selectedCoach = teachers[0] || null;
    }
    if (!selectedCoach) {
      list.innerHTML = '<p class="player-empty">没有教这个角色的老师，可联系客服咨询</p>';
      updateCoachQuote();
      return;
    }
    list.innerHTML = "";
    teachers.forEach(function (t) {
      var card = document.createElement("div");
      card.className = "player-card coach-card" + (selectedCoach === t ? " player-selected" : "");
      var avatar = escapeHtml(String(t.id || "?").slice(0, 2).toUpperCase());
      var groups = groupChars(t);
      var visible = groups.slice(0, 3);
      var extra = groups.length - visible.length;
      var chips = visible.map(function (g) {
        var label = g.names.length === 1 ? g.names[0] + " " + g.rankLabel : "多角色" + g.rankLabel;
        return '<span class="chip chip-match">' + escapeHtml(label) + "</span>";
      }).join("");
      if (extra > 0) chips += '<span class="chip chip-more">+' + extra + "</span>";
      card.innerHTML =
        '<div class="player-avatar">' + (t.avatar ? '<img class="player-avatar-img" src="' + escapeHtml(t.avatar) + '" alt="">' : avatar) + "</div>" +
        '<div class="player-id">' + escapeHtml(t.id) + "</div>" +
        '<div class="player-mode">' + escapeHtml(t.mode.join(" / ")) + "</div>" +
        '<div class="player-chips">' + chips + "</div>" +
        '<div class="teacher-teach">教学：' + escapeHtml(t.teachingChars.join("、")) + "</div>" +
        '<div class="teacher-price">¥' + t.price + "/小时</div>";
      card.addEventListener("click", function () {
        openTeacherDetail(t);
      });
      list.appendChild(card);
    });
    updateCoachQuote();
  }

  function openTeacherDetail(t) {
    currentTeacherDetail = t;
    var box = $("td-avatar");
    box.innerHTML = "";
    box.className = "player-avatar pd-avatar";
    if (t.avatar) {
      var img = document.createElement("img");
      img.src = t.avatar;
      img.alt = "";
      img.className = "player-avatar-img";
      box.appendChild(img);
    } else {
      box.textContent = String(t.id || "?").slice(0, 2).toUpperCase();
    }
    $("td-id").textContent = t.id;
    $("td-mode").textContent = "操作模式：" + t.mode.join(" / ");
    $("td-price").textContent = "教学价格：" + t.price + " 元/小时";

    var levelsEl = $("td-levels");
    levelsEl.innerHTML = "";
    groupChars(t).forEach(function (g) {
      var row = document.createElement("div");
      row.className = "pd-char-row";
      var rank = document.createElement("span");
      rank.className = "pd-rank";
      rank.textContent = g.rankLabel;
      var names = document.createElement("span");
      names.className = "pd-names";
      names.textContent = g.names.join("、");
      row.appendChild(rank);
      row.appendChild(names);
      levelsEl.appendChild(row);
    });

    $("td-characters").textContent = t.teachingChars.join("、");
    $("teacher-detail-modal").hidden = false;
  }

  /* 对练陪玩：目标段位筛选（不限 / 1800及以下 / 1800~2000 / 2000及以上） */
  function fillSparRankFilter() {
    var sel = $("spar-rank");
    sel.innerHTML = "";
    [
      { v: "", l: "不限" },
      { v: "le", l: "M" + SITE_CONFIG.sparRankThreshold + "及以下" },
      { v: "range", l: "M" + SITE_CONFIG.sparRankThreshold + "~" + SITE_CONFIG.sparRankThreshold2 },
      { v: "ge", l: "M" + SITE_CONFIG.sparRankThreshold2 + "及以上" }
    ].forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.v;
      opt.textContent = o.l;
      sel.appendChild(opt);
    });
  }

  /* ---------- 对练陪玩资料库 ---------- */
  var SPAR_EXTRA_KEY = "sf6_spar_players_extra";
  var extraPlayers = [];
  try {
    extraPlayers = JSON.parse(localStorage.getItem(SPAR_EXTRA_KEY) || "[]") || [];
  } catch (e) {
    extraPlayers = [];
  }

  function allSparPlayers() {
    return SITE_CONFIG.sparPlayers.concat(extraPlayers);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getSparRankFilter() {
    var v = $("spar-rank").value;
    if (v === "le") return { op: "le", threshold: SITE_CONFIG.sparRankThreshold };
    if (v === "range") return { op: "range", min: SITE_CONFIG.sparRankThreshold, max: SITE_CONFIG.sparRankThreshold2 };
    if (v === "ge") return { op: "ge", threshold: SITE_CONFIG.sparRankThreshold2 };
    return null;
  }

  function valueMatches(filter, v) {
    if (!filter) return true;
    if (filter.op === "le") return v <= filter.threshold;
    if (filter.op === "range") return v > filter.min && v <= filter.max;
    if (filter.op === "ge") return v >= filter.threshold;
    return true;
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
      return matchedChars.some(function (c) { return valueMatches(rankFilter, c.value); });
    }
    return true;
  }

  function matchedPlayerIds() {
    return allSparPlayers().filter(playerMatches).map(function (p) { return p.id; });
  }

  /* 按分段分组：同分段多个角色合并显示（如"多角色 M1800"） */
  function groupChars(player) {
    var groups = [];
    var map = {};
    var chars = player.characters || player.levels || [];
    chars.forEach(function (c) {
      var key = c.rankLabel;
      if (!map[key]) {
        map[key] = { rankLabel: key, value: c.value, names: [] };
        groups.push(map[key]);
      }
      map[key].names.push(c.name);
    });
    return groups;
  }

  var selectedSpar = null;
  var currentPlayerDetail = null;

  function renderSparPlayers() {
    var list = $("spar-player-list");
    var matched = allSparPlayers().filter(playerMatches);
    var title = $("player-list-title");
    if (title) title.textContent = "打手列表（匹配 " + matched.length + " 人）";
    var rankFilter = getSparRankFilter();
    if (matched.length === 0) {
      list.innerHTML = '<p class="player-empty">暂无匹配的打手，可联系客服咨询</p>';
      return;
    }
    if (!selectedSpar || matched.indexOf(selectedSpar) === -1) {
      selectedSpar = matched[0];
    }
    list.innerHTML = "";
    matched.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "player-card" + (selectedSpar === p ? " player-selected" : "");
      var avatar = escapeHtml(String(p.id || "?").slice(0, 2).toUpperCase());
      var groups = groupChars(p);
      var visible = groups.slice(0, 4);
      var extra = groups.length - visible.length;
      var chips = visible.map(function (g) {
        var label = g.names.length === 1 ? g.names[0] + " " + g.rankLabel : "多角色" + g.rankLabel;
        var cls = valueMatches(rankFilter, g.value) ? "chip chip-match" : "chip";
        return '<span class="' + cls + '">' + escapeHtml(label) + "</span>";
      }).join("");
      if (extra > 0) chips += '<span class="chip chip-more">+' + extra + "</span>";
      card.innerHTML =
        '<div class="player-avatar">' + (p.avatar ? '<img class="player-avatar-img" src="' + escapeHtml(p.avatar) + '" alt="">' : avatar) + "</div>" +
        '<div class="player-id">' + escapeHtml(p.id) + "</div>" +
        '<div class="player-mode">' + escapeHtml(p.mode.join(" / ")) + "</div>" +
        '<div class="player-chips">' + chips + "</div>" +
        '<div class="teacher-price">¥' + (p.price || SITE_CONFIG.sparPricePerHour) + "/小时</div>";
      card.addEventListener("click", function () {
        openPlayerDetail(p);
      });
      list.appendChild(card);
    });
  }

  /* ---------- 打手详情弹窗 ---------- */
  function openPlayerDetail(p) {
    currentPlayerDetail = p;
    var box = $("pd-avatar");
    box.innerHTML = "";
    box.className = "player-avatar pd-avatar";
    if (p.avatar) {
      var img = document.createElement("img");
      img.src = p.avatar;
      img.alt = "";
      img.className = "player-avatar-img";
      box.appendChild(img);
    } else {
      box.textContent = String(p.id || "?").slice(0, 2).toUpperCase();
    }

    $("pd-id").textContent = p.id;
    $("pd-mode").textContent = "操作模式：" + p.mode.join(" / ");
    $("pd-price").textContent = "对练价格：" + (p.price || SITE_CONFIG.sparPricePerHour) + " 元/小时";

    var charsEl = $("pd-chars");
    charsEl.innerHTML = "";
    groupChars(p).forEach(function (g) {
      var row = document.createElement("div");
      row.className = "pd-char-row";
      var rank = document.createElement("span");
      rank.className = "pd-rank";
      rank.textContent = g.rankLabel;
      var names = document.createElement("span");
      names.className = "pd-names";
      names.textContent = g.names.join("、");
      row.appendChild(rank);
      row.appendChild(names);
      charsEl.appendChild(row);
    });

    $("player-detail-modal").hidden = false;
  }

  /* ---------- 添加打手（本地录入） ---------- */
  function fillCharacterSelect(sel) {
    fillCharacters(sel);
  }

  function addCharRow(charName) {
    var wrap = $("p-chars");
    var row = document.createElement("div");
    row.className = "char-row";

    var sel = document.createElement("select");
    sel.className = "select p-char";
    fillCharacterSelect(sel);
    if (charName) sel.value = charName;

    var inp = document.createElement("input");
    inp.type = "number";
    inp.min = "0";
    inp.max = "2400";
    inp.className = "input p-rank";
    inp.placeholder = "M分";

    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn-remove";
    rm.textContent = "×";
    rm.addEventListener("click", function () { row.remove(); });

    row.appendChild(sel);
    row.appendChild(inp);
    row.appendChild(rm);
    wrap.appendChild(row);
  }

  function openPlayerModal() {
    $("p-id").value = "";
    $("p-mode").value = "经典";
    $("p-price").value = "";
    $("p-avatar").value = "";
    $("p-avatar-preview").hidden = true;
    $("p-avatar-file").value = "";
    $("p-chars").innerHTML = "";
    addCharRow("");
    $("player-modal").hidden = false;
  }

  function handleAvatarFile(file, inputId, previewId) {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      showModal("提示", "头像图片请小于 1.5MB");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      $(inputId).value = reader.result;
      var preview = $(previewId);
      preview.src = reader.result;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  function savePlayer() {
    var id = $("p-id").value.trim();
    if (!id) {
      showModal("提示", "请填写打手 ID");
      return;
    }
    var chars = [];
    $("p-chars").querySelectorAll(".char-row").forEach(function (row) {
      var raw = row.querySelector(".p-rank").value;
      if (!raw) return;
      var v = parseInt(raw, 10);
      if (!Number.isInteger(v) || v < 0 || v > 2400) return;
      chars.push({ name: row.querySelector(".p-char").value, rankLabel: "M" + v, value: v });
    });
    if (chars.length === 0) {
      showModal("提示", "请至少填一个角色的 M 分");
      return;
    }
    var price = parseInt($("p-price").value, 10);
    extraPlayers.push({
      id: id,
      mode: $("p-mode").value.split(","),
      characters: chars,
      price: Number.isInteger(price) && price > 0 ? price : SITE_CONFIG.sparPricePerHour,
      avatar: $("p-avatar").value.trim() || null
    });
    localStorage.setItem(SPAR_EXTRA_KEY, JSON.stringify(extraPlayers));
    $("player-modal").hidden = true;
    updateCopyConfigBtn();
    renderSparPlayers();
    updateSparQuote();
    showModal("提示", "已加入打手“" + id + "”。要同步到线上，点列表旁的“复制配置”把代码发给我，或自己粘贴到 js/config.js 后推送。");
  }

  function buildExtraCode() {
    var parts = extraPlayers.map(function (p) { return JSON.stringify(p, null, 2); });
    return "// 新增打手（粘贴到 js/config.js 的 sparPlayers 数组里，注意上一项末尾要加逗号）\n" + parts.join(",\n");
  }

  function updateCopyConfigBtn() {
    $("btn-copy-player-config").hidden = extraPlayers.length === 0;
  }

  /* ---------- 添加老师（本地录入） ---------- */
  function addTeacherLevelRow(charName) {
    var wrap = $("t-levels");
    var row = document.createElement("div");
    row.className = "char-row";
    var sel = document.createElement("select");
    sel.className = "select p-char";
    fillCharacterSelect(sel);
    if (charName) sel.value = charName;
    var inp = document.createElement("input");
    inp.type = "number";
    inp.min = "0";
    inp.max = "2400";
    inp.className = "input p-rank";
    inp.placeholder = "M分";
    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn-remove";
    rm.textContent = "×";
    rm.addEventListener("click", function () { row.remove(); });
    row.appendChild(sel);
    row.appendChild(inp);
    row.appendChild(rm);
    wrap.appendChild(row);
  }

  function addTeacherCharRow(charName) {
    var wrap = $("t-chars");
    var row = document.createElement("div");
    row.className = "char-row";
    var sel = document.createElement("select");
    sel.className = "select";
    fillCharacterSelect(sel);
    if (charName) sel.value = charName;
    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn-remove";
    rm.textContent = "×";
    rm.addEventListener("click", function () { row.remove(); });
    row.appendChild(sel);
    row.appendChild(rm);
    wrap.appendChild(row);
  }

  function openTeacherModal() {
    $("t-id").value = "";
    $("t-mode").value = "经典";
    $("t-price").value = "";
    $("t-avatar").value = "";
    $("t-avatar-preview").hidden = true;
    $("t-avatar-file").value = "";
    $("t-levels").innerHTML = "";
    $("t-chars").innerHTML = "";
    addTeacherLevelRow("");
    addTeacherCharRow("");
    $("teacher-modal").hidden = false;
  }

  function saveTeacher() {
    var id = $("t-id").value.trim();
    if (!id) {
      showModal("提示", "请填写老师 ID / 称呼");
      return;
    }
    var price = parseInt($("t-price").value, 10);
    if (!Number.isInteger(price) || price <= 0) {
      showModal("提示", "请填写正确的教学价格（元/小时）");
      return;
    }
    var levels = [];
    $("t-levels").querySelectorAll(".char-row").forEach(function (row) {
      var raw = row.querySelector(".p-rank").value;
      if (!raw) return;
      var v = parseInt(raw, 10);
      if (!Number.isInteger(v) || v < 0 || v > 2400) return;
      levels.push({ name: row.querySelector(".p-char").value, rankLabel: "M" + v, value: v });
    });
    if (levels.length === 0) {
      showModal("提示", "请至少填一个角色水平（角色 + M分）");
      return;
    }
    var teachingChars = [];
    $("t-chars").querySelectorAll(".char-row .select").forEach(function (sel) {
      var v = sel.value;
      if (v && teachingChars.indexOf(v) === -1) teachingChars.push(v);
    });
    if (teachingChars.length === 0) {
      showModal("提示", "请至少填一个教学角色");
      return;
    }
    extraTeachers.push({
      id: id,
      mode: $("t-mode").value.split(","),
      levels: levels,
      teachingChars: teachingChars,
      price: price,
      avatar: $("t-avatar").value.trim() || null
    });
    localStorage.setItem(TEACHER_EXTRA_KEY, JSON.stringify(extraTeachers));
    $("teacher-modal").hidden = true;
    updateCopyTeacherBtn();
    renderCoachTeachers();
    showModal("提示", "已加入老师“" + id + "”。要同步到线上，点列表旁的“复制配置”把代码发给我，或自己粘贴到 js/config.js 后推送。");
  }

  function buildTeacherExtraCode() {
    var parts = extraTeachers.map(function (t) { return JSON.stringify(t, null, 2); });
    return "// 新增老师（粘贴到 js/config.js 的 coachTeachers 数组里，注意上一项末尾要加逗号）\n" + parts.join(",\n");
  }

  function updateCopyTeacherBtn() {
    $("btn-copy-teacher-config").hidden = extraTeachers.length === 0;
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
  function updateCoachQuote() {
    var priceEl = $("coach-price");
    var detailEl = $("coach-detail");
    var btn = $("btn-order-coach");

    lastErrorKey.coach = null;
    detailEl.classList.remove("error");
    if (!selectedCoach) {
      priceEl.textContent = "--";
      detailEl.textContent = "暂无老师，请联系客服";
      btn.disabled = true;
      return;
    }
    var hours = parseInt($("coach-hours").value, 10);
    $("coach-selected").textContent = selectedCoach.id + "（" + selectedCoach.price + " 元/小时）";
    priceEl.textContent = "¥" + hours * selectedCoach.price;
    detailEl.textContent = selectedCoach.id + " ｜ " + selectedCoach.price + " 元/小时 × " + hours + " 小时";
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
    if (!selectedSpar) {
      priceEl.textContent = "--";
      detailEl.textContent = "暂无匹配陪玩，请联系客服";
      btn.disabled = true;
      return;
    }
    var rate = selectedSpar.price || SITE_CONFIG.sparPricePerHour;
    priceEl.textContent = "¥" + hours * rate;
    detailEl.textContent = selectedSpar.id + " ｜ " + rate + " 元/小时 × " + hours + " 小时" +
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
      if (!selectedCoach) return "";
      var coachHours = parseInt($("coach-hours").value, 10);
      return "【街霸6游戏教学】老师：" + selectedCoach.id +
        " ｜ 教学角色：" + selectedCoach.teachingChars.join("、") +
        " ｜ 时长：" + coachHours + "小时" +
        " ｜ 教学价格：" + selectedCoach.price + " 元/小时" +
        " ｜ 预估价格：" + coachHours * selectedCoach.price + " 元";
    }

    if (activeTab === "spar") {
      var sparRank = $("spar-rank").value ? $("spar-rank").selectedOptions[0].textContent : "不限";
      var sparChar = $("spar-char").value ? $("spar-char").selectedOptions[0].textContent : "不限";
      var ids = matchedPlayerIds();
      var sparRate = selectedSpar ? (selectedSpar.price || SITE_CONFIG.sparPricePerHour) : SITE_CONFIG.sparPricePerHour;
      return "【街霸6对练陪玩】时长：" + $("spar-hours").value + "小时" +
        " ｜ 操作模式：" + $("spar-mode").value +
        " ｜ 角色：" + sparChar +
        " ｜ 目标段位：" + sparRank +
        " ｜ 匹配陪玩：" + (ids.length ? ids.join("、") : "暂无") +
        (selectedSpar ? " ｜ 当前选择：" + selectedSpar.id : "") +
        " ｜ 预估价格：" + parseInt($("spar-hours").value, 10) * sparRate + " 元";
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

    $("coach-hours").addEventListener("change", updateCoachQuote);
    $("coach-char-filter").addEventListener("change", renderCoachTeachers);
    $("btn-add-teacher").addEventListener("click", openTeacherModal);
    $("btn-add-tlevel").addEventListener("click", function () { addTeacherLevelRow(""); });
    $("btn-add-tchar").addEventListener("click", function () { addTeacherCharRow(""); });
    $("t-cancel").addEventListener("click", function () { $("teacher-modal").hidden = true; });
    $("t-save").addEventListener("click", saveTeacher);
    $("teacher-modal").addEventListener("click", function (e) {
      if (e.target === $("teacher-modal")) $("teacher-modal").hidden = true;
    });
    $("t-avatar-file").addEventListener("change", function () {
      handleAvatarFile(this.files && this.files[0], "t-avatar", "t-avatar-preview");
    });
    $("td-select").addEventListener("click", function () {
      if (currentTeacherDetail) selectedCoach = currentTeacherDetail;
      $("teacher-detail-modal").hidden = true;
      renderCoachTeachers();
      var quote = document.querySelector('#tab-coach .quote');
      if (quote) quote.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    $("td-close").addEventListener("click", function () { $("teacher-detail-modal").hidden = true; });
    $("teacher-detail-modal").addEventListener("click", function (e) {
      if (e.target === $("teacher-detail-modal")) $("teacher-detail-modal").hidden = true;
    });
    $("btn-copy-teacher-config").addEventListener("click", function () {
      copyText(buildTeacherExtraCode(), $("btn-copy-teacher-config"), "已复制 ✓");
    });

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

    $("btn-add-player").addEventListener("click", openPlayerModal);
    $("btn-add-char").addEventListener("click", function () { addCharRow(""); });
    $("p-cancel").addEventListener("click", function () { $("player-modal").hidden = true; });
    $("p-save").addEventListener("click", savePlayer);
    $("player-modal").addEventListener("click", function (e) {
      if (e.target === $("player-modal")) $("player-modal").hidden = true;
    });
    $("btn-copy-player-config").addEventListener("click", function () {
      copyText(buildExtraCode(), $("btn-copy-player-config"), "已复制 ✓");
    });
    $("p-avatar-file").addEventListener("change", function () {
      handleAvatarFile(this.files && this.files[0], "p-avatar", "p-avatar-preview");
    });
    $("pd-close").addEventListener("click", function () { $("player-detail-modal").hidden = true; });
    $("pd-select").addEventListener("click", function () {
      if (currentPlayerDetail) selectedSpar = currentPlayerDetail;
      $("player-detail-modal").hidden = true;
      renderSparPlayers();
      var quote = document.querySelector('#tab-spar .quote');
      if (quote) quote.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    $("player-detail-modal").addEventListener("click", function (e) {
      if (e.target === $("player-detail-modal")) $("player-detail-modal").hidden = true;
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    fillRanks($("cur-rank"), true);
    fillTargetRanks();
    fillStars($("cur-star"));
    fillStars($("tgt-star"));
    fillCharacters($("boost-char"));
    fillSparCharacters();
    fillCoachCharFilter();
    fillSparRankFilter();
    updateCopyConfigBtn();
    updateCopyTeacherBtn();

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
    renderSparPlayers();
    updateSparQuote();
    renderCoachTeachers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
