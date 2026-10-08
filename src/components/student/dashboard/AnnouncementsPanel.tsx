'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Megaphone, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  priority: 'HIGH' | 'NORMAL';
}

export function AnnouncementsPanel({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-[#C6FF34]" />
          ANNOUNCEMENTS
        </span>
        <span className="text-[10px] font-mono text-zinc-500">Cohort News</span>
      </div>

      {announcements.length === 0 ? (
        <p className="text-xs text-zinc-500 font-mono py-2">No active broadcast announcements.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 line-clamp-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.priority === 'HIGH' ? 'bg-[#C6FF34]' : 'bg-zinc-500'
                    }`}
                  />
                  {item.title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {item.timeAgo}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-1">
        <Link
          href="/student/attendance"
          className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1"
        >
          <span>View Batch Board</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </GlassCard>
  );
}
