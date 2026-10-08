'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Cpu,
  FileText,
  Award,
  Calendar,
  Sparkles,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StudentSidebarProps {
  student: {
    name: string;
    email: string;
    tsId: string;
    avatarUrl?: string | null;
  };
}

export function StudentSidebar({ student }: StudentSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard, exact: true },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Practical Labs', href: '/student/labs', icon: Terminal },
    { label: 'Assessments', href: '/student/assessments', icon: Cpu },
    { label: 'Assignments', href: '/student/assignments', icon: FileText },
    { label: 'Certificates', href: '/student/certificates', icon: Award },
    { label: 'Batch & Attendance', href: '/student/attendance', icon: Calendar },
    { label: 'Academic Report', href: '/student/report', icon: FileText },
  ];

  const initial = student.name ? student.name[0].toUpperCase() : 'S';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen transition-all duration-300 z-40 bg-[#050706]/90 backdrop-blur-2xl border-r border-white/[0.08]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 space-y-6">
        {/* Brand & Collapse Toggle */}
        <div className="flex items-center justify-between gap-2 px-2 pt-2">
          <Link href="/student" className="flex items-center gap-3 overflow-hidden group">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Logo"
              width={34}
              height={34}
              unoptimized
              className="h-8 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {!collapsed && (
              <span className="font-mono text-xs font-bold tracking-tight text-white uppercase whitespace-nowrap">
                THREAD SECURITY
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Authenticated TS-ID Badge */}
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
              AUTHENTICATED TS-ID
            </span>
            <span className="text-[#C6FF34] font-bold text-xs flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              {student.tsId}
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title={`TS-ID: ${student.tsId}`}>
            <span className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#C6FF34]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
        )}

        {/* Core Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative group',
                  isActive
                    ? 'bg-white/[0.08] text-white font-bold border border-white/[0.12] shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-[#C6FF34]' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#C6FF34]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* External Platform Shortcuts */}
        {!collapsed && (
          <div className="pt-3 border-t border-white/[0.06] space-y-1 text-xs font-mono">
            <Link
              href="/workshops"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-[#C6FF34] hover:bg-white/[0.03] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6FF34]" />
              <span>Cyber Workshops</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Public Site</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white font-mono font-bold flex items-center justify-center text-xs shrink-0">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              initial
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 truncate">
              <span className="text-xs font-bold text-white block truncate">{student.name}</span>
              <span className="text-[10px] text-[#C6FF34] font-mono block">Verified Student</span>
            </div>
          )}
        </div>

        <Link
          href="/login"
          aria-label="Logout"
          className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/[0.05] transition-colors shrink-0"
          title="Sign out of student session"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
