'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CaptureAttendanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CaptureEmployeeAttendance] Render error:', error);
  }, [error]);

  const handleRefreshToday = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/employee-attendance/capture';
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600 shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Attendance Capture Synchronization
      </h2>
      <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
        The daily roster or date parameter was resolving with an unexpected format. Click below to load today&apos;s active 24-hour attendance register.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={handleRefreshToday}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Open Today&apos;s Attendance</span>
        </Button>

        <Button
          onClick={() => reset()}
          variant="outline"
          className="inline-flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Page</span>
        </Button>

        <Link href="/admin/employee-attendance">
          <Button
            variant="ghost"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Attendance Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

