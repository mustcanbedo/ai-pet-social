'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Pet, UserMemory, PERSONALITY_LABELS } from '@/types';
import { getAIProvider, ensureProvider } from '@/services/aiService';

interface Props {
  activePet: Pet;
  allPets: Pet[];
  activePetId: string;
  onSwitchPet: (id: string) => void;
  messages: ChatMessage[];
  memory: UserMemory;
  onSend: (msg: ChatMessage) => void;
  onMemoryUpdate: (memory: UserMemory) => void;
}

export default function ChatPanel({
  activePet,
  allPets,
  activePetId,
  onSwitchPet,
  messages,
  memory,
  onSend,
  onMemoryUpdate,
}: Props) {
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      ensureProvider().catch(() => {});
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activePet.name || isWaiting) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: '你',
      content: input.trim(),
      timestamp: Date.now(),
    };

    onSend(userMsg);
    setInput('');
    setIsWaiting(true);
    setError(null);

    try {
      await ensureProvider();
      const provider = getAIProvider();
      const updatedMemory = await provider.extractMemory(userMsg.content, memory);
      onMemoryUpdate(updatedMemory);

      const reply = await provider.chat(activePet, userMsg.content, updatedMemory);
      const petMsg: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        senderId: activePet.id,
        senderName: activePet.name,
        content: reply,
        timestamp: Date.now(),
      };
      onSend(petMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : '回复失败，请重试');
    } finally {
      setIsWaiting(false);
    }
  };

  const hasTwoPets = allPets.filter(p => p.name.trim()).length >= 2;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
      {/* Pet Switcher — Apple-style segmented control */}
      {hasTwoPets && (
        <div className="flex gap-1 border-b border-zinc-100 px-4 pb-3 pt-3">
          {allPets.filter(p => p.name.trim()).map(pet => {
            const isActive = pet.id === activePetId;
            return (
              <button
                key={pet.id}
                onClick={() => onSwitchPet(pet.id)}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'bg-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {pet.name}
                <span className="ml-1 font-normal text-zinc-400">
                  {PERSONALITY_LABELS[pet.personality]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        style={{ maxHeight: 360, minHeight: 240 }}
      >
        {!activePet.name ? (
          <p className="pt-10 text-center text-[13px] text-zinc-400">
            先在左侧为你的主宠物取个名字吧
          </p>
        ) : messages.length === 0 ? (
          <p className="pt-10 text-center text-[13px] text-zinc-400">
            开始和 {activePet.name} 聊天吧
          </p>
        ) : (
          messages.map(msg => {
            const isUser = msg.senderId === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[72%]">
                  {!isUser && (
                    <div className="mb-1 px-1 text-[12px] font-medium text-zinc-400">
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                      isUser
                        ? 'rounded-br-md bg-blue-500 text-white'
                        : 'rounded-bl-md bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isWaiting && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-2.5 text-[14px] text-zinc-400">
              {activePet.name} 正在输入...
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={activePet.name ? `发消息给 ${activePet.name}` : '先配置宠物吧'}
          disabled={!activePet.name || isWaiting}
          className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-[14px] outline-none placeholder:text-zinc-400 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !activePet.name || isWaiting}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1.5 1.5L13.5 7.5L1.5 13.5L4 7.5L1.5 1.5Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
