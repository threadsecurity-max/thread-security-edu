'use client';

import React from 'react';
import { BRAND_STORY_STEPS } from '@/data/aboutUsData';
import { Compass, Sparkles, Milestone } from 'lucide-react';

export function BrandStory() {
  return (
    <section id="our-story" className="scroll-mt-28 py-20 sm:py-24 bg-slate-900/50 text-white border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-lime-400 border border-slate-800 mb-4">
            <Compass className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 03 // OUR EVOLUTION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Why Thread Security exists.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Cybersecurity is becoming increasingly important, yet understanding it can feel inaccessible to learners who lack structured guidance, practical exposure, or a clear starting point. Thread Security aims to help bridge that gap by creating an environment where learners can explore cybersecurity concepts, build practical understanding, and develop their capabilities with direction.
          </p>
        </div>

        {/* Progressive Timeline / Narrative Layout */}
        <div className="relative">
          {/* Vertical line indicator on md+ */}
          <div className="hidden md:block absolute left-8 top-4 bottom-4 w-px bg-slate-800" aria-hidden="true" />

          <div className="space-y-8 md:space-y-10">
            {BRAND_STORY_STEPS.map((step, idx) => (
              <div
                key={step.phase}
                className="relative flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group"
              >
                {/* Step Marker Badge */}
                <div className="hidden md:flex shrink-0 w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-lime-400 items-center justify-center font-mono font-bold text-sm relative z-10 shadow-md group-hover:border-lime-500/40 transition-colors">
                  0{idx + 1}
                </div>

                {/* Content Card */}
                <div className="flex-1 p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800/80 group-hover:border-slate-700 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400">
                      {step.phase}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Foundational Pillar
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fact Integrity Notice */}
        <div className="mt-12 p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Honest Narrative Policy: We present our purpose and learning evolution without fabricated founding dates or exaggerated corporate claims.</span>
          </div>
          <span className="hidden sm:inline-block text-slate-400">THREADSECURITY.IN</span>
        </div>
      </div>
    </section>
  );
}
