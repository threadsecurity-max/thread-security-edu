'use client';

import { Shield, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TrackPartitionProps {
  cyberCount: number;
  aiCount: number;
  onSelectTrack: (track: 'all' | 'cyber' | 'ai') => void;
  activeTrack: 'all' | 'cyber' | 'ai';
}

export function TrackPartition({
  cyberCount,
  aiCount,
  onSelectTrack,
  activeTrack,
}: TrackPartitionProps) {
  return (
    <section id="tracks" className="py-16 bg-[#FAFAFA] text-slate-900 relative z-10 border-t border-slate-200">
      
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            TRACK ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            Dual Track <span className="text-emerald-600">Partition</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Choose your specialization track. Each pathway is partitioned into structured stages with dedicated live sandbox environments.
          </p>
        </div>

        {/* 2-Column Partition Box */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          
          {/* Visible Vertical Divider Line */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200 z-30" />

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 relative">
            
            {/* ── LEFT PARTITION: CYBERSECURITY ── */}
            <div className="p-8 sm:p-10 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold tracking-wider uppercase">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TRACK A • CYBERSECURITY</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                  Cybersecurity <span className="text-emerald-600">Engineering</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Offensive Red Teaming, Web VAPT, SOC Operations, Threat Hunting, and Cloud DevSecOps with 100% on-demand isolated sandbox labs.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>OWASP Top 10 Web Exploitation &amp; Burp Suite Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Splunk SIEM, MITRE ATT&amp;CK, &amp; Memory Forensics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enterprise Active Directory &amp; BloodHound Attacks</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  {cyberCount} COURSES AVAILABLE
                </span>
                <button
                  onClick={() => onSelectTrack('cyber')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTrack === 'cyber'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span>Explore Cyber</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── RIGHT PARTITION: ARTIFICIAL INTELLIGENCE ── */}
            <div className="p-8 sm:p-10 bg-gradient-to-br from-white via-slate-50 to-purple-50/30 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/70 border border-purple-200 text-purple-800 font-mono text-xs font-bold tracking-wider uppercase">
                  <Brain className="w-3.5 h-3.5 text-purple-600" />
                  <span>TRACK B • ARTIFICIAL INTELLIGENCE</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                  AI &amp; Data <span className="text-purple-600">Security</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Autonomous Agentic AI Engineering, LLM Red Teaming, Indirect Prompt Injection, NeMo Guardrails, and Production ML Defense.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>LLM Jailbreaking &amp; Dual-LLM Guardrail Auditing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Tool-Using Autonomous AI Agents &amp; SSRF Evasion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Vector Database Poisoning &amp; RAG Architecture Defense</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-800 uppercase tracking-wider">
                  {aiCount} COURSES AVAILABLE
                </span>
                <button
                  onClick={() => onSelectTrack('ai')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTrack === 'ai'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <span>Explore AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Switcher Strip */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ACTIVE PARTITION VIEW</span>
            </div>

            <button
              onClick={() => onSelectTrack('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTrack === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Show All Courses ({cyberCount + aiCount})
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
