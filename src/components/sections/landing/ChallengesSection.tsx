'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ShieldAlert, Brain, Route, Briefcase, Target, Cpu, Lock, Layers } from 'lucide-react';

// Dynamic import MoltenMetal since it uses WebGL (client-only)
const MoltenMetal = dynamic(() => import('@/components/ui/MoltenMetal'), { ssr: false });

interface ChallengeCard {
  icon: React.ReactNode;
  title: string;
  category: 'cyber' | 'ai';
  problem: string;
  solution: string;
}

const CYBER_CARDS: ChallengeCard[] = [
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    category: 'cyber',
    title: 'Lack of Hands-On Exposure',
    problem:
      'Most students learn cybersecurity from theory-heavy courses. Without real labs, sandboxes, or CTF environments, they never develop the muscle memory needed for real incidents.',
    solution:
      'Our 100% lab-first curriculum gives you live attack surfaces and red-team/blue-team exercises from day one.',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    category: 'cyber',
    title: 'Certifications Without Context',
    problem:
      'Students collect certifications (CEH, CompTIA, etc.) but can\'t apply them in real scenarios. Certs alone don\'t demonstrate operational competence.',
    solution:
      'We pair industry certifications with portfolio-building projects and TS-ID verified credentials that employers trust.',
  },
  {
    icon: <Route className="w-5 h-5" />,
    category: 'cyber',
    title: 'No Clear Career Roadmap',
    problem:
      'Students jump between random YouTube tutorials, bootcamps, and certifications with no structured path. This leads to scattered knowledge and slow progress.',
    solution:
      'Follow a structured learning path with 1-on-1 mentorship and personalised career guidance from SOC leads.',
  },
  {
    icon: <Target className="w-5 h-5" />,
    category: 'cyber',
    title: 'Isolation From Industry',
    problem:
      'Learning in a silo without exposure to real security operations centres or professional networks limits career growth.',
    solution:
      'Live sessions with CISOs, SOC analysts — plus a private alumni network of 2,000+ placed professionals.',
  },
];

const AI_CARDS: ChallengeCard[] = [
  {
    icon: <Brain className="w-5 h-5" />,
    category: 'ai',
    title: 'AI Is Evolving Faster Than Curricula',
    problem:
      'University syllabi lag 2–3 years behind industry. By the time you graduate, the tools, frameworks, and attack vectors have completely changed.',
    solution:
      'Continuously updated modules aligned with MITRE ATT&CK, OWASP, and the latest LLM security research — taught by active practitioners.',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    category: 'ai',
    title: 'No Real AI Project Experience',
    problem:
      'Students study AI theory but never build production-grade models or deploy ML pipelines. Interview panels can spot the gap instantly.',
    solution:
      'Build end-to-end AI projects — from data ingestion to deployment — using the same tools top companies use in production.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    category: 'ai',
    title: 'Scattered Learning Resources',
    problem:
      'Hundreds of free courses, conflicting tutorials, and hype-driven content make it impossible to build deep, structured AI knowledge.',
    solution:
      'A curated, mentor-guided AI curriculum that builds skills progressively — from fundamentals to advanced generative AI.',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    category: 'ai',
    title: 'Placement-Ready ≠ Degree Holder',
    problem:
      'Companies hiring for AI roles test practical skills — not textbook memorisation. Most graduates fail technical interviews.',
    solution:
      'Mock interviews, resume labs, and direct hiring-partner pipelines ensure you walk in with proof of skill.',
  },
];

const ALL_CARDS = [...CYBER_CARDS, ...AI_CARDS];

