// 模組 M6｜負責模型: Claude Sonnet 5
//
// 零依賴 Node 結構驗證腳本。
// 用法：node tests/validate.mjs [path-to-index.html]
//   --lenient / 環境變數 AC_LENIENT=1  → 跳過「課綱 40 課全清單完全一致」檢查，
//   方便用小型 fixture（只有 2-3 課）測試其餘 7 條斷言。正式驗證請勿加旗標。

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// 0. 參數解析
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawArgs = process.argv.slice(2);
const LENIENT = rawArgs.includes("--lenient") || process.env.AC_LENIENT === "1";
const positional = rawArgs.find((a) => !a.startsWith("--"));

const htmlPath = positional
  ? path.resolve(process.cwd(), positional)
  : path.resolve(__dirname, "..", "index.html");

if (!fs.existsSync(htmlPath)) {
  console.error(`找不到檔案: ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");

// ---------------------------------------------------------------------------
// 1. 共用工具
// ---------------------------------------------------------------------------

const errors = [];
function fail(assertionNo, msg) {
  errors.push(`[斷言${assertionNo}] ${msg}`);
}

/** 解出標籤字串中的某個屬性值（不假設屬性順序）。 */
function getAttr(tagAttrs, name) {
  const re = new RegExp(`(?:^|\\s)${name}="([^"]*)"`);
  const m = re.exec(tagAttrs);
  return m ? m[1] : null;
}

/** 去除 HTML 標籤（保留內文字元）。用於模擬 textContent 的第一步。 */
function stripTags(s) {
  return s.replace(/<[^>]*>/g, "");
}

/** 只還原 &lt; &gt; &amp; 三種 entity（SPEC 4 只要求這三種）。 */
function decodeEntities(s) {
  return s.replace(/&lt;|&gt;|&amp;/g, (m) => ({ "&lt;": "<", "&gt;": ">", "&amp;": "&" }[m]));
}

/** 模擬 el.textContent：去標籤 → 解 entity → trim。 */
function textContent(s) {
  return decodeEntities(stripTags(s)).trim();
}

// ---------------------------------------------------------------------------
// 2. 課綱權威清單（SPEC 第 2 節，寫死作為期望值）
// ---------------------------------------------------------------------------

const EXPECTED_LIDS = [];
for (let ch = 1; ch <= 10; ch++) {
  for (let lesson = 1; lesson <= 4; lesson++) {
    EXPECTED_LIDS.push(`${ch}.${lesson}`);
  }
}
const EXPECTED_LID_SET = new Set(EXPECTED_LIDS);

const stats = {};

// ---------------------------------------------------------------------------
// 3. 抽取所有 <article class="lesson">…</article>（不巢狀，非貪婪安全）
// ---------------------------------------------------------------------------

const articleRe = /<article\b([^>]*)>([\s\S]*?)<\/article>/g;
const lessons = [];
let am;
while ((am = articleRe.exec(html)) !== null) {
  const attrs = am[1];
  const body = am[2];
  const cls = getAttr(attrs, "class") || "";
  if (!/\blesson\b/.test(cls)) continue; // 理論上只有 lesson 會用 <article>，保守起見仍檢查
  lessons.push({
    id: getAttr(attrs, "id"),
    lid: getAttr(attrs, "data-lid"),
    body,
    raw: am[0],
  });
}
stats.articleCount = lessons.length;

// ---------------------------------------------------------------------------
// 斷言 1：40 個 <article class="lesson">，data-lid 與 SPEC 課綱完全一致且無重複
// ---------------------------------------------------------------------------

