import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Thread Security Education',
  description:
    'Learn how Thread Security Education collects, uses, protects, and handles your personal information, student credentials, and learning analytics.',
  alternates: {
    canonical: 'https://threadsecurity.in/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP &amp; IT Act Compliant Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: January 1, 2026 | Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Introduction</h2>
            <p>
              Thread Security Education (&quot;TSE&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the training platform, live cyber sandboxed labs, assessment management system, and verified TS-ID credentialing services available at threadsecurity.in. We are committed to safeguarding the privacy and security of our students, applicants, website visitors, and institutional partners.
            </p>
            <p>
              This Privacy Policy explains how we collect, process, store, and disclose your personal and academic data when you register for courses, attend masterclasses, take assessments, or use our sandboxed environments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Information We Collect</h2>
            <p>We collect information in the following categories:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-900">Personal Identification:</strong> Full name, email address, phone number, physical address, educational qualifications, and government-issued ID for TS-ID verifiable credentials.
              </li>
              <li>
                <strong className="text-slate-900">Account Credentials:</strong> Passwords, session tokens, multi-factor authentication (MFA) codes, and clearance roles.
              </li>
              <li>
                <strong className="text-slate-900">Academic &amp; Lab Activity:</strong> Assessment attempt history, answers, scoring metrics, test completion timers, live lab sandboxed terminal logs, and tamper-audit telemetry.
              </li>
              <li>
                <strong className="text-slate-900">Payment &amp; Billing Data:</strong> Transaction references, GST invoices, and payment confirmation IDs. Note: Raw credit card/UPI PIN information is processed securely by RBI-licensed payment gateways and is never stored on TSE servers.
              </li>
              <li>
                <strong className="text-slate-900">Technical Data:</strong> IP addresses, browser types, device fingerprints, operating system details, and session cookies.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Purpose of Data Processing</h2>
            <p>We process your personal information exclusively for legitimate educational and security purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 text-xs mb-1">Course &amp; Lab Delivery</p>
                <p className="text-xs text-slate-600">Provisioning sandboxed VM environments, lab scenarios, and mentor guidance.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 text-xs mb-1">TS-ID Verification</p>
                <p className="text-xs text-slate-600">Publishing cryptographically verifiable certificates for hiring partners.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 text-xs mb-1">Assessment Integrity</p>
                <p className="text-xs text-slate-600">Enforcing anti-cheat controls, tab-switch monitoring, and tamper audit logs.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 text-xs mb-1">Placement Support</p>
                <p className="text-xs text-slate-600">Connecting qualifying alumni with hiring cybersecurity and tech firms.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Data Protection &amp; Security Standards</h2>
            <p>
              As a premier cybersecurity institute, we enforce rigorous technical controls to protect your data against unauthorized access, loss, or manipulation:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>HMAC-SHA256 encrypted session vaults and HttpOnly, Secure, SameSite cookie architectures.</li>
              <li>TLS 1.3 encryption across all communication endpoints in transit and AES-256 for persistent database storage.</li>
              <li>Strict Role-Based Access Control (RBAC) preventing unauthorized student-to-student or student-to-admin data visibility.</li>
              <li>Air-gapped sandboxed virtual machines preventing lab exploits from spilling into identity data stores.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. Data Sharing &amp; Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal data. Data is shared strictly under confidential arrangements with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Verified placement partners (only with your explicit opt-in for recruitment drives).</li>
              <li>Authorized cloud infrastructure providers hosting our sandboxed compute labs.</li>
              <li>Statutory or law enforcement authorities when mandated under applicable Indian legal statutes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">6. Student Rights</h2>
            <p>Under the Digital Personal Data Protection (DPDP) Act, you possess the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Access a summary of personal data held about you.</li>
              <li>Request correction or rectification of outdated contact or educational details.</li>
              <li>Request erasure of your non-regulatory personal data upon program completion.</li>
              <li>Withdraw consent for non-essential communications at any time.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">7. Contact the Data Protection Officer</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our administrative desk:</p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Mail className="w-4 h-4 text-purple-700" />
                <span className="font-mono font-medium">privacy@threadsecurity.in / edu@threadsecurity.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Phone className="w-4 h-4 text-purple-700" />
                <span className="font-mono font-medium">+91 7347398956</span>
              </div>
              <div className="flex items-start gap-2 text-slate-800">
                <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>Thread Security Education, 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001</span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
