'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Flame, Check } from 'lucide-react';

export interface LearningStreakProps {
  currentStreak: number;
  streakDays: { day: string; active: boolean; date: string }[];
}

export function LearningStreakWidget({
  currentStreak,
  streakDays,
}: LearningStreakProps) {
  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            LEARNING STREAK
          </span>
        </div>
        <span className="text-base font-extrabold font-mono text-white">
          {currentStreak} <span className="text-xs text-zinc-500 font-normal">Days</span>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {streakDays.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500">{item.day}</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                item.active
                  ? 'bg-[#C6FF34] text-black font-bold shadow-[0_0_8px_rgba(198,255,52,0.3)]'
                  : 'bg-white/[0.04] border border-white/[0.06] text-zinc-600'
              }`}
              title={item.date}
            >
              {item.active ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '·'}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
