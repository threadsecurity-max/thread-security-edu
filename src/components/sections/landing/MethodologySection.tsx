'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Users, UserCheck, BookOpen, Trophy, Briefcase, Code, CheckCircle2 } from 'lucide-react';

export function MethodologySection() {
  return (
    <section id="features" className="relative py-20 bg-[#ffffff] border-b border-slate-200 overflow-hidden">
      {/* Grid Border Background Pattern */}
      <div className="absolute inset-0 opacity-50 pointer-events-none z-0">
        <Image
          src="/images/TSE Border.svg"
          alt="Grid background border pattern"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <span className="text-sm sm:text-base md:text-lg font-medium tracking-[0.2em] sm:tracking-[0.25em] text-violet-700 uppercase font-sans">
            Why Choose Us
          </span>
          <div className="h-1 w-16 sm:w-20 mt-2.5 mb-6 rounded-full bg-violet-600 shadow-[0_0_12px_rgba(126,59,237,0.5)]" />
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 font-sans tracking-tight max-w-3xl mx-auto leading-tight mb-4">
            The Foundation Of Every Success Story
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Your journey from learning to landing a high-paying Cybersecurity & AI role — we guide you at every step.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Live & Interactive Sessions (Large - Row 1 Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div className="space-y-3 relative z-10 max-w-lg">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Live & Interactive Sessions
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Learn directly from Industry Experts, participate in live attack-defense labs, and get real-time guidance.
              </p>
            </div>

            {/* Visual: Authentic Live & Interactive Classroom Session Photo */}
            <div className="mt-6 relative w-full h-[220px] sm:h-[240px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 group/live">
              <Image
                src="/images/Live Interactive.jpeg"
                alt="TSE Authentic Live & Interactive Classroom Training Session"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover object-center group-hover/live:scale-105 transition-transform duration-700 filter brightness-[0.95] contrast-[1.03]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Top Live Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-[#C6FF34] border border-[#C6FF34]/30 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
                  Live Classroom &amp; Interactive Lab
                </span>
              </div>

              {/* Bottom Caption Strip */}
              <div className="absolute bottom-3 inset-x-3 sm:inset-x-4 flex items-center justify-between text-white z-10">
                <div>
                  <p className="text-xs sm:text-sm font-semibold tracking-tight text-white drop-shadow-sm">
                    Live Academy Instruction
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-200 drop-shadow-sm">
                    Senior Industry Faculty • Hands-On Red &amp; Blue Team Drills
                  </p>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/20">
                  TSE Academy
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: 1:1 Expert Mentorship (Small - Row 1 Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black tracking-tight">
                1:1 Expert Mentorship
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Personalized placement guidance, weekly progress reviews, and doubt clearing at every step of your learning journey.
              </p>
            </div>

            {/* Real 1:1 In-Person Mentorship Photos */}
            <div className="mt-6 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group/photo overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm aspect-[4/5] bg-slate-100">
                  <Image
                    src="/images/Mentorship.jpeg"
                    alt="1:1 In-Person Technical Mentorship with Mentor at TSE Desk"
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover object-center group-hover/photo:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#C6FF34] bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-[#C6FF34]/30">
                      TSE Desk
                    </span>
                    <p className="text-[11px] font-semibold text-white mt-1 leading-tight">
                      Technical Mentorship
                    </p>
                  </div>
                </div>

                <div className="relative group/photo overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm aspect-[4/5] bg-slate-100">
                  <Image
                    src="/images/Mentorship Photo.jpeg"
                    alt="1:1 Resume and Interview Guidance Session with Student"
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover object-center group-hover/photo:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-purple-300 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-purple-400/30">
                      1:1 Review
                    </span>
                    <p className="text-[11px] font-semibold text-white mt-1 leading-tight">
                      Career Guidance
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real In-Person &amp; Online Mentors</span>
                </div>
                <span className="text-[10px] text-violet-600 font-semibold">TSE Academy</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Industry Vetted Curriculum (Small - Row 2 Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black tracking-tight">
                Industry Vetted Curriculum
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Built to match real cybersecurity and AI roles, mapped to OWASP LLM and MITRE ATT&CK frameworks.
              </p>
            </div>

            {/* Visual: Curriculum tag badges matching style of screenshot */}
            <div className="mt-6 border border-slate-100 rounded-2xl bg-slate-50 p-4 space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                <span>Syllabus Modules</span>
                <span className="text-violet-700 font-medium"></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-violet-600 text-white font-medium px-2 py-1 rounded-md">#OWASP-Top-10</span>
                <span className="text-[10px] bg-violet-100 text-violet-700 font-medium px-2 py-1 rounded-md">#MITRE-Attack</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded-md">#AI-Model-Def</span>
                <span className="text-[10px] bg-[#C6FF34] text-black font-medium px-2 py-1 rounded-md">#Active-CTF-Labs</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Mock Interviews + Contests (Large - Row 2 Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div className="space-y-3 relative z-10 max-w-lg">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Mock Interviews + Contests
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rigorous interview prep with regular mock rounds conducted by CISO panels, alongside live hacking contests to build speed.
              </p>
            </div>

            {/* Visual: Telemetry / score metric bar chart matching screenshot design */}
            <div className="mt-6 border border-slate-100 rounded-2xl bg-slate-50 p-4 shadow-inner relative overflow-hidden h-[180px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-violet-700" />
                  <span className="text-[10px] text-slate-600 font-medium">PREPARATION SCORE</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium uppercase">
                  Growth: <span className="text-emerald-800 font-semibold">+42%</span>
                </div>
              </div>
              
              {/* Bar Chart Representation */}
              <div className="flex items-end justify-between h-[100px] pt-4 px-2">
                {[24, 32, 41, 50, 58, 67, 75, 84, 91, 98].map((val, idx) => (
                  <div key={idx} className="w-[8%] bg-slate-200/60 rounded-t h-full flex flex-col justify-end">
                    <div 
                      className="bg-violet-600 rounded-t w-full transition-all duration-500" 
                      style={{ height: `${val}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 5: Resume to Job Offer Support (Full Width - Row 3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-stretch gap-6 shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Resume to Job Offer Support
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                End-to-end job prep support, including resume audits, portfolio optimization, direct hiring partner referrals, and salary negotiation help.
              </p>
            </div>

            {/* Visual: Progress timeline representing transition */}
            <div className="flex-1 border border-slate-100 rounded-2xl bg-slate-50 p-5 shadow-inner flex flex-col justify-center gap-4 min-h-[140px]">
              <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                <span>Placement Pipeline</span>
                <span className="text-emerald-800 font-medium">Offer Secured</span>
              </div>
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Horizontal progress bar */}
                <div className="absolute top-[15px] inset-x-4 h-1 bg-slate-200 z-0">
                  <div className="w-[85%] h-full bg-violet-600" />
                </div>
                
                {[
                  { label: "Resume Audit", done: true },
                  { label: "Technical Prep", done: true },
                  { label: "CISO Mock", done: true },
                  { label: "Job Offer", done: false, active: true },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      step.done 
                        ? 'bg-violet-600 border-violet-600 text-white' 
                        : step.active 
                          ? 'bg-[#C6FF34] border-[#C6FF34] text-black font-semibold animate-pulse'
                          : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-[9px] font-medium text-slate-600 mt-2 tracking-tight">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
