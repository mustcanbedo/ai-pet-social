'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pet, ChatMessage, UserMemory, Personality } from '@/types';
import PetConfigPanel from '@/components/PetConfigPanel';
import ChatPanel from '@/components/ChatPanel';
import MemoryPanel from '@/components/MemoryPanel';
import InteractionPanel from '@/components/InteractionPanel';

export default function Home() {
  const [mainPet, setMainPet] = useState<Pet>({
    id: 'pet1', name: '', personality: 'extrovert' as Personality,
  });
  const [secondPet, setSecondPet] = useState<Pet>({
    id: 'pet2', name: '', personality: 'introvert' as Personality,
  });
  const [activePetId, setActivePetId] = useState('pet1');
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [userMemory, setUserMemory] = useState<UserMemory>({
    preferences: [], recentMemories: [],
  });
  const [providerType, setProviderType] = useState<'mock' | 'deepseek'>('mock');

  useEffect(() => {
    fetch('/api/provider')
      .then(r => r.json())
      .then(d => setProviderType(d.type))
      .catch(() => {});
  }, []);

  const allPets = useMemo(() => [mainPet, secondPet], [mainPet, secondPet]);
  const activePet = useMemo(
    () => allPets.find(p => p.id === activePetId) || mainPet,
    [allPets, activePetId, mainPet],
  );
  const currentMessages = conversations[activePetId] || [];

  const handleChatSend = (petId: string, msg: ChatMessage) => {
    setConversations(prev => ({
      ...prev,
      [petId]: [...(prev[petId] || []), msg],
    }));
  };

  const providerBadge =
    providerType === 'deepseek'
      ? { label: 'DeepSeek', dot: 'bg-emerald-500' }
      : { label: 'Mock AI', dot: 'bg-zinc-300' };

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-zinc-50 px-6 py-5">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-base font-semibold tracking-tight text-zinc-800">
          AI 宠物社交
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/60 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${providerBadge.dot}`} />
          {providerBadge.label}
        </span>
      </header>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="flex w-72 shrink-0 flex-col gap-5">
          <PetConfigPanel
            mainPet={mainPet}
            secondPet={secondPet}
            onMainPetChange={setMainPet}
            onSecondPetChange={setSecondPet}
          />
          <MemoryPanel memory={userMemory} />
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <ChatPanel
            activePet={activePet}
            allPets={allPets}
            activePetId={activePetId}
            onSwitchPet={setActivePetId}
            messages={currentMessages}
            memory={userMemory}
            onSend={(msg) => handleChatSend(activePetId, msg)}
            onMemoryUpdate={setUserMemory}
          />
          <InteractionPanel
            mainPet={mainPet}
            secondPet={secondPet}
            memory={userMemory}
          />
        </div>
      </div>
    </div>
  );
}
