'use client';

import React, { useState } from 'react';
import { ABOUT_FAQS } from '@/data/aboutUsData';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export function AboutFAQ() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-5': true,
    'faq-10': true,
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faqs" className="scroll-mt-28 py-20 sm:py-28 bg-slate-900/60 text-white border-y border-slate-800/80 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-lime-400 border border-slate-800 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-lime-400" />
            <span>SECTION 11 // COMMON INQUIRIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Questions worth asking.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Clear answers to common questions about Thread Security, our learning methodologies, certifications, and operational policies.
          </p>
        </div>

        {/* Accessible Accordion */}
        <div className="space-y-3.5">
          {ABOUT_FAQS.map((faq, index) => {
            const isOpen = Boolean(openIds[faq.id]);

            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs font-bold text-lime-400 shrink-0">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg bg-slate-900 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-lime-400 bg-lime-950/40' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed font-normal border-t border-slate-850/80 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Have a specific question not addressed above?</h4>
            <p className="text-xs text-slate-400">
              Speak directly with an academic mentor or admissions advisor.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Contact Admissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="tel:+917347398956"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-mono text-xs border border-slate-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 7347398956</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
