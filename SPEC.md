<!-- 模組 M0｜負責模型: Claude Fable 5（orchestrator） -->

# Claude Academy 課程網站 — 交接規格（SPEC）

本文件是所有模組的**介面契約**。任何模組不得更改 class 名稱、id 命名規則或檔案輸出位置。

## 0. 專案概觀

把 Anthropic Academy 的課程內容（Claude 基礎、Prompting、API、Tool Use、MCP、Claude Code、Agent Skills、Subagents、部署與 AI Fluency）以繁體中文重寫成一個**零建置、單檔 HTML** 的課程網站，呈現方式完全比照參考頁 `reference-gads-course.html`（來源：https://smartsirvincent.github.io/google-ads-course-tw/）。

- 最終成品：`index.html`（單檔、無外部 JS、僅允許 Google Fonts 外部資源）
- 語言：台灣繁體中文；技術名詞保留英文，第一次出現時加註中文
- 10 章、40 課；hash 路由格式 `#L{章}.{課}`（如 `#L5.1`）

## 1. 檔案與模組對照

| 檔案 | 模組 | 說明 |
|---|---|---|
| `src/m1-style.css` | M1 | 完整 `<style>` 內容（不含 `<style>` 標籤） |
| `src/m2-app.js` | M2 | 完整 `<script>` 內容（不含 `<script>` 標籤） |
| `src/content/m3-ch01-04.html` | M3 | CH01–CH04 的 `<section class="chapter">` 片段 |
| `src/content/m4-ch05-07.html` | M4 | CH05–CH07 片段 |
| `src/content/m5-ch08-10.html` | M5 | CH08–CH10 片段 |
| `tests/validate.mjs` | M6 | 零依賴 Node 驗證腳本，對 `index.html` 做結構檢核 |
| `index.html` | M8 | Fable 5 整合（sidebar nav 與 hero 由 M8 依課綱生成） |

每個檔案第一行必須是註解，標明負責模型，例如：
`<!-- 模組 M3｜負責模型: Claude Sonnet 5 -->`（CSS 用 `/* ... */`，JS 用 `// ...`）

## 2. 課綱（權威定義 — 所有模組以此為準）

每課 `id="L{lid}"`、`data-lid="{lid}"`。閱讀時間由內容模組自行估 4–6 分鐘。

### CH01 認識 Claude（章 subtitle：從模型家族到安全理念）
- 1.1 Claude 是什麼｜subtitle: Anthropic 與 Claude 模型家族總覽
- 1.2 Claude 能做什麼｜subtitle: 從對話、分析、寫程式到 Agent
- 1.3 選對模型｜subtitle: 能力、速度、成本的三角取捨
- 1.4 安全與 Constitutional AI｜subtitle: 為什麼 Claude 有時會拒絕你

### CH02 Prompt Engineering 基礎（subtitle：把話說清楚是一種技術）
- 2.1 好 Prompt 的解剖學｜subtitle: 角色、脈絡、任務、格式
- 2.2 給範例最有效｜subtitle: few-shot prompting 的威力
- 2.3 讓 Claude 先思考｜subtitle: chain of thought 與 XML 標籤
- 2.4 常見失敗模式與除錯｜subtitle: prompt 不聽話的時候怎麼辦

### CH03 Claude API 入門（subtitle：對應官方課程 Claude with the Anthropic API）
- 3.1 第一次呼叫｜subtitle: API key 與 Messages API
- 3.2 核心參數｜subtitle: system、max_tokens、temperature
- 3.3 多輪對話、串流與視覺輸入｜subtitle: 從單發問答到真正的應用
- 3.4 省錢之道｜subtitle: prompt caching 與 Batch API

### CH04 Tool Use 工具使用（subtitle：讓 Claude 動手做事）
- 4.1 什麼是 tool use｜subtitle: 從純文字到能查能算
- 4.2 定義好用的工具 schema｜subtitle: 描述寫得好，模型用得對
- 4.3 Agentic loop｜subtitle: 從工具請求到結果回傳的完整迴圈
- 4.4 結構化輸出與錯誤處理｜subtitle: 穩定拿到你要的 JSON

### CH05 MCP 入門（subtitle：對應官方課程 Introduction to Model Context Protocol）
- 5.1 為什麼需要 MCP｜subtitle: N×M 整合問題
- 5.2 MCP 架構｜subtitle: host、client、server 各做什麼
- 5.3 三大原語｜subtitle: tools、resources、prompts
- 5.4 動手用現成的 MCP server｜subtitle: 十分鐘接上你的第一個 server

### CH06 MCP 進階（subtitle：對應官方課程 MCP: Advanced Topics）
- 6.1 打造自己的 MCP server｜subtitle: 用 SDK 從零寫一個
- 6.2 sampling 與 elicitation｜subtitle: server 反過來請 client 幫忙
- 6.3 Remote MCP 與 OAuth 認證｜subtitle: 從本機走向雲端
- 6.4 MCP 安全性與最佳實踐｜subtitle: prompt injection 與權限最小化

