export type Personality = 'extrovert' | 'introvert' | 'tsundere' | 'gentle' | 'sarcastic';

export const PERSONALITY_LABELS: Record<Personality, string> = {
  extrovert: '外向',
  introvert: '内向',
  tsundere: '傲娇',
  gentle: '温柔',
  sarcastic: '毒舌',
};

export const PERSONALITY_EMOJI: Record<Personality, string> = {
  extrovert: '🎉',
  introvert: '🌙',
  tsundere: '😼',
  gentle: '🌸',
  sarcastic: '🔥',
};

export const PERSONALITY_OPTIONS: { value: Personality; label: string }[] = [
  { value: 'extrovert', label: '外向' },
  { value: 'introvert', label: '内向' },
  { value: 'tsundere', label: '傲娇' },
  { value: 'gentle', label: '温柔' },
  { value: 'sarcastic', label: '毒舌' },
];

export const PERSONALITY_DESCRIPTIONS: Record<Personality, string> = {
  extrovert: '热情开朗，喜欢主动聊天，经常用感叹号',
  introvert: '安静害羞，说话简短温柔，喜欢用省略号',
  tsundere: '口是心非，表面冷漠其实很关心人',
  gentle: '温柔体贴，轻声细语，经常关心对方',
  sarcastic: '毒舌犀利，喜欢吐槽和调侃',
};

export interface Pet {
  id: string;
  name: string;
  personality: Personality;
}

export interface MemoryItem {
  content: string;
  timestamp: number;
}

export interface UserMemory {
  name?: string;
  preferences: string[];
  recentMemories: MemoryItem[];
}

export interface ChatMessage {
  id: string;
  senderId: 'user' | string;
  senderName: string;
  content: string;
  timestamp: number;
}

export type RelationshipStatus = '陌生' | '好奇' | '朋友' | '竞争' | '亲密';

export interface RelationshipChange {
  from: RelationshipStatus;
  to: RelationshipStatus;
  reason: string;
}

export interface PetInteraction {
  messages: ChatMessage[];
  summary: string;
  relationshipChange: RelationshipChange;
}
