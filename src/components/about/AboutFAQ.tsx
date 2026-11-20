'use client';

import React, { useState } from 'react';
import { ABOUT_FAQS } from '@/data/aboutUsData';
import {
  HelpCircle,
  ChevronDown,
  Phone,
  ArrowRight,
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
    <section id="faqs" className="scroll-mt-28 py-20 sm:py-28 bg-black text-white border-y border-zinc-800 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-white" />
            <span>SECTION 11 // COMMON INQUIRIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Questions worth asking.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
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
                className="rounded-2xl bg-zinc-950 border border-zinc-850 overflow-hidden transition-colors hover:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs font-bold text-white shrink-0">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg bg-zinc-900 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white bg-zinc-800' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal border-t border-zinc-850 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Have a specific question not addressed above?</h4>
            <p className="text-xs text-zinc-400">
              Speak directly with an academic mentor or admissions advisor.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <span>Contact Admissions</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </Link>

            <a
              href="tel:+917347398956"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>+91 7347398956</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
