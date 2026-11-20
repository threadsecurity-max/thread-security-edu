'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ENROLLMENT_CHECKLIST } from '@/data/aboutUsData';
import {
  CheckSquare,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';

const STORAGE_KEY = 'ts_enrollment_checklist_state_v1';

export function EnrollmentChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [, setIsClient] = useState(false);

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
    <section id="checklist" className="scroll-mt-28 py-20 sm:py-28 bg-black text-white border-y border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700 mb-4">
            <CheckSquare className="w-3.5 h-3.5 text-white" />
            <span>SECTION 09 // PRE-ENROLLMENT DILIGENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Before you join Thread Security.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            An informed decision starts with the right questions. Review these ten points for the specific program you are considering. Tick each one as you go.
          </p>
        </div>

        {/* Interactive Progress Bar Card */}
        <div className="mb-10 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span>
                  {completedCount}/{totalCount} reviewed
                </span>
                <span className="text-zinc-600 font-normal">&bull;</span>
                <span className="text-zinc-400 font-normal">
                  {remainingCount} items remaining
                </span>
              </span>

              <span className="font-mono text-xs font-bold text-white">
                {progressPercentage}% Completed
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer border border-zinc-700"
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
                    ? 'bg-zinc-900/90 border-white/40 shadow-sm'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
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
                      <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg border-2 border-zinc-700 bg-zinc-900 text-transparent hover:border-white transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">
                        {item.number}.
                      </span>
                      <h3
                        className={`text-base font-bold tracking-tight transition-colors ${
                          isChecked ? 'text-white' : 'text-zinc-200'
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-normal max-w-3xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="sm:shrink-0 pl-10 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={item.ctaHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono transition-colors"
                  >
                    <span>{item.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Banner When 10/10 Checked */}
        {isAllCompleted && (
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-700 shadow-xl animate-in fade-in duration-300 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-white border border-zinc-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>ALL 10 ESSENTIALS REVIEWED</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                You&apos;ve reviewed the essentials.
              </h3>
              <p className="text-sm text-zinc-300 max-w-xl">
                Take your time, ask questions, and make the decision that is right for you. Our admissions desk is available to walk you through any remaining syllabus details.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-tight transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-black" />
              <span>Talk to Our Team</span>
            </Link>
          </div>
        )}

        {/* Legal Nature Clarification */}
        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-500">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>
            Educational Diligence Aid: This checklist is intended to assist your independent evaluation. It does not constitute a legal contract or policy acceptance.
          </span>
        </div>
      </div>
    </section>
  );
}
