'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, Check, ChevronUp } from 'lucide-react';

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
    <footer className="bg-gradient-to-b from-[#0a110c] via-[#050806] to-black text-slate-300 border-t border-[#C6FF34]/20 pt-14 pb-10 relative overflow-hidden">
      {/* Lime & Black Ambient Background Glows & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C6FF34]/15 via-[#080e0a]/40 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#C6FF34_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── LIME & BLACK NEWSLETTER BANNER ── */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-[#0e1710] via-[#070c08] to-[#040705] border border-[#C6FF34]/30 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-[0_0_30px_rgba(198,255,52,0.06)] backdrop-blur-xl">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(198,255,52,0.2)]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white tracking-tight">Stay Updated on Security Courses &amp; Updates</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">Get updates on new cohort admissions, course releases, and security workshops.</p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address for security course updates
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#050806] border border-slate-800 focus:border-[#C6FF34] text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C6FF34]/30 min-w-[240px] w-full transition-all placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isSubscribed
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-[#C6FF34] text-slate-950 hover:bg-[#b3fa1b] shadow-[0_0_15px_rgba(198,255,52,0.25)]'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── 4-COLUMN RELEVANT FOOTER NAVIGATION ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-10 border-b border-slate-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/logos/TSE Logo Nav.svg"
                  alt="Thread Security Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-sm tracking-wider text-white font-mono">
                THREAD SECURITY EDUCATION
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Practical cybersecurity and DevSecOps training with hands-on labs, real-world scenario simulations, and industry-recognized verification.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://x.com/ThreadSecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/50 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="Twitter / X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/thread_security?igsh=MXIxZ2p3dWUwZDN6eQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/50 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/thread-security/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/50 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
              <a
                href="https://github.com/threadsecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0a110c] border border-slate-800 hover:border-[#C6FF34]/50 text-slate-400 hover:text-[#C6FF34] flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Landing Page Sections */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Explore Sections
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
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
                  Industry Certifications
                </Link>
              </li>
              <li>
                <Link href="/#careers-forged" className="hover:text-[#C6FF34] transition-colors">
                  Career Pathways
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-[#C6FF34] transition-colors">
                  Student Reviews
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#C6FF34] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/#apply-batches" className="hover:text-[#C6FF34] transition-colors">
                  Upcoming Cohorts
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform & Features */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Platform &amp; Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/courses" className="hover:text-[#C6FF34] transition-colors font-semibold text-slate-200">
                  All Masterclasses &amp; Modules
                </Link>
              </li>
              <li>
                <Link href="/learning-paths" className="hover:text-[#C6FF34] transition-colors">
                  Curriculum Learning Paths
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#C6FF34] transition-colors">
                  Technical Security Blog
                </Link>
              </li>
              <li>
                <Link href="/placements" className="hover:text-[#C6FF34] transition-colors">
                  Placement Highlights
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#C6FF34] transition-colors">
                  Workshops &amp; Events
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
              <li>
                <Link href="/student" className="hover:text-[#C6FF34] transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#C6FF34] font-mono">
              Admissions &amp; Help
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="text-slate-200 font-medium">Thread Security Education</p>
              <p>
                <a href="mailto:admissions@threads-edu.com" className="hover:text-[#C6FF34] transition-colors">
                  admissions@threads-edu.com
                </a>
              </p>
              <p>
                <a href="tel:+919876543210" className="hover:text-[#C6FF34] transition-colors font-mono">
                  +91 98765 43210
                </a>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Mon — Sat: 9:00 AM – 7:00 PM IST
              </p>
            </div>
            <div className="pt-2">
              <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs text-[#C6FF34] hover:underline font-bold">
                <span>Book 1-on-1 Counseling</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── BOTTOM COPYRIGHT & LEGAL BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Thread Security Education. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
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
