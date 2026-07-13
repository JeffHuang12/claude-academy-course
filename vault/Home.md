---
course: Claude Academy
tags: [claude-academy, moc]
---

# Claude Academy

從 Prompt 到 Agent 的完整實戰課程 — 10 章 40 課，預估 ~3.3 小時。
線上版：https://jeffhuang12.github.io/claude-academy-course/

## CH01 認識 Claude

*從模型家族到安全理念*

- [[1.1 Claude 是什麼]] — Anthropic 與 Claude 模型家族總覽
- [[1.2 Claude 能做什麼]] — 從對話、分析、寫程式到 Agent
- [[1.3 選對模型]] — 能力、速度、成本的三角取捨
- [[1.4 安全與 Constitutional AI]] — 為什麼 Claude 有時會拒絕你

## CH02 Prompt Engineering 基礎

*把話說清楚是一種技術*

- [[2.1 好 Prompt 的解剖學]] — 角色、脈絡、任務、格式
- [[2.2 給範例最有效]] — few-shot prompting 的威力
- [[2.3 讓 Claude 先思考]] — chain of thought 與 XML 標籤
- [[2.4 常見失敗模式與除錯]] — prompt 不聽話的時候怎麼辦

## CH03 Claude API 入門

*對應官方課程 Claude with the Anthropic API*

- [[3.1 第一次呼叫]] — API key 與 Messages API
- [[3.2 核心參數]] — system、max_tokens、temperature
- [[3.3 多輪對話、串流與視覺輸入]] — 從單發問答到真正的應用
- [[3.4 省錢之道]] — prompt caching 與 Batch API

## CH04 Tool Use 工具使用

*讓 Claude 動手做事*

- [[4.1 什麼是 tool use]] — 從純文字到能查能算
- [[4.2 定義好用的工具 schema]] — 描述寫得好，模型用得對
- [[4.3 Agentic loop]] — 從工具請求到結果回傳的完整迴圈
- [[4.4 結構化輸出與錯誤處理]] — 穩定拿到你要的 JSON

## CH05 MCP 入門

*對應官方課程 Introduction to Model Context Protocol*

- [[5.1 為什麼需要 MCP]] — N×M 整合問題
- [[5.2 MCP 架構]] — host、client、server 各做什麼
- [[5.3 三大原語]] — tools、resources、prompts
- [[5.4 動手用現成的 MCP server]] — 十分鐘接上你的第一個 server

## CH06 MCP 進階

*對應官方課程 MCP: Advanced Topics*

- [[6.1 打造自己的 MCP server]] — 用 SDK 從零寫一個
- [[6.2 sampling 與 elicitation]] — server 反過來請 client 幫忙
- [[6.3 Remote MCP 與 OAuth 認證]] — 從本機走向雲端
- [[6.4 MCP 安全性與最佳實踐]] — prompt injection 與權限最小化

## CH07 Claude Code 實戰

*對應官方課程 Claude Code in Action*

- [[7.1 Claude Code 是什麼]] — 安裝與第一次對話
- [[7.2 核心工作流]] — 探索、規劃、實作、驗證
- [[7.3 CLAUDE.md 與專案記憶]] — 讓每次對話都懂你的專案
- [[7.4 Hooks、Slash Commands 與自動化]] — 把重複的事交給機器

## CH08 Agent Skills

*對應官方課程 Introduction to Agent Skills*

- [[8.1 什麼是 Skill]] — 漸進式揭露的知識包
- [[8.2 SKILL.md 的結構]] — frontmatter、說明與資源檔
- [[8.3 Skill、Tool、MCP 怎麼選]] — 三種擴充方式的分工
- [[8.4 打造並測試你的第一個 Skill]] — 從想法到可重複使用

## CH09 Subagents 與多代理架構

*對應官方課程 Introduction to Subagents*

- [[9.1 為什麼需要 subagent]] — context 隔離與專業分工
- [[9.2 定義 subagent]] — 角色、工具與權限邊界
- [[9.3 Orchestrator 模式]] — 任務分派、平行執行與匯整
- [[9.4 多代理的常見陷阱]] — 過度分派、結果失真與驗收

## CH10 部署、評估與 AI Fluency

*把 Claude 帶進正式環境*

- [[10.1 部署選項]] — Claude API、Amazon Bedrock、Google Vertex AI
- [[10.2 Evals 評估基本功]] — 怎麼知道你的 AI 有沒有變好
- [[10.3 AI Fluency 4D 框架]] — Delegation、Description、Discernment、Diligence
- [[10.4 負責任地用 AI]] — 資料、隱私與治理
