'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Lock,
  Cpu,
  Terminal,
  Activity,
} from 'lucide-react';
import { GROUND_TRUTH } from '@/data/aboutUsData';

export function AboutHero() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800/80 pt-16 sm:pt-24 pb-20 sm:pb-28"
    >
      {/* ── TECHNICAL BACKGROUND GRID & SUBTLE GLOW ── */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative fine technical corner accents */}
      <div className="absolute top-6 left-6 hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
        <span>SYS.EDU.ABOUT // VERIFIED PLATFORM</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Eyebrow & Credential Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-lime-400/10 text-lime-300 border border-lime-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              ABOUT THREAD SECURITY
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPIIT Recognized: {GROUND_TRUTH.dpiitId}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
              <Award className="w-3.5 h-3.5 text-lime-400" />
              <span>{GROUND_TRUTH.isoStandard} Certified</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12]">
            A stronger digital world begins with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300">
              people who understand security.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Thread Security is building a learning ecosystem around cybersecurity—bringing structured education, practical exploration, and guided development together to help learners understand the challenges of a connected world.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#ecosystem"
              onClick={(e) => scrollToSection(e, 'ecosystem')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm tracking-tight transition-all shadow-[0_0_24px_rgba(163,230,53,0.3)] hover:shadow-[0_0_32px_rgba(163,230,53,0.45)] cursor-pointer"
            >
              <span>Explore Our Learning Ecosystem</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#verification"
              onClick={(e) => scrollToSection(e, 'verification')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm tracking-tight border border-slate-750 hover:border-slate-600 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Thread Security</span>
            </a>
          </div>

          {/* Small Supporting Labels: Learn, Explore, Build, Secure */}
          <div className="pt-6 border-t border-slate-800/80 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">Core 01</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                  <Terminal className="w-3 h-3 text-lime-400" />
                  <span>Learn</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">Core 02</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Explore</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">Core 03</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>Build</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">Core 04</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-4 flex justify-center">
            <a
              href="#who-we-are"
              onClick={(e) => scrollToSection(e, 'who-we-are')}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer group"
              aria-label="Scroll to learn who we are"
            >
              <span>Scroll to discover</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
