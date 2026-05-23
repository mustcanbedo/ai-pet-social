# AI 宠物社交 — 产品需求文档（PRD）

## 1. 产品定位

**一句话：** 每个用户拥有一只 AI 宠物，宠物具备个性与记忆，并能与其他宠物互动，形成可感知的关系变化。

**当前阶段：** MVP v0.1 已完成（文字对话 + 记忆 + 社交）。下一阶段目标是 **「会思考的宠物 → 有形象、会动的宠物」**。

**产品三层架构（演进方向）：**

```
┌─────────────────────────────────────┐
│  表现层：3D 形象 + 动画 + 交互行为    │  ← v0.5 / v1.5
├─────────────────────────────────────┤
│  智能层：个性 + 记忆 + 对话 + 社交    │  ← v0.1 ✅
├─────────────────────────────────────┤
│  数据层：宠物配置 / 记忆 / 关系状态   │  ← 已有
└─────────────────────────────────────┘
```

**核心体验闭环：**

```
配置宠物 → 用户对话 → 个性回复 → 提取记忆 → 记忆驱动后续回复
    → 创建第二只宠物 → 自动互动 → 关系变化 → 互动总结
```

---

## 2. 目标用户与场景

| 用户 | 场景 |
|------|------|
| 作业评审 | 3 分钟内理解「个性 + 记忆 + 社交」三大能力 |
| 产品验证 | 快速验证 AI 宠物陪伴感是否成立 |
| 开发者 | 基于 AIProvider 接口扩展更多模型或功能 |

---

## 3. MVP 范围（当前已实现）

### 3.1 功能清单

| 模块 | 功能 | 状态 |
|------|------|------|
| 宠物配置 | 主/副宠物名称、5 种性格选择 | ✅ |
| 用户对话 | 文本聊天，性格影响回复风格 | ✅ |
| 记忆系统 | 提取名字/偏好，面板实时展示，后续对话引用 | ✅ |
| 宠物社交 | 两只宠物自动 6 轮对话 | ✅ |
| 关系变化 | 互动总结 + 关系状态（陌生→好奇→朋友…） | ✅ |
| AI 双模式 | DeepSeek 真实对话 + Mock 无 Key 兜底 | ✅ |

### 3.2 明确不做（MVP 阶段）

- 登录注册、多用户体系
- 数据库、后端持久化
- 社区广场、推荐算法
- 养成数值（饥饿/经验）
- 语音、多模态
- 3D 形象 / 照片生模型 / 动画交互（**延后至 v0.5+，见第 8 节**）

### 3.3 页面结构

```
┌──────────────────────────────────────────────────────┐
│  🐾 AI 宠物社交 Demo          [DeepSeek / Mock 模式]  │
├──────────────────────────┬───────────────────────────┤
│  宠物配置                 │  与主宠物对话              │
│  宠物记忆（名字/偏好）     │  宠物社交（自动互动）       │
└──────────────────────────┴───────────────────────────┘
```

### 3.4 设计要点

| 维度 | 方案 |
|------|------|
| 记忆 | 独立面板展示，能力可见 |
| 性格 | 5 种性格，Prompt/模板驱动，可切换对比 |
| 社交 | 自动对话 + 关系变化 |
| AI 架构 | Mock + DeepSeek 双模式，Provider 可替换 |

---

## 4. 数据模型

```typescript
type Personality = 'extrovert' | 'introvert' | 'tsundere' | 'gentle' | 'sarcastic';

interface Pet {
  id: string;
  name: string;
  personality: Personality;
  // v0.5+ 扩展
  modelUrl?: string;           // 3D 模型 CDN 地址（.glb / .vrm）
  avatarSource?: 'preset' | 'photo' | 'upload';
  thumbnailUrl?: string;
}

/** v0.5+ LLM 回复扩展结构 */
interface PetResponse {
  reply: string;
  emotion?: 'happy' | 'shy' | 'angry' | 'curious' | 'idle';
  action?: 'wave' | 'jump' | 'nod' | 'tilt' | 'idle';
}

interface UserMemory {
  name?: string;
  preferences: string[];
  recentMemories: { content: string; timestamp: number }[];
}

interface ChatMessage {
  id: string;
  senderId: 'user' | string;
  senderName: string;
  content: string;
  timestamp: number;
}

type RelationshipStatus = '陌生' | '好奇' | '朋友' | '竞争' | '亲密';
```

