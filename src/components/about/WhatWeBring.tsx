'use client';

import React from 'react';
import Link from 'next/link';
import { VALUE_PROPOSITIONS } from '@/data/aboutUsData';
import {
  Layers,
  Terminal,
  UsersRound,
  LayoutDashboard,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'structured-learning': <Layers className="w-5 h-5 text-lime-400" />,
  'practical-exploration': <Terminal className="w-5 h-5 text-emerald-400" />,
  'mentorship-guidance': <UsersRound className="w-5 h-5 text-cyan-400" />,
  'learning-management': <LayoutDashboard className="w-5 h-5 text-purple-400" />,
  'assessment-development': <CheckCircle2 className="w-5 h-5 text-amber-400" />,
  'community-growth': <Users className="w-5 h-5 text-blue-400" />,
};

export function WhatWeBring() {
  return (
    <section id="what-we-bring" className="scroll-mt-28 py-20 sm:py-24 bg-slate-900/60 text-white border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-lime-400 border border-slate-800 mb-4">
            <Layers className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 05 // VALUE PROPOSITION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            More than learning cybersecurity.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-300">
              Building the ability to apply it.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Real security acumen requires an ecosystem: structured pathways, active terminal environments, daily mentor feedback, and institutional accountability. Here is what we deliver across our active programs:
          </p>
        </div>

        {/* 6 Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {VALUE_PROPOSITIONS.map((prop) => (
            <div
              key={prop.id}
              className="p-6 sm:p-7 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 w-fit rounded-xl bg-slate-900 border border-slate-800 mb-5 group-hover:border-slate-700 transition-colors">
                  {ICON_MAP[prop.id] || <Sparkles className="w-5 h-5 text-lime-400" />}
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-lime-300 transition-colors">
                  {prop.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  {prop.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-850 space-y-1.5">
                {prop.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl font-bold text-white tracking-tight">
              Ready to explore our live learning tracks?
            </h4>
            <p className="text-sm text-slate-400">
              Review full curriculum modules, terminal requirements, and enrollment pathways.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm tracking-tight transition-all shadow-md shrink-0"
          >
            <span>Explore the Learning Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
