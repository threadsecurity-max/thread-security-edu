'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Terminal,
  Hammer,
  ShieldCheck,
  Eye,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  ChevronRight,
  Layers,
  Cpu,
} from 'lucide-react';

export interface RouteCardItem {
  id: string;
  step: string;
  label: string;
  tag: string;
  theme: 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue' | 'rose';
  desc: string;
  deliverable: string;
  tools: string[];
  image: string; // <-- Easy-to-replace image URL for each card
  icon: any;
}

export const ROUTE_CARDS: RouteCardItem[] = [
  {
    id: 'learn',
    step: '01',
    label: 'Learn & Absorb',
    tag: 'THEORY & ARCHITECTURE',
    theme: 'emerald',
    desc: 'Deep architectural exploration of low-level network protocols, memory safety, threat modeling, and foundational LLM tokenization mechanics.',
    deliverable: 'System Architecture Blueprint',
    tools: ['HTTP/3', 'Wireshark', 'TCP/IP', 'Linux Internals'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    icon: BookOpen,
  },
  {
    id: 'practice',
    step: '02',
    label: 'Sandbox Practice',
    tag: 'VIRTUAL ATTACK LABS',
    theme: 'cyan',
    desc: 'Browser-accessible isolated targets for hands-on web exploitation, Active Directory privilege escalation, and memory forensics.',
    deliverable: 'Exploit Proof-of-Concepts (PoCs)',
    tools: ['Kali Linux', 'Burp Suite Pro', 'Docker', 'BloodHound'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    icon: Terminal,
  },
  {
    id: 'build',
    step: '03',
    label: 'Build & Construct',
    tag: 'DEVSECOPS & AI GUARDRAILS',
    theme: 'purple',
    desc: 'Engineer automated vulnerability detection pipelines, AI prompt firewall guardrails, and production-grade security tooling.',
    deliverable: 'Production Tooling Repository',
    tools: ['Python', 'FastAPI', 'LangChain', 'NeMo Guardrails'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    icon: Hammer,
  },
  {
    id: 'test',
    step: '04',
    label: 'Test & Audit',
    tag: 'AUTOMATED VALIDATION',
    theme: 'amber',
    desc: 'Stress-test exploits against hardened detection engines. Validate that defensive guardrails withstand adversarial evasion payloads.',
    deliverable: 'CVSS v3.1 Audit Playbook',
    tools: ['Trivy', 'Checkov', 'GitHub Actions', 'SonarQube'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
    icon: ShieldCheck,
  },
  {
    id: 'review',
    step: '05',
    label: 'Mentor Review',
    tag: '1-ON-1 ARCHITECT SCRUTINY',
    theme: 'blue',
    desc: 'Present capstone code directly to veteran security researchers and principal engineers for line-by-line architectural review.',
    deliverable: 'Mentor Verification Sign-off',
    tools: ['Live Whiteboard', 'Ghidra', 'PR Review', 'Splunk'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
    icon: Eye,
  },
  {
    id: 'improve',
    step: '06',
    label: 'Refine & Deploy',
    tag: 'PRODUCTION HARDENING',
    theme: 'rose',
    desc: 'Iterate based on mentor feedback, patch residual zero-day surface exposures, and push hardened builds into production registries.',
    deliverable: 'Hardened Production Release',
    tools: ['Docker Hub', 'Terraform', 'Kubernetes', 'AWS GuardDuty'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    icon: TrendingUp,
  },
];

export function LearningRoute() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCard = ROUTE_CARDS[activeIndex];
  const ActiveIcon = activeCard.icon;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : ROUTE_CARDS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < ROUTE_CARDS.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="route" className="py-24 bg-[#F8FAFC] text-slate-900 border-t border-slate-200 relative z-10 overflow-hidden">
      
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-35 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      {/* Soft Radial Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>THE LEARNING ROUTE</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
            The Continuous <span className="text-emerald-600">Execution Loop</span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Education is an active feedback loop. Students cycle iteratively through hands-on sandbox exploitation, automated CI/CD security audits, and 1-on-1 mentor code sign-offs.
          </p>
        </div>

        {/* ── INTERACTIVE STAGE STEPPER CONTROLLER (FLEXBOX, NO GRID) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-md">
          {/* Scrollable Stage Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {ROUTE_CARDS.map((card, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={card.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{card.step}. {card.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs font-mono text-slate-500 mr-2">
              STAGE {activeCard.step} / 0{ROUTE_CARDS.length}
            </span>
            <button
              onClick={handlePrev}
              aria-label="Previous Stage"
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-slate-400 text-slate-700 flex items-center justify-center shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Stage"
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-slate-400 text-slate-700 flex items-center justify-center shadow-sm transition-all active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── INTERACTIVE SPOTLIGHT HERO CARD (FLEXBOX, NO GRID) ── */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col lg:flex-row items-stretch"
            >
              {/* Left Column: Stage Image with Overlay */}
              <div className="w-full lg:w-1/2 relative min-h-[280px] sm:min-h-[380px] bg-slate-950 overflow-hidden">
                <Image
                  src={activeCard.image}
                  alt={activeCard.label}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-mono text-xs font-bold tracking-wider uppercase shadow-lg">
                    STAGE {activeCard.step}
                  </span>

                  <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase shadow-md">
                    {activeCard.tag}
                  </span>
                </div>

                {/* Floating Bottom Title on Image */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-lg">
                    <ActiveIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                      {activeCard.label}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Right Column: Stage Details & Deliverables */}
              <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
                    <span>{activeCard.tag}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {activeCard.label}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                    {activeCard.desc}
                  </p>

                  {/* Deliverable Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono uppercase text-slate-500 font-bold">
                        Key Tangible Outcome:
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 pl-6">
                      {activeCard.deliverable}
                    </p>
                  </div>

                  {/* Toolchain Chips */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">
                      Active Toolchain &amp; Technologies:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeCard.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Navigation within Card */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ROUTE_CARDS.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveIndex(dotIdx)}
                        aria-label={`Jump to stage ${dotIdx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          dotIdx === activeIndex
                            ? 'w-7 bg-emerald-600'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-md transition-colors"
                  >
                    <span>Advance Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── INTERACTIVE THUMBNAIL DECK (FLEXBOX SNAP SCROLLER, NO GRID) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
            <span>EXPLORE ALL STAGES</span>
            <span>CLICK OR SWIPE CARDS TO JUMP</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x">
            {ROUTE_CARDS.map((card, idx) => {
              const isSelected = idx === activeIndex;
              const IconComp = card.icon;

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-[260px] sm:w-[290px] shrink-0 p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left snap-start flex flex-col justify-between space-y-3 bg-white border ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow'
                  }`}
                >
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900">
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      sizes="290px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold uppercase">
                      STAGE {card.step}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <h4 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {card.label}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 truncate max-w-[170px]">{card.deliverable}</span>
                    <span className={`font-bold ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isSelected ? 'ACTIVE' : 'SELECT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FINAL CAPSTONE / CREDENTIAL BANNER (NO GRID) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold uppercase">
                  FINAL MILESTONE
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  TS-ID Cryptographic Verification
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                Blockchain-Anchored Credential &amp; Priority Hiring Dispatch
              </h4>
            </div>
          </div>

          <a
            href="#catalogue"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-md transition-colors"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
