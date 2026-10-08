'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { BookOpen, Layers, Award, Clock, Cpu, CheckCircle } from 'lucide-react';

export interface LearningProgressOverviewProps {
  journey: {
    overallProgressPercent: number;
    coursesEnrolledCount: number;
    coursesCompletedCount: number;
    modulesTotalCount: number;
    modulesCompletedCount: number;
    assessmentsCompletedCount: number;
    certificatesEarnedCount: number;
  };
  totalHours: number;
}

export function LearningProgressOverview({
  journey,
  totalHours,
}: LearningProgressOverviewProps) {
  const percent = Math.min(100, Math.max(0, journey.overallProgressPercent));
  
  // Circumference for r = 42
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <GlassCard level={2} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight font-serif">Your Learning Journey</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Holistic completion metrics & hands-on laboratory time
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
          Academic Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Circular Progress Meter (Col 4) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/[0.06] relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-[#C6FF34] transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {percent}%
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                OVERALL
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-semibold text-zinc-300 block">Coursework Completion</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {journey.modulesCompletedCount} of {journey.modulesTotalCount} Modules Finalized
            </span>
          </div>
        </div>

        {/* Breakdown Metric Tiles (Col 7) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3.5">
          {/* Modules Completed */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">MODULES</span>
              <Layers className="w-3.5 h-3.5 text-[#C6FF34]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">
                {journey.modulesCompletedCount}
              </span>
              <span className="text-xs font-mono text-zinc-500">/ {journey.modulesTotalCount}</span>
            </div>
          </div>

          {/* Assessments Completed */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">ASSESSMENTS</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">
                {journey.assessmentsCompletedCount}
              </span>
              <span className="text-xs font-mono text-zinc-500">Evaluated</span>
            </div>
          </div>

          {/* Learning Hours */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">LEARNING TIME</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{totalHours}</span>
              <span className="text-xs font-mono text-zinc-500">Hours</span>
            </div>
          </div>

          {/* Certificates Earned */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">CREDENTIALS</span>
              <Award className="w-3.5 h-3.5 text-[#C6FF34]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">
                {journey.certificatesEarnedCount}
              </span>
              <span className="text-xs font-mono text-zinc-500">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
