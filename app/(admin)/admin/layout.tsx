import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { Sparkles, Globe } from 'lucide-react';
import { BroadcastMessageModal } from '@/components/notifications/broadcast-modal';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';
import { AdminNavigation } from '@/components/admin/admin-navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Strict anti-IDOR role validation: allow SUPER_ADMIN, ACADEMIC_ADMIN, and SECURITY_ADMIN
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN' && session.role !== 'SECURITY_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const admin = await prisma.user.findFirst({
    where: { id: session.userId },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFF8F8] text-slate-900 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* ── HIGH-TECH PROMINENT RED LIGHT GRID BACKGROUND ── */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-red-500/8 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-500/8 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.06)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,226,226,0.5),transparent)]" />

      {/* ── RESPONSIVE ADMIN NAVIGATION (Desktop Sidebar & Mobile Drawer) ── */}
      <AdminNavigation
        user={{
          userId: session.userId,
          name: admin?.name || session.name,
          email: admin?.email || session.email,
          role: session.role,
        }}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Liquid Glass Crisp Red Light Topbar */}
        <header className="h-16 bg-white/90 backdrop-blur-2xl border-b border-red-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_24px_rgba(220,38,38,0.03)] safe-top">
          <div className="flex items-center gap-3">
            <h1 className="text-xs sm:text-sm font-extrabold text-slate-950 font-mono tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]" />
              <span className="hidden sm:inline text-slate-900">SUPER ADMIN COMMAND CENTER</span>
              <span className="sm:hidden text-slate-900">ADMIN CONSOLE</span>
            </h1>
          </div>

          {/* Action Buttons in Red Light Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live LMS Broadcasting Trigger */}
            <BroadcastMessageModal />

            <Link href="/workshops">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-mono font-bold text-xs border border-red-200/80 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Workshops</span>
              </button>
            </Link>

            <Link href="/">
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-mono font-bold text-xs border border-slate-200 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Landing Page</span>
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <BroadcastNotificationBanner userId={session.userId} />
          {children}
        </main>
      </div>
    </div>
  );
}

