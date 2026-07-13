// 模組 M8｜負責模型: Claude Fable 5（orchestrator — 整合與組裝）
// 用法：node build.mjs
// 讀取 src/ 各模組產出，依 SPEC 課綱生成 sidebar nav 與 hero，組裝出單檔 index.html
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ---- 課綱權威定義（與 SPEC.md 第 2 節一致）----
const CURRICULUM = [
  { ch: "01", title: "認識 Claude", lessons: [
    ["1.1", "Claude 是什麼"], ["1.2", "Claude 能做什麼"], ["1.3", "選對模型"], ["1.4", "安全與 Constitutional AI"] ] },
  { ch: "02", title: "Prompt Engineering 基礎", lessons: [
    ["2.1", "好 Prompt 的解剖學"], ["2.2", "給範例最有效"], ["2.3", "讓 Claude 先思考"], ["2.4", "常見失敗模式與除錯"] ] },
  { ch: "03", title: "Claude API 入門", lessons: [
    ["3.1", "第一次呼叫"], ["3.2", "核心參數"], ["3.3", "多輪對話、串流與視覺輸入"], ["3.4", "省錢之道"] ] },
  { ch: "04", title: "Tool Use 工具使用", lessons: [
    ["4.1", "什麼是 tool use"], ["4.2", "定義好用的工具 schema"], ["4.3", "Agentic loop"], ["4.4", "結構化輸出與錯誤處理"] ] },
  { ch: "05", title: "MCP 入門", lessons: [
    ["5.1", "為什麼需要 MCP"], ["5.2", "MCP 架構"], ["5.3", "三大原語"], ["5.4", "動手用現成的 MCP server"] ] },
  { ch: "06", title: "MCP 進階", lessons: [
    ["6.1", "打造自己的 MCP server"], ["6.2", "sampling 與 elicitation"], ["6.3", "Remote MCP 與 OAuth 認證"], ["6.4", "MCP 安全性與最佳實踐"] ] },
  { ch: "07", title: "Claude Code 實戰", lessons: [
    ["7.1", "Claude Code 是什麼"], ["7.2", "核心工作流"], ["7.3", "CLAUDE.md 與專案記憶"], ["7.4", "Hooks、Slash Commands 與自動化"] ] },
  { ch: "08", title: "Agent Skills", lessons: [
    ["8.1", "什麼是 Skill"], ["8.2", "SKILL.md 的結構"], ["8.3", "Skill、Tool、MCP 怎麼選"], ["8.4", "打造並測試你的第一個 Skill"] ] },
  { ch: "09", title: "Subagents 與多代理架構", lessons: [
    ["9.1", "為什麼需要 subagent"], ["9.2", "定義 subagent"], ["9.3", "Orchestrator 模式"], ["9.4", "多代理的常見陷阱"] ] },
  { ch: "10", title: "部署、評估與 AI Fluency", lessons: [
    ["10.1", "部署選項"], ["10.2", "Evals 評估基本功"], ["10.3", "AI Fluency 4D 框架"], ["10.4", "負責任地用 AI"] ] },
];

const SITE_TITLE = "Claude Academy";
const SITE_LEDE = "從 Prompt 到 Agent 的完整實戰課程 — Claude 基礎、API、Tool Use、MCP、Claude Code、Agent Skills 與多代理架構";

// ---- 讀入各模組 ----
const css = read("src/m1-style.css");
const js = read("src/m2-app.js");
const content = ["src/content/m3-ch01-04.html", "src/content/m4-ch05-07.html", "src/content/m5-ch08-10.html"]
  .map(read).join("\n");

const totalLessons = CURRICULUM.reduce((n, c) => n + c.lessons.length, 0);

// 總時數：從內容裡的 lesson-time 加總
const mins = [...content.matchAll(/lesson-time">⏱ ~(\d+) 分鐘/g)].map((m) => Number(m[1]));
if (mins.length !== totalLessons) {
  console.warn(`⚠️ lesson-time 數量 ${mins.length} != 課數 ${totalLessons}（照常組裝，交給 validate.mjs 抓細節）`);
}
const totalHours = (mins.reduce((a, b) => a + b, 0) / 60).toFixed(1).replace(/\.0$/, "");

// ---- 生成 sidebar nav ----
const nav = CURRICULUM.map((c) => {
  const lis = c.lessons.map(([lid, t]) =>
    `<li><a href="#L${lid}" data-lid="${lid}"><span class="lnum">${lid}</span> ${t}</a></li>`).join("\n");
  return `<div class="nav-chapter" data-ch="${c.ch}"><button class="nav-ch-toggle" type="button" aria-expanded="false"><span class="ch-num">CH${c.ch}</span><span class="ch-title">${c.title}</span><span class="ch-arrow">▸</span></button><ul class="nav-lessons">\n${lis}\n</ul></div>`;
}).join("\n");

const html = `<!DOCTYPE html>
<!--
  Claude Academy 課程網站（單檔 HTML，零建置）
  多模型協作產出：
    M0/M8 架構、課綱、整合 — Claude Fable 5
    M1 CSS 主題            — Claude Sonnet 5
    M2 互動層 JS           — Claude Opus 4.8
    M3–M5 課程內容         — Claude Sonnet 5
    M6 驗證測試            — Claude Sonnet 5
    M7 註解與格式微調      — Claude Haiku 4.5
-->
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${SITE_TITLE} 課程</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;700;900&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<!-- ===== M1: CSS 主題｜Claude Sonnet 5 ===== -->
<style>
${css}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand">${SITE_TITLE}</div>
    <div class="brand-sub">${SITE_LEDE}</div>
    <div class="search"><input type="search" id="search" placeholder="搜尋課程內容..." autocomplete="off"></div>
    <div class="progress-summary"><span>學習進度</span><span><span id="progress-count">0</span> / ${totalLessons}</span></div>
    <div class="progress-bar"><div class="progress-bar-fill" id="progress-bar-fill"></div></div>
    <!-- ===== M8: 目錄（由課綱生成）｜Claude Fable 5 ===== -->
    <nav class="toc">${nav}</nav>
  </aside>
  <main class="content">
    <header class="hero">
      <div class="hero-eyebrow">Anthropic Academy · 繁體中文版</div>
      <h1>${SITE_TITLE}</h1>
      <p class="hero-lede">${SITE_LEDE}</p>
      <div class="hero-meta">
        <span><strong>${CURRICULUM.length}</strong> 章</span>
        <span><strong>${totalLessons}</strong> 課</span>
        <span>預估 ~${totalHours} 小時</span>
      </div>
    </header>
<!-- ===== M3–M5: 課程內容｜Claude Sonnet 5 ===== -->
${content}
    <div class="search-empty" id="search-empty" style="display:none;">沒有符合的課程。試試其他關鍵字。</div>
  </main>
</div>
<!-- ===== M2: 互動層｜Claude Opus 4.8 ===== -->
<script>
${js}
</script>
</body>
</html>
`;

writeFileSync(join(ROOT, "index.html"), html);
console.log(`✅ index.html 已組裝（${CURRICULUM.length} 章 / ${totalLessons} 課 / 預估 ~${totalHours} 小時 / ${(html.length / 1024).toFixed(0)} KB）`);
