// 模組 M2｜負責模型: Claude Opus 4.8
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // localStorage keys（DOM 契約，M8 整合時不得變動）
  // ---------------------------------------------------------------------------
  var STORAGE_KEY = "claude_academy_progress_v1";
  var OPEN_KEY = "claude_academy_open_chapters_v1";

  // ---------------------------------------------------------------------------
  // 安全儲存層
  //   Safari 私密模式下 localStorage 的存取（甚至只是讀取）可能 throw；
  //   內容也可能被外部污染成損毀 JSON。任何一種情況都不能讓整段 script 掛掉，
  //   而是「退化為記憶體內運作」：功能照常，只是重整後不保存。
  //   我們用一次性探測決定 storage 是否可用，之後所有讀寫都走這層封裝。
  // ---------------------------------------------------------------------------
  var storageOK = (function probe() {
    try {
      var k = "__academy_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      // SecurityError / QuotaExceededError / localStorage 為 undefined 皆歸此
      return false;
    }
  })();

  function loadJSON(key) {
    // 回傳一個「乾淨的物件」。任何失敗（storage 不可用、值為 null、
    // JSON.parse throw、parse 出來不是物件）都退化成 {}，絕不 throw。
    if (!storageOK) return {};
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      // 防禦：損毀資料可能 parse 成陣列、字串、null。只接受純物件。
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  function saveJSON(key, value) {
    // storage 不可用時靜默略過（記憶體內的 state 仍是唯一真實來源）。
    if (!storageOK) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 寫入期間才失敗（如配額）→ 當作記憶體模式，往後不再嘗試以免噪音。
      storageOK = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 記憶體內 state（storage 只是它的鏡像，不是它的來源）
  // ---------------------------------------------------------------------------
  var progress = loadJSON(STORAGE_KEY); // { "5.1": true, ... }
  var openChapters = loadJSON(OPEN_KEY); // { "05": true, ... }

  // totalLessons 一律由 DOM 推導，永不寫死（強化要求 1）。
  // 用函式包裝以便測試鉤子能在 DOM 變動後重新計算。
  function countLessons() {
    return document.querySelectorAll(".progress-check").length;
  }
  var totalLessons = countLessons();

  // ---------------------------------------------------------------------------
  // 章節折疊：狀態記憶 + 點擊切換
  //   缺少 nav 時（M8 尚未生成 sidebar）整個功能靜默停用，不報錯。
  // ---------------------------------------------------------------------------
  var navChapters = document.querySelectorAll(".nav-chapter");

  navChapters.forEach(function (ch) {
    // 還原記憶狀態；data-ch 缺失時以空字串當 key，不會 throw。
    if (openChapters[ch.dataset.ch]) ch.dataset.open = "true";
  });

  document.querySelectorAll(".nav-ch-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ch = btn.parentElement;
      if (!ch) return; // 防禦：理論上 toggle 一定有父層，但不假設
      var isOpen = ch.dataset.open === "true";
      var next = !isOpen;
      ch.dataset.open = next ? "true" : "false";
      btn.setAttribute("aria-expanded", String(next));
      openChapters[ch.dataset.ch] = next;
      saveJSON(OPEN_KEY, openChapters);
    });
  });

  // 讓某課所屬章節展開（供 hash 導航使用）。
  // data-ch 是零補位（"05"）而 data-lid 章節段不是（"5.1"），兩者不能直接前綴比對，
  // 因此改以「哪個 nav-chapter 內含此 lesson 連結」來反查，最可靠。
  function expandChapterForLid(lid) {
    var linkSelector = '.nav-lessons a[data-lid="' + cssAttr(lid) + '"]';
    navChapters.forEach(function (ch) {
      if (ch.querySelector(linkSelector)) {
        ch.dataset.open = "true";
        var btn = ch.querySelector(".nav-ch-toggle");
        if (btn) btn.setAttribute("aria-expanded", "true");
        if (ch.dataset.ch) openChapters[ch.dataset.ch] = true;
      }
    });
    saveJSON(OPEN_KEY, openChapters);
  }

  // 轉義屬性選擇器中的引號類字元，避免像含引號的 lid 破壞選擇器。
  function cssAttr(v) {
    return String(v).replace(/["\\]/g, "\\$&");
  }

  // ---------------------------------------------------------------------------
  // 進度：單一 applyProgress() 收斂（強化要求 6）
  //   checkbox / article.done / nav a.done / 進度條與計數，
  //   任何路徑（初始化、勾選、測試鉤子）都只透過這裡刷新，四者絕不失同步。
  // ---------------------------------------------------------------------------
  var progressCountEl = document.getElementById("progress-count");
  var progressBarEl = document.getElementById("progress-bar-fill");

  function applyProgress() {
    var count = 0;
    document.querySelectorAll(".progress-check").forEach(function (cb) {
      var lid = cb.dataset.lid;
      var done = !!progress[lid];
      cb.checked = done;

      // 用 getElementById 而非 querySelector：id 形如 "L5.1" 含點，
      // 當成 CSS 選擇器會被誤解析為 class，getElementById 則按字面比對。
      var article = document.getElementById("L" + lid);
      if (article) article.classList.toggle("done", done);

      var link = document.querySelector(
        '.nav-lessons a[data-lid="' + cssAttr(lid) + '"]'
      );
      if (link) link.classList.toggle("done", done);

      if (done) count++;
    });

    // UI 元素可能缺席（整合前）：各自 guard，缺哪個就停用哪個，不連坐。
    if (progressCountEl) progressCountEl.textContent = String(count);
    if (progressBarEl) {
      var pct = totalLessons > 0 ? (count / totalLessons) * 100 : 0;
      progressBarEl.style.width = pct + "%";
    }
    return count;
  }

  applyProgress();

  document.querySelectorAll(".progress-check").forEach(function (cb) {
    cb.addEventListener("change", function () {
      var lid = cb.dataset.lid;
      if (cb.checked) progress[lid] = true;
      else delete progress[lid];
      saveJSON(STORAGE_KEY, progress);
      applyProgress(); // 收斂：不手動改 UI，一律走單一入口
    });
  });

  // ---------------------------------------------------------------------------
  // 全文即時搜尋：debounce ~120ms + IME 組字保護（強化要求 4）
  //   組字（compositionstart→end）期間注音/拼音的中間態會連續觸發 input，
  //   若照跑會過濾到一堆殘缺字。故組字期間完全跳過，compositionend 後補跑一次。
  // ---------------------------------------------------------------------------
  var searchInput = document.getElementById("search");
  var searchEmpty = document.getElementById("search-empty");

  if (searchInput) {
    var composing = false;
    var debounceTimer = null;

    function runFilter() {
      var q = searchInput.value.trim().toLowerCase();
      var anyMatch = false;

      document.querySelectorAll(".chapter").forEach(function (chSec) {
        var chMatch = false;
        chSec.querySelectorAll(".lesson").forEach(function (les) {
          if (!q) {
            // 空查詢 = 全部還原可見
            les.classList.remove("hidden");
            chMatch = true;
            return;
          }
          var match = les.textContent.toLowerCase().indexOf(q) !== -1;
          les.classList.toggle("hidden", !match);
          if (match) chMatch = true;
        });
        // 章節沒有任何命中課程時整章收起（僅在有查詢字時）
        chSec.classList.toggle("hidden", !!q && !chMatch);
        if (chMatch) anyMatch = true;
      });

      // #search-empty 可能不存在 → guard
      if (searchEmpty) {
        searchEmpty.style.display = q && !anyMatch ? "block" : "none";
      }
    }

    function scheduleFilter() {
      if (composing) return; // 組字中：一律不過濾
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 120);
    }

    searchInput.addEventListener("input", scheduleFilter);
    searchInput.addEventListener("compositionstart", function () {
      composing = true;
    });
    searchInput.addEventListener("compositionend", function () {
      composing = false;
      // 組字結束才是「一個完整字」落定，立即補跑一次（不等 debounce，體感較跟手）
      if (debounceTimer) clearTimeout(debounceTimer);
      runFilter();
    });
  }

  // ---------------------------------------------------------------------------
  // 導航：hash 解析與捲動（強化要求 3、5）
  // ---------------------------------------------------------------------------
  // 是否偏好減少動態：respect prefers-reduced-motion，關閉 smooth。
  var prefersReduced = (function () {
    try {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (e) {
      return false;
    }
  })();

  // 從 hash 解析出「有效」的 lid，否則回 null。
  //   有效 = 形如 #L{章}.{課} 且該課實際存在於 DOM。
  //   #L99.9（格式對但不存在）、#foo、#、空字串 → 一律 null（靜默忽略）。
  function lidFromHash(hash) {
    if (!hash || hash.charAt(0) !== "#") return null;
    var m = /^#L(\d+\.\d+)$/.exec(hash);
    if (!m) return null;
    var lid = m[1];
    // 以元素存在與否作為最終真值來源，而非只信正則
    if (!document.getElementById("L" + lid)) return null;
    return lid;
  }

  function markActiveNav(lid) {
    var links = document.querySelectorAll(".nav-lessons a");
    links.forEach(function (x) {
      x.classList.remove("active");
    });
    if (lid == null) return;
    var active = document.querySelector(
      '.nav-lessons a[data-lid="' + cssAttr(lid) + '"]'
    );
    if (active) active.classList.add("active");
  }

  // 導航到某 lid：展開章節 → 標記 nav → 捲動。smooth 可切換（初載入通常不 smooth）。
  function navigateToLid(lid, smooth) {
    if (lid == null) return;
    expandChapterForLid(lid);
    markActiveNav(lid);
    var el = document.getElementById("L" + lid);
    if (!el) return;
    var behavior = !smooth || prefersReduced ? "auto" : "smooth";
    // 章節剛展開會改變版面高度，用 rAF 等一次重排後再捲動，落點才準確。
    requestAnimationFrame(function () {
      try {
        el.scrollIntoView({ behavior: behavior, block: "start" });
      } catch (e) {
        // 舊版瀏覽器不支援物件參數 → 退回無參數版本
        el.scrollIntoView();
      }
    });
  }

  // nav 連結點擊：平滑捲動 + pushState + active 標記（強化要求，等價參考頁）
  document.querySelectorAll(".nav-lessons a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href) return;
      var lid = lidFromHash(href);
      if (lid == null) return; // 指向不存在的課 → 交回瀏覽器預設，不攔截
      e.preventDefault();
      // 先更新網址（pushState 不觸發 hashchange，故手動接續導航）
      try {
        history.pushState(null, "", href);
      } catch (err) {
        // 某些沙箱/file:// 下 pushState 可能受限 → 退回直接設 hash
        location.hash = href;
      }
      navigateToLid(lid, true);
    });
  });

  // 使用者手動改網址列 / 上一頁下一頁 → hashchange
  window.addEventListener("hashchange", function () {
    var lid = lidFromHash(location.hash);
    if (lid == null) {
      markActiveNav(null); // 導到無效 hash：清掉 active，但不跳動、不報錯
      return;
    }
    navigateToLid(lid, true);
  });

  // ---------------------------------------------------------------------------
  // 初始狀態
  // ---------------------------------------------------------------------------
  (function initEntry() {
    var lid = lidFromHash(location.hash);
    if (lid != null) {
      // 有效初始 hash：展開對應章節 + 捲動 + 標記（初載入用瞬間捲動，不搶戲）
      navigateToLid(lid, false);
      return;
    }
    // 無有效 hash 且沒有任何記憶的展開狀態 → 首次進站展開第一章
    if (Object.keys(openChapters).length === 0) {
      var first = document.querySelector(".nav-chapter");
      if (first) {
        first.dataset.open = "true";
        var btn = first.querySelector(".nav-ch-toggle");
        if (btn) btn.setAttribute("aria-expanded", "true");
        if (first.dataset.ch) openChapters[first.dataset.ch] = true;
        saveJSON(OPEN_KEY, openChapters);
      }
    }
  })();

  // ---------------------------------------------------------------------------
  // 選配測試鉤子：唯讀狀態存取 + 重新計算（不洩漏可寫入的內部參考）
  // ---------------------------------------------------------------------------
  try {
    Object.defineProperty(window, "__academy", {
      value: Object.freeze({
        // 重新推導 totalLessons 並刷新 UI（DOM 動態變動後可呼叫）
        recount: function () {
          totalLessons = countLessons();
          return applyProgress();
        },
        // 進度狀態唯讀快照（複製，外部改動不影響內部 state）
        get progress() {
          return Object.assign({}, progress);
        },
        get totalLessons() {
          return totalLessons;
        },
        get storageAvailable() {
          return storageOK;
        }
      }),
      writable: false,
      configurable: false
    });
  } catch (e) {
    // window 唯讀或屬性已存在時，測試鉤子失敗不影響任何正式功能
  }
})();
