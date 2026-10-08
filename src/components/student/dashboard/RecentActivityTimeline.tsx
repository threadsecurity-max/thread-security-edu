'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { CheckCircle2, PlayCircle, Terminal, Cpu, Calendar } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'MODULE_COMPLETED' | 'QUIZ_SCORED' | 'LAB_SUBMITTED' | 'ATTENDANCE_LOGGED';
  title: string;
  subtitle: string;
  timeAgo: string;
}

export function RecentActivityTimeline({
  activities,
}: {
  activities: ActivityItem[];
}) {
  if (activities.length === 0) {
    return (
      <GlassCard level={1} className="p-6 text-center space-y-2">
        <p className="text-xs text-zinc-500 font-mono">No recent activity logged yet.</p>
      </GlassCard>
    );
  }

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'MODULE_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'QUIZ_SCORED':
        return <Cpu className="w-3.5 h-3.5 text-[#C6FF34]" />;
      case 'LAB_SUBMITTED':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'ATTENDANCE_LOGGED':
        return <Calendar className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <PlayCircle className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <GlassCard level={2} className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-serif font-bold text-white tracking-tight">Recent Activity</h3>
        <span className="text-[11px] font-mono text-zinc-500">Live Ledger</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-black border border-white/[0.15] flex items-center justify-center">
              {getIcon(act.type)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white group-hover:text-[#C6FF34] transition-colors line-clamp-1">
                  {act.title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {act.timeAgo}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono line-clamp-1">{act.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
