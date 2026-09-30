'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Check, Shield, Lock, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CookieSettingsPage() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    // Load stored preferences if available
    try {
      const stored = localStorage.getItem('tse_cookie_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalyticsEnabled(parsed.analytics ?? true);
        setMarketingEnabled(parsed.marketing ?? false);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        'tse_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          marketing: marketingEnabled,
          updatedAt: new Date().toISOString(),
        })
      );
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3500);
    } catch {
      // Ignore
    }
  };

  const handleAcceptAll = () => {
    setAnalyticsEnabled(true);
    setMarketingEnabled(true);
    try {
      localStorage.setItem(
        'tse_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: true,
          marketing: true,
          updatedAt: new Date().toISOString(),
        })
      );
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3500);
    } catch {
      // Ignore
    }
  };

  const handleRejectNonEssential = () => {
    setAnalyticsEnabled(false);
    setMarketingEnabled(false);
    try {
      localStorage.setItem(
        'tse_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: false,
          marketing: false,
          updatedAt: new Date().toISOString(),
        })
      );
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-4">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>Interactive Privacy Preferences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Cookie Settings &amp; Preferences
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Manage your cookie permissions across the Thread Security Education learning portal. Read our full{' '}
            <Link href="/cookie-policy" className="text-purple-700 underline font-semibold">
              Cookie Policy
            </Link>{' '}
            for full transparency.
          </p>
        </div>

        {/* Preferences Control Form */}
        <div className="space-y-6">

          {/* Essential Cookies */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Strictly Necessary &amp; Security Cookies</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Required for core authentication, multi-factor login (MFA), sandboxed lab state, and assessment anti-cheat protection. These cannot be disabled.
              </p>
            </div>
            <div className="pt-1">
              <input
                type="checkbox"
                checked
                disabled
                className="w-5 h-5 accent-emerald-600 rounded cursor-not-allowed opacity-80"
                aria-label="Necessary Cookies (Always Active)"
              />
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Learning Analytics &amp; Performance Cookies</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Helps us monitor curriculum interaction, improve sandboxed terminal performance, and understand common student learning bottlenecks.
              </p>
            </div>
            <div className="pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle Analytics Cookies"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Webinar &amp; Workshop Notification Cookies</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allows us to notify you about upcoming live cybersecurity bootcamps, scholarship deadlines, and guest speaker sessions.
              </p>
            </div>
            <div className="pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle Marketing Cookies"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <button
              onClick={handleSavePreferences}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#C6FF34]" />
              <span>Save Cookie Preferences</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Reject Non-Essential
              </button>
            </div>
          </div>

          {/* Saved feedback alert */}
          {savedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your cookie preferences have been updated and saved successfully.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
