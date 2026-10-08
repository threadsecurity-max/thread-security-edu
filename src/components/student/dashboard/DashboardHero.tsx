'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Sparkles, BookOpen, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface DashboardHeroProps {
  studentName: string;
  batchName: string | null;
  currentCourse: {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    progressPercent: number;
    modulesCount: number;
    completedModulesCount: number;
    currentModuleTitle: string;
    currentLessonTitle: string;
    lastActivityText: string;
    ctaText: string;
    ctaHref: string;
  } | null;
}

export function DashboardHero({
  studentName,
  batchName,
  currentCourse,
}: DashboardHeroProps) {
  // Determine dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = studentName.split(' ')[0] || studentName;

  return (
    <GlassCard
      level={3}
      glow={true}
      className="p-6 sm:p-8 md:p-10 border-[#C6FF34]/20 relative overflow-hidden"
    >
      {/* Ambient background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C6FF34]/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#C6FF34_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Greeting & Status */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/25 text-[#C6FF34] text-xs font-mono font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] animate-pulse" />
              CYBERSECURITY COHORT • {batchName || 'ACTIVE TRACK'}
            </span>
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline-block">
              Thread Security LMS
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-serif">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-white via-zinc-200 to-[#C6FF34] bg-clip-text text-transparent">
                {firstName}
              </span>
              .
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
              Continue building your offensive & defensive cybersecurity skills. Track your sandbox
              labs, ongoing syllabus, and qualification milestones.
            </p>
          </div>
        </div>

        {/* Right Column: Prominent Next Action Card */}
        {currentCourse ? (
          <div className="w-full lg:w-[420px] shrink-0 p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#C6FF34]" />
                CURRENT COURSE
              </span>
              <span className="text-xs font-mono font-bold text-[#C6FF34]">
                {currentCourse.progressPercent}%
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 font-serif">
                {currentCourse.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1 font-mono">
                {currentCourse.currentModuleTitle} • {currentCourse.currentLessonTitle}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(198,255,52,0.4)]"
                  style={{ width: `${Math.max(4, Math.min(100, currentCourse.progressPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>
                  {currentCourse.completedModulesCount} / {currentCourse.modulesCount} Modules
                </span>
                <span className="truncate max-w-[180px]">{currentCourse.lastActivityText}</span>
              </div>
            </div>

            {/* Dominant Primary CTA */}
            <Link href={currentCourse.ctaHref} className="block group">
              <button className="w-full py-3 px-5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] active:scale-[0.99] text-black font-mono font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(198,255,52,0.25)] hover:shadow-[0_4px_24px_rgba(198,255,52,0.4)] cursor-pointer">
                <span>{currentCourse.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="w-full lg:w-[380px] shrink-0 p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C6FF34]">
              GETTING STARTED
            </span>
            <p className="text-xs text-zinc-300">
              You are ready to begin your first cybersecurity training track.
            </p>
            <Link href="/student/courses" className="block">
              <button className="w-full py-2.5 px-4 rounded-xl bg-[#C6FF34] text-black font-mono font-bold text-xs tracking-wide flex items-center justify-center gap-2">
                <span>Explore Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
