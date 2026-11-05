'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Lock,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  KeyRound,
  Terminal,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getForgeStatusAction } from '@/features/forge/actions/forge.actions';

export function ForgeModeClient({
  updatedAt,
  userEmail,
}: {
  updatedAt: string;
  userEmail: string | null;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Poll every 8 seconds to automatically open doors when developer turns Forge Mode OFF
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getForgeStatusAction();
        if (!res.isEnabled) {
          router.push('/');
        }
      } catch {
        // quiet retry
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCheckDoors = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const res = await getForgeStatusAction();
      if (!res.isEnabled) {
        setStatusMessage('The developer has opened the doors! Redirecting...');
        setTimeout(() => router.push('/'), 1200);
      } else {
        setStatusMessage('The developer is still forging. Doors remain locked. Please check back shortly.');
      }
    } catch {
      setStatusMessage('Connection verified. Developer is still active.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Animated Cyber Heat Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/15 via-rose-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-violet-600/15 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-6 bg-[#0c0d14]/90 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_rgba(245,158,11,0.12)] backdrop-blur-2xl">
        {/* Animated Forge Core Badge */}
        <div className="relative inline-flex items-center justify-center mx-auto mb-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-black border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
            <Flame className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-black border border-amber-500/60 shadow">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>FORGE MODE ENGAGED &bull; SYSTEM AT REST</span>
        </div>

        {/* Primary Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-snug">
            Wait for the Developer to Open the Doors
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Deep developmental forging and architectural upgrades are currently underway. All user action panels have been put to rest to ensure complete database and state integrity.
          </p>
        </div>

        {/* Status Feed Box */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-500 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>KERNEL STATUS: LOCKED</span>
            </span>
            <span className="text-[10px]">
              {new Date(updatedAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-slate-300">
            &gt; Operational panels: <strong className="text-amber-300">RESTING (MUTED)</strong>
          </div>
          <div className="text-slate-300">
            &gt; Master lock: <strong className="text-emerald-400">DEVELOPER SANCTUARY</strong>
          </div>
          {userEmail && (
            <div className="text-[10px] text-slate-500 pt-1 border-t border-white/5">
              Logged in as: {userEmail} (Standard clearance)
            </div>
          )}
        </div>

        {/* Notice feedback if manual check performed */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            {statusMessage}
          </div>
        )}

        {/* Action Button: Check Doors */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCheckDoors}
            disabled={checking}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Doors...' : 'Check If Doors Are Open'}</span>
          </button>

          <a
            href="/login"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Developer Account Login</span>
          </a>
        </div>

        {/* Micro Footer Notice */}
        <div className="pt-2 text-[10px] text-slate-500 font-mono">
          Authorized developer testing identities bypass this barrier automatically.
        </div>
      </div>
    </div>
  );
}

