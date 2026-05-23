# 技术架构

## 1. 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 单页 Demo + API Route |
| 语言 | TypeScript | 全项目类型安全 |
| 样式 | Tailwind CSS 4 | 快速 UI |
| 状态 | React useState | 单用户，无全局状态库 |
| AI | DeepSeek + Mock | 策略模式，可切换 Provider |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  page.tsx ── PetConfig / ChatPanel / Memory / Interaction│
│       │                                                  │
│       └── ensureProvider() → aiService.ts                │
│              ├── MockAIProvider      (无 Key 兜底)        │
│              └── DeepSeekAIProvider  (真实对话)           │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch
┌──────────────────────────▼──────────────────────────────┐
│                   Next.js API Routes                     │
│  GET  /api/provider  → 返回 deepseek | mock              │
│  POST /api/chat      → 代理 DeepSeek chat/completions    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│              DeepSeek API (deepseek-chat)                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
src/
├── app/
│   ├── page.tsx                 # 主页面，全局 state
│   ├── layout.tsx
│   └── api/
│       ├── chat/route.ts        # DeepSeek 代理
│       └── provider/route.ts    # 模式检测
├── components/
│   ├── PetConfigPanel.tsx       # 宠物配置
│   ├── ChatPanel.tsx            # 用户 ↔ 宠物对话
│   ├── MemoryPanel.tsx          # 记忆展示
│   └── InteractionPanel.tsx     # 宠物 ↔ 宠物互动
├── services/
│   ├── aiService.ts             # AIProvider 接口 + 工厂
│   ├── mockAIProvider.ts        # Mock 实现
│   └── deepseekProvider.ts      # DeepSeek 实现
└── types/index.ts               # 数据类型
```

---

## 4. AI 服务层（核心）

### 4.1 AIProvider 接口

```typescript
interface AIProvider {
  chat(pet, message, memory): Promise<string>;
  extractMemory(input, currentMemory): Promise<UserMemory>;
  generateInteractionTurn(conversation, speaker, other, memory): Promise<string>;
  analyzeInteraction(messages, pet1, pet2): Promise<{ summary, relationshipChange }>;
}
```

### 4.2 Provider 切换

```typescript
// aiService.ts
// 启动时 fetch /api/provider
// 有 DEEPSEEK_API_KEY → DeepSeekAIProvider
// 无 Key → MockAIProvider
```

发送消息前 `await ensureProvider()`，避免初始化竞态。

### 4.3 DeepSeek Prompt 设计

**对话 System Prompt：**
- 注入：宠物名、性格描述、用户名字、用户偏好
- 规则：1–3 句口语化；召回问句必须基于记忆回答；不编造信息

**记忆提取：**
- LLM 返回 JSON `{ name, preferences[] }`
- 疑问句（「我是谁」「我叫啥」）不提取名字

**参数：** temperature 0.8（对话）/ 0.1（提取），max_tokens 200

### 4.4 Mock 兜底

- 性格模板 + 正则记忆提取 + 召回意图识别
- 无 API Key 时可演示 UI 与基本流程

---

## 5. 数据流

### 用户对话

```
用户输入
  → await ensureProvider()
  → extractMemory() → 更新 UserMemory → MemoryPanel 渲染
  → chat(pet, message, memory) → 宠物回复 → ChatPanel 渲染
```

### 宠物互动

```
点击「让两只宠物互动」
  → 循环 6 轮 generateInteractionTurn()
  → analyzeInteraction() → 总结 + 关系变化
```

---

## 6. 安全与环境

| 项 | 方案 |
|----|------|
| API Key | 仅存 `.env.local`，不提交 Git |
| 前端调用 | 通过 `/api/chat` 代理，Key 不暴露浏览器 |
| 环境变量 | `DEEPSEEK_API_KEY=sk-xxx` |

---

## 7. 关键设计决策

| 决策 | 理由 |
|------|------|
| 无数据库 | MVP 聚焦 AI 能力，state 够用 |
| 无登录 | 降低演示门槛 |
| AIProvider 抽象 | Mock/DeepSeek 可切换，后续可接 OpenAI 等 |
| 记忆独立面板 | 能力可见，评审友好 |
| API Route 代理 | 保护 Key，无需独立后端 |

---

## 8. 已知局限

| 局限 | 计划版本 |
|------|---------|
| 刷新页面记忆丢失 | v0.2 localStorage |
| Mock 模式语义理解有限 | 推荐 DeepSeek 演示 |
| 无多用户 | v1.0 |
| 无线上部署 | v1.0 Vercel |
