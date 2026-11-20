'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ENROLLMENT_CHECKLIST } from '@/data/aboutUsData';
import {
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';

const STORAGE_KEY = 'ts_enrollment_checklist_state_v1';

export function EnrollmentChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('[Checklist] Failed to read from localStorage:', e);
    }
  }, []);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('[Checklist] Failed to save to localStorage:', e);
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedItems({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[Checklist] Failed to reset localStorage:', e);
    }
  };

  const totalCount = ENROLLMENT_CHECKLIST.length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const isAllCompleted = completedCount === totalCount;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <section id="checklist" className="scroll-mt-28 py-20 sm:py-28 bg-slate-900/60 text-white border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-lime-400/10 text-lime-400 border border-lime-400/30 mb-4">
            <CheckSquare className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 09 // PRE-ENROLLMENT DILIGENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Before you join Thread Security.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            An informed decision starts with the right questions. Review these ten points for the specific program you are considering. Tick each one as you go.
          </p>
        </div>

        {/* Interactive Progress Bar Card */}
        <div className="mb-10 p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <span>
                  {completedCount}/{totalCount} reviewed
                </span>
                <span className="text-slate-500 font-normal">&bull;</span>
                <span className="text-slate-400 font-normal">
                  {remainingCount} items remaining
                </span>
              </span>

              <span className="font-mono text-xs font-bold text-lime-400">
                {progressPercentage}% Completed
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-xs font-mono font-medium transition-colors cursor-pointer border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 10-Point Checklist Items */}
        <div className="space-y-4 mb-10">
          {ENROLLMENT_CHECKLIST.map((item) => {
            const isChecked = Boolean(checkedItems[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                  isChecked
                    ? 'bg-lime-950/20 border-lime-500/40 shadow-xs'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleItem(item.id);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <div className="w-6 h-6 rounded-lg bg-lime-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-700 bg-slate-900 text-transparent hover:border-lime-400 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-lime-400/80">
                        {item.number}.
                      </span>
                      <h3
                        className={`text-base font-bold tracking-tight transition-colors ${
                          isChecked ? 'text-lime-300' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-3xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="sm:shrink-0 pl-10 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={item.ctaHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-750 text-xs font-mono transition-colors"
                  >
                    <span>{item.ctaLabel}</span>
                    <ArrowRight className="w-3 h-3 text-lime-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Banner When 10/10 Checked */}
        {isAllCompleted && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-lime-950/60 via-slate-900 to-emerald-950/60 border border-lime-500/40 shadow-2xl animate-in fade-in duration-300 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                <span>ALL 10 ESSENTIALS REVIEWED</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                You&apos;ve reviewed the essentials.
              </h3>
              <p className="text-sm text-slate-300 max-w-xl">
                Take your time, ask questions, and make the decision that is right for you. Our admissions desk is available to walk you through any remaining syllabus details.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm tracking-tight transition-all shadow-[0_0_24px_rgba(163,230,53,0.3)] shrink-0 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Talk to Our Team</span>
            </Link>
          </div>
        )}

        {/* Legal Nature Clarification */}
        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Educational Diligence Aid: This checklist is intended to assist your independent evaluation. It does not constitute a legal contract or policy acceptance.
          </span>
        </div>
      </div>
    </section>
  );
}
