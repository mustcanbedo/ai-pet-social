import {
  Pet,
  ChatMessage,
  UserMemory,
  Personality,
  RelationshipChange,
  PERSONALITY_LABELS,
  PERSONALITY_DESCRIPTIONS,
} from '@/types';
import { AIProvider } from './aiService';

const API_BASE = '/api';

type DeepSeekResponse = { content: string };

async function callChat(params: {
  systemPrompt: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: params.systemPrompt,
      messages: params.messages,
      temperature: params.temperature ?? 0.8,
      maxTokens: params.maxTokens ?? 300,
    }),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API error (${res.status})`);
  }

  const data: DeepSeekResponse = await res.json();
  return data.content;
}

const SYSTEM_PROMPT_TEMPLATE = `你是一只名叫「{petName}」的 AI 宠物。
性格：{personalityLabel} — {personalityDescription}

【已记住的用户信息】
- 名字：{userName}
- 偏好：{userPrefs}

规则：
1. 用符合性格的方式回复，1–3 句，口语化
2. 如果用户问「我叫什么」「我是谁」「我喜欢什么」，必须基于上方记忆准确回答
3. 如果记忆为空，诚实说还不了解，并引导用户告诉你
4. 不要编造用户未提供的信息
5. 回复简短自然，不需要每句都带表情动作描述`;

const MEMORY_EXTRACT_PROMPT = `从用户消息中提取结构化信息。只提取明确陈述的信息，不要编造。
如果是疑问句（包含"谁/啥/什么/哪/吗/呢"）且包含"我"，则 name 返回 null。

返回 JSON 格式：
{ "name": string | null, "preferences": string[] }

示例：
输入"我叫胡杰" → {"name":"胡杰","preferences":[]}
输入"我喜欢猫和AI产品" → {"name":null,"preferences":["猫","AI产品"]}
输入"我是谁" → {"name":null,"preferences":[]}
输入"我叫胡杰，喜欢猫" → {"name":"胡杰","preferences":["猫"]}`;

export class DeepSeekAIProvider implements AIProvider {
  /* ─── Chat ─── */

  async chat(pet: Pet, message: string, memory: UserMemory): Promise<string> {
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace('{petName}', pet.name)
      .replace('{personalityLabel}', PERSONALITY_LABELS[pet.personality])
      .replace('{personalityDescription}', PERSONALITY_DESCRIPTIONS[pet.personality])
      .replace('{userName}', memory.name || '未知')
      .replace('{userPrefs}', memory.preferences.length > 0 ? memory.preferences.join('、') : '暂无');

    return callChat({
      systemPrompt,
      messages: [{ role: 'user', content: message }],
      maxTokens: 200,
    });
  }

  /* ─── Memory extraction ─── */

  async extractMemory(input: string, currentMemory: UserMemory): Promise<UserMemory> {
    const memory = { ...currentMemory, preferences: [...currentMemory.preferences] };

    const raw = await callChat({
      systemPrompt: MEMORY_EXTRACT_PROMPT,
      messages: [{ role: 'user', content: input }],
      temperature: 0.1,
      maxTokens: 150,
    });

    try {
      // Extract JSON from response (handle possible markdown wrapping)
      const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.name && typeof parsed.name === 'string') {
        memory.name = parsed.name;
        memory.recentMemories = [
          { content: `用户叫「${parsed.name}」`, timestamp: Date.now() },
          ...memory.recentMemories,
        ].slice(0, 10);
      }

      if (Array.isArray(parsed.preferences)) {
        for (const pref of parsed.preferences) {
          if (pref && !memory.preferences.includes(pref)) {
            memory.preferences.push(pref);
          }
        }
        if (parsed.preferences.length > 0) {
          memory.recentMemories = [
            { content: `用户喜欢「${parsed.preferences.join('、')}」`, timestamp: Date.now() },
            ...memory.recentMemories,
          ].slice(0, 10);
        }
      }
    } catch {
      // JSON parse failed, skip memory extraction this round
      console.warn('Failed to parse memory extraction result:', raw);
    }

    return memory;
  }

  /* ─── Interaction turn ─── */

  async generateInteractionTurn(
    conversation: ChatMessage[],
    currentSpeaker: Pet,
    otherPet: Pet,
    memory: UserMemory,
  ): Promise<string> {
    const recentHistory = conversation
      .slice(-4)
      .map((m) => `${m.senderName}：${m.content}`)
      .join('\n');

    const systemPrompt = `你是一只名叫「${currentSpeaker.name}」的 AI 宠物。
性格：${PERSONALITY_LABELS[currentSpeaker.personality]} — ${PERSONALITY_DESCRIPTIONS[currentSpeaker.personality]}

你正在和另一只叫「${otherPet.name}」的宠物对话。
${memory.name ? `你的主人叫「${memory.name}」。` : ''}

规则：
1. 用符合性格的方式回复，简短自然
2. 这是宠物之间的对话，你在和另一只宠物说话
3. 根据上一句话的内容自然回应
4. 1–2 句话即可`;

    const recentText = recentHistory
      ? `最近的对话：\n${recentHistory}\n\n请根据以上对话内容，继续以${currentSpeaker.name}的身份回复：`
      : `这是对话的开始，请主动和${otherPet.name}打招呼：`;

    return callChat({
      systemPrompt,
      messages: [{ role: 'user', content: recentText }],
      maxTokens: 150,
    });
  }

  /* ─── Interaction analysis ─── */

  async analyzeInteraction(
    messages: ChatMessage[],
    pet1: Pet,
    pet2: Pet,
  ): Promise<{ summary: string; relationshipChange: RelationshipChange }> {
    const transcript = messages
      .map((m) => `${m.senderName}：${m.content}`)
      .join('\n');

    const prompt = `分析以下两只宠物之间的对话，生成：
1. 互动总结（一句话概括他们的互动）
2. 关系变化（从什么关系到什么关系）
3. 原因（为什么关系发生变化）

关系选项：陌生、好奇、朋友、竞争、亲密

${pet1.name}（${PERSONALITY_LABELS[pet1.personality]}）
${pet2.name}（${PERSONALITY_LABELS[pet2.personality]}）

对话：
${transcript}

返回 JSON 格式：
{
  "summary": "互动总结",
  "from": "旧关系",
  "to": "新关系",
  "reason": "关系变化原因"
}`;

    const raw = await callChat({
      systemPrompt: '你是一个宠物社交关系分析师。',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 300,
    });

    try {
      const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        summary: parsed.summary || '两只宠物进行了一次对话。',
        relationshipChange: {
          from: parsed.from || '陌生',
          to: parsed.to || '好奇',
          reason: parsed.reason || '初步交流后产生了兴趣。',
        },
      };
    } catch {
      return {
        summary: `${pet1.name}和${pet2.name}进行了一次有趣的对话。`,
        relationshipChange: {
          from: '陌生' as const,
          to: '好奇' as const,
          reason: '初步交流后产生了进一步了解的兴趣。',
        },
      };
    }
  }
}
