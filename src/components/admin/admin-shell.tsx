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
  Sliders,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  UsersRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdminShellProps {
  user: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  mentorsCount?: number;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
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

export function AdminShell({ user, mentorsCount, headerActions, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('ts_admin_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ts_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Announcements', href: '/admin/announcements', icon: Bell },
      ],
    },
    {
      title: 'People',
      items: [
        { name: 'Users Directory', href: '/admin/users', icon: UsersRound },
        {
          name: 'Faculty & Mentors',
          href: '/admin/mentors',
          icon: ShieldCheck,
          badge: mentorsCount !== undefined && mentorsCount > 0 ? String(mentorsCount) : undefined,
        },
        { name: 'Student Directory', href: '/admin/students', icon: Users },
        { name: 'Access & Invites', href: '/admin/access', icon: UserCheck },
      ],
    },
    {
      title: 'Academics',
      items: [
        { name: 'Batches & Cohorts', href: '/admin/batches', icon: Layers },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Timetable & Schedule', href: '/admin/timetable', icon: Calendar },
        { name: 'Workshops', href: '/admin/workshops', icon: Sparkles },
        { name: 'Assessments', href: '/admin/assessments', icon: Award },
      ],
    },
    {
      title: 'Operations',
      items: [
        { name: 'Tasks (CSM & SEO)', href: '/admin/tasks', icon: CheckSquare },
        { name: 'Faculty Messages', href: '/admin/messages', icon: MessageSquare },
        { name: 'Lead Pipeline', href: '/admin/leads', icon: Sliders },
        { name: 'Search Console', href: '/admin/seo-console', icon: Globe },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
        { name: 'Server Health', href: '/admin/server-health', icon: Activity },
        { name: 'SOC Analyst', href: '/admin/security-analyst', icon: Terminal },
        { name: 'Database Sync', href: '/admin/db-sync', icon: Cpu },
      ],
    },
  ];

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  const renderNavLinks = (compact: boolean) => (
    <nav className="space-y-4 text-xs overflow-y-auto max-h-[calc(100vh-170px)] pr-1 custom-scrollbar">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          {!compact && (
            <div className="px-3 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              {group.title}
            </div>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={compact ? item.name : undefined}
                  className={`flex items-center ${compact ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'} rounded-xl transition-all ${
                    active
                      ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300 font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center gap-2.5 truncate ${compact ? 'justify-center' : ''}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-400' : 'text-neutral-400'}`} />
                    {!compact && <span className="truncate">{item.name}</span>}
                  </div>
                  {!compact && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/25 text-violet-300 border border-violet-500/30">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800 text-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open admin navigation menu"
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
          >
            <Menu className="w-5 h-5 text-violet-400" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education"
              width={24}
              height={24}
              unoptimized
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-bold tracking-tight text-white">Thread Security</span>
          </Link>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
          Admin
        </span>
      </div>

      {/* ── FIXED DESKTOP BLACK SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-screen z-40 bg-black text-white border-r border-neutral-900 hidden md:flex flex-col justify-between transition-all duration-300 p-4 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="space-y-4">
          {/* Logo & Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <Image
                src="/logos/TSE Logo Nav.svg"
                alt="Logo"
                width={28}
                height={28}
                unoptimized
                className="h-7 w-auto object-contain shrink-0"
              />
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold tracking-wider text-white">THREAD SECURITY</span>
                  <span className="text-[10px] text-violet-400 font-medium">Admin Portal</span>
                </div>
              )}
            </Link>

            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-violet-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-neutral-400 hover:text-white" />
              )}
            </button>
          </div>

          {/* Nav Items */}
          {renderNavLinks(isCollapsed)}
        </div>

        {/* User Footer */}
        <div className={`pt-3 border-t border-neutral-900 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-900`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">
                  {user.name || 'Admin'}
                </span>
                <span className="text-[10px] text-violet-400 block truncate">
                  {user.email || user.role}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Link
              href="/login"
              className="text-neutral-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 h-screen w-72 bg-black border-r border-neutral-800 text-white z-50 p-5 md:hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/logos/TSE Logo Nav.svg"
                      alt="Logo"
                      width={28}
                      height={28}
                      unoptimized
                      className="h-7 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-wider text-white">THREAD SECURITY</span>
                      <span className="text-[10px] text-violet-400 font-medium">Admin Portal</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderNavLinks(false)}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-xs font-semibold text-white block truncate">{user.name || 'Admin'}</span>
                  <span className="text-[10px] text-violet-400 block truncate">{user.role}</span>
                </div>
                <Link href="/login" className="text-neutral-400 hover:text-rose-400 p-1.5">
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA (Offsets the fixed sidebar) ── */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'} flex flex-col min-h-screen`}>
        {/* White / Violet Clean Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {headerActions}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
