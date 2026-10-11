import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { Sparkles, Globe, Shield, Activity, Terminal } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080C14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* ── HIGH-TECH OBSIDIAN & EMERALD CYBERSECURITY BACKGROUND ── */}
      <div className="fixed top-0 left-1/4 w-[750px] h-[750px] bg-emerald-500/5 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[650px] h-[650px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />

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
        
        {/* Obsidian Glass Top Utility Bar */}
        <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.5)] safe-top">
          <div className="flex items-center gap-3">
            <h1 className="text-xs sm:text-sm font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="hidden sm:inline text-slate-100">THREAD SECURITY LMS — ADMIN COMMAND CENTER</span>
              <span className="sm:hidden text-slate-100">ADMIN CONSOLE</span>
            </h1>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400">
              <Shield className="w-3 h-3" />
              SECURE SESSION ACTIVE
            </span>
          </div>

          {/* Action Buttons in Obsidian & Emerald Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live LMS Broadcasting Trigger */}
            <BroadcastMessageModal />

            <Link href="/admin/workshops">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-mono font-bold text-xs border border-emerald-700/50 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Conduct Workshop</span>
              </button>
            </Link>

            <Link href="/admin/server-health">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono font-bold text-xs border border-slate-700/80 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Server Health</span>
              </button>
            </Link>

            <Link href="/">
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono font-bold text-xs border border-slate-700/80 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
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
