import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  Terminal,
  Award,
  ShieldAlert,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  Calendar,
  CheckSquare,
  Activity,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Live database query

export default async function AdminDashboardOverviewPage() {
  const session = await getSession();
  if (session?.role === 'SECURITY_ADMIN') {
    redirect('/admin/security-analyst');
  }

  // Live database metric queries with resilient fallbacks
  let totalStudents = 0;
  let activeStudents = 0;
  let pendingStudents = 0;
  let totalMentors = 0;
  let totalBatches = 0;
  let totalCourses = 0;
  let totalWorkshops = 0;
  let pendingCorrectionRequests = 0;
  let recentAuditLogs: any[] = [];
  let studentsList: any[] = [];
  let upcomingSessions: any[] = [];

  try {
    const [
      studentsCount,
      approvedCount,
      mentorsCount,
      batchesCount,
      coursesCount,
      workshopsCount,
      correctionsCount,
      audits,
      recentStudents,
      sessions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { in: ['STUDENT', 'GUEST'] } } }),
      prisma.user.count({ where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: true } }),
      prisma.mentorProfile.count(),
      prisma.batch.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      (prisma as any).workshop ? (prisma as any).workshop.count() : 0,
      (prisma as any).attendanceCorrectionRequest ? (prisma as any).attendanceCorrectionRequest.count({ where: { status: 'PENDING' } }) : 0,
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.user.findMany({
        where: { role: { in: ['STUDENT', 'GUEST'] } },
        include: {
          tsIdentity: true,
          enrollments: true,
          studentProfile: { include: { batch: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.batchSession.findMany({
        include: {
          batch: { include: { mentor: { include: { user: true } } } },
        },
        orderBy: { sessionDate: 'asc' },
        take: 5,
      }),
    ]);

    totalStudents = studentsCount;
    activeStudents = approvedCount;
    pendingStudents = Math.max(0, studentsCount - approvedCount);
    totalMentors = mentorsCount;
    totalBatches = batchesCount;
    totalCourses = coursesCount;
    totalWorkshops = workshopsCount;
    pendingCorrectionRequests = correctionsCount;
    recentAuditLogs = audits;
    studentsList = recentStudents;
    upcomingSessions = sessions;
  } catch (err) {
    console.error('Failed to query dashboard overview metrics:', err);
  }

  const kpis = [
    {
      title: 'TOTAL STUDENTS',
      value: totalStudents,
      subtext: `${activeStudents} Active TS-IDs • ${pendingStudents} Pending`,
      icon: Users,
      href: '/admin/students',
      color: 'text-emerald-400',
      badge: `${activeStudents} Active`,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'FACULTY & MENTORS',
      value: totalMentors,
      subtext: 'Instructors & Security Leads',
      icon: ShieldCheck,
      href: '/admin/mentors',
      color: 'text-teal-400',
      badge: 'Roster',
      badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    },
    {
      title: 'ACTIVE BATCHES',
      value: totalBatches,
      subtext: 'Concurrent Cohorts in Session',
      icon: Layers,
      href: '/admin/batches',
      color: 'text-cyan-400',
      badge: 'Cohorts',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'COURSES & MODULES',
      value: totalCourses,
      subtext: 'Academic Curriculum Tracks',
      icon: BookOpen,
      href: '/admin/courses',
      color: 'text-indigo-400',
      badge: 'Published',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'WORKSHOPS CONDUCTED',
      value: totalWorkshops,
      subtext: 'Hands-on Masterclasses & Labs',
      icon: Sparkles,
      href: '/admin/workshops',
      color: 'text-amber-400',
      badge: 'Public & Live',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    {
      title: 'ATTENDANCE REQUESTS',
      value: pendingCorrectionRequests,
      subtext: 'Pending Review by Admin',
      icon: AlertCircle,
      href: '/admin/batches',
      color: pendingCorrectionRequests > 0 ? 'text-rose-400' : 'text-emerald-400',
      badge: pendingCorrectionRequests > 0 ? 'Action Needed' : 'All Clear',
      badgeColor: pendingCorrectionRequests > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-8 text-slate-100 font-sans relative z-10">
      {/* ── ACTION COMMAND HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              OPERATIONAL COMMAND CONSOLE
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-xs text-slate-400 font-mono">Live PostgreSQL Synchronization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-mono">
            Thread Security Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
            Centralized administration of faculty rosters, student TS-IDs, batch timetables, live workshops, attendance registers, and system security.
          </p>
        </div>

        {/* Quick Action Dock */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link href="/admin/workshops">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <span>Conduct Workshop</span>
            </button>
          </Link>

          <Link href="/admin/batches">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>New Batch</span>
            </button>
          </Link>

          <Link href="/admin/mentors">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Provision Mentor</span>
            </button>
          </Link>

          <Link href="/admin/tasks">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Tasks (CSM/SEO)</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (LIVE DATABASE RECORDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    {kpi.title}
                  </span>
                  <Icon className={`w-4 h-4 ${kpi.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">
                  {kpi.value}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 truncate max-w-[120px]">{kpi.subtext}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── MAIN SPLIT: UPCOMING OPERATIONS & ACTIVE STUDENTS DIRECTORY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Registered Students Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Student Roster Preview ({totalStudents})
              </h2>
              <span className="text-[11px] text-slate-400 font-mono block">
                Recently enrolled students, track identities, and dashboard permissions
              </span>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline font-bold flex items-center gap-1"
            >
              <span>Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl bg-[#0B0F19]/90 border border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 sticky top-0 z-10 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">TS-ID</th>
                    <th className="p-3.5 font-bold">Student Name</th>
                    <th className="p-3.5 font-bold">Email</th>
                    <th className="p-3.5 font-bold">Batch</th>
                    <th className="p-3.5 text-right font-bold">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {studentsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-mono">
                        No student accounts found.
                      </td>
                    </tr>
                  ) : (
                    studentsList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            {s.tsIdentity?.tsId || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{s.name}</td>
                        <td className="p-3.5 text-slate-400 text-[11px] truncate max-w-[140px]">{s.email}</td>
                        <td className="p-3.5 text-slate-300 text-[11px]">
                          {s.studentProfile?.batch?.batchCode || 'Unassigned'}
                        </td>
                        <td className="p-3.5 text-right">
                          {s.isDashboardAccessGranted ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                              PENDING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Lectures & Today's Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Upcoming Scheduled Sessions
            </h2>
            <Link
              href="/admin/batches"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline font-bold"
            >
              Timetable Calendar →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 space-y-3 font-mono text-xs shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {upcomingSessions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono">
                No upcoming lecture sessions scheduled.
              </div>
            ) : (
              upcomingSessions.map((sess) => {
                const dateStr = new Date(sess.sessionDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                const timeStr = new Date(sess.sessionDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-bold">{sess.batch?.batchCode}</span>
                      <span className="text-slate-400 text-[10px]">📅 {dateStr} • {timeStr}</span>
                    </div>
                    <p className="text-white font-bold text-xs truncate">{sess.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Faculty: {sess.batch?.mentor?.user?.name || 'Assigned Lead'}</span>
                      <span className="text-emerald-400 font-semibold">{sess.status || 'SCHEDULED'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── SECURITY AUDIT TRAIL FEED ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
              Live Audit & Security Events
            </h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline font-bold"
          >
            All Audit Records →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {recentAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[#0B0F19]/90 border border-slate-850 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{log.action}</span>
                <span className="text-slate-500 text-[10px]">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] truncate">{log.details || `Entity: ${log.entity}`}</p>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Entity: {log.entity}</span>
                <span>ID: {log.entityId ? log.entityId.slice(0, 8) : 'SYSTEM'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
