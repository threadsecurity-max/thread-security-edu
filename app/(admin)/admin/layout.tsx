import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Terminal,
  Cpu,
  ShieldAlert,
  LogOut,
  Globe,
  Sparkles,
} from 'lucide-react';
import { BroadcastMessageModal } from '@/components/notifications/broadcast-modal';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';

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

  const isSecAdmin = session.role === 'SECURITY_ADMIN';

  const admin = await prisma.user.findFirst({
    where: { id: session.userId },
  });

  return (
    <div className="min-h-screen flex bg-[#090204] text-slate-100 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* ── HIGH-TECH PROMINENT BIG GRID BACKGROUND ── */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-red-600/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),transparent)]" />

      {/* ── LIQUID GLASS RED SIDEBAR NAVIGATION ── */}
      <aside className="w-64 bg-[#0d0306]/85 backdrop-blur-2xl border-r border-red-500/20 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 shadow-[5px_0_30px_rgba(220,38,38,0.05)]">
        <div className="p-6 space-y-6">
          
          {/* Brand Logo & Title */}
          <Link href="/admin" className="flex items-center gap-3 group" title="Return to Admin Dashboard">
            <img src="/logos/TSE Logo Nav.svg" alt="Thread Security Education Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* Dynamic Navigation Links according to Role RBAC */}
          <nav className="space-y-1.5 text-xs font-mono">
            
            {/* Core Accessibility Shortcuts */}
            <div className="space-y-1 mb-4 pb-4 border-b border-red-500/15">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-white font-bold bg-gradient-to-r from-red-600/30 to-rose-600/10 border border-red-500/40 hover:border-red-400 transition-all shadow-[0_0_15px_rgba(220,38,38,0.15)] active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4 text-red-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/courses"
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Courses Going On</span>
              </Link>
              <Link
                href="/workshops"
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Workspace</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Landing Page</span>
              </Link>
            </div>

            {/* Role Specific Management Links */}
            <div className="space-y-1">
              <Link
                href="/admin/students"
                className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Student Directory</span>
              </Link>
              <Link
                href="/admin/batches"
                className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
              >
                <Layers className="w-4 h-4 text-red-400" />
                <span>Batch Conduction</span>
              </Link>
              <Link
                href="/admin/mentors"
                className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Faculty Roster</span>
              </Link>
              <Link
                href="/admin/db-sync"
                className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
              >
                <Cpu className="w-4 h-4 text-red-400" />
                <span>Database Sync</span>
              </Link>
              <div className="pt-2 mt-2 border-t border-red-500/15 space-y-1.5">
                <span className="px-4 text-[10px] font-mono text-red-400/80 uppercase font-bold tracking-wider block">
                  Growth & GCP Services
                </span>
                <Link
                  href="/admin/seo-console"
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Google Search Console</span>
                </Link>
                <Link
                  href="/admin/leads"
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl text-slate-300 hover:text-white hover:bg-red-950/30 hover:border-red-500/20 border border-transparent transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Lead Pipeline & AI</span>
                </Link>

                <span className="px-4 text-[10px] font-mono text-red-400/80 uppercase font-bold tracking-wider block pt-2">
                  Security Operations
                </span>
                <Link
                  href="/admin/security-analyst"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-950/60 to-red-900/30 text-red-300 border border-red-500/30 hover:border-red-400 hover:text-white transition-all font-bold active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                >
                  <Terminal className="w-4 h-4 text-red-400" />
                  <span>SOC Operations</span>
                </Link>
                <Link
                  href="/admin/audit"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-500/20 transition-all active:scale-95 font-semibold"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Security Audit</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-red-500/20 flex items-center justify-between bg-red-950/20 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
              {admin?.name ? admin.name[0] : 'SA'}
            </div>
            <div className="truncate font-mono">
              <span className="text-xs font-bold text-white block truncate">
                {admin?.name || session.name || 'Super Admin'}
              </span>
              <span className="text-[10px] text-red-400 block font-semibold">
                {session.role}
              </span>
            </div>
          </div>
          <Link href="/login" className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" title="Log Out">
            <LogOut className="w-4 h-4 text-red-400" />
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Liquid Glass Dark Red Topbar (Clean Executive Layout without unnecessary badges) */}
        <header className="h-16 bg-[#0d0306]/80 backdrop-blur-2xl border-b border-red-500/20 px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_30px_rgba(220,38,38,0.05)]">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
              <span>SUPER ADMIN COMMAND CENTER</span>
            </h1>
          </div>

          {/* iPhone-based Liquid Pill Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live LMS Broadcasting Trigger */}
            <BroadcastMessageModal />

            <Link href="/workshops">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs border border-white/15 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Workshops</span>
              </button>
            </Link>

            <Link href="/">
              <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono font-bold text-xs border border-white/10 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Landing Page</span>
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <BroadcastNotificationBanner userId={session.userId} />
          {children}
        </main>
      </div>
    </div>
  );
}
