'use client';

import React from 'react';
import Link from 'next/link';
import { TRANSPARENCY_DIRECTORY } from '@/data/aboutUsData';
import { FileSearch, ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';

export function TransparencyDirectory() {
  return (
    <section id="transparency" className="scroll-mt-28 py-20 sm:py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-lime-400 border border-slate-800 mb-4">
            <FileSearch className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 08 // INFORMATION DIRECTORY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Everything you should know{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-300">
              before making a decision.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            We believe learners should understand what they are joining before they commit. Here is where you can find the relevant information across all operational touchpoints.
          </p>
        </div>

        {/* Structured Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRANSPARENCY_DIRECTORY.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400">
                    Topic
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-850">
                    Directory
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-lime-300 transition-colors">
                  {item.topic}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-normal mb-4">
                  {item.whatToCheck}
                </p>

                {item.note && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300/90 mb-4">
                    {item.note}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <Link
                  href={item.destinationHref}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-lime-400 hover:text-lime-300 hover:underline transition-colors cursor-pointer"
                >
                  <span>{item.destinationLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
