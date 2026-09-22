'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CourseCTA() {
  return (
    <section className="py-20 bg-white text-slate-900 relative z-10 border-t border-slate-200 overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="p-8 sm:p-14 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-mono font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>START YOUR LEARNING JOURNEY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Transform Your Cyber &amp; AI Security Career
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
            Gain 100% practical lab experience, 1-on-1 lead mentor guidance, and verified cryptographic certification.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogue"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-100 transition-all shadow-sm cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
