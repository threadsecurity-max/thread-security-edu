'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const FEATURED_MENTORS = [
  {
    id: 'm-1',
    name: 'Kunal Singh',
    title: 'Lead Security Architect',
    company: 'Thread Security Education',
    expertise: 'Red Teaming, Web VAPT, & Active Directory',
    bio: 'Ex-Principal Offensive Security Consultant with 10+ years of red teaming Fortune 500 financial networks and cloud infrastructure.',
    initials: 'KS',
  },
  {
    id: 'm-2',
    name: 'Ananya Roy',
    title: 'Head of AI Vulnerability Research',
    company: 'TSE GenAI Labs',
    expertise: 'LLM Red Teaming, Prompt Injection, & Guardrails',
    bio: 'Former AI Safety Researcher specializing in vector database poisoning, model evasion attacks, and agentic tool RCE mitigations.',
    initials: 'AR',
  },
  {
    id: 'm-3',
    name: 'Vikramaditya Sharma',
    title: 'Principal SOC Engineer',
    company: 'Cyber Threat Command',
    expertise: 'Splunk SIEM, MITRE ATT&CK, & PCAP Forensics',
    bio: 'SOC Blue Team Lead directing real-time threat hunting operations and high-severity incident triage playbooks.',
    initials: 'VS',
  },
  {
    id: 'm-4',
    name: 'Harpreet Kaur',
    title: 'Senior AI Engineer',
    company: 'Autonomous Systems Inc.',
    expertise: 'Agentic Tool Architecture & LangChain Security',
    bio: 'Specialist in multi-modal LLM deployment, autonomous agent sandboxing, and enterprise AI pipeline hardening.',
    initials: 'HK',
  },
];

export function MentorsSection() {
  return (
    <section id="mentors" className="py-20 bg-[#F8FAFC] text-slate-900 border-t border-slate-200 relative z-10">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            DISTINGUISHED FACULTY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
            Learn Directly From <span className="text-purple-600">Active Practitioners</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Our courses are designed and delivered by active security architects and AI engineers who protect production systems daily.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_MENTORS.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-5 text-left"
            >
              <div className="space-y-4">
                
                {/* Avatar & Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                    {m.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {m.name}
                    </h3>
                    <span className="text-xs font-mono text-purple-700 font-semibold block">{m.title}</span>
                    <span className="text-[11px] text-slate-500 block">{m.company}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-700">
                  <span className="text-emerald-700 font-bold block mb-0.5">Focus:</span>
                  <span>{m.expertise}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {m.bio}
                </p>

              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Book 1-on-1 Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
