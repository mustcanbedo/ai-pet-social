# 作业提交

## 提交清单

| 材料 | 地址 |
|------|------|
| Part 2 技术说明 | [TECH_DOC.md](./TECH_DOC.md) |
| Part 3 产品思考 | [PRODUCT_THINKING.md](./PRODUCT_THINKING.md) |
| 在线 Demo | https://ai-pet-social.vercel.app/ |
| 源码 | https://github.com/mustcanbedo/ai-pet-social |
| 产品 PRD | [PRD.md](./PRD.md) |
| 技术架构 | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| 运行说明 | [README.md](../README.md) |

在线 Demo 部署于 Vercel，国内可能需要梯子。

---

## 项目概要

- **产品：** AI 宠物具备个性、记忆与社交能力，可通过 Web 直接体验
- **工程：** Next.js + DeepSeek，AIProvider 策略模式，Mock/DeepSeek 可切换
- **交付：** 源码 + 在线 Demo + 文档，总耗时约 2 小时

---

## 本地运行

```bash
npm install
cp .env.local.example .env.local   # 填入 DEEPSEEK_API_KEY
npm run dev
```

访问 http://localhost:3000
