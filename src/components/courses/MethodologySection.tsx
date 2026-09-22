'use client';

import { Users, Terminal, Cpu, CheckSquare, MessageSquare, Briefcase } from 'lucide-react';

const PILLARS = [
  {
    title: 'Mentor-Led Guidance',
    desc: 'Direct instruction from principal security architects and senior AI engineers with weekly office hours.',
    icon: Users,
    color: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  },
  {
    title: 'Practice-First Approach',
    desc: 'Theory is paired immediately with live sandboxed labs, interactive terminal challenges, and memory forensics.',
    icon: Terminal,
    color: 'text-sky-700 border-sky-200 bg-sky-50',
  },
  {
    title: 'Project-Driven Outcomes',
    desc: 'Build enterprise-grade vulnerability reports, automated exploits, and agentic AI guardrail architectures.',
    icon: Cpu,
    color: 'text-purple-700 border-purple-200 bg-purple-50',
  },
  {
    title: 'Continuous Assessment',
    desc: 'Automated code audits and practical lab examinations test real capability rather than multiple-choice guessing.',
    icon: CheckSquare,
    color: 'text-teal-700 border-teal-200 bg-teal-50',
  },
  {
    title: 'Actionable Feedback',
    desc: 'Receive line-by-line code reviews, vulnerability report feedback, and tailored career roadmap tuning.',
    icon: MessageSquare,
    color: 'text-amber-700 border-amber-200 bg-amber-50',
  },
  {
    title: 'Real Industry Context',
    desc: 'Curriculum modeled on active Fortune 500 threat vectors, MITRE ATT&CK frameworks, and OWASP Top 10 for LLMs.',
    icon: Briefcase,
    color: 'text-indigo-700 border-indigo-200 bg-indigo-50',
  },
];

export function MethodologySection() {
  return (
    <section id="methodology" className="py-20 bg-white text-slate-900 border-t border-slate-200 relative z-10">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            LEARNING METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
            6 Pillars Of <span className="text-purple-600">Excellence</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            We don't teach passive video watching. We engineer real-world technical competency through rigorous, mentor-guided practice.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold ${p.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
