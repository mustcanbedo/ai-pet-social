import { Pet, ChatMessage, UserMemory, RelationshipChange } from '@/types';
import { MockAIProvider } from './mockAIProvider';
import { DeepSeekAIProvider } from './deepseekProvider';

export interface AIProvider {
  chat(pet: Pet, message: string, memory: UserMemory): Promise<string>;
  extractMemory(input: string, currentMemory: UserMemory): UserMemory | Promise<UserMemory>;
  generateInteractionTurn(
    conversation: ChatMessage[],
    currentSpeaker: Pet,
    otherPet: Pet,
    memory: UserMemory,
  ): Promise<string>;
  analyzeInteraction(
    messages: ChatMessage[],
    pet1: Pet,
    pet2: Pet,
  ): Promise<{
    summary: string;
    relationshipChange: RelationshipChange;
  }>;
}

let provider: AIProvider = new MockAIProvider();
let providerType: 'mock' | 'deepseek' = 'mock';
let initPromise: Promise<void> | null = null;

async function detectProvider(): Promise<void> {
  try {
    const res = await fetch('/api/provider');
    const data = await res.json();
    if (data.type === 'deepseek') {
      provider = new DeepSeekAIProvider();
      providerType = 'deepseek';
    }
  } catch {
    // Network error — keep mock provider
  }
}

export function ensureProvider(): Promise<void> {
  if (!initPromise) {
    initPromise = detectProvider();
  }
  return initPromise;
}

export function getAIProvider(): AIProvider {
  return provider;
}

export function getProviderType(): 'mock' | 'deepseek' {
  return providerType;
}
