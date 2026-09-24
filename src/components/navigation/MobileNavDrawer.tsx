'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  BookOpen,
  Layers,
  Phone,
  Code2,
  Briefcase,
  Share2,
  Newspaper,
  UserCheck,
  LayoutDashboard,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavDrawerProps {
  session?: any;
}

export function MobileNavDrawer({ session }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <div className="flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        className="touch-target p-2 rounded-xl text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Mobile Sheet / Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 h-dvh w-[min(100vw-2rem,360px)] bg-white z-50 shadow-2xl flex flex-col safe-top safe-bottom safe-right safe-left border-l border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img
                    src="/logos/TSE Logo Dark.svg"
                    alt="TSE"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="font-black text-sm tracking-tight text-black">
                    THREAD SECURITY
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="touch-target p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Core Navigation
                </div>

                <Link
                  href="/#curriculum-roadmap"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                >
                  <Layers className="w-5 h-5 text-black" />
                  <span>Roadmap & Batches</span>
                </Link>

                <Link
                  href="/#featured-courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-black" />
                  <span>Featured Courses</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-black" />
                  <span>Contact Us</span>
                </Link>

                <div className="pt-4 pb-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Explore & Career
                  </div>

                  <Link
                    href="/workshops"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-[#75a600] bg-lime-50/60 border border-lime-200/60 hover:bg-lime-100/60 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#75a600]" />
                    <span>Workshop Gallery</span>
                  </Link>

                  <Link
                    href="/contact?topic=success-stories"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-neutral-700 hover:bg-neutral-100 transition-colors mt-1"
                  >
                    <Code2 className="w-4 h-4 text-black" />
                    <span>Success Stories</span>
                  </Link>

                  {/* <Link
                    href="/placements"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-black" />
                    <span>Placement Highlights</span>
                  </Link> */}

                  <Link
                    href="/contact?topic=hiring"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-black" />
                    <span>Hire From Us</span>
                  </Link>

                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <Newspaper className="w-4 h-4 text-black" />
                    <span>Blogs & Articles</span>
                  </Link>
                </div>
              </div>

              {/* Bottom Actions inside Drawer */}
              <div className="p-4 border-t border-gray-100 bg-neutral-50/50 space-y-2">
                {session ? (
                  session.role !== 'STUDENT' || session.isDashboardAccessGranted ? (
                    <Link
                      href={
                        session.role === 'SECURITY_ADMIN'
                          ? '/admin/security-analyst'
                          : session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN'
                          ? '/admin'
                          : session.role === 'MENTOR'
                          ? '/mentor'
                          : '/student'
                      }
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white font-bold text-sm shadow-md active:scale-[0.99] transition-transform"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#C6FF34]" />
                      <span>Back to Dashboard ({session.role})</span>
                    </Link>
                  ) : (
                    <Link
                      href="/courses"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white font-bold text-sm shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Discover Curriculum</span>
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-300 bg-white text-black font-bold text-sm hover:bg-gray-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black text-white font-bold text-sm shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Request Callback</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNavDrawer;
