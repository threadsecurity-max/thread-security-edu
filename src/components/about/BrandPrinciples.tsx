'use client';

import React from 'react';
import { BRAND_PRINCIPLES } from '@/data/aboutUsData';
import {
  Eye,
  Terminal,
  ShieldAlert,
  Search,
  Activity,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const PRINCIPLE_ICON_MAP: Record<string, React.ReactNode> = {
  Eye: <Eye className="w-5 h-5 text-lime-400" />,
  Terminal: <Terminal className="w-5 h-5 text-emerald-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-amber-400" />,
  Search: <Search className="w-5 h-5 text-cyan-400" />,
  Activity: <Activity className="w-5 h-5 text-purple-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-lime-300" />,
};

export function BrandPrinciples() {
  return (
    <section id="principles" className="scroll-mt-28 py-20 sm:py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-lime-400 border border-slate-800 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 10 // CORE PRINCIPLES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            The principles behind{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-300">
              everything we build.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            We adhere to six operational principles that guide our curriculum design, faculty conduct, and student relationships.
          </p>
        </div>

        {/* 6 Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRAND_PRINCIPLES.map((principle, index) => (
            <div
              key={principle.id}
              className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-lime-400 group-hover:border-lime-500/40 transition-colors">
                    {PRINCIPLE_ICON_MAP[principle.iconName] || <Eye className="w-5 h-5 text-lime-400" />}
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-lime-300 transition-colors">
                  {principle.title}
                </h3>

                <p className="text-xs font-mono text-slate-400 mb-4">
                  {principle.tagline}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {principle.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Standard Code</span>
                <span className="text-lime-400/80 uppercase">VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
