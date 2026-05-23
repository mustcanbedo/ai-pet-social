'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Pet, UserMemory, RelationshipStatus } from '@/types';
import { getAIProvider, ensureProvider } from '@/services/aiService';

interface Props {
  mainPet: Pet;
  secondPet: Pet;
  memory: UserMemory;
}

const RELATIONSHIP_COLORS: Record<RelationshipStatus, string> = {
  '陌生': 'bg-zinc-100 text-zinc-500',
  '好奇': 'bg-blue-50 text-blue-600',
  '朋友': 'bg-emerald-50 text-emerald-600',
  '竞争': 'bg-amber-50 text-amber-600',
  '亲密': 'bg-pink-50 text-pink-600',
};

export default function InteractionPanel({ mainPet, secondPet, memory }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [relationshipChange, setRelationshipChange] = useState<{
    from: RelationshipStatus;
    to: RelationshipStatus;
    reason: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const abortRef = useRef(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      ensureProvider().catch(() => {});
    }
  }, []);

  const canStart = mainPet.name.trim() && secondPet.name.trim() && !isRunning;

  const handleInteract = async () => {
    if (!canStart) return;
    setIsRunning(true);
    abortRef.current = false;
    setMessages([]);
    setSummary(null);
    setRelationshipChange(null);

    try {
      await ensureProvider();
      const provider = getAIProvider();
      const totalTurns = 6;
      const conversation: ChatMessage[] = [];

      for (let i = 0; i < totalTurns; i++) {
        if (abortRef.current) break;

        const speaker = i % 2 === 0 ? mainPet : secondPet;
        const other = i % 2 === 0 ? secondPet : mainPet;

        const line = await provider.generateInteractionTurn(conversation, speaker, other, memory);
        const msg: ChatMessage = {
          id: `interact-${Date.now()}-${i}`,
          senderId: speaker.id,
          senderName: speaker.name,
          content: line,
          timestamp: Date.now(),
        };

        conversation.push(msg);
        setMessages([...conversation]);
        await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      }

      const result = await provider.analyzeInteraction(conversation, mainPet, secondPet);
      setSummary(result.summary);
      setRelationshipChange(result.relationshipChange);
    } catch (err) {
      console.error('Interaction failed:', err);
    } finally {
      setIsRunning(false);
      setInteractionCount(c => c + 1);
    }
  };

  const isConfigured = mainPet.name.trim() && secondPet.name.trim();

  return (
    <section className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h2 className="text-[13px] font-semibold text-zinc-500">社交</h2>
        <button
          onClick={handleInteract}
          disabled={!canStart}
          className="rounded-full bg-zinc-800 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          {isRunning ? '对话中…' : '让宠物互动'}
        </button>
      </div>

      <div className="p-5">
        {!isConfigured ? (
          <p className="text-[13px] text-zinc-400">配置两只宠物的名称和性格后，它们会自动对话</p>
        ) : messages.length === 0 && !isRunning ? (
          <p className="text-[13px] text-zinc-400">
            点击「让宠物互动」开始{interactionCount > 0 ? '新一轮 ' : ''}对话
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => {
              const pet = msg.senderId === mainPet.id ? mainPet : secondPet;
              return (
                <div key={msg.id} className="rounded-xl bg-zinc-50 px-3.5 py-2.5 text-[14px] leading-relaxed">
                  <span className="mr-1 font-medium text-zinc-500">
                    {msg.senderName}：
                  </span>
                  {msg.content}
                </div>
              );
            })}
            {isRunning && (
              <div className="animate-pulse rounded-xl bg-blue-50 px-3.5 py-2.5 text-[14px] text-blue-400">
                对话进行中…
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {summary && relationshipChange && (
          <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">关系</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${RELATIONSHIP_COLORS[relationshipChange.from]}`}>
                {relationshipChange.from}
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${RELATIONSHIP_COLORS[relationshipChange.to]}`}>
                {relationshipChange.to}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-600">{relationshipChange.reason}</p>
            <div className="rounded-xl bg-zinc-50 px-3.5 py-3 text-[13px] leading-relaxed text-zinc-700">
              {summary}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