{
  const foundLids = lessons.map((l) => l.lid);
  const seen = new Map();
  const dupes = new Set();
  for (const lid of foundLids) {
    if (lid === null) continue;
    seen.set(lid, (seen.get(lid) || 0) + 1);
    if (seen.get(lid) > 1) dupes.add(lid);
  }

  lessons.forEach((l, i) => {
    if (!l.lid) fail(1, `第 ${i + 1} 個 <article class="lesson"> 缺少 data-lid 屬性`);
    else if (!/^\d{1,2}\.\d$/.test(l.lid)) fail(1, `data-lid="${l.lid}" 格式不正確（應為 {章}.{課}）`);
    else if (!EXPECTED_LID_SET.has(l.lid)) fail(1, `data-lid="${l.lid}" 不在課綱權威清單內`);
  });

  if (dupes.size > 0) {
    fail(1, `data-lid 重複: ${[...dupes].sort().join(", ")}`);
  }

  if (!LENIENT) {
    if (lessons.length !== 40) {
      fail(1, `<article class="lesson"> 數量應為 40，實際 ${lessons.length}`);
    }
    const foundSet = new Set(foundLids);
    const missing = EXPECTED_LIDS.filter((lid) => !foundSet.has(lid));
    if (missing.length > 0) {
      fail(1, `課綱清單中缺少以下 lid: ${missing.join(", ")}`);
    }
  }

  stats.uniqueLidCount = new Set(foundLids.filter(Boolean)).size;
  stats.duplicateLidCount = dupes.size;
}

// ---------------------------------------------------------------------------
// 斷言 2：nav 連結 a[data-lid] 與 article id="L{lid}" 互相對應
// ---------------------------------------------------------------------------

{
  const navLids = [];
  const aTagRe = /<a\b([^>]*)>/g;
  let m;
  while ((m = aTagRe.exec(html)) !== null) {
    const attrs = m[1];
    const dataLid = getAttr(attrs, "data-lid");
    const href = getAttr(attrs, "href");
    if (dataLid !== null && href !== null && /^#L/.test(href)) {
      navLids.push({ dataLid, href });
    }
  }

  navLids.forEach(({ dataLid, href }) => {
    const expectedHref = `#L${dataLid}`;
    if (href !== expectedHref) {
      fail(2, `nav 連結 href="${href}" 與 data-lid="${dataLid}" 不一致（應為 ${expectedHref}）`);
    }
  });

  const navLidSet = new Set(navLids.map((n) => n.dataLid));
  const articleLidMap = new Map(); // lid -> id
  lessons.forEach((l) => {
    if (l.lid) articleLidMap.set(l.lid, l.id);
  });

  for (const lid of navLidSet) {
    const expectedId = `L${lid}`;
    if (!articleLidMap.has(lid)) {
      fail(2, `nav 連結 data-lid="${lid}" 找不到對應的 <article id="${expectedId}">`);
    } else if (articleLidMap.get(lid) !== expectedId) {
      fail(2, `課 ${lid} 的 <article id> 應為 "${expectedId}"，實際 "${articleLidMap.get(lid)}"`);
    }
  }
  for (const lid of articleLidMap.keys()) {
    if (!navLidSet.has(lid)) {
      fail(2, `<article data-lid="${lid}"> 找不到對應的 nav 連結 a[data-lid="${lid}"]`);
    }
  }

  stats.navLinkCount = navLids.length;
}

// ---------------------------------------------------------------------------
// 逐課解析：斷言 3（lesson-section 順序）、5（qa/hint 數量），
// 並蒐集斷言 4（qa/answer/opt）所需的 qa 區塊。
// ---------------------------------------------------------------------------

const EXPECTED_SECTION_TITLES = ["讀一讀", "重點整理", "練習題"];
let totalQaCount = 0;
let totalHintCount = 0;
let totalAnswerCheckedCount = 0;

