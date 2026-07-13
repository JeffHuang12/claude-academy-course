// 模組 M9｜負責模型: Claude Fable 5（orchestrator — Obsidian vault 生成器）
// 用法：node vault-build.mjs
// 從 src/content/*.html 解析 40 課，生成 vault/（Obsidian 知識庫）：
//   vault/Home.md + vault/{NN 章標題}/{lid 課標題}.md
// 課文修改後重跑即可，vault/ 內既有課文檔會被整批覆寫。
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const VAULT = join(ROOT, "vault");
const SITE = "https://jeffhuang12.github.io/claude-academy-course/";

const html = ["src/content/m3-ch01-04.html", "src/content/m4-ch05-07.html", "src/content/m5-ch08-10.html"]
  .map((p) => readFileSync(join(ROOT, p), "utf8")).join("\n");

// ---- 共用工具 ----
const unescapeEntities = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
// 行內標記：先轉 strong/code，再拆掉殘餘標籤，最後解 entity
function inline(s) {
  return unescapeEntities(
    s
      .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
      .replace(/<code>([\s\S]*?)<\/code>/g, (_, c) => "`" + unescapeEntities(c) + "`")
      .replace(/<[^>]+>/g, "")
  ).trim();
}
const safeName = (s) => s.replace(/[/\\:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim();

// ---- 解析章與課 ----
const chapters = [...html.matchAll(/<section class="chapter" id="C(\d+)">([\s\S]*?)<\/section>/g)].map(([, num, body]) => {
  const chTitle = inline(body.match(/<h2 class="ch-title">([\s\S]*?)<\/h2>/)[1]);
  const chSubtitle = inline(body.match(/<div class="ch-subtitle">([\s\S]*?)<\/div>/)[1]);
  const lessons = [...body.matchAll(/<article class="lesson" id="L[\d.]+" data-lid="([\d.]+)">([\s\S]*?)<\/article>/g)].map(([, lid, art]) => ({
    lid,
    time: Number(art.match(/lesson-time">⏱ ~(\d+) 分鐘/)[1]),
    title: inline(art.match(/<h3 class="lesson-title">([\s\S]*?)<\/h3>/)[1]),
    subtitle: inline(art.match(/<div class="lesson-subtitle">([\s\S]*?)<\/div>/)[1]),
    // 以開頭標記切段：最後一段會帶著 lesson-body 的收尾 </div>，先剝掉再用錨定正則精確取出
    sections: art.split('<div class="lesson-section">').slice(1).map((chunk, idx, arr) => {
      const c = idx === arr.length - 1 ? chunk.replace(/\s*<\/div>\s*$/, "") : chunk;
      const m = c.match(/^<h4 class="section-title">([\s\S]*?)<\/h4><div class="section-body">([\s\S]*)<\/div><\/div>\s*$/);
      if (!m) throw new Error(`L${lid} 第 ${idx + 1} 段解析失敗：` + c.slice(0, 100));
      return { title: inline(m[1]), body: m[2] };
    }),
  }));
  for (const l of lessons) {
    const titles = l.sections.map((s) => s.title).join("/");
    if (titles !== "讀一讀/重點整理/練習題") throw new Error(`L${l.lid} 段落不完整：${titles}`);
  }
  return { num, title: chTitle, subtitle: chSubtitle, lessons };
});

// ---- section-body 逐塊轉 Markdown ----
const CALLOUT = { hint: "tip", "hint warn": "warning", "hint stop": "danger" };
function blockToMd(body) {
  const out = [];
  let rest = body;
  const eat = (re, fn) => {
    const m = rest.match(re);
    if (m && m.index === 0) { out.push(fn(m)); rest = rest.slice(m[0].length); return true; }
    return false;
  };
  while ((rest = rest.replace(/^\s+/, "")).length) {
    if (eat(/^<p>([\s\S]*?)<\/p>/, (m) => inline(m[1]))) continue;
    if (eat(/^<div class="(hint(?: warn| stop)?)"><span class="hint-icon">[\s\S]*?<\/span><div class="hint-body">([\s\S]*?)<\/div><\/div>/, (m) =>
      "> [!" + CALLOUT[m[1]] + "]\n" + inline(m[2]).split("\n").map((l) => "> " + l).join("\n"))) continue;
    if (eat(/^<pre class="code">([\s\S]*?)<\/pre>/, (m) => "```\n" + unescapeEntities(m[1]).trim() + "\n```")) continue;
    if (eat(/^<ul class="bullets">([\s\S]*?)<\/ul>/, (m) =>
      [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => "- " + inline(li[1])).join("\n"))) continue;
    if (eat(/^<div class="qa">((?:<div class="(?:qtext|opt|answer)">[\s\S]*?<\/div>\s*)+)<\/div>/, (m) => {
      const parts = [...m[1].matchAll(/<div class="(qtext|opt|answer)">([\s\S]*?)<\/div>/g)];
      const q = inline(parts.find((p) => p[1] === "qtext")[2]);
      const opts = parts.filter((p) => p[1] === "opt").map((p) => "> - " + inline(p[2]));
      const ans = inline(parts.find((p) => p[1] === "answer")[2]);
      return ["> [!question] " + q, ...opts, ">", "> > [!success]- 答案", "> > " + ans].join("\n");
    })) continue;
    throw new Error("無法解析的區塊開頭：" + rest.slice(0, 120));
  }
  return out.join("\n\n");
}

// ---- 生成筆記 ----
if (existsSync(VAULT)) rmSync(VAULT, { recursive: true });
mkdirSync(VAULT, { recursive: true });

const flat = chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, ch })));
const noteName = (l) => safeName(`${l.lid} ${l.title}`);
const folderName = (ch) => safeName(`${ch.num} ${ch.title}`);

