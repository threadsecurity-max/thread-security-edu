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
  Eye: <Eye className="w-5 h-5 text-white" />,
  Terminal: <Terminal className="w-5 h-5 text-white" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-white" />,
  Search: <Search className="w-5 h-5 text-white" />,
  Activity: <Activity className="w-5 h-5 text-white" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-white" />,
};

export function BrandPrinciples() {
  return (
    <section id="principles" className="scroll-mt-28 py-20 sm:py-24 bg-zinc-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SECTION 10 // CORE PRINCIPLES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            The principles behind{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              everything we build.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            We adhere to six operational principles that guide our curriculum design, faculty conduct, and student relationships.
          </p>
        </div>

        {/* 6 Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRAND_PRINCIPLES.map((principle, index) => (
            <div
              key={principle.id}
              className="p-6 sm:p-8 rounded-2xl bg-black border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white group-hover:border-zinc-600 transition-colors">
                    {PRINCIPLE_ICON_MAP[principle.iconName] || <Eye className="w-5 h-5 text-white" />}
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-500">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-zinc-200 transition-colors">
                  {principle.title}
                </h3>

                <p className="text-xs font-mono text-zinc-400 mb-4">
                  {principle.tagline}
                </p>

                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {principle.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Standard Code</span>
                <span className="text-zinc-300 uppercase font-bold">VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
