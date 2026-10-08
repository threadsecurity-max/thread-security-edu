'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Globe, Sparkles, ShieldCheck } from 'lucide-react';
import { NotificationDropdown } from '../dashboard/NotificationDropdown';
import { GlobalSearchModal } from '../dashboard/GlobalSearchModal';
import { StudentMobileNav } from '@/components/navigation/StudentMobileNav';

export interface StudentTopbarProps {
  student: {
    userId: string;
    name: string;
    tsId: string;
  };
}

export function StudentTopbar({ student }: StudentTopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#050706]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile Nav & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <StudentMobileNav tsId={student.tsId} studentName={student.name} />

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">PORTAL</span>
            <span className="text-zinc-600">/</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] shadow-[0_0_8px_#C6FF34]" />
              COMMAND CENTER
            </span>
          </div>

          <span className="sm:hidden text-xs font-mono font-bold text-white">
            STUDENT LMS
          </span>
        </div>

        {/* Center/Right: Search Bar & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Interactive Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search curriculum"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-[#C6FF34]" />
            <span className="hidden md:inline">Search courses, exams, resources...</span>
            <span className="md:hidden">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-zinc-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Quick Shortcuts */}
          <Link
            href="/workshops"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C6FF34]/10 hover:bg-[#C6FF34]/20 text-[#C6FF34] text-xs font-mono font-bold border border-[#C6FF34]/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#C6FF34]" />
            <span>Workshops</span>
          </Link>

          <Link
            href="/"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono border border-white/[0.08] transition-all cursor-pointer"
          >
            <Globe className="w-3 h-3 text-zinc-400" />
            <span>Public Site</span>
          </Link>

          {/* Live Notification Dropdown */}
          <NotificationDropdown userId={student.userId} />

          {/* Student Identity Pill */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/[0.08]">
            <span className="hidden sm:inline-block text-xs font-bold text-white max-w-[120px] truncate">
              {student.name}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-[#C6FF34] font-bold">
              {student.tsId.slice(-6)}
            </span>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
