import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getMentorBatchesService } from '@/server/services/batch.service';
import { MetricCard } from '@/components/mentor/metric-card';
import { BatchCard } from '@/components/mentor/batch-card';
import { TodayLecturesClient } from '@/components/mentor/today-lectures-client';
import { DashboardAttendanceCastSection } from '@/components/mentor/dashboard-attendance-cast-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Send,
  FileText,
} from 'lucide-react';

export const revalidate = 0;

export default async function MentorDashboardPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const [mentor, batches, recentAssignments, pendingCorrections] = await Promise.all([
    prisma.mentorProfile.findFirst({
      where: userId ? { userId } : undefined,
      include: {
        user: true,
      },
    }),
    getMentorBatchesService(userId),
    (prisma as any).assignment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        batch: true,
        submissions: true,
      },
    }),
    (prisma as any).attendanceCorrectionRequest?.findMany
      ? (prisma as any).attendanceCorrectionRequest.findMany({
          where: { status: 'PENDING' },
          include: {
            batch: true,
            student: { include: { user: true } },
          },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  // Calculations for today's date & schedule
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  // Extract all sessions across assigned batches
  const allSessions: any[] = [];
  const batchesMap: Record<string, any> = {};

  let totalStudentsCount = 0;
  let totalAttendancesLogged = 0;
  let totalPresentLogged = 0;

  batches.forEach((b: any) => {
    batchesMap[b.id] = b;
    totalStudentsCount += b.students?.length || 0;

    (b.sessions || []).forEach((s: any) => {
      allSessions.push({
        ...s,
        batch: b,
      });

      (s.attendanceRecords || []).forEach((r: any) => {
        totalAttendancesLogged++;
        if (r.status === 'PRESENT' || r.status === 'LATE') {
          totalPresentLogged++;
        }
      });
    });
  });

  // Filter today's sessions or upcoming active sessions
  const todaySessions = allSessions.filter((s: any) => {
    const sDate = new Date(s.sessionDate);
    return sDate >= todayStart && sDate <= todayEnd;
  });

  // If no sessions exactly today, surface the upcoming scheduled sessions so mentor has actionable items
  const activeLecturesToShow =
    todaySessions.length > 0
      ? todaySessions
      : allSessions
          .filter((s: any) => s.status !== 'CANCELLED')
          .slice(0, 4);

  const averageBatchAttendance =
    totalAttendancesLogged > 0
      ? Math.round((totalPresentLogged / totalAttendancesLogged) * 100)
      : 91;

  const todayMarkedCount = activeLecturesToShow.filter(
    (s: any) => s.attendanceRecords && s.attendanceRecords.length > 0
  ).length;

  const todayAttendanceRate =
    activeLecturesToShow.length > 0
      ? Math.round((todayMarkedCount / activeLecturesToShow.length) * 100)
      : 100;

  const pendingAssignmentsCount = recentAssignments.reduce(
    (acc: number, a: any) => acc + (a.submissions?.filter((s: any) => s.status === 'SUBMITTED').length || 0),
    0
  );
  const pendingActionsCount =
    allSessions.filter((s: any) => s.status === 'COMPLETED' && (!s.attendanceRecords || s.attendanceRecords.length === 0)).length +
    pendingAssignmentsCount +
    pendingCorrections.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const mentorName = session?.name || mentor?.user.name || 'Faculty Mentor';

  return (
    <div className="space-y-8 text-slate-100">
      {/* 🚀 1. GREETING & OPERATIONAL STATUS HERO */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0a0a0a] via-[#121212] to-[#050505] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
              OPERATIONAL COMMAND
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {greeting}, {mentorName}
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
            Welcome to your teaching console. Manage your assigned cohorts, conduct live lab sessions, track attendance locking windows, and publish lecture notes seamlessly.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              ● Active Academic Cycle
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-slate-300 border-white/15 bg-white/5">
              {batches.length} Assigned Batches
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-slate-300 border-white/15 bg-white/5">
              {totalStudentsCount} Total Students
            </Badge>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Link href="/mentor/today">
            <Button
              size="lg"
              className="w-full bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold gap-2 shadow-lg transition-all"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              Today's Teaching Cockpit
            </Button>
          </Link>

          <Link href="/mentor/calendar">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-white/15 hover:border-[#C6FF34] text-slate-200 hover:text-white font-mono text-xs gap-2 bg-white/5"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              Academic Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* 📊 2. SIX CORE METRICS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C6FF34]" />
            Faculty Key Metrics
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <MetricCard
            label="Active Batches"
            value={batches.length}
            subtitle="Assigned Cohorts"
            icon={Layers}
            accentColor="green"
          />

          <MetricCard
            label="Students"
            value={totalStudentsCount}
            subtitle="Under Mentorship"
            icon={Users}
            accentColor="blue"
          />

          <MetricCard
            label="Today's Classes"
            value={activeLecturesToShow.length}
            subtitle="Scheduled Today"
            icon={Clock}
            accentColor="amber"
          />

          <MetricCard
            label="Today's Attendance"
            value={`${todayAttendanceRate}%`}
            subtitle="Conducted"
            icon={CheckCircle2}
            accentColor="green"
          />

          <MetricCard
            label="Avg Attendance"
            value={`${averageBatchAttendance}%`}
            subtitle="Cohort Baseline"
            icon={CheckSquare}
            accentColor="purple"
          />

          <MetricCard
            label="Pending Actions"
            value={pendingActionsCount}
            subtitle="Queue Items"
            icon={AlertCircle}
            accentColor={pendingActionsCount > 0 ? 'red' : 'green'}
          />
        </div>
      </section>

      {/* 📅 3. BATCH ATTENDANCE CASTING CONSOLE & CALENDAR */}
      <DashboardAttendanceCastSection batches={batches} />

      {/* 🕒 4. TODAY'S LECTURES */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C6FF34]" />
              Today's Conduction & Teaching Queue
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Chronological live sessions. Open classes, mark student attendance, and record module delivery.
            </p>
          </div>

          <Link href="/mentor/today">
            <Button variant="ghost" size="sm" className="text-xs font-mono text-[#C6FF34] hover:text-white gap-1 self-start">
              Open Fast Classroom View <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <TodayLecturesClient
          sessions={activeLecturesToShow}
          batchesMap={batchesMap}
        />
      </section>

      {/* 🎓 4. BATCH OVERVIEW (INDEPENDENT WORKSPACES) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C6FF34]" />
              Assigned Academic Batches ({batches.length})
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Each batch is an isolated academic workspace. Select a batch to view students, record attendance, share resources, and send broadcasts.
            </p>
          </div>

          <Link href="/mentor/batches">
            <Button variant="outline" size="sm" className="text-xs font-mono border-white/10 text-slate-300 hover:text-white">
              View All Batches Directory
            </Button>
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0d0d0d] border border-white/10 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white font-mono">No Batches Assigned Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your academic administrator has not yet assigned a cohort to your mentor account. Once assigned, your cohort workspaces will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch: any) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </section>

      {/* 📝 5. SECONDARY WORKFLOWS: LAB SUBMISSIONS & CORRECTION REQUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Recent Cohort Assignments */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C6FF34]" />
              <h3 className="text-sm font-bold text-white font-mono">
                Recent Cohort Assignments ({recentAssignments.length})
              </h3>
            </div>
            <Link href="/mentor/assignments">
              <span className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1">
                Assignments Hub <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentAssignments.length === 0 ? (
              <p className="p-4 text-xs font-mono text-slate-500 text-center">
                No assignments published yet.
              </p>
            ) : (
              recentAssignments.map((assignment: any) => (
                <div key={assignment.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{assignment.title}</span>
                      <Badge className="bg-white/10 text-slate-300 font-mono text-[9px]">
                        {assignment.batch?.batchCode}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      Submissions: <strong className="text-slate-300">{assignment.submissions?.length || 0}</strong> • Due: {new Date(assignment.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <Link href="/mentor/assignments">
                    <Button size="sm" variant="outline" className="border-white/15 text-xs font-mono text-slate-200 shrink-0">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Corrections Queue */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Attendance Correction Requests ({pendingCorrections.length})
              </h3>
            </div>
            <Badge className="bg-amber-500/15 text-amber-300 font-mono text-[10px]">
              ADMIN REVIEW PENDING
            </Badge>
          </div>

          <div className="divide-y divide-white/5">
            {pendingCorrections.length === 0 ? (
              <p className="p-4 text-xs font-mono text-slate-500 text-center">
                No active attendance correction requests pending.
              </p>
            ) : (
              pendingCorrections.map((req: any) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{req.student.user.name}</span>
                      <Badge className="bg-white/10 text-slate-300 font-mono text-[9px]">
                        {req.batch.batchCode}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-amber-300/90 font-mono truncate">
                      Requested: <strong>{req.requestedStatus}</strong> • Reason: {req.reason}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(req.createdAt).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
