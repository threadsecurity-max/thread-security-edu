'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Clock, Target, TrendingUp } from 'lucide-react';

export interface WeeklyAnalyticsProps {
  weeklyHours: number;
  goalHours: number;
}

export function WeeklyAnalyticsWidget({
  weeklyHours,
  goalHours = 10,
}: WeeklyAnalyticsProps) {
  const percent = Math.min(100, Math.round((weeklyHours / goalHours) * 100));

  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            THIS WEEK
          </span>
        </div>
        <span className="text-xs font-mono text-[#C6FF34] font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {percent}% of Goal
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-white">
              {weeklyHours}
            </span>
            <span className="text-xs font-mono text-zinc-400">hours logged</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">Goal: {goalHours}h</span>
        </div>

        {/* Minimal progress bar */}
        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(198,255,52,0.3)]"
            style={{ width: `${Math.max(3, percent)}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
