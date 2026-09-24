'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Award, Users, CheckCircle2, Star, Layers, Play } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words';

interface HeroSectionProps {
  totalCourses: number;
  totalLabs: number;
}

const heroFlipWords = [
  { text: 'Cybersecurity', className: 'text-[#65a30d]' },
  { text: 'AI Security', className: 'text-[#7E3BED]' },
  { text: 'Cloud DevSecOps', className: 'text-[#0284c7]' },
  { text: 'SOC Operations', className: 'text-[#d97706]' },
];

export function HeroSection({ totalCourses, totalLabs }: HeroSectionProps) {
  return (
    <section 
      aria-label="Cybersecurity and AI Training Academy Overview"
      className="relative pt-8 sm:pt-14 pb-16 md:pb-28 overflow-hidden bg-white text-slate-900 text-center"
    >
      {/* Ambient background glows & grid canvas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] pointer-events-none z-0 opacity-70 select-none overflow-hidden flex items-center justify-center">
        <Image
          src="/images/TSE Hero Grid Base.svg"
          alt="Cybersecurity and AI Academy Network Background Grid"
          width={1400}
          height={800}
          priority
          className="w-full h-auto object-contain mx-auto transition-all duration-700"
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-tr from-purple-200/40 via-lime-100/30 to-indigo-100/40 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── TOP BADGE BAR ── */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-900 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-purple-700 font-bold">NORTH REGION&apos;S #1 PRACTICAL ACADEMY</span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-slate-700 font-medium">94% Placement Success</span>
        </div>

        {/* ── FULL-BLEED HIGH-IMPACT H1 HEADLINE ── */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 max-w-6xl mx-auto leading-[1.14] sm:leading-[1.12] mb-6">
          Master <FlipWords words={heroFlipWords} className="px-1 inline-block" /> With Placement-Focused Hands-On Practice
        </h1>

        {/* ── SUBTITLE ── */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-4xl mx-auto mb-8 sm:mb-9 leading-relaxed font-sans font-medium">
          Thread Security Education (TSE) is North Region&apos;s premier career launcher for Ethical Hacking, SOC Analytics, Cloud DevSecOps, and AI Security. Learn in 100% sandboxed live labs, receive 1-on-1 industry mentorship, and earn verified TS-ID student credentials.
        </p>

        {/* ── HIGH-CONVERTING CTA BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 w-full max-w-xl sm:max-w-none mx-auto">
          <Link href="/contact" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-black text-white hover:bg-slate-800 font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group touch-target">
              <span>Apply For Free Demo Class</span>
              <ArrowRight className="w-5 h-5 text-[#C6FF34] group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/courses" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-slate-300 text-slate-900 hover:bg-slate-100 font-bold text-sm sm:text-base transition-all cursor-pointer touch-target">
              Explore Career Programs
            </button>
          </Link>
          <Link href="/placements" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto min-h-[48px] px-5 sm:px-7 py-3.5 sm:py-4 rounded-full bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 font-bold text-sm sm:text-base transition-all cursor-pointer inline-flex items-center justify-center gap-2 touch-target">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Placement Highlights</span>
            </button>
          </Link>
        </div>

        {/* ── RATING & SOCIAL PROOF STRIP ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 mb-14 border-y border-slate-100 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-slate-900 ml-1">4.9/5 Rating</span>
            <span className="text-slate-400 font-normal">(1,200+ Alumni)</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>200+ Sandboxed Security Labs</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Verifiable TS-ID Credentials</span>
          </div>
        </div>

        {/* ── TSE LAPTOP MOCKUP SHOWCASE ── */}
        <div className="relative w-full max-w-6xl mx-auto mt-6 sm:mt-10">
          {/* Subtle Dynamic Ambient Glow behind Laptop */}
          <div className="absolute -inset-4 sm:-inset-10 bg-gradient-to-r from-purple-400/20 via-lime-300/25 to-sky-400/20 rounded-[3rem] blur-3xl pointer-events-none opacity-80" />

          {/* Clean Laptop Mockup Presentation */}
          <div className="relative w-full mx-auto transition-transform duration-700 ease-out hover:scale-[1.015]">
            <Image
              src="/images/TSE Design.svg"
              alt="Thread Security Education AI and Cybersecurity LMS Platform Interface on Laptop"
              width={1724}
              height={1372}
              priority
              fetchPriority="high"
              loading="eager"
              className="w-full h-auto object-contain mx-auto drop-shadow-[0_25px_50px_rgba(15,23,42,0.18)] filter brightness-[1.01]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
