'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  UserCheck,
  Award,
  Terminal,
  Sparkles,
} from 'lucide-react';

export function CourseHero() {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden bg-[#06090e] text-white border-b border-slate-800">
      
      {/* Dark Technical Background Grid (No Blurry Gradients) */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Student Trust, and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs font-semibold tracking-wider uppercase">
              <GraduationCap className="w-3.5 h-3.5 text-[#C6FF34]" />
              <span>TSE ACADEMIC &amp; SANDBOX LABS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[1.06]">
              Architect Your <span className="text-[#C6FF34]">Cyber</span> &amp; <span className="text-purple-400">AI Security</span> Trajectory
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Production-focused LMS curriculum engineered around isolated virtual sandboxes, 1-on-1 mentor guidance, structured learning trajectories, and verified cryptographic credentials.
            </p>

            {/* Active Student Social Proof Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 border-2 border-slate-950 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                  AK
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-700 border-2 border-slate-950 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                  RS
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-700 border-2 border-slate-950 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                  MN
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-mono font-bold text-[#C6FF34]">
                  +1.4k
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>1,450+ Active Students Learning in Sandboxes</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#catalogue"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C6FF34] text-slate-950 font-extrabold text-sm hover:bg-[#b5fa1a] transition-all shadow-[0_0_20px_rgba(198,255,52,0.25)] cursor-pointer"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#conduct"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>How TSE Works</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 font-mono text-xs text-slate-400">
              <div>
                <span className="block text-xl font-bold text-white">100% Live</span>
                <span>Virtual Sandboxes</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-[#C6FF34]">1-on-1</span>
                <span>Mentor Reviews</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-purple-400">Verified</span>
                <span>TS-ID Badges</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Student Cohort & Sandbox Activity Terminal */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0b1019] border border-slate-800 shadow-2xl relative overflow-hidden space-y-5 text-left">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                  tse-lms // live_student_cohorts
                </span>
              </div>

              {/* Active Student Cohort Sessions */}
              <div className="space-y-3 font-mono text-xs">
                
                {/* Student Session 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/60 text-[#C6FF34] flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-bold block text-sm">Aarav Sharma</span>
                      <span className="text-slate-400 text-[11px]">Web VAPT • Exploit Lab 04</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-[#C6FF34] border border-emerald-800/60 text-[10px] font-bold uppercase tracking-wider">
                    In Sandbox
                  </span>
                </div>

                {/* Connecting Visual */}
                <div className="flex justify-center my-0.5">
                  <div className="w-[2px] h-5 bg-slate-700" />
                </div>

                {/* Student Session 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-700/60 text-purple-300 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-bold block text-sm">Meera Patel</span>
                      <span className="text-slate-400 text-[11px]">LLM Red Teaming • Prompt Injection</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                </div>

              </div>

              {/* Terminal Footer Strip */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>SYSTEM STATUS:</span>
                <span className="text-[#C6FF34] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SANDBOX LAB RUNTIMES READY
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
