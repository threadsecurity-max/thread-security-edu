'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCloudinaryAssetUrl } from '@/lib/cloudinary/cloudinaryService';
import {
  Mail,
  ArrowRight,
  Check,
  ChevronUp,
  MapPin,
  Phone,
  Clock,
  Star,
  Shield,
  Sliders,
  X,
  ExternalLink,
} from 'lucide-react';

export function PublicFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [cookieSavedToast, setCookieSavedToast] = useState(false);

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

  const handleSaveCookieSettings = () => {
    try {
      localStorage.setItem(
        'tse_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: analyticsCookies,
          marketing: marketingCookies,
          updatedAt: new Date().toISOString(),
        })
      );
      setCookieSavedToast(true);
      setTimeout(() => {
        setCookieSavedToast(false);
        setIsCookieModalOpen(false);
      }, 1500);
    } catch {
      setIsCookieModalOpen(false);
    }
  };

  const googleMapsUrl =
    'https://www.google.com/maps/place/Thread+Security/@31.3138789,75.590456,16.01z/data=!4m6!3m5!1s0xae225c233d665ba3:0xdc4a9a6073a04901!8m2!3d31.3165991!4d75.5915633!16s%2Fg%2F11zkxck516?entry=ttu&g_ep=EgoyMDI2MDkyNy4xIKXMDSoASAFQAw%3D%3D';

  return (
    <footer className="relative bg-white text-slate-800 border-t border-slate-200/90 pt-16 pb-8 overflow-hidden font-sans">
      
      {/* ── GIANT GRAY WATERMARK AT BACKGROUND (More Width, Less Height) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[1720px] pointer-events-none select-none z-0 overflow-hidden flex items-end justify-center opacity-[0.1] grayscale">
        <Image
          src={getCloudinaryAssetUrl('/images/thread security footer.svg')}
          alt="Thread Security Background Watermark"
          width={1720}
          height={380}
          unoptimized
          loading="lazy"
          className="w-full h-auto max-h-[170px] sm:max-h-[220px] md:max-h-[270px] lg:max-h-[310px] object-cover sm:object-contain object-bottom"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── STREAMLINED NEWSLETTER / UPDATES BANNER ── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 shadow-xs">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-950 tracking-tight">Stay Ahead with Cybersecurity Updates &amp; Cohorts</h4>
              <p className="text-xs text-slate-500 mt-1">Get early access to syllabus releases, vulnerability breakdowns, and live workshop invites.</p>
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
              className="bg-white border border-slate-300 focus:border-purple-600 text-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 min-w-[260px] w-full transition-all placeholder:text-slate-400 font-sans shadow-xs"
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-md ${
                isSubscribed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-white hover:bg-slate-800'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-4 h-4 text-[#C6FF34]" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-4 h-4 text-[#C6FF34]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── 5-COLUMN HIGH-IMPACT NAVIGATION GRID (Matching Reference Style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-14">
          
          {/* Column 1: Brand & Contact (Spans 4 cols on Desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/logos/TSE Logo Nav.svg"
                  alt="Thread Security Education"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-base tracking-wider text-slate-950 font-mono group-hover:text-purple-700 transition-colors">
                THREAD SECURITY EDUCATION
              </span>
            </Link>
            
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Your Skill &amp; Technology Partner. Training students since 2019 with live sandboxed labs, industry trainers, and placement support.
            </p>

            {/* Direct Contact Stack */}
            <div className="space-y-3 pt-1">
              
              {/* Google Maps Location Link */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-xs text-slate-600 hover:text-slate-950 transition-colors group max-w-sm"
                title="View Thread Security Education on Google Maps"
              >
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 group-hover:text-purple-700" />
                <span className="leading-snug underline-offset-2 group-hover:underline">
                  3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
              </a>

              {/* Phone */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                <a
                  href="tel:+917347398956"
                  className="hover:text-slate-950 font-mono font-medium transition-colors"
                >
                  +91 7347398956
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <a
                  href="mailto:edu@threadsecurity.in"
                  className="hover:text-slate-950 font-mono font-medium transition-colors"
                >
                  edu@threadsecurity.in
                </a>
              </div>

              {/* Timings */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Mon – Sat, 9 AM – 7 PM</span>
              </div>
            </div>

            {/* Social Media Pill Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://www.instagram.com/thread_security?igsh=MXIxZ2p3dWUwZDN6eQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-purple-700 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@ThreadSecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-red-600 flex items-center justify-center transition-all"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/thread-security/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-blue-700 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>

              <a
                href="https://x.com/ThreadSecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all"
                aria-label="Twitter / X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://github.com/threadsecurity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: COURSES */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-4 font-sans">
              Courses
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/courses#cybersecurity" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Programming &amp; Scripting
                </Link>
              </li>
              <li>
                <Link href="/courses#ai-security" className="text-slate-600 hover:text-slate-950 transition-colors">
                  AI &amp; Data Security
                </Link>
              </li>
              <li>
                <Link href="/courses#soc-analyst" className="text-slate-600 hover:text-slate-950 transition-colors">
                  SOC Operations &amp; SIEM
                </Link>
              </li>
              <li>
                <Link href="/courses#devsecops" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Cyber &amp; Cloud DevSecOps
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Ethical Hacking &amp; CEH
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Offensive Red Teaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: PROGRAMS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-4 font-sans">
              Programs
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/learning-paths" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Internship &amp; Training
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-600 hover:text-slate-950 transition-colors">
                  After 12th Courses
                </Link>
              </li>
              <li>
                <Link href="/learning-paths#six-months" className="text-slate-600 hover:text-slate-950 transition-colors">
                  6 Months Training
                </Link>
              </li>
              <li>
                <Link href="/learning-paths#forty-five-days" className="text-slate-600 hover:text-slate-950 transition-colors">
                  45 Days Training
                </Link>
              </li>
              <li>
                <Link href="/learning-paths#six-weeks" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Summer Internship
                </Link>
              </li>
              <li>
                <Link href="/contact?topic=hiring" className="text-slate-600 hover:text-slate-950 transition-colors">
                  College Partnerships
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: COMPANY */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-4 font-sans">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#about" className="text-slate-600 hover:text-slate-950 transition-colors">
                  About Thread Security
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Why Thread Security
                </Link>
              </li>
              <li>
                <Link href="/#curriculum-roadmap" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Curriculum Roadmap
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Workshops &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Research &amp; Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: SUPPORT */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-4 font-sans">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#faq" className="text-slate-600 hover:text-slate-950 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/placements" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Placement Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Free Career Counselling
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Verify TS-ID Certificate
                </Link>
              </li>
              <li>
                <Link href="/student" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-slate-950 transition-colors font-medium">
                  Enquire Now
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── TOP LEGAL LINKS ROW (Exactly As Requested in Reference Image) ── */}
        <div className="pt-8 pb-5 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-slate-600">
            <Link
              href="/privacy-policy"
              className="hover:text-slate-950 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-950 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/cookie-policy"
              className="hover:text-slate-950 transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-slate-950 transition-colors"
            >
              Refund Policy
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-slate-950 transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-slate-950 transition-colors"
            >
              Sitemap
            </Link>
            <button
              type="button"
              onClick={() => setIsCookieModalOpen(true)}
              className="hover:text-slate-950 transition-colors cursor-pointer inline-flex items-center gap-1 text-slate-600"
            >
              <span>Cookie settings</span>
            </button>
          </div>
        </div>

        {/* ── BOTTOM COPYRIGHT & SOCIAL PROOF STRIP ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 pt-3">
          <p>© 2026 Thread Security Education. All rights reserved. Built in Jalandhar, Punjab.</p>
          
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admissions Open</span>
            </span>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 transition-colors"
              title="Verified Reviews on Google Maps"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9★ on Google (1,200+ reviews)</span>
            </a>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ml-1"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ── QUICK COOKIE SETTINGS MODAL ── */}
      {isCookieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-base text-slate-950">Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setIsCookieModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We use cookies to maintain your login session, ensure assessment anti-cheat integrity, and improve learning tools. Manage your preferences below or see our{' '}
              <Link href="/cookie-policy" className="text-purple-700 underline font-medium">
                Cookie Policy
              </Link>.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Essential &amp; Security</p>
                  <p className="text-[11px] text-slate-500">Authentication &amp; assessment verification.</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Required
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-900">Learning Analytics</p>
                  <p className="text-[11px] text-slate-500">Curriculum progression metrics.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-900">Webinar &amp; Workshop Alerts</p>
                  <p className="text-[11px] text-slate-500">Cohort notices and guest lectures.</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingCookies}
                  onChange={(e) => setMarketingCookies(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {cookieSavedToast && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center font-medium">
                Preferences saved!
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Link
                href="/cookie-settings"
                onClick={() => setIsCookieModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Detailed Settings
              </Link>
              <button
                onClick={handleSaveCookieSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
