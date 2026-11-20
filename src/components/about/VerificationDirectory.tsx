'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VERIFICATION_DIRECTORY } from '@/data/aboutUsData';
import {
  ShieldCheck,
  ExternalLink,
  Phone,
} from 'lucide-react';

export function VerificationDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCategories =
    selectedCategory === 'all'
      ? VERIFICATION_DIRECTORY
      : VERIFICATION_DIRECTORY.filter((cat) => cat.id === selectedCategory);

  return (
    <section id="verification" className="scroll-mt-28 py-20 sm:py-28 bg-black text-white border-y border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>SECTION 07 // TRUST &amp; VERIFICATION ENGINE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Is Thread Security real?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Verify it yourself.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Choosing an education platform is an important decision. You should not have to rely only on what a website says about itself. We encourage every learner to review the available information, verify important details, and ask questions before making a decision.
          </p>
        </div>

        {/* Source Distinction Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Source Integrity Standard</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                We clearly label <strong className="text-white">Independent Registries</strong> (Government / ISO bodies) versus <strong className="text-zinc-300">Self-Published Institutional Records</strong>.
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All Categories
            </button>
            {VERIFICATION_DIRECTORY.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.name.split('.')[1] || cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Categories */}
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>{category.name}</span>
                </h3>
                <p className="text-xs font-mono text-zinc-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Source & Status Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            item.isIndependent
                              ? 'bg-white text-black font-bold'
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{item.isIndependent ? 'Independent Registry' : 'Official Publication'}</span>
                        </span>

                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          {item.statusText}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight mb-2 group-hover:text-zinc-200 transition-colors">
                        {item.title}
                      </h4>

                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 mb-3 text-xs font-medium text-zinc-200">
                        {item.claim}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-normal mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Destination Action */}
                    <div className="pt-4 border-t border-zinc-850 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 truncate">
                        <span className="text-zinc-500">Source:</span> {item.sourceLabel}
                      </div>

                      {item.documentRef && (
                        <div className="text-[11px] font-mono text-white">
                          Ref / ID: <span className="font-bold underline">{item.documentRef}</span>
                        </div>
                      )}

                      {item.destinationUrl && (
                        <div className="pt-1">
                          {item.destinationUrl.startsWith('http') ? (
                            <a
                              href={item.destinationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:text-zinc-300 hover:underline transition-colors cursor-pointer"
                            >
                              <span>Inspect Verification Source</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <Link
                              href={item.destinationUrl}
                              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:text-zinc-300 hover:underline transition-colors cursor-pointer"
                            >
                              <span>Explore Verification Page</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Admissions Verification Helpline */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Have a specific institutional or university verification question?</h4>
            <p className="text-xs text-zinc-400">
              Our academic administration desk directly assists with college NOCs, training letters, and official verification requests.
            </p>
          </div>

          <a
            href="tel:+917347398956"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span>Call Admissions Desk: +91 7347398956</span>
          </a>
        </div>
      </div>
    </section>
  );
}
