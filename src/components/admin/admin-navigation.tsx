'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Terminal,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Award,
  LogOut,
  Globe,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Calendar,
  CheckSquare,
  MessageSquare,
  Bell,
  Activity,
  FileSpreadsheet,
  Settings,
  UserCheck,
  Sliders,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdminNavigationProps {
  user: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

interface NavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
    exact?: boolean;
    badge?: string;
  }[];
}

export function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileDrawerOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileDrawerOpen]);

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Command Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Announcements', href: '/admin/announcements', icon: Bell },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { name: 'Faculty & Mentors', href: '/admin/mentors', icon: ShieldCheck },
        { name: 'Student Directory', href: '/admin/students', icon: Users },
        { name: 'Access & Invitations', href: '/admin/access', icon: UserCheck },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { name: 'Workshops Conduction', href: '/admin/workshops', icon: Sparkles, badge: 'LIVE' },
        { name: 'Batches & Cohorts', href: '/admin/batches', icon: Layers },
        { name: 'Courses Catalogue', href: '/admin/courses', icon: BookOpen },
        { name: 'Assessments & Tests', href: '/admin/assessments', icon: Award },
        { name: 'Timetable & Schedule', href: '/admin/timetable', icon: Calendar },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Tasks (CSM & SEO)', href: '/admin/tasks', icon: CheckSquare, badge: 'OPS' },
        { name: 'Faculty Messages', href: '/admin/messages', icon: MessageSquare },
        { name: 'Lead Pipeline & AI', href: '/admin/leads', icon: Sliders },
        { name: 'Google Search Console', href: '/admin/seo-console', icon: Globe },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { name: 'Activity & Audit Logs', href: '/admin/audit', icon: ShieldAlert },
        { name: 'Server Health & Metrics', href: '/admin/server-health', icon: Activity },
        { name: 'SOC Operations', href: '/admin/security-analyst', icon: Terminal },
        { name: 'Database Sync', href: '/admin/db-sync', icon: Cpu },
      ],
    },
  ];

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Brand Logo & Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3 group" title="Thread Security Admin Center">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education Logo"
              width={34}
              height={34}
              unoptimized
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-black tracking-wider text-white">THREAD SECURITY</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                COMMAND CENTER
              </span>
            </div>
          </Link>
          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close navigation drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Portal Switcher */}
        <div className="grid grid-cols-2 gap-1.5 pb-2 text-[11px] font-mono">
          <Link
            href="/workshops"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700/50 transition-all font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Public Portal</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all font-semibold"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Landing Page</span>
          </Link>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-4 text-xs font-mono overflow-y-auto max-h-[calc(100dvh-270px)] pr-1 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrentActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                        active
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850 hover:border-slate-800 border border-transparent font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold ${
                            item.badge === 'LIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Panel */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/50">
            {user.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate font-mono">
            <span className="text-xs font-bold text-slate-200 block truncate">
              {user.name || 'Admin'}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold truncate">
              {user.role}
            </span>
          </div>
        </div>
        <Link
          href="/login"
          className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B0F19]/95 border-b border-slate-800 text-slate-100 sticky top-0 z-40 safe-top shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open admin navigation menu"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors touch-target"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education"
              width={26}
              height={26}
              unoptimized
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-mono font-bold tracking-tight text-white">COMMAND CENTER</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
            {user.role}
          </span>
        </div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 bg-[#090D16]/95 backdrop-blur-2xl border-r border-slate-850 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 shadow-[4px_0_30px_rgba(0,0,0,0.6)] p-5">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 h-dvh w-[min(85vw,320px)] bg-[#090D16] border-r border-slate-800 text-slate-200 z-50 shadow-2xl p-5 md:hidden safe-top safe-bottom safe-left"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
