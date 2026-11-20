'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminPortalError] Uncaught error in admin portal:', error, 'Digest:', error?.digest);

    // Auto-recover if caused by stale deployment chunk / server action mismatch:
    const isStaleBuild =
      error?.name === 'UnrecognizedActionError' ||
      error?.message?.includes('Server Action') ||
      error?.message?.includes('Loading chunk') ||
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('MIME type');

    if (isStaleBuild && typeof window !== 'undefined') {
      const reloadKey = 'ts_admin_stale_reload_' + (error.digest || 'general');
      const hasReloaded = sessionStorage.getItem(reloadKey);
      if (!hasReloaded) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
      }
    }
  }, [error]);

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans bg-white">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
        Admin Portal Synchronization
      </h1>
      <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed mb-4">
        A system update was completed or the requested resource encountered an unexpected state. Refreshing synchronizes your active session with the production cluster.
      </p>

      {error?.digest && (
        <p className="text-xs font-mono text-slate-500 mb-6 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Trace Reference: <span className="font-semibold text-slate-800">{error.digest}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={handleHardRefresh}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Page</span>
        </Button>

        <Button
          onClick={() => reset()}
          variant="outline"
          className="inline-flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>

        <Link href="/admin">
          <Button
            variant="ghost"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
