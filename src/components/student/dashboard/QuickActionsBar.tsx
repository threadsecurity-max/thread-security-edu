'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Terminal,
  Cpu,
  FileText,
  Calendar,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export function QuickActionsBar() {
  const actions = [
    { label: 'My Courses', href: '/student/courses', icon: BookOpen, accent: 'text-[#C6FF34]' },
    { label: 'Practical Labs', href: '/student/labs', icon: Terminal, accent: 'text-amber-400' },
    { label: 'Assessments', href: '/student/assessments', icon: Cpu, accent: 'text-emerald-400' },
    { label: 'Assignments', href: '/student/assignments', icon: FileText, accent: 'text-blue-400' },
    { label: 'Attendance & Batch', href: '/student/attendance', icon: Calendar, accent: 'text-purple-400' },
    { label: 'Certificates', href: '/student/certificates', icon: Award, accent: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
          QUICK COMMAND ACCESS
        </span>
        <span className="text-[10px] font-mono text-zinc-500">Instant Navigation</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.label} href={act.href} className="group block">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.18] hover:bg-white/[0.06] transition-all flex flex-col justify-between h-24 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${act.accent}`} />
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-[#C6FF34] transition-colors truncate">
                  {act.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
