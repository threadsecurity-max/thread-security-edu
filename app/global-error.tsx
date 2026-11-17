'use client';

import React, { useEffect } from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Root uncaught error:', error);
  }, [error]);

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-sm">
          <RotateCcw className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-slate-900">
          Application Synchronizing
        </h1>
        <p className="text-slate-600 mb-6 max-w-md text-xs sm:text-sm leading-relaxed">
          An unexpected runtime state was encountered. Click Refresh Page to reload the latest version of Thread Security Education.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleHardRefresh}
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-md text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
          </Button>
          <Button
            onClick={() => reset()}
            variant="outline"
            className="inline-flex items-center gap-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-xs"
          >
            <span>Try Again</span>
          </Button>
        </div>
      </body>
    </html>
  );
}