for (const lesson of lessons) {
  const lid = lesson.lid || "(缺 data-lid)";
  const body = lesson.body;

  // --- 斷言 3 ---
  const sectionDivCount = (body.match(/<div class="lesson-section">/g) || []).length;
  const titles = [];
  const titleRe = /<div class="lesson-section">\s*<h4 class="section-title">([\s\S]*?)<\/h4>/g;
  let tm;
  while ((tm = titleRe.exec(body)) !== null) {
    titles.push(textContent(tm[1]));
  }

  if (sectionDivCount !== 3) {
    fail(3, `課 ${lid}: 應恰有 3 個 lesson-section，實際 ${sectionDivCount} 個`);
  }
  if (titles.length !== sectionDivCount) {
    fail(3, `課 ${lid}: 有 lesson-section 缺少對應的 <h4 class="section-title">（找到 ${titles.length}/${sectionDivCount} 個標題）`);
  }
  const titlesToCompare = titles.slice(0, 3);
  const orderOk =
    titlesToCompare.length === 3 &&
    titlesToCompare.every((t, i) => t === EXPECTED_SECTION_TITLES[i]);
  if (!orderOk) {
    fail(
      3,
      `課 ${lid}: lesson-section 標題順序應為 [${EXPECTED_SECTION_TITLES.join(", ")}]，實際 [${titlesToCompare.join(", ")}]`
    );
  }

  // --- 斷言 5：至少 1 個 .qa、至少 1 個 .hint ---
  const qaCount = (body.match(/<div class="qa">/g) || []).length;
  const hintCount = (body.match(/<div class="hint(?: (?:warn|stop))?">/g) || []).length;
  totalQaCount += qaCount;
  totalHintCount += hintCount;

  if (qaCount < 1) fail(5, `課 ${lid}: 至少要有 1 個 .qa，實際 0 個`);
  if (hintCount < 1) fail(5, `課 ${lid}: 至少要有 1 個 .hint，實際 0 個`);

  // --- 斷言 4：qa 內 answer 與 opt 逐字相等（去 ✅ 前綴、entity 正規化） ---
  const qaBlockRe = /<div class="qa">((?:<div class="(?:qtext|opt|answer)">[\s\S]*?<\/div>)+)<\/div>/g;
  let qm;
  let qaIndex = 0;
  while ((qm = qaBlockRe.exec(body)) !== null) {
    qaIndex++;
    const inner = qm[1];
    const childRe = /<div class="(qtext|opt|answer)">([\s\S]*?)<\/div>/g;
    const opts = [];
    const answers = [];
    let cm;
    while ((cm = childRe.exec(inner)) !== null) {
      const type = cm[1];
      const text = textContent(cm[2]);
      if (type === "opt") opts.push(text);
      if (type === "answer") answers.push(text);
    }

    if (answers.length !== 1) {
      fail(4, `課 ${lid} QA#${qaIndex}: 應恰有 1 個 .answer，實際 ${answers.length} 個`);
      continue;
    }

    totalAnswerCheckedCount++;
    const answerRaw = answers[0];
    const answerStripped = answerRaw.replace(/^✅\s*/, "").trim();
    if (answerStripped === answerRaw.trim()) {
      fail(4, `課 ${lid} QA#${qaIndex}: answer「${answerRaw}」缺少開頭「✅ 」前綴`);
    }
    const matched = opts.some((opt) => opt === answerStripped);
    if (!matched) {
      fail(
        4,
        `課 ${lid} QA#${qaIndex}: answer 去除前綴後為「${answerStripped}」，在 opt 清單 [${opts
          .map((o) => `「${o}」`)
          .join(", ")}] 中找不到逐字相符項`
      );
    }
  }

  // 用 qa div 出現次數與 qa block regex 命中次數比對，抓出結構異常（如 answer 缺失整包不成對）的 qa
  if (qaIndex !== qaCount) {
    fail(
      4,
      `課 ${lid}: 偵測到 ${qaCount} 個 .qa 開始標籤，但只能完整解析 ${qaIndex} 個（可能有 qtext/opt/answer 標籤缺漏或損毀）`
    );
  }
}

stats.totalQaCount = totalQaCount;
stats.totalHintCount = totalHintCount;
stats.totalAnswerCheckedCount = totalAnswerCheckedCount;

// ---------------------------------------------------------------------------
// 斷言 6：id 全域唯一；<article>/</article>、<section>/</section> 數量成對
// ---------------------------------------------------------------------------

