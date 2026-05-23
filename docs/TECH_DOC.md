# Part 2：技术说明

---

## 1. 技术栈选择

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 单页 Demo + API Route 代理 AI 调用 |
| 语言 | TypeScript | 数据模型清晰，便于维护与扩展 |
| 样式 | Tailwind CSS 4 | 快速搭建 UI |
| 状态 | React useState | 单用户场景，无需全局状态库 |
| AI | DeepSeek + Mock 双 Provider | 真实对话 + 无 Key 可演示 |
| 工具 | Cursor Agent | 需求拆解、代码生成、文档与调试 |
| 部署 | Vercel + GitHub | 推送自动部署 |

**未采用：** 独立后端（API Route 足够）、数据库（MVP 用 React state）、前端直调 API（Key 不安全）。

---

## 2. AI 调用方式

### 2.1 接口设计

所有 AI 逻辑通过 `AIProvider` 接口隔离，UI 层不依赖具体模型：

```typescript
interface AIProvider {
  chat(pet, message, memory): Promise<string>;
  extractMemory(input, currentMemory): Promise<UserMemory>;
  generateInteractionTurn(...): Promise<string>;
  analyzeInteraction(...): Promise<{ summary, relationshipChange }>;
}
```

- `DeepSeekAIProvider` — 配置 Key 后启用
- `MockAIProvider` — 无 Key 时降级，保证 Demo 可运行

### 2.2 Prompt

**对话（System Prompt）：**

```
你是一只名叫「{petName}」的 AI 宠物。
性格：{personalityLabel} — {personalityDescription}

【已记住的用户信息】
- 名字：{userName}
- 偏好：{userPrefs}

规则：
1. 符合性格，1–3 句口语化
2. 问「我叫什么/我是谁/我喜欢什么」→ 基于记忆准确回答
3. 记忆为空时引导用户告知，不编造信息
```

**记忆提取：** LLM 返回 `{ name, preferences[] }`；「我是谁」等疑问句不写入名字。

**参数：** 对话 temperature 0.8，提取 0.1，max_tokens 200。

### 2.3 记忆流程

```
用户输入
  → extractMemory() 提取名字/偏好
  → 更新 UserMemory，记忆面板同步展示
  → chat() 将记忆注入 System Prompt
  → 宠物回复引用记忆；追问「我叫啥」可准确召回
```

记忆提取与对话生成分离；记忆面板独立展示，便于验证系统是否真正记住用户信息。

### 2.4 安全

```
Browser → POST /api/chat → DeepSeek（服务端）
Browser → GET  /api/provider → 返回 deepseek | mock
```

`DEEPSEEK_API_KEY` 仅存服务端环境变量，不提交 Git。

---

## 3. 系统结构

```
page.tsx
├── PetConfigPanel / MemoryPanel
├── ChatPanel / InteractionPanel
├── aiService.ts
│   ├── mockAIProvider.ts
│   └── deepseekProvider.ts
└── /api/chat, /api/provider
         ↓
    DeepSeek API
```

**对话链路：** 用户输入 → `ensureProvider()` → `extractMemory()` → `chat()` → UI 更新

---

## 4. AI 工具如何参与开发

本次开发采用「人定方向、AI 执行细节、人做验证」的协作模式：

| 阶段 | 人工 | AI 工具 |
|------|------|--------|
| 需求 | 确定 MVP 范围与取舍 | 生成 PRD 初稿、任务拆分 |
| 架构 | 定义 AIProvider 接口、双模式策略 | 生成类型定义、目录结构 |
| 编码 | 确认 Prompt 规则、体验路径 | 组件骨架、Mock 模板、API Route |
| 调试 | 验证记忆召回、对话质量 | 定位 bug、提出修复方案 |
| 交付 | 确认演示脚本、部署配置 | 同步维护文档 |

**效率对比：**

| 环节 | 预估（传统） | 实际 |
|------|------------|------|
| 需求 + PRD | 2–3 h | ~20 min |
| MVP 编码 | 4–6 h | ~70 min |
| DeepSeek 接入 | 1–2 h | ~30 min |
| 文档 + 部署 | 1–2 h | ~20 min |
| **合计** | **8–12 h** | **~2 h** |

人工时间主要花在：功能取舍、Prompt 调优、端到端体验验证、API Key 与部署配置。

---

## 5. 总耗时

约 **2 小时**（需求 20 min + MVP 70 min + DeepSeek 30 min + 文档部署 20 min）。

---

## 附录

| | 地址 |
|---|------|
| 在线 Demo | https://ai-pet-social.vercel.app/ |
| 源码 | https://github.com/mustcanbedo/ai-pet-social |

**对话示例：**

```
用户：我叫胡杰，是你的主人
python：胡杰主人！太好啦，以后我就跟着你啦！
→ 记忆：名字 = 胡杰

用户：我叫啥？
python：你叫胡杰呀！我当然记得啦~
```
