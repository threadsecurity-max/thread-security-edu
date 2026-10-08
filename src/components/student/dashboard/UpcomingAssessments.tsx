'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassCard';
import { Cpu, Clock, HelpCircle, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export interface AssessmentItem {
  id: string;
  title: string;
  courseTitle: string;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
  dueText: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  score: number | null;
  href: string;
}

export function UpcomingAssessments({
  assessments,
}: {
  assessments: AssessmentItem[];
}) {
  if (assessments.length === 0) {
    return (
      <GlassCard level={1} className="p-6 text-center space-y-2">
        <Cpu className="w-6 h-6 text-zinc-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">No pending assessments</h4>
        <p className="text-xs text-zinc-400">You are all caught up on scheduled exams.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Assessments</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Knowledge benchmarks & qualification exams
          </p>
        </div>
        <Link
          href="/student/assessments"
          className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1"
        >
          <span>All Tests</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((item) => {
          const isPassed = item.status === 'PASSED';
          const isFailed = item.status === 'FAILED';

          return (
            <GlassCard
              key={item.id}
              level={1}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.16] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-400">
                    {item.courseTitle}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isFailed
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20'
                    }`}
                  >
                    {isPassed
                      ? `PASSED (${item.score}%)`
                      : isFailed
                      ? `RETAKE (${item.score}%)`
                      : 'AVAILABLE'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                      {item.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {item.durationMinutes} Mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  Pass Mark: {item.passingScore}%
                </span>
                <Link href={item.href}>
                  <button className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                    <span>{isPassed ? 'Review Results' : 'Take Exam'}</span>
                    <ArrowRight className="w-3 h-3 text-[#C6FF34]" />
                  </button>
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
