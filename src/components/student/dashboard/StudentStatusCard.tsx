'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { ShieldCheck, Flame, User, Award, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface StudentStatusCardProps {
  student: {
    name: string;
    email: string;
    avatarUrl: string | null;
    tsId: string;
    batchName: string | null;
    batchCode: string | null;
    currentStreak: number;
    totalHours: number;
    assignedMentor: {
      name: string;
      title: string;
    } | null;
  };
  overallProgressPercent: number;
  enrolledCoursesCount: number;
}

export function StudentStatusCard({
  student,
  overallProgressPercent,
  enrolledCoursesCount,
}: StudentStatusCardProps) {
  const initial = student.name ? student.name[0].toUpperCase() : 'S';

  return (
    <GlassCard level={2} className="p-6 space-y-6">
      {/* Header Profile Identity */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C6FF34]/20 via-white/10 to-[#C6FF34]/40 border border-[#C6FF34]/40 flex items-center justify-center text-white font-mono font-bold text-lg shadow-inner">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                initial
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C6FF34] border-2 border-black" title="Verified Session" />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{student.name}</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono truncate max-w-[160px] sm:max-w-[200px]">
              {student.email}
            </p>
          </div>
        </div>

        {/* Visual TS-ID Pill */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">
            AUTHENTICATED TS-ID
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] font-mono font-bold text-xs shadow-[0_0_12px_rgba(198,255,52,0.12)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            {student.tsId}
          </span>
        </div>
      </div>

      {/* Grid of Key Attributes */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.08]">
        {/* Cohort */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
            BATCH COHORT
          </span>
          <span className="text-xs font-semibold text-white block truncate" title={student.batchName || 'Active Batch'}>
            {student.batchCode || 'GENERAL'}
          </span>
        </div>

        {/* Mentor */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
            FACULTY MENTOR
          </span>
          <span className="text-xs font-semibold text-zinc-200 block truncate" title={student.assignedMentor?.name || 'Academic Faculty'}>
            {student.assignedMentor?.name || 'Faculty Assigned'}
          </span>
        </div>

        {/* Learning Streak */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
            LEARNING STREAK
          </span>
          <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {student.currentStreak} Day{student.currentStreak === 1 ? '' : 's'}
          </span>
        </div>

        {/* Overall Completion */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
            OVERALL PROGRESS
          </span>
          <span className="text-xs font-mono font-bold text-[#C6FF34] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {overallProgressPercent}%
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
