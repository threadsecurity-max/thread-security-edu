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
  Activity,
  Layers,
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

interface NavSection {
  title?: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: string;
  }>;
}

export function StudentSidebar({ student }: StudentSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'CORE ACADEMICS',
      items: [
        { label: 'Dashboard', href: '/student', icon: LayoutDashboard, exact: true },
        { label: 'My Courses', href: '/student/courses', icon: BookOpen },
        { label: 'Practical Labs', href: '/student/labs', icon: Terminal, badge: 'SANDBOX' },
        { label: 'Assessments', href: '/student/assessments', icon: Cpu },
        { label: 'Assignments', href: '/student/assignments', icon: FileText },
      ],
    },
    {
      title: 'FACULTY & COHORT',
      items: [
        { label: 'Batch & Attendance', href: '/student/attendance', icon: Calendar, badge: 'LIVE' },
        { label: 'Study Materials', href: '/student/materials', icon: BookOpen, badge: 'DOCS' },
      ],
    },
  ];

  const initial = student.name ? student.name[0].toUpperCase() : 'S';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen transition-all duration-300 z-40 bg-[#050706]/95 backdrop-blur-2xl border-r border-white/[0.08] select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-none flex-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <Link href="/student" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="relative shrink-0">
              <Image
                src="/logos/TSE Logo Nav.svg"
                alt="Thread Security Logo"
                width={32}
                height={32}
                unoptimized
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C6FF34] ring-2 ring-[#050706]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold tracking-wider text-white uppercase whitespace-nowrap">
                  THREAD SECURITY
                </span>
                <span className="font-mono text-[9px] text-[#C6FF34] tracking-widest uppercase">
                  EDUCATION TERMINAL
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Authenticated TS-ID Badge Card */}
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] space-y-1 font-mono text-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C6FF34]/[0.03] rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] animate-pulse" />
                VERIFIED ID
              </span>
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <div className="text-white font-bold text-xs flex items-center gap-1.5 truncate pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
              <span className="text-zinc-200 tracking-tight font-mono">{student.tsId}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Verified TS-ID: ${student.tsId}`}>
            <span className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#C6FF34] hover:bg-white/[0.06] transition-colors cursor-pointer">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
        )}

        {/* Grouped Navigation */}
        <div className="space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && section.title && (
                <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  {section.title}
                </div>
              )}
              {collapsed && idx > 0 && <div className="h-px bg-white/[0.06] my-2 mx-2" />}

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative group',
                        isActive
                          ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                          isActive ? 'text-[#C6FF34]' : 'text-zinc-400 group-hover:text-zinc-200'
                        )}
                      />

                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && !isActive && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.05]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active indicator dot & left accent bar */}
                      {isActive && (
                        <>
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#C6FF34] shadow-[0_0_8px_#C6FF34]" />
                          {!collapsed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] shrink-0 shadow-[0_0_6px_#C6FF34]" />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

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
              <span>Public Portal</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-black/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0">
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
              <span className="text-[10px] text-[#C6FF34] font-mono block">Enrolled Student</span>
            </div>
          )}
        </div>

        <Link
          href="/login"
          aria-label="Logout"
          className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/[0.05] transition-colors shrink-0"
          title="Sign out of student session"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
