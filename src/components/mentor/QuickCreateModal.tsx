'use client';

import React, { useState } from 'react';
import {
  Plus,
  Users,
  Clock,
  Terminal,
  Cpu,
  FileText,
  Radio,
  BookOpen,
  Globe,
  X,
} from 'lucide-react';
import Link from 'next/link';

export function QuickCreateDropdown() {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'New Student', href: '/mentor/students?create=true', icon: Users, desc: 'Onboard student & dispatch credentials' },
    { label: 'Schedule Lecture', href: '/mentor/lectures?create=true', icon: Clock, desc: 'Set live lecture with duration & link' },
    { label: 'Cybersecurity Lab', href: '/mentor/labs?create=true', icon: Terminal, desc: 'Deploy target sandbox & CTF flag' },
    { label: 'New Assignment', href: '/mentor/assignments?create=true', icon: FileText, desc: 'Publish cohort tasks & set deadline' },
    { label: 'Batch Announcement', href: '/mentor/announcements?create=true', icon: Radio, desc: 'Broadcast alert to entire cohort' },
    { label: 'Study Material', href: '/mentor/materials?create=true', icon: BookOpen, desc: 'Upload notes, slides, or PDF' },
    { label: 'New Research Blog', href: '/mentor/blogs/new', icon: Globe, desc: 'Draft technical cybersecurity post' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-2.5 px-3.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-between shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Create</span>
        </span>
        <span className="text-[10px] bg-black/15 px-1.5 py-0.5 rounded">Action</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-12 z-50 p-2 rounded-2xl bg-[#0a0a0a] border border-white/[0.12] shadow-2xl backdrop-blur-2xl space-y-1 w-64 md:w-72">
            <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
              OPERATIONAL ACTIONS
            </div>
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.label}
                  href={act.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#C6FF34] group-hover:bg-[#C6FF34] group-hover:text-black transition-colors shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-white group-hover:text-[#C6FF34] transition-colors block">
                      {act.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">
                      {act.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