---

## 5. 版本规划与迭代周期

### MVP v0.1（当前，~2 小时）✅

**目标：** 满足作业全部要求，可演示、可交付。

| 交付物 | 说明 |
|--------|------|
| 在线 Demo | https://ai-pet-social.vercel.app/（国内可能需要梯子） |
| 源码 | https://github.com/mustcanbedo/ai-pet-social |
| 本地运行 | `npm run dev` |
| 真实 AI 对话 | DeepSeek + API Route 代理 |
| 记忆 + 社交 | 完整闭环 |
| 文档 | docs/ 目录下 PRD、TECH_DOC、ARCHITECTURE 等 |

---

### v0.2 体验增强（预估 1–2 天）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| localStorage 记忆持久化 | P0 | 刷新页面不丢记忆 |
| 对话历史上下文 | P1 | 多轮对话更连贯 |
| 错误态 / 重试 UI | P1 | API 失败友好提示 |
| 移动端响应式 | P2 | 基础适配 |

---

### v0.5 3D 视觉雏形（预估 3–5 天）

**目标：** 从纯文字升级为「看得见、会动」的宠物，验证视觉层与智能层的衔接。

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Three.js 3D 视窗 | P0 | 页面左侧/中央嵌入 3D 宠物展示 |
| 预设 3D 模型 | P0 | 2–3 个内置 .glb 宠物，按性格映射默认形象 |
| LLM 驱动动画 | P0 | 回复附带 `{ emotion, action }`，触发 idle / wave / happy |
| 聊天气泡保留 | P1 | 3D + 文字双轨，不丢失现有对话能力 |
| 双宠物 3D 社交预览 | P2 | 互动时两只模型面对面 + 字幕 |

**技术选型：**

