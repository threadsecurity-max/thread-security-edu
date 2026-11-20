'use client';

import React from 'react';
import { WHO_WE_ARE_PILLARS } from '@/data/aboutUsData';
import { Shield, ArrowUpRight } from 'lucide-react';

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="scroll-mt-28 py-20 sm:py-24 bg-black text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800 mb-4">
            <Shield className="w-3.5 h-3.5 text-zinc-300" />
            <span>SECTION 02 // IDENTITY & PURPOSE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Who are we?
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Thread Security is a cybersecurity-focused learning ecosystem built around the idea that security knowledge should be understandable, practical, and accessible. We aim to bring structured learning and hands-on exploration together, helping learners develop the confidence to understand digital systems, recognize security challenges, and approach problems responsibly.
          </p>
        </div>

        {/* Narrative Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-750 transition-all space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>The Problem We Address</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Traditional computer science education often treats cybersecurity as an isolated elective or abstract theory. Meanwhile, commercial training providers frequently rely on passive video lectures, outdated slides, and unrealistic marketing claims. Beginners are left without the practical technical capabilities needed to audit code, defend networks, or understand vulnerabilities at the packet and kernel level.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-750 transition-all space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>Who The Ecosystem Is Built For</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Our learning tracks are engineered for undergraduate engineering students (B.Tech, BCA, MCA, Polytechnic) fulfilling university-mandated industrial training, recent graduates breaking into information security, software engineers learning application security, and motivated self-starters seeking verified, verifiable technical depth.
            </p>
          </div>
        </div>

        {/* Three Editorial Blocks: Understand, Practise, Evolve */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
            THREE CORNERSTONES OF THE LEARNING EXPERIENCE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHO_WE_ARE_PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="group relative p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-white group-hover:text-zinc-300 transition-colors">
                      {pillar.number}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      Phase
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-tight mb-1 group-hover:text-zinc-200 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-mono text-zinc-500 mb-4">{pillar.tagline}</p>

                  <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-850 flex items-center gap-1.5 text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <span>Hands-on discipline</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
