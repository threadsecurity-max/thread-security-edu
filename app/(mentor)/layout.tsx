import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession, hasMentorClearance } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Globe,
  Bell,
  ShieldCheck,
} from 'lucide-react';

import { Metadata } from 'next';
import { MentorNavigation } from '@/components/mentor/mentor-navigation';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';
import { MentorVerifyClient } from './mentor/verify/mentor-verify-client';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Strict anti-IDOR role validation: only allow MENTOR, SUPER_ADMIN & ACADEMIC_ADMIN
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Enforce Mentor Faculty Secret Key & Passkey Challenge
  const hasClearance = await hasMentorClearance();
  if (session.role === 'MENTOR' && !hasClearance) {
    return (
      <MentorVerifyClient
        mentorEmail={session.email}
        mentorName={session.name || 'Faculty Mentor'}
      />
    );
  }

  // Get unread notifications count safely
  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({
      where: {
        userId: session.userId,
        isRead: false,
      },
    });
  } catch (err) {
    console.warn('Could not fetch unread notifications count:', err);
  }

  const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white font-sans selection:bg-[#C6FF34] selection:text-black">
      {/* Mentor Navigation (Responsive Sidebar & Mobile Drawer) */}
      <MentorNavigation
        user={{
          userId: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
        }}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-black/95 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              MENTOR COMMAND CONSOLE
            </Badge>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
              TEACH • TRACK • COMMUNICATE • REVIEW • REPORT
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/mentor/notifications" className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors" title="Notifications">
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
              )}
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-bold font-mono border border-white shadow-sm transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-black" />
              <span>Landing Page</span>
            </Link>

            <Link
              href="/student"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-white/20 hover:border-[#C6FF34] text-white hover:text-[#C6FF34] bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              Student View
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-mono border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/10 transition-all cursor-pointer"
              >
                Admin Center
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          <BroadcastNotificationBanner userId={session.userId} />
          {children}
        </main>
      </div>
    </div>
  );
}

