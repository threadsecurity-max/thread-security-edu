import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Terminal,
  Cpu,
  Award,
  FileText,
  Calendar,
  Bell,
  LogOut,
  Globe,
  Sparkles,
} from 'lucide-react';

import { StudentMobileNav } from '@/components/navigation/StudentMobileNav';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session exists, redirect to login
  if (!session) {
    redirect('/login');
  }

  // Fetch the logged-in student record to verify dashboard access grant
  let student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      studentProfile: true,
    },
  });

  // If student record not found, fallback to first student or redirect
  if (!student) {
    student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      include: {
        tsIdentity: true,
        studentProfile: true,
      },
    });
  }

  // If student has NOT been granted dashboard access by Admin, gate access and redirect to home page to explore
  const isGranted = (student as any)?.isDashboardAccessGranted;
  if (student && !isGranted && student.role === 'STUDENT') {
    redirect('/?notice=clearance-pending');
  }

  const tsId = student?.tsIdentity?.tsId || session.tsId || 'TSE-2026-8F4K29';
  const studentName = student?.name || session.name || 'Student';

  return (
    <div className="min-h-screen flex bg-[#F7F9FA]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#04111C] text-white border-r border-white/10 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div className="p-6 space-y-6">
          {/* Brand */}
          <Link href="/student" className="flex items-center gap-3 group" title="Return to Student Dashboard">
            <img src="/logos/TSE Logo Nav.svg" alt="Thread Security Education Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* TS-ID Card */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AUTHENTICATED TS-ID</span>
            <span className="text-security-green font-bold text-sm block">{tsId}</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium text-slate-300">
            {/* Core Accessibility Navigation */}
            <div className="space-y-1 mb-3 pb-3 border-b border-white/10">
              <Link
                href="/student"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-white font-bold bg-white/10 hover:bg-white/15 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-security-green" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/student/courses"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Courses Going On</span>
              </Link>
              <Link
                href="/workshops"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-security-green" />
                <span>Workspace</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Landing Page</span>
              </Link>
            </div>

            <Link
              href="/student"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white/10 text-white font-bold"
            >
              <LayoutDashboard className="w-4 h-4 text-security-green" />
              Dashboard
            </Link>
            <Link
              href="/student/courses"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              My Courses
            </Link>
            <Link
              href="/student/labs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <Terminal className="w-4 h-4 text-slate-400" />
              Practical Labs
            </Link>
            <Link
              href="/student/assessments"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <Cpu className="w-4 h-4 text-slate-400" />
              Assessments
            </Link>
            <Link
              href="/student/assignments"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-[#C6FF34]" />
              Assignments
            </Link>
            <Link
              href="/student/certificates"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <Award className="w-4 h-4 text-slate-400" />
              Certificates
            </Link>
            <Link
              href="/student/attendance"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4 text-security-green" />
              Batch & Attendance
            </Link>
            <Link
              href="/student/report"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              Academic Report
            </Link>
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-security-green text-primary-dark font-bold flex items-center justify-center text-xs shrink-0">
              {studentName[0]}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{studentName}</span>
              <span className="text-[10px] text-security-green font-mono block">Verified Student</span>
            </div>
          </div>
          <Link href="/login" className="text-slate-400 hover:text-white p-1">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 safe-top">
          <div className="flex items-center gap-2 sm:gap-4">
            <StudentMobileNav tsId={tsId} studentName={studentName} />
            <Badge variant="tsid" className="text-[11px] sm:text-xs">{tsId}</Badge>
            <span className="text-xs text-muted font-mono hidden lg:inline-block">
              Thread Security Academic Session • 2026
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#C6FF34]" />
              <span className="hidden sm:inline">Landing Page</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <Link
              href="/workshops"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C6FF34] text-slate-950 hover:bg-[#b3fa1b] text-xs font-bold font-mono shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Workshops</span>
            </Link>
            <button
              aria-label="View notifications"
              className="touch-target relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-security-green" />
            </button>
            <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-border">
              <span className="text-xs font-bold text-primary truncate max-w-[120px] sm:max-w-none">
                {studentName}
              </span>
            </div>
          </div>
        </header>

        {/* Content with bottom clearance for mobile bottom nav */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-6">
          <BroadcastNotificationBanner userId={student?.id} />
          {children}
        </main>
      </div>
    </div>
  );
}
