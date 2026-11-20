'use client';

import React from 'react';
import { MISSION_AND_VISION } from '@/data/aboutUsData';
import { Target, Eye, Check, Scale } from 'lucide-react';

export function MissionVision() {
  return (
    <section id="mission-vision" className="scroll-mt-28 py-20 sm:py-28 bg-black text-white relative overflow-hidden">
      {/* Subtle monochrome ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-zinc-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800 mb-4">
            <Target className="w-3.5 h-3.5 text-zinc-300" />
            <span>SECTION 04 // COMPASS & CONVICTION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Our Mission &amp; Vision
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Education defines how future professionals approach digital safety. We anchor our pedagogy on deep technical honesty, active practice, and ethical responsibility.
          </p>
        </div>

        {/* Split Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <div className="relative p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Target className="w-5 h-5" />
            </div>

            <div>
              <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3">
                MISSION STATEMENT
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-5">
                {MISSION_AND_VISION.mission.heading}
              </h3>

              <blockquote className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium pl-4 border-l-2 border-white italic mb-6">
                &ldquo;{MISSION_AND_VISION.mission.statement}&rdquo;
              </blockquote>

              <p className="text-sm text-zinc-400 leading-relaxed">
                {MISSION_AND_VISION.mission.subtext}
              </p>
            </div>

            <div className="pt-6 mt-8 border-t border-zinc-850 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Goal: Practical Technical Capability</span>
              <span className="text-white font-semibold">TSE.MISSION // 01</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="relative p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Eye className="w-5 h-5" />
            </div>

            <div>
              <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3">
                VISION STATEMENT
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-5">
                {MISSION_AND_VISION.vision.heading}
              </h3>

              <blockquote className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium pl-4 border-l-2 border-zinc-500 italic mb-6">
                &ldquo;{MISSION_AND_VISION.vision.statement}&rdquo;
              </blockquote>

              <p className="text-sm text-zinc-400 leading-relaxed">
                {MISSION_AND_VISION.vision.subtext}
              </p>
            </div>

            <div className="pt-6 mt-8 border-t border-zinc-850 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Horizon: Secure Digital Society</span>
              <span className="text-white font-semibold">TSE.VISION // 02</span>
            </div>
          </div>
        </div>

        {/* Supporting Brand Principles: Over versus Under */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950/80 border border-zinc-850">
          <div className="max-w-2xl mb-8">
            <h4 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-white" />
              <span>What We Prioritize in Every Cohort</span>
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              Our pedagogical philosophy is built on clear trade-offs. We prioritize sustainable engineering habits over commercial shortcuts:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MISSION_AND_VISION.principles.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-black border border-zinc-850 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-white font-semibold mb-1">
                  <Check className="w-4 h-4 text-white shrink-0" />
                  <span>{item.title}</span>
                </div>
                <div className="text-xs text-zinc-500 pl-6">
                  prioritized over <span className="line-through text-zinc-600 font-mono">{item.versus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
