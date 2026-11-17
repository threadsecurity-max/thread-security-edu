'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error, 'Error Digest:', error?.digest);

    // If caused by stale deploy / chunk load error / UnrecognizedActionError:
    const isStaleBuild =
      error?.name === 'UnrecognizedActionError' ||
      error?.message?.includes('Server Action') ||
      error?.message?.includes('Loading chunk') ||
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('MIME type');

    if (isStaleBuild && typeof window !== 'undefined') {
      const reloadKey = 'ts_stale_reload_' + (error.digest || 'general');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-sm">
        <RotateCcw className="w-8 h-8 animate-pulse" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-slate-900">
        System Update Synchronizing
      </h1>
      <p className="text-slate-600 mb-4 max-w-md text-sm leading-relaxed">
        A new production build was deployed. Your browser was loading cached application chunks that need a quick refresh to connect with the updated server.
      </p>

      {error?.digest && (
        <p className="text-xs font-mono text-slate-500 mb-6 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Error Reference: <span className="font-semibold text-slate-800">{error.digest}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={handleHardRefresh}
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Page</span>
        </Button>
        <Button
          onClick={() => reset()}
          variant="outline"
          className="inline-flex items-center gap-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
}
