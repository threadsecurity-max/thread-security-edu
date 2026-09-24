'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, Check, ChevronUp, MapPin, Phone, Star } from 'lucide-react';

export function PublicFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-[#090e0b] via-[#040705] to-black text-slate-300 border-t border-[#C6FF34]/20 pt-16 pb-12 relative overflow-hidden font-sans">
      {/* Lime Ambient Background Glow & Tech Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C6FF34]/12 via-[#080e0a]/30 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#C6FF34_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── STREAMLINED NEWSLETTER BANNER ── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c140e] via-[#060a07] to-[#040705] border border-[#C6FF34]/25 flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(198,255,52,0.15)]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white tracking-tight">Stay Ahead with Cybersecurity Updates &amp; Cohorts</h4>
              <p className="text-xs text-slate-400 mt-1">Get early access to syllabus releases, vulnerability breakdowns, and live workshop invites.</p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address for security updates
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/60 border border-slate-800 focus:border-[#C6FF34] text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#C6FF34]/30 min-w-[260px] w-full transition-all placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSubscribed
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'bg-[#C6FF34] text-black hover:bg-[#b2f218] shadow-[0_0_20px_rgba(198,255,52,0.25)]'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── SPACIOUS & STRUCTURED MULTI-COLUMN NAVIGATION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Direct Contact Column (Spans 4 cols on Desktop) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/logos/TSE Logo Nav.svg"
                  alt="Thread Security Education"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-base tracking-wider text-white font-mono group-hover:text-[#C6FF34] transition-colors">
                THREAD SECURITY EDUCATION
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Premier Cybersecurity &amp; AI Academy providing live hands-on sandboxed labs, mentor-led masterclasses, and verified TS-ID credentials.
            </p>

            {/* Email Pill & Direct Call Block */}
            <div className="space-y-2.5 pt-1">
              <a
                href="mailto:edu@threadsecurity.in"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e1711] border border-emerald-500/30 text-white hover:border-[#C6FF34] hover:text-[#C6FF34] text-xs font-mono transition-all group"
              >
                <Mail className="w-3.5 h-3.5 text-[#C6FF34] group-hover:scale-110 transition-transform" />
                <span>edu@threadsecurity.in</span>
              </a>

              <div className="flex items-center gap-3">
                <a
                  href="tel:+917347398956"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#C6FF34] transition-colors font-mono"
                >
                  <Phone className="w-4 h-4 text-[#C6FF34]" />
                  <span>+91 7347398956</span>
                </a>
              </div>

              {/* Google Verified Review Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-white">4.9</span>
                </div>
                <span className="text-slate-400 text-[11px]">on Google (Verified Student Reviews)</span>
              </div>
            </div>

            {/* Academy Campus Address */}
            <div className="flex items-start gap-2.5 pt-2 text-xs text-slate-400 max-w-sm">
              <MapPin className="w-4 h-4 text-[#C6FF34] shrink-0 mt-0.5" />
              <span className="leading-snug">
                3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://x.com/ThreadSecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/60 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="Twitter / X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/thread_security?igsh=MXIxZ2p3dWUwZDN6eQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/60 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/thread-security/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/60 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
              <a
                href="https://github.com/threadsecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/60 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Courses (2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Courses
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/courses" className="hover:text-[#C6FF34] transition-colors font-medium text-slate-200">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/courses#cybersecurity" className="hover:text-[#C6FF34] transition-colors">
                  Cybersecurity &amp; CEH
                </Link>
              </li>
              <li>
                <Link href="/courses#ai-security" className="hover:text-[#C6FF34] transition-colors">
                  AI Security &amp; LLMs
                </Link>
              </li>
              <li>
                <Link href="/courses#soc-analyst" className="hover:text-[#C6FF34] transition-colors">
                  SOC Threat Hunting
                </Link>
              </li>
              <li>
                <Link href="/courses#devsecops" className="hover:text-[#C6FF34] transition-colors">
                  Cloud DevSecOps
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#C6FF34] transition-colors">
                  Web App Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Industrial Training & Cohorts (2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Training Tracks
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/#apply-batches" className="hover:text-[#C6FF34] transition-colors font-medium text-slate-200">
                  Upcoming Batches
                </Link>
              </li>
              <li>
                <Link href="/learning-paths" className="hover:text-[#C6FF34] transition-colors">
                  6 Months Training
                </Link>
              </li>
              <li>
                <Link href="/learning-paths" className="hover:text-[#C6FF34] transition-colors">
                  6 Weeks Internship
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#C6FF34] transition-colors">
                  Workshops &amp; Bootcamps
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="hover:text-[#C6FF34] transition-colors">
                  Verify Certificate (TS-ID)
                </Link>
              </li>
              <li>
                <Link href="/contact?topic=hiring" className="hover:text-[#C6FF34] transition-colors">
                  Hire From Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Explore & Company (2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/#curriculum-roadmap" className="hover:text-[#C6FF34] transition-colors">
                  Curriculum Roadmap
                </Link>
              </li>
              <li>
                <Link href="/#projects" className="hover:text-[#C6FF34] transition-colors">
                  Hands-on Projects
                </Link>
              </li>
              <li>
                <Link href="/#certifications" className="hover:text-[#C6FF34] transition-colors">
                  Certifications
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-[#C6FF34] transition-colors">
                  Student Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6FF34] transition-colors">
                  Contact Admissions
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#C6FF34] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Resources & Portal (2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-[#C6FF34] transition-colors font-medium text-slate-200">
                  Research &amp; Blog
                </Link>
              </li>
              <li>
                <Link href="/learning-paths" className="hover:text-[#C6FF34] transition-colors">
                  Learning Pathways
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#C6FF34] transition-colors">
                  Events &amp; Webinars
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6FF34] transition-colors">
                  1-on-1 Counseling
                </Link>
              </li>
              <li>
                <Link href="/student" className="hover:text-[#C6FF34] transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#C6FF34] transition-colors">
                  Member Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── BOTTOM COPYRIGHT & LEGAL BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Thread Security Education. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/verify-certificate" className="hover:text-slate-300 transition-colors">
              Credential Verification
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Support
            </Link>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-[#C6FF34] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
