'use client';

import React from 'react';
import Link from 'next/link';
import { CITIES_LIST, INDUSTRIAL_TRAINING_CITIES } from '@/data/industrialTrainingCities';
import { IndustrialTrainingComparisonTable } from './IndustrialTrainingComparisonTable';
import {
  ShieldCheck,
  Award,
  Terminal,
  MapPin,
  Clock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  FileCheck2,
  Layers,
  ChevronRight,
  Brain,
  Shield,
} from 'lucide-react';

export function IndustrialTrainingHubView() {
  const cities = Object.values(INDUSTRIAL_TRAINING_CITIES);

  return (
    <div className="w-full bg-[#FAFAFA] text-slate-900 font-sans pb-20">
      {/* ── BREADCRUMBS ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold" aria-current="page">
              Industrial Training
            </span>
          </nav>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl space-y-5">
            {/* Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                <span>North India Regional Network</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>DPIIT Recognized: DIPP169824</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Award className="w-3.5 h-3.5 text-slate-600" />
                <span>ISO 9001:2015 Quality Certified</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
              45-Day Summer &amp; 6-Month Industrial Training in Cybersecurity &amp; AI
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl">
              Government of India DPIIT-recognized industrial training programs engineered for B.Tech, BCA, MCA, and IT students. Choose in-person campus drills in Jalandhar, commute hybrid cohorts in Phagwara and Ludhiana, live hybrid tracks in Chandigarh, or 100% online instruction in Dharamshala.
            </p>

            {/* Quick Geo Direct Links */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Select Your City Cohort:
              </div>
              <div className="flex flex-wrap gap-2.5">
                {CITIES_LIST.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/industrial-training/${city.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-purple-700 font-mono bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                      {city.badge}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-16">
        
        {/* ── 5 CITIES DIRECTORY CARDS ── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 inline-block">
              Regional Delivery Centers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Choose Your Regional Training Location
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every city page features tailored delivery logistics, commute options to our flagship campus, verified university compliance checklists, and specialized FAQs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cities.map((city) => (
              <div
                key={city.slug}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                      {city.state}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200/60">
                      {city.deliveryTypeBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-purple-700 transition-colors">
                      {city.cityName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {city.regionLabel}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {city.blufSummary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500">Key Target Colleges:</div>
                    <div className="text-xs font-medium text-slate-800 line-clamp-2">
                      {city.targetUniversitiesAndColleges.slice(0, 3).join(', ')}...
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <Link
                    href={`/industrial-training/${city.slug}`}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>View {city.cityName} Cohort &amp; Labs</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROGRAM COMPARISON SECTION ── */}
        <section className="space-y-4">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 inline-block">
              Side-by-Side Analysis
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              45-Day Summer Sprint vs. 6-Month Industrial Fellowship
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Understand the core differences in academic timing, daily laboratory intensity, capstone deliverables, and placement support to choose the right track for your degree requirements.
            </p>
          </div>

          <IndustrialTrainingComparisonTable />
        </section>

        {/* ── TECHNICAL CURRICULUM TRACKS ── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block">
              Specialized Industrial Domains
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Three High-Demand Industrial Training Specializations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Track 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Offensive Security &amp; VAPT</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Web application pen-testing (OWASP Top 10), API vulnerability exploitation, Active Directory attacks, network pivoting, and enterprise remediation reporting.
              </p>
              <div className="text-xs font-mono font-semibold text-purple-700">Tools: Burp Suite Pro, Metasploit, Nmap, Wireshark, Docker</div>
            </div>

            {/* Track 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">SOC Operations &amp; SIEM Defense</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprise SIEM configuration with Splunk and Wazuh, real-time threat hunting, log parsing, alert triage, incident response, and digital forensics.
              </p>
              <div className="text-xs font-mono font-semibold text-blue-700">Tools: Splunk Enterprise, Wazuh EDR, Suricata, Sysmon, TheHive</div>
            </div>

            {/* Track 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Agentic AI &amp; LLM Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Building autonomous tool-calling AI agents (LangGraph, CrewAI), secure RAG architectures, model inversion testing, prompt injection defense, and dual-LLM guardrails.
              </p>
              <div className="text-xs font-mono font-semibold text-emerald-700">Tools: Python, LangChain, LangGraph, Vector DBs, NeMo Guardrails</div>
            </div>
          </div>
        </section>

        {/* ── ACADEMIC ASSURANCE & CONTACT BANNER ── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
              Verified Brand Ground Truth
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Thread Security Education (TSE)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Operated under parent cybersecurity research organization{' '}
              <a href="https://threadsecurity.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                Thread Security
              </a>
              . Flagship facility located at 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001. All training credentials carry unique, permanent TS-ID lookup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <span>Connect with Training Counselors</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
            <a
              href="tel:+917347398956"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-semibold transition-all"
            >
              <Phone className="w-4 h-4 text-lime-400" />
              <span>+91 7347398956</span>
            </a>
            <a
              href="mailto:edu@threadsecurity.in"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-semibold transition-all"
            >
              <Mail className="w-4 h-4 text-purple-300" />
              <span>edu@threadsecurity.in</span>
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