| 能力 | 开源方案 |
|------|---------|
| 3D 渲染 | [Three.js](https://github.com/mrdoob/three.js) + React Three Fiber |
| 角色加载 | GLTFLoader（通用宠物）/ [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)（类人形） |
| 互动参考 | [dammagotchi](https://github.com/dammafra/dammagotchi)（虚拟宠物状态机） |
| 双角色对话参考 | [dev-fun-collab-v2-public](https://github.com/webdeveloperhyper/dev-fun-collab-v2-public)（VRM 自动对话 + 表情） |

**架构扩展：**

```
chat() 返回 PetResponse { reply, emotion, action }
  → ChatPanel 显示文字
  → PetViewport 播放动画
```

---

### v1.0 产品化（预估 1–2 周）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 用户登录（轻量） | P0 | 简单用户名即可 |
| 多宠物管理 | P1 | 动态增删宠物 |
| 关系图谱可视化 | P1 | 宠物间关系网络 |
| 2D 头像 AI 生成 | P2 | 快速个性化（轻量方案） |
| 部署上线 | P0 | ✅ 已部署 Vercel |

---

### v1.5 照片生 3D + 自定义形象（预估 1–2 周）

**目标：** 用户上传一张照片，生成专属 3D 宠物形象。

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 照片上传 | P0 | 支持 JPG/PNG，前端裁剪 |
| 图生 3D 管线 | P0 | 后台 GPU 推理 → 输出 .glb |
| 生成进度 UI | P0 | 5–30s 等待，进度条 + 预览 |
| 模型 CDN 存储 | P1 | 持久化用户专属模型 |
| 预设兜底 | P1 | 生成失败时回退预设模型 |

**技术选型：**

| 能力 | 开源方案 | 说明 |
|------|---------|------|
| 快速验证 | [TripoSR](https://github.com/VAST-AI-Research/TripoSR) | 单图快速重建，MIT |
| 高质量生产 | [Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1) | PBR 材质，开源权重 |
| 物体重建 | [SAM 3D Objects](https://github.com/imersual/sam-3d-objects) | 单图 shape + texture |

**基础设施约束：**

- 图生 3D **需要 GPU**，不能跑在 Vercel Serverless
- 方案：Replicate / Modal API，或自建 GPU 服务
- 新增 `/api/generate-3d` 转发至 GPU 后端

**用户流程：**

```
上传宠物照片 → GPU 生成 3D 模型 → 存入 CDN
  → 前端 Three.js 加载 → 绑定到 Pet.modelUrl
  → 后续对话/互动使用该专属形象
```

---

### v2.0 完整 3D 互动 + 社交扩展（预估 2–4 周）

| 功能 | 说明 |
|------|------|
| 点击/拖拽互动 | 摸头、喂食等触发动画 + LLM 反应 |
| 双宠物 3D 面对面社交 | 替代纯文字互动，模型 + 字幕 |
| 小游戏 | 参考 dammagotchi 跳跃等 mini-game |
| 用户间宠物互动 | 跨用户的宠物 3D 碰面 |
| 社区广场 | 宠物动态 feed |
| 养成数值 | 饥饿、心情、经验驱动不同动画状态 |
| 商业化 | 形象皮肤、动作包、关系报告 |

---

## 6. 成功指标（MVP）

- [ ] 评审 3 分钟内完成「个性 → 记忆 → 社交」演示
- [ ] 「我叫 XX」→「我叫啥」记忆召回成功
- [ ] 切换性格后回复风格可感知差异
- [ ] 两只宠物互动后产生关系变化

---

## 7. 演示路径（3 分钟）

1. 配置主宠物（名称 + 性格）→ 发送消息 → 展示个性
2. 「我叫胡杰」→「我喜欢猫」→「我叫啥？」→ 展示记忆
3. 配置第二只宠物 → 点击「让两只宠物互动」→ 展示社交

> 推荐 DeepSeek 模式。配置见 [README.md](../README.md)。

---

## 8. 3D 视觉宠物 — 技术整合方案

### 8.1 设计原则

- **智能层与表现层解耦**：DeepSeek 负责「说什么、什么情绪」，Three.js 负责「怎么动」
- **渐进增强**：v0.5 先用预设模型验证动画链路，v1.5 再接照片生 3D
- **文字不丢**：3D 是增强，聊天气泡/记忆面板保留

### 8.2 LLM → 动画映射

DeepSeek System Prompt 扩展，要求返回 JSON：

```json
{
  "reply": "胡杰！我当然记得你呀~",
  "emotion": "happy",
  "action": "wave"
}
```

| 字段 | 前端行为 |
|------|---------|
| `reply` | 聊天气泡（现有逻辑） |
| `emotion` | 切换表情 blend shape / 材质色调 |
| `action` | 播放对应 VRMA / GLB 动画片段 |

### 8.3 目录扩展（目标态）

```
src/
├── components/
│   PetViewport.tsx         # Three.js 单宠物视窗
│   InteractionScene.tsx    # 双宠物 3D 场景
├── services/
│   model3dService.ts       # 照片 → 3D API 调用
│   animationService.ts     # emotion/action → 动画映射表
└── app/api/
    generate-3d/route.ts    # 转发 GPU 推理服务
```

### 8.4 风险与对策

| 风险 | 对策 |
|------|------|
| 图生 3D 需 GPU，成本高 | 先用预设模型；图生 3D 按次计费或限免 |
| 生成质量不稳定 | 预设模板兜底 + 用户可重试 |
| 3D 模型体积大 | Draco 压缩 + CDN |
| 移动端性能 | 降级为 2D 头像 + 简单 CSS 动画 |
| Vercel 无法跑 GPU | 独立 GPU 服务 / 第三方 API |

### 8.5 版本路线图总览

```
v0.1 ✅ 文字 MVP（个性 + 记忆 + 社交）
  ↓
v0.2   体验 polish（持久化、上下文）
  ↓
v0.5   3D 预设模型 + LLM 驱动动画
  ↓
v1.0   用户体系 + 多宠物
  ↓
v1.5   照片生 3D + 自定义形象
  ↓
v2.0   完整 3D 互动 + 跨用户社交
```
