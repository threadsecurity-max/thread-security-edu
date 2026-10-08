'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassCard';
import { PlayCircle, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ContinueLearningCardProps {
  currentCourse: {
    id: string;
    title: string;
    category: string;
    progressPercent: number;
    currentModuleTitle: string;
    currentLessonTitle: string;
    lastActivityText: string;
    ctaText: string;
    ctaHref: string;
  } | null;
}

export function ContinueLearningCard({ currentCourse }: ContinueLearningCardProps) {
  if (!currentCourse) {
    return (
      <GlassCard level={1} className="p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-white">No active course in progress</h3>
        <p className="text-xs text-zinc-400">Enroll in a cybersecurity track to start learning.</p>
        <Link href="/student/courses" className="inline-block">
          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-semibold">
            Browse Catalog
          </button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard level={2} className="p-6 space-y-5 border-l-4 border-l-[#C6FF34]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#C6FF34]/10 text-[#C6FF34]">
              RESUME STUDYING
            </span>
            <span className="text-xs font-mono text-zinc-400">{currentCourse.category}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{currentCourse.title}</h2>
        </div>

        <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          {currentCourse.lastActivityText}
        </span>
      </div>

      {/* Target Module and Lesson Detail */}
      <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide block">
            {currentCourse.currentModuleTitle}
          </span>
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-[#C6FF34] shrink-0" />
            <span className="truncate">{currentCourse.currentLessonTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">SYLLABUS PROGRESS</span>
            <span className="text-xs font-mono font-bold text-[#C6FF34]">
              {currentCourse.progressPercent}%
            </span>
          </div>

          <Link href={currentCourse.ctaHref}>
            <button className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] active:scale-95 text-black font-mono font-bold text-xs tracking-wide flex items-center gap-2 transition-all shadow-[0_2px_12px_rgba(198,255,52,0.25)] cursor-pointer">
              <span>{currentCourse.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
