'use client';

import { UserMemory } from '@/types';

interface Props {
  memory: UserMemory;
}

export default function MemoryPanel({ memory }: Props) {
  const hasMemory = memory.name || memory.preferences.length > 0 || memory.recentMemories.length > 0;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-[13px] font-semibold text-zinc-500">记忆</h2>

      {!hasMemory ? (
        <p className="text-[13px] leading-relaxed text-zinc-400">
          宠物会记住你说过的话。
          <br />
          试试说「我叫胡杰」「我喜欢猫」。
        </p>
      ) : (
        <div className="space-y-3.5">
          {memory.name && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">你的名字</span>
              <div className="mt-1 rounded-xl bg-blue-50 px-3 py-2 text-[14px] font-medium text-blue-700">
                {memory.name}
              </div>
            </div>
          )}

          {memory.preferences.length > 0 && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">偏好</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {memory.preferences.map((pref, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-[12px] font-medium text-zinc-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {memory.recentMemories.length > 0 && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">最近</span>
              <ul className="mt-1 space-y-1">
                {memory.recentMemories.slice(0, 5).map((item, i) => (
                  <li key={i} className="rounded-lg bg-zinc-50 px-3 py-1.5 text-[13px] text-zinc-600">
                    {item.content}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="pt-0.5 text-[11px] text-zinc-400">
            宠物回复时会自然引用这些记忆
          </p>
        </div>
      )}
    </section>
  );
}