{
  const idRe = /\bid="([^"]*)"/g;
  const idMap = new Map();
  let im;
  while ((im = idRe.exec(html)) !== null) {
    const id = im[1];
    idMap.set(id, (idMap.get(id) || 0) + 1);
  }
  const dupIds = [...idMap.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  if (dupIds.length > 0) {
    fail(6, `id 重複: ${dupIds.join(", ")}`);
  }
  stats.totalIdCount = idMap.size;

  const openArticle = (html.match(/<article[\s>]/g) || []).length;
  const closeArticle = (html.match(/<\/article>/g) || []).length;
  if (openArticle !== closeArticle) {
    fail(6, `<article> 開始標籤 ${openArticle} 個，</article> 結束標籤 ${closeArticle} 個，數量不成對`);
  }

  const openSection = (html.match(/<section[\s>]/g) || []).length;
  const closeSection = (html.match(/<\/section>/g) || []).length;
  if (openSection !== closeSection) {
    fail(6, `<section> 開始標籤 ${openSection} 個，</section> 結束標籤 ${closeSection} 個，數量不成對`);
  }

  stats.articleTagPairs = openArticle;
  stats.sectionTagPairs = openSection;
}

// ---------------------------------------------------------------------------
// 斷言 7：pre.code 內不得出現未轉義的 <（除 &lt; 之外不應含 < 字元）
// ---------------------------------------------------------------------------

{
  const preRe = /<pre class="code">([\s\S]*?)<\/pre>/g;
  let pm;
  let preIndex = 0;
  let preCount = 0;
  while ((pm = preRe.exec(html)) !== null) {
    preIndex++;
    preCount++;
    const content = pm[1];
    if (content.includes("<")) {
      const snippetIdx = content.indexOf("<");
      const snippet = content.slice(Math.max(0, snippetIdx - 20), snippetIdx + 20).replace(/\n/g, "\\n");
      fail(7, `第 ${preIndex} 個 <pre class="code"> 內含未轉義的 "<" 字元（附近內容: "...${snippet}..."）`);
    }
  }
  stats.preCodeCount = preCount;
}

// ---------------------------------------------------------------------------
// 斷言 8：#progress-count、#progress-bar-fill、#search、#search-empty 存在
// ---------------------------------------------------------------------------

{
  const requiredIds = ["progress-count", "progress-bar-fill", "search", "search-empty"];
  for (const id of requiredIds) {
    const re = new RegExp(`\\bid="${id}"`);
    if (!re.test(html)) {
      fail(8, `找不到必要元素 id="${id}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. 結果輸出
// ---------------------------------------------------------------------------

if (errors.length === 0) {
  console.log("PASS 全部斷言通過");
  console.log(`檔案: ${htmlPath}`);
  if (LENIENT) console.log("模式: --lenient（跳過課綱 40 課全清單檢查，僅供 fixture 測試使用）");
  console.log("--- 統計摘要 ---");
  console.log(`article(lesson) 數量: ${stats.articleCount}`);
  console.log(`不重複 data-lid 數量: ${stats.uniqueLidCount}`);
  console.log(`nav 連結數量: ${stats.navLinkCount}`);
  console.log(`.qa 總數: ${stats.totalQaCount}`);
  console.log(`成功比對 answer/opt 的 qa 數: ${stats.totalAnswerCheckedCount}`);
  console.log(`.hint 總數: ${stats.totalHintCount}`);
  console.log(`全域 id 數量（不重複）: ${stats.totalIdCount}`);
  console.log(`<article> 標籤配對數: ${stats.articleTagPairs}`);
  console.log(`<section> 標籤配對數: ${stats.sectionTagPairs}`);
  console.log(`<pre class="code"> 區塊數: ${stats.preCodeCount}`);
  process.exit(0);
} else {
  console.error(`FAIL 共 ${errors.length} 個錯誤`);
  console.error(`檔案: ${htmlPath}`);
  if (LENIENT) console.error("模式: --lenient（跳過課綱 40 課全清單檢查）");
  console.error("");
  errors.forEach((e, i) => console.error(`${i + 1}. ${e}`));
  process.exit(1);
}