### CH07 Claude Code 實戰（subtitle：對應官方課程 Claude Code in Action）
- 7.1 Claude Code 是什麼｜subtitle: 安裝與第一次對話
- 7.2 核心工作流｜subtitle: 探索、規劃、實作、驗證
- 7.3 CLAUDE.md 與專案記憶｜subtitle: 讓每次對話都懂你的專案
- 7.4 Hooks、Slash Commands 與自動化｜subtitle: 把重複的事交給機器

### CH08 Agent Skills（subtitle：對應官方課程 Introduction to Agent Skills）
- 8.1 什麼是 Skill｜subtitle: 漸進式揭露的知識包
- 8.2 SKILL.md 的結構｜subtitle: frontmatter、說明與資源檔
- 8.3 Skill、Tool、MCP 怎麼選｜subtitle: 三種擴充方式的分工
- 8.4 打造並測試你的第一個 Skill｜subtitle: 從想法到可重複使用

### CH09 Subagents 與多代理架構（subtitle：對應官方課程 Introduction to Subagents）
- 9.1 為什麼需要 subagent｜subtitle: context 隔離與專業分工
- 9.2 定義 subagent｜subtitle: 角色、工具與權限邊界
- 9.3 Orchestrator 模式｜subtitle: 任務分派、平行執行與匯整
- 9.4 多代理的常見陷阱｜subtitle: 過度分派、結果失真與驗收

### CH10 部署、評估與 AI Fluency（subtitle：把 Claude 帶進正式環境）
- 10.1 部署選項｜subtitle: Claude API、Amazon Bedrock、Google Vertex AI
- 10.2 Evals 評估基本功｜subtitle: 怎麼知道你的 AI 有沒有變好
- 10.3 AI Fluency 4D 框架｜subtitle: Delegation、Description、Discernment、Diligence
- 10.4 負責任地用 AI｜subtitle: 資料、隱私與治理

## 3. 內容模組（M3/M4/M5）的 HTML 模板 — 必須逐字遵守結構

章節容器（`{NN}` 為兩位數章號）：

```html
<section class="chapter" id="C{NN}"><header class="ch-header"><div class="ch-eyebrow">章節 {NN}</div><h2 class="ch-title">{章標題}</h2><div class="ch-subtitle">{章副標}</div><div class="ch-meta">{n}課 · ⏱ ~{總分鐘} 分鐘</div></header>
{lessons…}
</section>
```

每課（三段固定順序：讀一讀 → 重點整理 → 練習題）：

```html
<article class="lesson" id="L{lid}" data-lid="{lid}"><header class="lesson-header"><div class="lesson-meta-row"><span class="lesson-num">第 {lid} 課</span><span class="lesson-time">⏱ ~{m} 分鐘</span><label class="progress-toggle"><input type="checkbox" class="progress-check" data-lid="{lid}"><span>已讀</span></label></div><h3 class="lesson-title">{課標題}</h3><div class="lesson-subtitle">{課副標}</div></header><div class="lesson-body">
<div class="lesson-section"><h4 class="section-title">讀一讀</h4><div class="section-body">
  <p>…2–4 段散文…</p>
  <div class="hint"><span class="hint-icon">💡</span><div class="hint-body">…生活化比喻…</div></div>
</div></div>
<div class="lesson-section"><h4 class="section-title">重點整理</h4><div class="section-body"><ul class="bullets">
  <li>…4–6 條…</li>
</ul></div></div>
<div class="lesson-section"><h4 class="section-title">練習題</h4><div class="section-body">
  <div class="qa"><div class="qtext">Q1: …</div><div class="opt">選項A</div><div class="opt">選項B</div><div class="opt">選項C</div><div class="answer">✅ {必須與其中一個 opt 逐字相同}</div></div>
</div></div>
</div></article>
```

可用元件（僅限這些）：
- `<div class="hint">…💡…`（比喻/補充）、`<div class="hint warn">…⚠️…`（常見誤區）、`<div class="hint stop">…🚫…`（危險/絕對別做）
- `<pre class="code">…</pre>`：程式碼、目錄結構、流程步驟。**內文中的 `<` `>` `&` 一律轉義為 `&lt;` `&gt;` `&amp;`**
- `<ul class="bullets">`；粗體用 `<strong>`

### 內容寫作準則
- 語氣比照參考頁：實戰、口語、多用生活化比喻與台灣情境案例；每課至少 1 個 hint，全課程 hint/warn/stop 交錯使用
- 每課練習題 2–3 題，每題 3 個選項、恰好 1 個 `answer`
- 技術名詞保留英文，第一次出現加註中文，例如「context window（上下文視窗）」
- **事實正確性**：模型家族以 Opus（最強推理）/ Sonnet（平衡）/ Haiku（快速便宜）三層描述；**不要寫死價格數字與模型版本號**（易過時），可說「以官方 pricing 頁為準」。MCP、Agent Skills、subagents、Claude Code 的機制描述以你確知的官方行為為準，不確定的細節寧可寫原則不寫數字
- 程式碼範例用 Python 或 TypeScript，短小可讀（≤15 行），出現在「讀一讀」內
- 每課「讀一讀」約 250–450 字中文，整份檔案是 HTML 片段，**不含** `<html>/<head>/<body>`

