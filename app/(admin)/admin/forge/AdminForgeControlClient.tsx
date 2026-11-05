'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Flame,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toggleForgeModeAction } from '@/features/forge/actions/forge.actions';

interface AdminForgeControlProps {
  initialStatus: {
    isEnabled: boolean;
    updatedAt: string;
    updatedBy: string;
    currentUserEmail: string | null;
    isCurrentUserBypassed: boolean;
    bypassedEmails: string[];
  };
}

export function AdminForgeControlClient({ initialStatus }: AdminForgeControlProps) {
  const [isEnabled, setIsEnabled] = useState(initialStatus.isEnabled);
  const [updatedAt, setUpdatedAt] = useState(initialStatus.updatedAt);
  const [updatedBy, setUpdatedBy] = useState(initialStatus.updatedBy);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleToggle = (nextState: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleForgeModeAction(nextState, notes);
        if (res.success) {
          setIsEnabled(Boolean(res.isEnabled));
          setUpdatedAt(res.updatedAt || new Date().toISOString());
          setFeedback({
            text: nextState
              ? 'FORGE MODE ENGAGED: All panels put to rest. Doors locked for non-testing users.'
              : 'FORGE MODE DISENGAGED: All panels restored. Doors are open!',
            type: 'success',
          });
        } else {
          setFeedback({ text: res.error || 'Failed to update forge status.', type: 'error' });
        }
      } catch (err: any) {
        setFeedback({ text: err.message || 'Operation failed.', type: 'error' });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-900 pb-12">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isEnabled ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400">
              DEVELOPER SANCTUARY &bull; SYSTEM MAINTENANCE SWITCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-amber-400" />
            <span>Developer Forge Mode</span>
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Put all operational action panels (students, mentors, and standard staff) to rest while deep development or migrations take place. Whitelisted developer test accounts retain unrestricted access.
          </p>
        </div>

        {/* Master State Badge & One-Click Toggle */}
        <div className="relative z-10 shrink-0 p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3 min-w-[200px]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            MASTER SWITCH
          </span>
          <div
            className={`text-xl font-mono font-black ${
              isEnabled ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isEnabled ? '🔥 FORGE ON' : '🛡️ DOORS OPEN'}
          </div>
          <button
            type="button"
            onClick={() => handleToggle(!isEnabled)}
            disabled={isPending}
            className={`w-full px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              isEnabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isPending ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Switching...</span>
              </>
            ) : isEnabled ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Open Doors (Turn OFF)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Engage Forge (Put to Rest)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Live Status & Telemetry */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-600" />
              <span>Sanctuary Lock Status</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isEnabled
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {isEnabled ? 'Panels At Rest' : 'All Panels Active'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <span className="font-mono font-bold text-slate-900">
                {isEnabled ? 'LOCKED TO DEVELOPERS ONLY' : 'OPEN FOR ALL USERS'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Last Modified:</span>
              <span className="font-mono text-slate-700">
                {new Date(updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Triggered By:</span>
              <span className="font-mono text-slate-700 truncate max-w-xs">{updatedBy}</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Audit Reason / Release Memo (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Deploying privilege delegation graph & database sync..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Panel 2: Whitelisted Developer Test Accounts */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Whitelisted Developer Emails</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              4 Test Accounts Exempt
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            These testing emails are strictly excluded from Forge Mode lockouts and never encounter the maintenance barrier:
          </p>

          <div className="space-y-2">
            {initialStatus.bypassedEmails.map((email, idx) => {
              const isYou = initialStatus.currentUserEmail?.toLowerCase() === email.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isYou
                      ? 'bg-violet-50/70 border-violet-300 text-violet-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  {isYou && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-violet-200 text-violet-800 font-semibold shrink-0">
                      You (Active)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/forge-mode"
              target="_blank"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Preview Forge Mode Barrier Screen (New Tab)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
