import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import {
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Calendar,
  CheckSquare,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Live database query

export default async function AdminDashboardOverviewPage() {
  const session = await getSession();
  if (session?.role === 'SECURITY_ADMIN') {
    redirect('/admin/security-analyst');
  }

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
      title: 'Total Students',
      value: totalStudents,
      subtext: `${activeStudents} Active • ${pendingStudents} Pending`,
      icon: Users,
      href: '/admin/students',
      color: 'text-violet-600',
      badge: `${activeStudents} Active`,
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      title: 'Faculty & Mentors',
      value: totalMentors,
      subtext: 'Instructors & Leads',
      icon: ShieldCheck,
      href: '/admin/mentors',
      color: 'text-indigo-600',
      badge: 'Roster',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Active Batches',
      value: totalBatches,
      subtext: 'Ongoing Cohorts',
      icon: Layers,
      href: '/admin/batches',
      color: 'text-purple-600',
      badge: 'Cohorts',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Courses & Tracks',
      value: totalCourses,
      subtext: 'Curriculum Catalog',
      icon: BookOpen,
      href: '/admin/courses',
      color: 'text-violet-600',
      badge: 'Published',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      title: 'Workshops',
      value: totalWorkshops,
      subtext: 'Live Masterclasses',
      icon: Sparkles,
      href: '/admin/workshops',
      color: 'text-amber-600',
      badge: 'Sessions',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Correction Requests',
      value: pendingCorrectionRequests,
      subtext: 'Attendance Approvals',
      icon: AlertCircle,
      href: '/admin/batches',
      color: pendingCorrectionRequests > 0 ? 'text-rose-600' : 'text-slate-600',
      badge: pendingCorrectionRequests > 0 ? 'Action Needed' : 'Clear',
      badgeColor: pendingCorrectionRequests > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time operations summary across students, faculty roster, batches, and course schedules.
          </p>
        </div>

        {/* Quick Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/workshops">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95 cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <span>Conduct Workshop</span>
            </button>
          </Link>

          <Link href="/admin/batches">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-xs">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>New Batch</span>
            </button>
          </Link>

          <Link href="/admin/mentors">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-xs">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Faculty Roster</span>
            </button>
          </Link>

          <Link href="/admin/tasks">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-xs">
              <CheckSquare className="w-4 h-4 text-slate-600" />
              <span>Tasks</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {kpi.title}
                  </span>
                  <Icon className={`w-4 h-4 ${kpi.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-2xl font-bold text-slate-900 block">
                  {kpi.value}
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] truncate">{kpi.subtext}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── MAIN SPLIT: RECENT STUDENTS & UPCOMING SESSIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Registered Students Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" />
                Student Roster Preview ({totalStudents})
              </h2>
              <span className="text-xs text-slate-500">
                Enrolled students and clearance permissions
              </span>
            </div>
            <Link
              href="/admin/students"
              className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1"
            >
              <span>Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 text-[11px] font-semibold uppercase">
                  <tr>
                    <th className="p-3.5">TS-ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Batch</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No student accounts found.
                      </td>
                    </tr>
                  ) : (
                    studentsList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 font-mono text-[11px] font-semibold">
                            {s.tsIdentity?.tsId || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-3.5 text-slate-500 truncate max-w-[140px]">{s.email}</td>
                        <td className="p-3.5 text-slate-600">
                          {s.studentProfile?.batch?.batchCode || 'Unassigned'}
                        </td>
                        <td className="p-3.5 text-right">
                          {s.isDashboardAccessGranted ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
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

        {/* Right Column: Upcoming Scheduled Sessions */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              Upcoming Scheduled Sessions
            </h2>
            <Link
              href="/admin/batches"
              className="text-xs text-violet-600 hover:text-violet-700 font-semibold"
            >
              Batch Calendar →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs shadow-xs">
            {upcomingSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
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
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-violet-300 space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-violet-700 font-semibold">{sess.batch?.batchCode}</span>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {dateStr} • {timeStr}
                      </span>
                    </div>
                    <p className="text-slate-900 font-semibold text-xs truncate">{sess.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Faculty: {sess.batch?.mentor?.user?.name || 'Assigned Lead'}</span>
                      <span className="text-emerald-600 font-medium">{sess.status || 'SCHEDULED'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── AUDIT LOGS FEED ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-violet-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              System Audit &amp; Event Trail
            </h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs text-violet-600 hover:text-violet-700 font-semibold"
          >
            All Audit Records →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {recentAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-violet-700 font-semibold">{log.action}</span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-600 text-xs truncate">{log.details || `Entity: ${log.entity}`}</p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
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