### 邊界情況（內容模組必須自查）
1. code 區塊內的 XML/HTML 範例已轉義（最容易破版）
2. `answer` 文字與某個 `opt` 逐字一致（測試會比對）
3. `data-lid`、`id` 與課綱完全一致，無重複
4. 不出現 `id` 或 `class` 以外的自創屬性；不用 inline style

## 4. M1（CSS）規格

- 讀 `reference-gads-course.html` 第 10–160 行的 `<style>`，**保留全部 class 名稱與版面結構**，改造成 Anthropic 品牌視覺：
  - 底色系換成 Anthropic 米白（建議 `--bg: #f0eee6; --bg-tint: #e8e4d8; --paper: #faf9f5`），accent 換成 Claude 陶土橘 `#c96442`（hover 可用 `#d97757`），ink 色系維持深暖棕黑
  - 字體維持 Noto Serif TC / Noto Sans TC / JetBrains Mono
- 必須涵蓋參考頁所有元件 class（hint/warn/stop、qa、code、bullets、progress、nav、hero、done 狀態、search-empty、hidden）
- RWD：≤ 900px 時 sidebar 轉為頂部區塊（非 sticky），內文單欄可讀；≥ 1600px 內文欄寬仍受 `--max-read` 限制
- 邊界情況:長標題換行不破版、`prefers-reduced-motion` 時關閉 smooth 動畫

## 5. M2（JS）規格

功能與參考頁 `<script>`（第 983 行起）等價，外加強化。介面（DOM 契約）：
- 讀取：`.nav-chapter[data-ch]`、`.nav-ch-toggle`、`.nav-lessons a[data-lid]`、`.progress-check[data-lid]`、`.lesson`、`.chapter`、`#search`、`#search-empty`、`#progress-count`、`#progress-bar-fill`
- localStorage keys：`claude_academy_progress_v1`、`claude_academy_open_chapters_v1`

強化要求（邊界情況優先涵蓋）：
1. **totalLessons 不寫死**，以 `document.querySelectorAll(".progress-check").length` 推導
2. localStorage 不可用（Safari 私密模式）或 JSON 損毀時：功能退化為記憶體內運作，不得 throw
3. 無效 hash（`#L99.9`、`#foo`）：忽略且不報錯；有效 hash 需自動展開對應章節並捲動
4. 搜尋 input 加 ~120ms debounce；正在 IME 組字（compositionstart/end）時不觸發過濾
5. `hashchange` 事件也要處理（使用者手動改網址）
6. 進度條與 `#progress-count` 永遠與 checkbox 狀態一致（單一 `applyProgress()` 收斂）
- 純 vanilla JS、IIFE 包裹、無全域洩漏（可掛一個 `window.__academy` 供測試，選配）

## 6. M6（測試）規格

`tests/validate.mjs`，`node tests/validate.mjs [path-to-index.html]`（預設 `index.html`），零依賴（僅 node:fs），失敗時 exit 1 並列出所有錯誤。斷言：
1. 40 個 `<article class="lesson">`，`data-lid` 與 SPEC 課綱完全一致且無重複
2. 每個 nav 連結 `a[data-lid]` 都有對應 `article id="L{lid}"`，反之亦然
3. 每課恰有 3 個 `lesson-section`，標題依序為 讀一讀/重點整理/練習題
4. 每個 `.qa` 恰有 1 個 `.answer`，且 answer 去掉 `✅ ` 前綴後與同一 qa 內某個 `.opt` 逐字相等
5. 每課至少 1 個 `.qa`、至少 1 個 `.hint`
6. `id` 全域唯一；`<article>`/`</article>`、`<section>`/`</section>` 數量成對
7. `pre.code` 內不得出現未轉義的 `<`（即 `<pre class="code">` 內文除 `&lt;` 外不含 `<`，容許結尾 `</pre>`）
8. `#progress-count`、`#progress-bar-fill`、`#search`、`#search-empty` 存在
- 用正則/字串解析即可（無 DOM 庫），但要處理跨行

## 7. M8（整合）流程 — Fable 5 執行

1. 依課綱生成 sidebar `<nav class="toc">`（結構同參考頁）與 hero（10 章 40 課、總時數由各課加總）
2. 組裝：`<style>`=M1、內文=M3+M4+M5、`<script>`=M2
3. 跑 M6 測試 + 瀏覽器實測（搜尋、進度、hash、RWD）
4. 品質關卡逐模組記錄驗收結果；不合格退回或升級模型
