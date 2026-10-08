'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface CalendarEventItem {
  id: string;
  title: string;
  type: 'LECTURE' | 'ASSESSMENT' | 'DEADLINE';
  dateText: string;
  timeText: string;
}

export function CalendarWidget({
  events,
}: {
  events: CalendarEventItem[];
}) {
  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#C6FF34]" />
          ACADEMIC CALENDAR
        </span>
        <span className="text-[10px] font-mono text-zinc-500">Live Schedule</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-zinc-500 font-mono py-2">
          No upcoming scheduled sessions for this week.
        </p>
      ) : (
        <div className="space-y-2.5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-white block truncate">{evt.title}</span>
                <span className="text-[10px] font-mono text-zinc-400 block">
                  {evt.dateText} • {evt.timeText}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 shrink-0">
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-1">
        <Link
          href="/student/attendance"
          className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1"
        >
          <span>View Session Ledger</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </GlassCard>
  );
}
