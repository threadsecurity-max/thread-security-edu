import { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Shield, Check, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Thread Security Education',
  description:
    'Read about the cookies and browser storage technologies used by Thread Security Education for authentication, assessment proctoring, and platform analytics.',
  alternates: {
    canonical: 'https://threadsecurity.in/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-4">
            <Cookie className="w-3.5 h-3.5 text-amber-600" />
            <span>Browser Storage &amp; Cookie Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: January 1, 2026 | Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your browser or device when you visit websites. They enable the web server to recognize your device, maintain active sessions, remember your preferences, and verify assessment integrity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Types of Cookies We Use</h2>
            <p>Thread Security Education uses cookies strictly categorized into the following purposes:</p>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">Essential &amp; Security Cookies (Mandatory)</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Always Active</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  These cookies are vital for logging into the Student Portal, authenticating API requests via HMAC-SHA256 signed session tokens (<code className="text-slate-800 font-mono text-[11px]">tse_session</code>), preventing CSRF attacks, and securing assessment sessions.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">Functional &amp; Learning Analytics Cookies</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">Configurable</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  These cookies remember your course player theme, sandboxed terminal font size, audio preferences, and help us optimize page load speed and user journeys.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">Marketing &amp; Workshop Notice Cookies</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">Configurable</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Used occasionally to present relevant cybersecurity webinars, scholarship alerts, and new batch launch schedules without displaying repetitive banners.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Technical Security of Our Cookies</h2>
            <p>
              In alignment with industry-leading cybersecurity engineering practices, all sensitive cookies issued by Thread Security Education include the following protection flags:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 font-mono text-xs">
              <li><strong className="text-slate-900 font-sans">HttpOnly:</strong> Blocks malicious client-side JavaScript from accessing session data (mitigating XSS).</li>
              <li><strong className="text-slate-900 font-sans">Secure:</strong> Guarantees cookies are transmitted exclusively over encrypted HTTPS/TLS connections.</li>
              <li><strong className="text-slate-900 font-sans">SameSite=Lax/Strict:</strong> Protects against Cross-Site Request Forgery (CSRF) attempts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Managing Your Preferences</h2>
            <p>
              You can modify or withdraw your cookie consent at any time by visiting our dedicated <Link href="/cookie-settings" className="text-purple-700 underline font-semibold">Cookie Settings</Link> page, or by configuring your browser settings to decline non-essential cookies.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">5. Inquiries</h2>
            <p>For questions concerning our cookie usage or security headers, email <span className="font-mono text-slate-900">tech@threadsecurity.in</span>.</p>
          </section>

        </div>

      </div>
    </div>
  );
}
