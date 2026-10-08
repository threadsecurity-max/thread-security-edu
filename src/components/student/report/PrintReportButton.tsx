'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black text-xs font-bold font-mono shadow-[0_4px_16px_rgba(198,255,52,0.18)] transition-all cursor-pointer shrink-0"
    >
      <Printer className="w-4 h-4 text-black" />
      <span>Print Official Dossier</span>
    </button>
  );
}