export function ChallengesSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      aria-label="Career challenges every IT student faces in cybersecurity and AI"
      className="relative overflow-hidden"
    >
      {/* ── Full-Bleed MoltenMetal Background ── */}
      <div className="absolute inset-0 z-0">
        <MoltenMetal
          color1="#0a0a0a"
          color2="#C6FF34"
          color3="#1a1a1a"
          speed={0.3}
          scale={4}
          detail={5}
          glow={1.8}
          coreSize={0.2}
          swirl={1}
          fold={-0.2}
          blackPoint={0.05}
          brightness={1.2}
          colorMode="molten"
          grain={true}
          grainIntensity={0.04}
          mouseInteraction={true}
          mouseStrength={0.3}
          opacity={1.0}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-black/90" />

      {/* ── Content ── */}
      <div className="relative z-10 py-20 md:py-28 overflow-hidden">
        {/* Heading — constrained width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.25em] uppercase text-[#C6FF34]/80 mb-4">
              <span className="w-6 h-px bg-[#C6FF34]/40" />
              Why Students Hit a Career Plateau
              <span className="w-6 h-px bg-[#C6FF34]/40" />
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight max-w-4xl mx-auto">
              Key Hurdles on the{' '}
              <span className="text-[#C6FF34]">Cybersecurity &amp; AI</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Here&apos;s how Thread Security Education helps you overcome them.
            </p>
          </motion.div>
        </div>

        {/* 3D Circular Revolving Showcase */}
        <div 
          className="relative w-full h-[540px] flex items-center justify-center z-10"
          style={{ perspective: '1600px', perspectiveOrigin: '50% 25%' }}
        >
          {/* Scaling Wrapper for Responsiveness */}
          <div className="scaling-wrapper relative flex items-center justify-center w-full h-full transition-transform duration-300">
            {/* 3D Rotating Track */}
            <div
              onClick={() => setIsPaused(!isPaused)}
              className="relative w-[380px] h-[340px] cursor-pointer hover:[animation-play-state:paused]"
              style={{
                transformStyle: 'preserve-3d',
                animation: 'rotate-carousel 50s linear infinite',
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {ALL_CARDS.map((c, idx) => {
                const angle = idx * (360 / ALL_CARDS.length);
                const isCyber = c.category === 'cyber';
                return (
                  <div
                    key={`${c.title}-${idx}`}
                    className="absolute inset-0 group rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-7 flex flex-col hover:border-[#C6FF34]/30 hover:bg-white/[0.06] transition-all duration-300 backface-visible"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(520px)`,
                      backfaceVisibility: 'visible',
                    }}
                  >
                    {/* Corner glow on hover */}
                    <div className="absolute -top-px -left-px w-20 h-20 rounded-tl-2xl bg-gradient-to-br from-[#C6FF34]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Top row: Icon + Category badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] flex items-center justify-center shrink-0 group-hover:bg-[#C6FF34]/15 transition-colors duration-300">
                        {c.icon}
                      </div>
                      <span
                        className={`text-[10px] font-medium tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border ${
                          isCyber
                            ? 'bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {isCyber ? 'Cybersecurity' : 'AI'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-white mb-3 tracking-tight leading-snug">
                      {c.title}
                    </h3>

                    {/* Problem */}
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1 line-clamp-3">
                      {c.problem}
                    </p>

                    {/* Solution */}
                    <div className="pt-4 border-t border-white/[0.06]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-[#C6FF34] mb-2">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-70">
                          <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        How We Fix It
                      </span>
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                        {c.solution}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Styled JSX for the smooth marquee keyframe animation and responsive scaling */}
      <style jsx>{`
        .scaling-wrapper {
          transform: scale(1);
        }
        @media (max-width: 480px) {
          .scaling-wrapper {
            transform: scale(0.48);
          }
        }
        @media (min-width: 481px) and (max-width: 640px) {
          .scaling-wrapper {
            transform: scale(0.60);
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .scaling-wrapper {
            transform: scale(0.75);
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .scaling-wrapper {
            transform: scale(0.88);
          }
        }

        @keyframes rotate-carousel {
          0% {
            transform: rotateX(-6deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(-6deg) rotateY(-360deg);
          }
        }
      `}</style>
    </section>
  );
}
