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
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#09090d] text-slate-900 font-sans selection:bg-violet-600 selection:text-white">
      {/* Mentor Navigation (Persistent Black Sidebar as in Admin) */}
      <MentorNavigation
        user={{
          userId: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
        }}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Workspace (Light Theme: White & Violet) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FD] md:h-screen md:overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">Faculty Workspace</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs text-violet-700 font-semibold hidden sm:inline">Instructor Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/mentor/notifications" className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors" title="Notifications">
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_8px_#8b5cf6] animate-pulse" />
              )}
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold font-mono border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>Landing Page</span>
            </Link>

            <Link
              href="/student"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-all cursor-pointer shadow-xs"
            >
              Student View
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-mono border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
              >
                Admin Center
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 sidebar-scroll bg-[#F8F9FD]">
          <BroadcastNotificationBanner userId={session.userId} />
          {children}
        </main>
      </div>
    </div>
  );
}

