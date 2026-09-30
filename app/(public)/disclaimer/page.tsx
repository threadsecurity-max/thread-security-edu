import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, Award, Briefcase, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer & Educational Notice | Thread Security Education',
  description:
    'Legal and educational disclaimer regarding the defensive ethical hacking curriculum, certification validity, and placement assistance at Thread Security Education.',
  alternates: {
    canonical: 'https://threadsecurity.in/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Legal &amp; Professional Practice Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Disclaimer
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Educational &amp; Defensive Purpose Only</h2>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
              <p className="text-xs leading-relaxed">
                All concepts, methodologies, demonstrations, automated security tools, scripts, and vulnerability assessments presented by Thread Security Education (TSE) are designed strictly and solely for defensive cybersecurity education, ethical penetration testing, and academic learning within isolated sandbox environments.
              </p>
            </div>
            <p>
              TSE does not promote, teach, encourage, or condone illegal hacking, unauthorized data exfiltration, extortion, or attacks against private or public computing systems. Any individual who uses techniques learned at TSE for malicious or non-consensual operations acts strictly on their own liability and in direct breach of the Indian Information Technology Act, 2000.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Career &amp; Placement Support Disclaimer</h2>
            <p>
              While Thread Security Education maintains an industry-leading 94% placement track record through extensive resume refinement, mock interviews, and corporate campus drives, TSE does not guarantee employment or specific salary figures. Hiring decisions are made solely at the discretion of independent third-party employers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Third-Party Trademarks &amp; Certification Disclaimers</h2>
            <p>
              Names, acronyms, and trademarks such as CEH, CISSP, CompTIA, AWS, Microsoft, or Google mentioned on this website belong to their respective trademark holders. Mention of these trademarks does not imply direct official affiliation or endorsement unless specifically stated as an authorized partner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Information Accuracy &amp; Currency</h2>
            <p>
              Due to the rapid evolution of cybersecurity threats and AI advancements, TSE reserves the right to update syllabi, lab architectures, and assessment modules at any time to preserve industry relevance.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">5. Contact Information</h2>
            <p>
              For legal inquiries regarding this disclaimer, contact: <span className="font-mono text-slate-900">legal@threadsecurity.in</span>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