let count = 0;
for (const ch of chapters) {
  const dir = join(VAULT, folderName(ch));
  mkdirSync(dir, { recursive: true });
  for (const l of ch.lessons) {
    const i = flat.findIndex((x) => x.lid === l.lid);
    const prev = flat[i - 1], next = flat[i + 1];
    const md = `---
course: Claude Academy
chapter: ${Number(ch.num)}
chapter_title: ${ch.title}
lesson: "${l.lid}"
title: ${l.title}
subtitle: ${l.subtitle}
reading_time_min: ${l.time}
tags: [claude-academy, ch${ch.num}]
aliases: ["L${l.lid}"]
source: ${SITE}#L${l.lid}
---

# 第 ${l.lid} 課｜${l.title}

> ${l.subtitle} · ⏱ 約 ${l.time} 分鐘

${l.sections.map((s) => `## ${s.title}\n\n${blockToMd(s.body)}`).join("\n\n")}

---
${prev ? `上一課：[[${noteName(prev)}]]` : ""}${prev && next ? " ｜ " : ""}${next ? `下一課：[[${noteName(next)}]]` : ""} ｜ [[Home]]
`;
    writeFileSync(join(dir, noteName(l) + ".md"), md);
    count++;
  }
}

// ---- Home.md（MOC）----
const totalMin = flat.reduce((a, l) => a + l.time, 0);
const home = `---
course: Claude Academy
tags: [claude-academy, moc]
---

# Claude Academy

從 Prompt 到 Agent 的完整實戰課程 — ${chapters.length} 章 ${flat.length} 課，預估 ~${(totalMin / 60).toFixed(1)} 小時。
線上版：${SITE}

${chapters.map((ch) => `## CH${ch.num} ${ch.title}

*${ch.subtitle}*

${ch.lessons.map((l) => `- [[${noteName(l)}]] — ${l.subtitle}`).join("\n")}`).join("\n\n")}
`;
writeFileSync(join(VAULT, "Home.md"), home);

console.log(`✅ vault 已生成：${count} 課 + Home.md（${chapters.length} 個章節資料夾）`);
