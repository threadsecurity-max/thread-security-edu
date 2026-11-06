'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';

interface Live24HourAttendanceClockProps {
  currentUser: {
    userId?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  isSuperAdmin: boolean;
  isTestingModeActive?: boolean;
  onToggleTestingMode?: () => void;
  isPending?: boolean;
}

export function Live24HourAttendanceClock({
  currentUser,
  isSuperAdmin,
  isTestingModeActive = false,
  onToggleTestingMode,
  isPending = false,
}: Live24HourAttendanceClockProps) {
  const [timeStr24, setTimeStr24] = useState<string>('--:--:--');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format 24-hour time in Asia/Kolkata
      const timeFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      setTimeStr24(timeFormatter.format(now));
      setDateStr(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const markerTitle = isSuperAdmin
    ? 'Super Admin (threadsecurity@gmail.com)'
    : 'Attendance Coordinator (Akshay Kumar)';

  return (
    <div className="space-y-3">
      {/* 24-Hour Digital Clock Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Clock Display */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-emerald-400 shadow-inner">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-emerald-400">
                  {timeStr24}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  24-HR IST CLOCK
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  24-HOUR WINDOW
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                <span className="text-slate-300 font-medium">{dateStr || 'Loading date...'}</span>
                <span>&bull;</span>
                <span>Timezone: Asia/Kolkata (UTC+05:30)</span>
              </div>
            </div>
          </div>

          {/* Marker Responsibility & Sequence Tracker */}
          <div className="flex flex-col md:items-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Responsible Marker:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-800 text-white border border-slate-700">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                {currentUser.name || currentUser.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{markerTitle} &bull; Sequentially Audited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Testing Mode Controller Banner */}
      {isSuperAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Super Admin Testing Accounts Policy</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    isTestingModeActive
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isTestingModeActive
                    ? '🧪 TESTING MODE ON (SHOWCASED TO AKSHAY)'
                    : '🛡️ STRICT MODE (HIDDEN FROM AKSHAY)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Testing users (<code>staff.junior</code>, <code>staff.executive</code>, <code>threadsecuritymentor</code>, <code>threadsecurity@gmail.com</code>) are{' '}
                <strong>
                  {isTestingModeActive
                    ? 'currently visible to coordinator Akshay Kumar'
                    : 'completely hidden from coordinator Akshay Kumar'}
                </strong>.
              </p>
            </div>
          </div>

          {onToggleTestingMode && (
            <button
              type="button"
              onClick={onToggleTestingMode}
              disabled={isPending}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 shadow-xs disabled:opacity-50 ${
                isTestingModeActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isPending
                ? 'Updating Policy...'
                : isTestingModeActive
                ? 'Disable Testing Mode (Hide Test Users)'
                : 'Enable Testing Mode (Showcase Test Users)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

