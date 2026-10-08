'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Clock,
  Terminal,
  Cpu,
  FileText,
  Radio,
  BookOpen,
  Globe,
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { QuickCreateDropdown } from './QuickCreateModal';

export interface MentorNavigationProps {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  unreadNotificationsCount?: number;
}

interface NavSection {
  title?: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: string;
    badgeCount?: number;
  }>;
}

export function MentorNavigation({ user, unreadNotificationsCount = 0 }: MentorNavigationProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'COMMAND CENTER',
      items: [
        { name: 'Console Overview', href: '/mentor', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'STUDENTS & COHORTS',
      items: [
        { name: 'Student Directory', href: '/mentor/students', icon: Users },
        { name: 'My Batches', href: '/mentor/batches', icon: Layers },
      ],
    },
    {
      title: 'TEACHING & LABS',
      items: [
        { name: "Today's Conduction", href: '/mentor/today', icon: Clock, badge: 'LIVE' },
        { name: 'Lectures', href: '/mentor/lectures', icon: Calendar },
        { name: 'Attendance Center', href: '/mentor/attendance', icon: ShieldCheck },
        { name: 'Cybersecurity Labs', href: '/mentor/labs', icon: Terminal, badge: 'CYBER' },
        { name: 'Assessments', href: '/mentor/assessments', icon: Cpu },
        { name: 'Assignments Hub', href: '/mentor/assignments', icon: FileText },
      ],
    },
    {
      title: 'CONTENT & DISPATCH',
      items: [
        { name: 'Study Materials', href: '/mentor/materials', icon: BookOpen },
        { name: 'Batch Broadcasts', href: '/mentor/announcements', icon: Radio },
        { name: 'Blog Studio', href: '/mentor/blogs', icon: Globe },
      ],
    },
    {
      title: 'CALENDAR & ALERTS',
      items: [
        { name: 'Academic Calendar', href: '/mentor/calendar', icon: Calendar },
        { name: 'Notifications', href: '/mentor/notifications', icon: Bell, badgeCount: unreadNotificationsCount },
      ],
    },
  ];

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* ── MOBILE TOP BAR (< md) ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#050706] border-b border-white/[0.08] text-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5 text-[#C6FF34]" />
          </button>
          <Link href="/mentor" className="flex items-center gap-2">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="TSE Logo"
              width={28}
              height={28}
              unoptimized
              className="h-7 w-auto"
            />
            <span className="text-xs font-mono font-bold tracking-wider text-white">
              COMMAND CENTER
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/mentor/today">
            <span className="px-2.5 py-1 rounded-full bg-[#C6FF34] text-black text-[10px] font-bold font-mono shadow-sm">
              LIVE TODAY
            </span>
          </Link>
        </div>
      </div>

      {/* ── MOBILE DRAWER OVERLAY (< md) ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#050706] border-r border-white/[0.08] p-5 flex flex-col justify-between z-10 text-white shadow-2xl h-full overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logos/TSE Logo Nav.svg"
                    alt="TSE Logo"
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-auto"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">THREAD SECURITY</span>
                    <span className="text-[9px] font-mono text-[#C6FF34] block">COMMAND CENTER</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Create Button */}
              <QuickCreateDropdown />

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
                <span className="text-[9px] text-[#C6FF34] font-bold uppercase tracking-widest block">
                  AUTHORIZED FACULTY
                </span>
                <p className="font-bold text-white truncate pt-0.5">{user.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
              </div>

              {/* Grouped Nav */}
              <div className="space-y-4">
                {navSections.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    {sec.title && (
                      <span className="px-2 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                        {sec.title}
                      </span>
                    )}
                    <nav className="space-y-1">
                      {sec.items.map((item) => {
                        const active = isCurrentActive(item.href, item.exact);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                              active
                                ? 'bg-[#C6FF34] text-black font-bold shadow-md'
                                : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-[#C6FF34]'}`} />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  active ? 'bg-black text-[#C6FF34]' : 'bg-white/[0.1] text-zinc-300'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <Link href="/login" className="block">
                <button className="w-full py-2 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center gap-2 text-xs font-mono hover:bg-white/[0.04] transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── DESCENT PERSISTENT DESKTOP SIDEBAR (>= md) ── */}
      <aside className="w-64 bg-[#050706] border-r border-white/[0.08] text-white hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
        <div className="p-4 space-y-4 overflow-y-auto scrollbar-none flex-1">
          {/* Brand Header */}
          <Link href="/mentor" className="flex items-center gap-3 group px-1" title="TSE Mentor Command Center">
            <div className="relative shrink-0">
              <Image
                src="/logos/TSE Logo Nav.svg"
                alt="Thread Security Education Logo"
                width={34}
                height={34}
                unoptimized
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C6FF34] ring-2 ring-[#050706]" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold tracking-wider text-white uppercase whitespace-nowrap">
                THREAD SECURITY
              </span>
              <span className="font-mono text-[9px] text-[#C6FF34] tracking-widest uppercase font-semibold">
                COMMAND CENTER
              </span>
            </div>
          </Link>

          {/* Quick Create Global Button */}
          <QuickCreateDropdown />

          {/* Mentor Profile Overview Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#C6FF34] font-bold flex items-center gap-1 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
                FACULTY LEAD
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold">
                AUTHORIZED
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate pt-0.5">{user.name}</p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">{user.email}</p>
          </div>

          {/* Grouped Navigation */}
          <div className="space-y-4 pt-1">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {sec.title && (
                  <span className="px-2.5 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                    {sec.title}
                  </span>
                )}
                <nav className="space-y-1 text-xs font-mono">
                  {sec.items.map((item) => {
                    const active = isCurrentActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all relative group ${
                          active
                            ? 'bg-white/[0.08] text-white font-bold border border-white/[0.12] shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                              active ? 'text-[#C6FF34]' : 'text-zinc-500 group-hover:text-zinc-300'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && !active && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/[0.05] text-zinc-400 border border-white/[0.05]">
                            {item.badge}
                          </span>
                        )}

                        {item.badgeCount ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-bold">
                            {item.badgeCount}
                          </span>
                        ) : null}

                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#C6FF34] shadow-[0_0_8px_#C6FF34]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-black/60 shrink-0 space-y-2">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Operating Mode:</span>
            <span className="text-[#C6FF34] font-bold">TEACH • TRACK • EVALUATE</span>
          </div>

          <Link href="/login" className="block">
            <button className="w-full py-2 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
