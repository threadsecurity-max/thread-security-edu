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

export function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on path change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll and handle Escape key
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

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Assessments & Tests', href: '/admin/assessments', icon: Award },
    { name: 'Courses Going On', href: '/admin/courses', icon: BookOpen },
    { name: 'Student Directory', href: '/admin/students', icon: Users },
    { name: 'Batch Conduction', href: '/admin/batches', icon: Layers },
    { name: 'Faculty Roster', href: '/admin/mentors', icon: ShieldCheck },
    { name: 'Database Sync', href: '/admin/db-sync', icon: Cpu },
    { name: 'Google Search Console', href: '/admin/seo-console', icon: Globe },
    { name: 'Lead Pipeline & AI', href: '/admin/leads', icon: Sparkles },
    { name: 'SOC Operations', href: '/admin/security-analyst', icon: Terminal },
    { name: 'Security Audit', href: '/admin/audit', icon: ShieldAlert },
  ];

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group" title="Return to Admin Dashboard">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education Logo"
              width={36}
              height={36}
              unoptimized
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close navigation drawer"
              className="touch-target p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Shortcuts */}
        <div className="space-y-1 pb-3 border-b border-red-200/80 text-xs font-mono">
          <Link
            href="/workshops"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-red-700 hover:bg-red-50 transition-all font-semibold"
          >
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>Workshops</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-red-700 hover:bg-red-50 transition-all font-semibold"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Landing Page</span>
          </Link>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="space-y-1 text-xs font-mono overflow-y-auto max-h-[calc(100dvh-280px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 border border-red-500 text-white font-bold shadow-[0_4px_16px_rgba(220,38,38,0.25)]'
                    : 'text-slate-800 hover:text-red-700 hover:bg-red-50 hover:border-red-200/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-red-600'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="pt-4 border-t border-red-200/80 flex items-center justify-between bg-red-50/70 backdrop-blur-md p-3 rounded-2xl border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_2px_8px_rgba(220,38,38,0.3)] border border-white">
            {user.name ? user.name[0] : 'A'}
          </div>
          <div className="truncate font-mono">
            <span className="text-xs font-bold text-slate-950 block truncate">
              {user.name || 'Admin'}
            </span>
            <span className="text-[10px] text-red-700 block font-semibold truncate">
              {user.role}
            </span>
          </div>
        </div>
        <Link
          href="/login"
          className="text-slate-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100/70 transition-colors touch-target"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-red-600" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet Header Bar (< md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 border-b border-red-200/80 text-slate-950 sticky top-0 z-40 safe-top shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open admin navigation menu"
            className="touch-target p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-red-600" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education"
              width={28}
              height={28}
              unoptimized
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 font-bold">
            {user.role}
          </span>
        </div>
      </div>

      {/* Desktop Sticky Sidebar (>= md) */}
      <aside className="w-64 bg-white/95 backdrop-blur-2xl border-r border-red-200/80 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(239,68,68,0.03)] p-6">
        {navContent}
      </aside>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 h-dvh w-[min(85vw,320px)] bg-white border-r border-red-200 text-slate-900 z-50 shadow-2xl p-5 md:hidden safe-top safe-bottom safe-left"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
