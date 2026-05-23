# 🐾 AI 宠物社交 Demo

单页 Web Demo，展示 AI 宠物 **个性 + 记忆 + 社交** 三大能力。  
约 2 小时完成开发、文档与部署。

---

## 在线访问

| | 链接 |
|---|------|
| 在线 Demo | https://ai-pet-social.vercel.app/ |
| 源码 | https://github.com/mustcanbedo/ai-pet-social |

国内访问 Vercel 可能需要梯子。无法打开时见下方本地运行。

---

## 快速开始

```bash
npm install
npm run dev
# http://localhost:3000
```

启用 DeepSeek 真实对话：

```bash
cp .env.local.example .env.local
# 填入 DEEPSEEK_API_KEY=sk-xxx
npm run dev
```

右上角 **DeepSeek 模式** 表示 AI 对话已生效。

---

## 功能

| 能力 | 说明 |
|------|------|
| 宠物个性 | 5 种性格，Prompt 驱动不同回复风格 |
| 记忆机制 | 提取并记住名字/偏好，后续对话可召回 |
| 宠物社交 | 两只宠物自动对话，产生关系变化 |

**演示路径（3 分钟）：**

1. 配置性格 → 发消息 → 观察回复风格
2. 「我叫胡杰」→「我喜欢猫」→「我叫啥？」→ 验证记忆
3. 配置第二只宠物 →「让两只宠物互动」→ 观察社交

---

## 文档

| 文档 | 内容 |
|------|------|
| [docs/TECH_DOC.md](./docs/TECH_DOC.md) | Part 2 技术说明 |
| [docs/PRODUCT_THINKING.md](./docs/PRODUCT_THINKING.md) | Part 3 产品思考 |
| [docs/PRD.md](./docs/PRD.md) | 产品需求与迭代规划 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 技术架构 |
| [docs/TECH_SUBMISSION.md](./docs/TECH_SUBMISSION.md) | 作业提交索引 |

---

## 项目结构

```
src/
├── app/page.tsx, api/chat, api/provider
├── components/   # 配置、对话、记忆、互动
├── services/     # AIProvider（Mock + DeepSeek）
└── types/
```

---

## 部署

- 平台：Vercel（GitHub 推送自动部署）
- 地址：https://ai-pet-social.vercel.app/
- 环境变量：`DEEPSEEK_API_KEY`（Vercel 控制台配置）
