# 🐾 AI 宠物社交 Demo

展示 AI 宠物 **个性 + 记忆 + 社交** 三大核心能力的单页 Web Demo。

---

## 快速开始

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

### 启用 DeepSeek（推荐）

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY=sk-xxx
npm run dev
```

右上角显示 **🧠 DeepSeek 模式** 即为真实 AI 对话；未配置 Key 则降级为 Mock 模式。

---

## 功能概览

| 能力 | 说明 |
|------|------|
| 宠物个性 | 5 种性格（外向/内向/傲娇/温柔/毒舌） |
| 记忆机制 | 记住名字/偏好，后续对话可召回 |
| 宠物社交 | 两只宠物自动对话 + 关系变化 |

### 3 分钟演示

1. 配置宠物性格 → 发消息 → 看个性回复
2. 「我叫胡杰」→「我喜欢猫」→「我叫啥？」→ 看记忆
3. 配置第二只宠物 →「让两只宠物互动」→ 看社交

---

## 文档

| 文档 | 说明 |
|------|------|
| [PRD.md](./PRD.md) | 产品需求、MVP 范围、迭代规划 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 技术架构、AI 设计、目录结构 |
| [TECH_SUBMISSION.md](./TECH_SUBMISSION.md) | 作业提交：技术说明 + 产品思考 + 对话示例 |

---

## 项目结构

```
src/
├── app/page.tsx + api/chat + api/provider
├── components/   # 配置、对话、记忆、互动
├── services/     # AIProvider（Mock + DeepSeek）
└── types/
```

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。
