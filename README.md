<!-- 模組 M8｜負責模型: Claude Fable 5（orchestrator） -->

# Claude Academy 課程網站

把 Anthropic Academy 的課程主題（Claude 基礎、Prompt Engineering、Claude API、Tool Use、MCP、Claude Code、Agent Skills、Subagents、部署與 AI Fluency）重寫為台灣繁體中文的 10 章 40 課，呈現方式比照 [google-ads-course-tw](https://smartsirvincent.github.io/google-ads-course-tw/)：零建置、單檔 HTML、離線可用。

## 使用方式

- **直接看**：用瀏覽器開 `index.html` 即可（雙擊或 `open index.html`），不需要伺服器
- **部署**：整個 `index.html` 丟上 GitHub Pages / 任何靜態空間就是完整網站；支援 `#L5.1` 這類深連結
- **功能**：側欄章節折疊、全文即時搜尋、已讀進度（localStorage 記憶）、hash 路由平滑捲動、RWD（≤900px 側欄轉頂部）

## 專案結構與負責模型

| 路徑 | 模組 | 負責模型 |
|---|---|---|
| `SPEC.md` | M0 課綱與交接規格 | Claude Fable 5 |
| `src/m1-style.css` | M1 CSS 主題（Anthropic 品牌視覺） | Claude Sonnet 5 |
| `src/m2-app.js` | M2 互動層 JS | Claude Opus 4.8 |
| `src/content/m3-ch01-04.html` | M3 內容 CH01–04 | Claude Sonnet 5 |
| `src/content/m4-ch05-07.html` | M4 內容 CH05–07 | Claude Sonnet 5 |
| `src/content/m5-ch08-10.html` | M5 內容 CH08–10 | Claude Sonnet 5 |
| `tests/validate.mjs` | M6 結構驗證測試 | Claude Sonnet 5 |
| （M7 為對 src 的註解/格式微調） | M7 | Claude Haiku 4.5 |
| `build.mjs`、`index.html`、`README.md` | M8 整合 | Claude Fable 5 |

`reference-gads-course.html` 是參考頁的本地快照，僅供比對，非交付物。

## 修改內容後怎麼重建

`index.html` 是產物，**不要直接編輯**。改 `src/` 下的檔案後：

```bash
node build.mjs          # 由課綱生成 nav/hero 並組裝 index.html
node tests/validate.mjs # 8 條結構斷言（40 課齊全、nav↔article 對應、answer/opt 逐字比對、code 轉義…）
```

新增/改課時，`build.mjs` 內的 `CURRICULUM` 與 `SPEC.md` 第 2 節是課綱的權威定義，兩處要同步；`tests/validate.mjs` 也寫死了 40 課清單（fixture 測試可用 `--lenient` 跳過該斷言）。

## 後續測試建議

- 已涵蓋：結構斷言（M6）、真機瀏覽器互動實測（搜尋/進度/hash/RWD/重載持久化）、`prefers-reduced-motion`
- 建議補：Safari 私密模式實機驗證 localStorage 退化路徑、iOS 實機捲動體驗、若上線可加 Playwright 煙霧測試（勾進度 → 重載 → 斷言計數）
