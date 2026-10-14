'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error, 'Error Digest:', error?.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4 text-center">
      <h1 className="text-4xl font-bold font-mono mb-4 text-red-600">Something went wrong</h1>
      <p className="text-gray-600 mb-2 max-w-md">
        An unexpected error occurred while rendering this page.
      </p>
      {error?.digest && (
        <p className="text-xs font-mono text-slate-500 mb-6 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Error Reference ID: <span className="font-semibold text-slate-800">{error.digest}</span>
        </p>
      )}
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-black text-white font-bold hover:bg-gray-800">
          Try Again
        </Button>
      </div>
    </div>
  );
}
