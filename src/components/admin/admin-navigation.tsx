'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            <img
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education Logo"
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
        <div className="space-y-1 pb-3 border-b border-red-500/15 text-xs font-mono">
          <Link
            href="/workshops"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Workshops</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Globe className="w-4 h-4 text-slate-400" />
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
                    ? 'bg-gradient-to-r from-red-600/30 to-rose-600/10 border border-red-500/40 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0 ml-1" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="pt-4 border-t border-red-500/20 flex items-center justify-between bg-red-950/20 backdrop-blur-md p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
            {user.name ? user.name[0] : 'A'}
          </div>
          <div className="truncate font-mono">
            <span className="text-xs font-bold text-white block truncate">
              {user.name || 'Admin'}
            </span>
            <span className="text-[10px] text-red-400 block font-semibold truncate">
              {user.role}
            </span>
          </div>
        </div>
        <Link
          href="/login"
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-red-400" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet Header Bar (< md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d0306]/95 border-b border-red-500/20 text-white sticky top-0 z-40 safe-top">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open admin navigation menu"
            className="touch-target p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <Menu className="w-5 h-5 text-red-400" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/logos/TSE Logo Nav.svg" alt="TSE" className="h-7 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 font-bold">
            {user.role}
          </span>
        </div>
      </div>

      {/* Desktop Sticky Sidebar (>= md) */}
      <aside className="w-64 bg-[#0d0306]/85 backdrop-blur-2xl border-r border-red-500/20 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 shadow-[5px_0_30px_rgba(220,38,38,0.05)] p-6">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 h-dvh w-[min(85vw,320px)] bg-[#0d0306] border-r border-red-500/30 text-white z-50 shadow-2xl p-5 md:hidden safe-top safe-bottom safe-left"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
