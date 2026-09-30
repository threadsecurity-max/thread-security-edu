import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Thread Security Education',
  description:
    'Review the official terms of enrollment, academic honor code, sandboxed lab acceptable use policy, and verifiable certificate issuance guidelines for Thread Security Education.',
  alternates: {
    canonical: 'https://threadsecurity.in/terms',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            <span>Academic &amp; Operational Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: January 1, 2026 | Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Acceptance of Terms</h2>
            <p>
              By accessing the website threadsecurity.in, enrolling in any training course, participating in sandboxed live labs, or undertaking assessments administered by Thread Security Education (&quot;TSE&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms &amp; Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Ethical Cybersecurity &amp; Lab Acceptable Use Policy (AUP)</h2>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Strict Legal Warning Regarding Defensive Scope</span>
              </div>
              <p className="text-xs leading-relaxed">
                All penetration testing methodologies, vulnerability hunting techniques, security scripts, and tools taught at TSE are exclusively for defensive, educational, and authorized lab practice under Indian Cyber Law (Information Technology Act, 2000 and Indian Penal Code).
              </p>
            </div>
            <p>Students explicitly agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>No techniques learned may be executed against production networks, websites, or servers without formal written authorization from the system owners.</li>
              <li>Sandboxed VM environments provided by TSE must not be used to launch outbound denial-of-service (DoS) attacks, cryptomining, or botnet staging.</li>
              <li>Violation of this policy will result in immediate expulsion, permanent revocation of TS-ID credentials, and formal reporting to legal authorities.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Enrollment &amp; Fee Payments</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Enrollment in a training batch is confirmed only upon successful receipt of the prescribed registration or course fee.</li>
              <li>Seats in live cohorts and sandboxed lab slots are allocated on a first-come, first-served basis.</li>
              <li>Fee payments are subject to our formal <Link href="/refund-policy" className="text-purple-700 underline font-medium">Refund Policy</Link>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Assessment Honor Code &amp; Anti-Cheating Controls</h2>
            <p>
              To protect the prestige and industry validity of TSE credentials, all online and proctored assessments are governed by strict automated integrity standards:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Assessments must be completed independently by the enrolled student without third-party assistance or unauthorized AI-assisted answer generation.</li>
              <li>The LMS automatically records telemetry events (such as tab switches, full-screen departures, and copy-paste events) to calculate an integrity confidence score.</li>
              <li>Any attempt to tamper with client-side timers, intercept API calls, or replay assessment questions will trigger an automatic failed attempt verdict.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. TS-ID Certificate Issuance &amp; Verification</h2>
            <p>
              Thread Security Education issues cryptographically verifiable TS-ID credentials upon satisfactory completion of curriculum modules, practical lab benchmarks, and required scores on exit assessments. TSE reserves the right to withhold or revoke credentials in cases of academic dishonesty or code of conduct violations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">6. Intellectual Property Rights</h2>
            <p>
              All courseware, video lectures, lab blueprints, custom challenges, slide decks, and code examples provided during training are the proprietary intellectual property of Thread Security Education. Students are granted a personal, non-transferable, revocable license for individual learning only. Redistribution, re-recording, or commercial reuse is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">7. Placement Assistance Disclaimer</h2>
            <p>
              TSE provides comprehensive placement preparation, resume reviews, 1-on-1 mock interviews, and access to campus recruitment drives. However, final hiring decisions, salary packages, and employment offers rest solely with participating recruiting companies based on student interview performance.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">8. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of the Republic of India. Any disputes arising in connection with training programs or platform services shall be subject to the exclusive jurisdiction of the competent courts in Jalandhar, Punjab, India.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              For any clarification regarding these terms, write to <span className="font-mono text-slate-700">legal@threadsecurity.in</span>.
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
