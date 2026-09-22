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
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4 text-center">
      <h1 className="text-4xl font-bold font-mono mb-4 text-red-600">Something went wrong</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        An unexpected error occurred while rendering this page.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-black text-white font-bold hover:bg-gray-800">
          Try Again
        </Button>
      </div>
    </div>
  );
}
