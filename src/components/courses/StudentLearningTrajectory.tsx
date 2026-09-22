'use client';

import { Play, Layers, Terminal, Cpu, FolderGit2, CheckCircle2, Award } from 'lucide-react';

const TRAJECTORY_STEPS = [
  { label: 'Start', desc: 'Baseline evaluation & virtual sandbox provisioning', icon: Play, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { label: 'Foundation', desc: 'Core architecture modules & security principles', icon: Layers, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Practice', desc: 'Hands-on terminal exercises & log triage', icon: Terminal, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { label: 'Labs', desc: 'Dedicated virtual sandbox exploits & defensive hardening', icon: Cpu, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { label: 'Projects', desc: 'Production-grade security tool construction & report writing', icon: FolderGit2, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { label: 'Assessment', desc: 'Proctored practical examination & mentor audit', icon: CheckCircle2, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { label: 'Completion', desc: 'Cryptographically signed TS-ID verification credential', icon: Award, color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export function StudentLearningTrajectory() {
  return (
    <section id="trajectory" className="py-20 bg-white text-slate-900 border-t border-slate-200 relative z-10">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            STUDENT TRAJECTORY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
            Your Transparent <span className="text-emerald-600">Milestones</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Every enrolled student advances through 7 transparent milestones. For authenticated accounts, your dashboard connects real-time lab completions directly to this trajectory.
          </p>
        </div>

        {/* Trajectory Stepper */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-3">
            {TRAJECTORY_STEPS.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold shrink-0 ${step.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {step.label}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 font-normal mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-slate-500 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-auto">
                    Milestone {idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
