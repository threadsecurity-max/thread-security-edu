'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
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
  const [collapsed, setCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setIsScrolled(scrollContainerRef.current.scrollTop > 8);
    }
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

          <div className="relative w-4/5 max-w-xs bg-[#050706] border-r border-white/[0.08] flex flex-col justify-between z-10 text-white shadow-2xl h-full overflow-hidden">
            {/* Mobile Pinned Header */}
            <div className="p-4 pb-3 border-b border-white/[0.08] bg-[#050706] space-y-3 shrink-0">
              <div className="flex items-center justify-between">
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

              <QuickCreateDropdown />
            </div>

            {/* Mobile Scrollable Nav */}
            <div className="p-4 overflow-y-auto sidebar-scroll flex-1 space-y-4">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
                <span className="text-[9px] text-[#C6FF34] font-bold uppercase tracking-widest block">
                  AUTHORIZED FACULTY
                </span>
                <p className="font-bold text-white truncate pt-0.5">{user.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
              </div>

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

            {/* Mobile Pinned Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#050706] shrink-0">
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

      {/* ── DESKTOP PERSISTENT COMMAND SIDEBAR (>= md) ── */}
      <aside
        className={`bg-[#050706] border-r border-white/[0.08] text-white hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* ── 1. PINNED TOP HEADER (Never scrolls away) ── */}
        <div
          className={`p-4 pb-3 shrink-0 border-b transition-all duration-200 z-10 ${
            isScrolled
              ? 'border-white/[0.12] bg-[#050706]/95 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
              : 'border-white/[0.06] bg-[#050706]'
          } ${collapsed ? 'px-2.5' : 'px-4'}`}
        >
          {/* Brand Row + Collapse Toggle */}
          <div className="flex items-center justify-between gap-2 pb-3">
            <Link
              href="/mentor"
              className="flex items-center gap-2.5 overflow-hidden group min-w-0"
              title="TSE Mentor Command Center"
            >
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
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold tracking-wider text-white uppercase truncate">
                    THREAD SECURITY
                  </span>
                  <span className="font-mono text-[9px] text-[#C6FF34] tracking-widest uppercase font-semibold">
                    COMMAND CENTER
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-[#C6FF34]" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-zinc-400 hover:text-white" />
              )}
            </button>
          </div>

          {/* Quick Create Action - Pinned At Top */}
          <div className="pt-0.5">
            <QuickCreateDropdown collapsed={collapsed} />
          </div>
        </div>

        {/* ── 2. SCROLLABLE MIDDLE NAVIGATION (Smooth Independent Scroll) ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto sidebar-scroll space-y-4 py-3 relative ${
            collapsed ? 'px-2' : 'px-3'
          }`}
          style={{
            overscrollBehavior: 'contain',
          }}
        >
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && sec.title && (
                <span className="px-2.5 pt-1 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block select-none">
                  {sec.title}
                </span>
              )}
              {collapsed && idx > 0 && <div className="h-px bg-white/[0.06] my-2 mx-2" />}

              <nav className="space-y-1 text-xs font-mono">
                {sec.items.map((item) => {
                  const active = isCurrentActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center ${
                        collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } rounded-xl transition-all relative group ${
                        active
                          ? 'bg-white/[0.08] text-white font-bold border border-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            active ? 'text-[#C6FF34]' : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && item.badge && !active && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/[0.05] text-zinc-400 border border-white/[0.05]">
                          {item.badge}
                        </span>
                      )}

                      {!collapsed && item.badgeCount ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-bold">
                          {item.badgeCount}
                        </span>
                      ) : null}

                      {/* Active indicator bar */}
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

        {/* ── 3. PINNED BOTTOM FOOTER (Never scrolls away) ── */}
        <div
          className={`shrink-0 border-t border-white/[0.08] bg-[#050706] space-y-2.5 ${
            collapsed ? 'p-2' : 'p-3'
          }`}
        >
          {/* Faculty Profile Card */}
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#C6FF34] font-bold flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
                  FACULTY CLEARANCE
                </span>
                <span className="text-[8px] px-1 py-0.2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
            </div>
          ) : (
            <div className="flex justify-center" title={`${user.name} (${user.email})`}>
              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#C6FF34]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Quick Sign Out Action */}
          <Link href="/login" className="block">
            <button
              title={collapsed ? 'Sign Out' : undefined}
              className={`w-full py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-mono flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-center gap-2 px-3'
              } transition-colors cursor-pointer border border-transparent hover:border-white/[0.06]`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
