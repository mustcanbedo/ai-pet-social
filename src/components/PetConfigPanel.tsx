'use client';

import { Pet, Personality, PERSONALITY_OPTIONS } from '@/types';

interface Props {
  mainPet: Pet;
  secondPet: Pet;
  onMainPetChange: (pet: Pet) => void;
  onSecondPetChange: (pet: Pet) => void;
}

function PetConfigRow({
  label,
  pet,
  onChange,
}: {
  label: string;
  pet: Pet;
  onChange: (p: Pet) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-zinc-600">
        {label}
      </label>
      <input
        type="text"
        placeholder="取个名字"
        value={pet.name}
        onChange={e => onChange({ ...pet, name: e.target.value })}
        className="mb-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px] outline-none placeholder:text-zinc-400 focus:border-blue-400"
      />
      <div className="flex gap-1.5 flex-wrap">
        {PERSONALITY_OPTIONS.map(opt => {
          const selected = pet.personality === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange({ ...pet, personality: opt.value as Personality })}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-all ${
                selected
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PetConfigPanel({
  mainPet,
  secondPet,
  onMainPetChange,
  onSecondPetChange,
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-[13px] font-semibold text-zinc-500">宠物</h2>
      <div className="space-y-5">
        <PetConfigRow label="宠物 A" pet={mainPet} onChange={onMainPetChange} />
        <div className="h-px bg-zinc-100" />
        <PetConfigRow label="宠物 B" pet={secondPet} onChange={onSecondPetChange} />
      </div>
      {!mainPet.name && (
        <p className="mt-3 text-[12px] text-amber-500">为主宠物取名后即可开始对话</p>
      )}
    </section>
  );
}
