'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Cpu,
  Award,
  Calendar,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentMobileNavProps {
  tsId: string;
  studentName: string;
}

export function StudentMobileNav({ tsId, studentName }: StudentMobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomNavItems = [
    { label: 'Home', href: '/student', icon: LayoutDashboard },
    { label: 'Learn', href: '/student/courses', icon: BookOpen },
    { label: 'Labs', href: '/student/labs', icon: Terminal },
    { label: 'Quiz', href: '/student/assessments', icon: Cpu },
    { label: 'Certificates', href: '/student/certificates', icon: Award },
  ];

  return (
    <>
      {/* Mobile Drawer Trigger Header button (visible < md) */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Open student menu"
        className="md:hidden touch-target p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Drawer Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[min(82vw,300px)] bg-[#04111C] text-white z-50 shadow-2xl flex flex-col justify-between p-5 md:hidden safe-top safe-bottom safe-left"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Link href="/" onClick={() => setDrawerOpen(false)}>
                    <img
                      src="/logos/TSE Logo Nav.svg"
                      alt="TSE"
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                    className="touch-target p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* TS-ID Pill */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    AUTHENTICATED TS-ID
                  </span>
                  <span className="text-security-green font-bold text-sm block">{tsId}</span>
                </div>

                {/* Full Nav in Drawer */}
                <nav className="space-y-1 text-sm font-medium text-slate-300">
                  <Link
                    href="/student"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname === '/student'
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4 text-security-green" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/student/courses"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/courses')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Courses Going On</span>
                  </Link>

                  <Link
                    href="/workshops"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-security-green" />
                    <span>Workspace</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>Landing Page</span>
                  </Link>

                  <Link
                    href="/student/labs"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/labs')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span>Practical Labs</span>
                  </Link>

                  <Link
                    href="/student/assessments"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/assessments')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Cpu className="w-4 h-4 text-slate-400" />
                    <span>Assessments</span>
                  </Link>

                  <Link
                    href="/student/certificates"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/certificates')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Certificates</span>
                  </Link>

                  <Link
                    href="/student/attendance"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/attendance')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Calendar className="w-4 h-4 text-security-green" />
                    <span>Batch & Attendance</span>
                  </Link>

                  <Link
                    href="/student/report"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      pathname.startsWith('/student/report')
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Academic Report</span>
                  </Link>
                </nav>
              </div>

              {/* User logout */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">{studentName}</span>
                  <span className="text-[10px] text-security-green font-mono block">Verified Student</span>
                </div>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Persistent Mobile Bottom Navigation (< md) */}
      <nav
        aria-label="Student mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-border/80 safe-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 h-14 items-center px-1 max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/student'
                ? pathname === '/student'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'touch-target flex flex-col items-center justify-center gap-1 rounded-lg transition-colors py-1 text-center',
                  isActive ? 'text-black font-extrabold' : 'text-neutral-500 hover:text-black'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive && 'text-black stroke-[2.5]')} />
                  {isActive && (
                    <motion.div
                      layoutId="student-tab-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"
                    />
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-none truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default StudentMobileNav;
