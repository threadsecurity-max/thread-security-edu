'use client';

import React from 'react';
import Link from 'next/link';
import { IndustrialTrainingCity, CITIES_LIST } from '@/data/industrialTrainingCities';
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
  HelpCircle,
  Building2,
  FileCheck,
  ChevronRight,
  Check,
} from 'lucide-react';

interface CityViewProps {
  city: IndustrialTrainingCity;
}

export function IndustrialTrainingCityView({ city }: CityViewProps) {
  const siblingCities = CITIES_LIST.filter((c) => c.slug !== city.slug);

  return (
    <div className="w-full bg-[#FAFAFA] text-slate-900 font-sans pb-20">
      {/* ── BREADCRUMBS ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900 transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/industrial-training" className="hover:text-slate-900 transition-colors shrink-0">
              Industrial Training
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate shrink-0" aria-current="page">
              {city.cityName} Training
            </span>
          </nav>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 sm:pt-16 pb-12 sm:pb-20">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl space-y-5">
            {/* Trust & Delivery Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                <span>{city.cityName}, {city.state}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>{city.deliveryTypeBadge}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>DPIIT Recognized: DIPP169824</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Award className="w-3.5 h-3.5 text-slate-600" />
                <span>ISO 9001:2015</span>
              </span>
            </div>

            {/* Single <h1> for Target City + Intent */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
              {city.heroH1}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl">
              {city.heroSub}
            </p>

            {/* BLUF GEO Block for Search & AI Overviews */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                <Terminal className="w-4 h-4 text-purple-700" />
                <span>Bottom Line Up Front (BLUF) Overview</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {city.blufSummary}
              </p>
            </div>

            {/* CTA Actions & Verified Contact */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                <span>Apply for {city.cityName} Training</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </Link>
              <a
                href="#comparison-table"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold hover:bg-slate-50 transition-all"
              >
                <span>Compare 45-Day vs. 6-Month Tracks</span>
              </a>
              <a
                href="tel:+917347398956"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admissions: +91 7347398956</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-16">
        
        {/* ── SECTION 1: COMPARISON TABLE (45-DAY vs 6-MONTH) ── */}
        <section id="comparison-table" className="space-y-4">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 inline-block">
              Curriculum Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              45-Day Summer Sprint vs. 6-Month Industrial Fellowship
            </h2>
            {/* BLUF Block for Program Structure */}
            <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>Quick Summary:</strong> The 45-Day Summer Sprint is built for 2nd and 3rd-year engineering students completing mandatory university break credits with rapid, hands-on vulnerability assessments. The 6-Month Industrial Fellowship is a comprehensive 24-week program for final-year students (7th/8th semester) requiring major university project submission, weekly logbook sign-offs, and dedicated technical placement assistance.
            </div>
          </div>

          <IndustrialTrainingComparisonTable cityName={city.cityName} />
        </section>

        {/* ── SECTION 2: LOCAL DELIVERY MODE & COMMUTE TRANSIT ── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block">
              Local Infrastructure &amp; Accessibility
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              How {city.cityName} Students Access Training &amp; Live Labs
            </h2>
            {/* BLUF GEO Block for Delivery */}
            <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>GEO Delivery Mode:</strong> {city.deliveryMode}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                <Building2 className="w-5 h-5 text-purple-700 shrink-0" />
                <span>Campus &amp; Lab Environment</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {city.campusAddress ? (
                  <>
                    <strong>Physical Center:</strong> {city.campusAddress}. Students access enterprise-grade attack-defense workstations, hardware hacking setups, and physical mentor sync cabins.
                  </>
                ) : (
                  <>
                    <strong>Virtual &amp; Hybrid Range:</strong> Isolated cloud containers provisioned per student on high-performance compute clusters, enabling zero malware risk and 24/7 access from any web browser.
                  </>
                )}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Commute, Connectivity &amp; Schedule</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {city.commuteTransitDetails}
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: UNIVERSITY ACCREDITATION & COMPLIANCE ── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 inline-block">
              Academic Credit Assurance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              University Compliance for Colleges in &amp; around {city.cityName}
            </h2>
            {/* BLUF Block for University Credits */}
            <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>Academic Guarantee:</strong> Every industrial training cohort strictly aligns with academic guidelines enforced by IKGPTU, autonomous engineering universities, and state technical education boards. Students receive verified paperwork guaranteeing 100% credit acceptance for minor and major project modules.
            </div>
          </div>

          {/* Compliance Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Synopsis Approval</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.synopsisApproval}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2. Weekly Progress Diary</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.weeklyLogbook}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3. Mid-Term Appraisal</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.midTermReview}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4. Live Capstone Repo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.capstoneProject}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>5. Viva-Voce Defense</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.vivaDefensePrep}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                <span>6. Cryptographic TS-ID</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {city.universityComplianceBlock.tsIdCredential}
              </p>
            </div>
          </div>

          {/* Target Institutions in this Region */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Target Universities &amp; Technical Colleges in {city.cityName} &amp; Surrounding Regions</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {city.targetUniversitiesAndColleges.map((college, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  {college}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CITY-SPECIFIC FAQs ── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 inline-block">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Industrial Training Queries for {city.cityName} Students
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {city.localFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
              >
                <h3 className="font-bold text-sm sm:text-base text-slate-950 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6.5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 5: CONTEXTUAL INTERNAL LINKING ── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
              Regional Training Network
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Explore Industrial Training Across North India Cities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Thread Security Education coordinates physical, hybrid, and live online cohorts across Punjab, Chandigarh Tricity, and Himachal Pradesh.
            </p>
          </div>

          {/* Sibling City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {siblingCities.map((c) => (
              <Link
                key={c.slug}
                href={`/industrial-training/${c.slug}`}
                className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>{c.state}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-sm text-white">{c.name}</div>
                <div className="text-[11px] text-lime-300 font-mono mt-1">{c.badge}</div>
              </Link>
            ))}
          </div>

          {/* Hub and Course Links */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <Link
              href="/industrial-training"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
              <span>Back to North India Industrial Training Hub</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500">Related Programs:</span>
              {city.relatedCourses.map((rc, idx) => (
                <Link
                  key={idx}
                  href={`/courses/${rc.slug}`}
                  className="text-slate-300 hover:text-lime-300 underline underline-offset-4 font-medium transition-colors"
                >
                  {rc.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
