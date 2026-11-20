'use client';

import React from 'react';
import { LEARNING_JOURNEY_STEPS } from '@/data/aboutUsData';
import { Route, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export function LearningJourney() {
  return (
    <section id="ecosystem" className="scroll-mt-28 py-20 sm:py-24 bg-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800 mb-4">
            <Route className="w-3.5 h-3.5 text-zinc-300" />
            <span>SECTION 06 // THE PEDAGOGICAL JOURNEY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            From curiosity to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              practical understanding.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Learning cybersecurity requires intentional progression. We guide you through five deliberate phases, ensuring you build conceptual foundations before executing in live terminal environments.
          </p>
        </div>

        {/* Desktop Connected Horizontal Flow / Mobile Vertical */}
        <div className="relative">
          {/* Subtle horizontal connecting line on lg+ */}
          <div
            className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-zinc-900 via-white/20 to-zinc-900 -translate-y-8 z-0 pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {LEARNING_JOURNEY_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-mono font-black text-sm group-hover:border-zinc-600 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">
                      Step 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mb-1 group-hover:text-zinc-200 transition-colors">
                    {step.name}
                  </h3>

                  <div className="text-xs font-mono text-zinc-500 mb-3">
                    {step.tagline}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Phase {idx + 1} of 5</span>
                  {idx < 4 ? (
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer / Program Variety Clarification */}
        <div className="mt-10 p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-start sm:items-center gap-3 text-xs text-zinc-400">
          <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="text-zinc-200">Cohort Note:</strong> The exact sequence, lab tools, assessment schedule, and deliverables vary by program format (e.g. 45-day summer sprint vs. 6-month industrial fellowship). Review your specific course page for exact weekly syllabus details.
          </p>
        </div>
      </div>
    </section>
  );
}
