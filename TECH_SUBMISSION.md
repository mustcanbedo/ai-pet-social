# 作业提交文档

> Engineer 作业 Part 2（技术说明）+ Part 3（产品思考）+ 对话示例

---

## Part 2：技术说明

### 1. 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 16 + App Router |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 状态 | React useState |
| AI | DeepSeek API + Mock 兜底 |

详细架构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

### 2. AI 调用方式

**策略模式：** `AIProvider` 接口统一 `chat / extractMemory / generateInteractionTurn / analyzeInteraction`

**DeepSeek 模式：**
- System Prompt 注入宠物性格 + 用户记忆（名字、偏好）
- 记忆提取：LLM 返回 JSON `{ name, preferences[] }`
- 通过 `/api/chat` 服务端代理，Key 不暴露前端

**Mock 模式：** 性格模板 + 正则提取 + 召回意图识别，无 Key 可运行

### 3. 系统结构

```
UI → ensureProvider() → aiService → Mock | DeepSeek
                                        ↓
                                   /api/chat → DeepSeek API
```

### 4. AI 工具如何提升开发效率

借助 Cursor Agent 完成需求拆解、组件脚手架、Mock 模板生成、DeepSeek 接入与文档整理。人工主要负责：配置 API Key、功能验证、演示路径确认。整体约 **2 小时** 完成从 scaffold 到可交付 Demo。

### 5. 总耗时

| 阶段 | 耗时 |
|------|------|
| 项目搭建 + MVP 功能 | ~70 分钟 |
| DeepSeek 接入 + 联调 | ~30 分钟 |
| 文档整理 + 验证 | ~20 分钟 |
| **合计** | **~2 小时** |

---

## Part 3：产品思考（≤300 字）

如果继续优化，我会优先优化 **「用户 ↔ 宠物对话 → 记忆沉淀 → 记忆驱动回复」** 这一核心循环。

原因：第一，这是产品成立的根基——宠物社交、关系图谱都建立在「宠物了解主人」之上；第二，记忆的可感知性直接决定用户是否感受到陪伴感；第三，技术 ROI 最高——当前架构已预留 AIProvider 和记忆面板，优化 Prompt 即可显著提升，无需重构。

具体优先级：对话质量 > 记忆持久化 > 关系网络扩展。详见 [PRD.md](./PRD.md) 版本规划。

---

## 对话示例

```
[主宠物 python（外向），副宠物 java（内向），DeepSeek 模式]

用户：你好呀！
python：嘿嘿，你好！我是 python，超开心你来找我聊天！

用户：我叫胡杰，是你的主人
python：胡杰主人！太好啦，以后我就跟着你啦！
→ 记忆面板：名字 = 胡杰

用户：我喜欢猫和 AI 产品
python：哇胡杰，猫和 AI 产品！快给我讲讲！
→ 记忆面板：偏好 = 猫, AI 产品

用户：我叫啥？
python：你叫胡杰呀！我当然记得啦~

[点击「让两只宠物互动」]
python：你好 java！我是 python！
java：嗯……你好 python……
→ 关系变化：陌生 → 好奇
```

---

## 运行方式

```bash
npm install
cp .env.local.example .env.local   # 填入 DEEPSEEK_API_KEY
npm run dev
```

访问 http://localhost:3000
