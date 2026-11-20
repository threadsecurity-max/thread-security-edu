'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { GROUND_TRUTH } from '@/data/aboutUsData';

export function AboutCTA() {
  return (
    <section id="get-started" className="scroll-mt-28 py-20 sm:py-28 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background subtle monochrome ambient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SECTION 12 // NEXT STEPS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Understand the journey.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Verify the details.
            </span>{' '}
            Then take your next step.
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Your cybersecurity journey deserves a thoughtful beginning. Explore what Thread Security offers, review the details, and connect with our team if you need clarity.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-tight transition-all shadow-md cursor-pointer"
            >
              <span>Explore Our Programs</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-tight border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Talk to Our Team</span>
            </Link>
          </div>

          {/* Tertiary Org Link */}
          <div className="pt-4">
            <a
              href={GROUND_TRUTH.parentOrgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Explore Parent Organization (Thread Security Org)</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Grounding Closing Statement */}
          <div className="pt-10 border-t border-zinc-850 max-w-2xl mx-auto text-xs text-zinc-400 font-mono leading-relaxed">
            <p>
              Thread Security Education &bull; 3rd Floor, Vasal Mall, Police Line, Jalandhar, Punjab 144001 &bull; DPIIT: {GROUND_TRUTH.dpiitId} &bull; ISO 9001:2015 Certified
            </p>
            <p className="mt-1 text-zinc-500">
              Trust should be demonstrated through information, not demanded through marketing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
