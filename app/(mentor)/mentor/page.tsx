import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getMentorBatchesService } from '@/server/services/batch.service';
import { BatchCard } from '@/components/mentor/batch-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  FileText,
  Terminal,
  Award,
  Video,
  Play,
  ClipboardList,
} from 'lucide-react';

export const revalidate = 0;

export default async function MentorDashboardPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const [batches, recentAssignments, allLabs, assessments] = await Promise.all([
    getMentorBatchesService(userId),
    (prisma as any).assignment.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        batch: true,
        submissions: true,
      },
    }),
    prisma.lab.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { course: true },
    }),
    prisma.assessment.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { course: true },
    }),
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

  // Today's sessions
  const todaySessions = allSessions.filter((s: any) => {
    const sDate = new Date(s.sessionDate);
    return sDate >= todayStart && sDate <= todayEnd;
  });

  const activeLecturesToShow =
    todaySessions.length > 0
      ? todaySessions
      : allSessions.filter((s: any) => s.status !== 'CANCELLED').slice(0, 4);

  // Pending grading count
  const pendingGradingCount = recentAssignments.reduce((acc: number, curr: any) => {
    const ungraded = (curr.submissions || []).filter((sub: any) => sub.status === 'SUBMITTED').length;
    return acc + ungraded;
  }, 0);

  // Pending attendance count
  const pendingAttendanceCount = activeLecturesToShow.filter(
    (s: any) => !s.attendanceRecords || s.attendanceRecords.length === 0
  ).length;

  return (
    <div className="space-y-8 text-slate-900 font-sans max-w-7xl mx-auto pb-12">
      {/* ── 1. GREETING & OVERVIEW HEADER ── */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 tracking-wide uppercase">
              FACULTY PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Thread Security
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Welcome back{session?.name ? `, ${session.name.split(' ')[0]}` : ''}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Here is an overview of your active courses, scheduled lectures, and student submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link href="/mentor/lectures?create=true">
            <button className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>Schedule Session</span>
            </button>
          </Link>
          <Link href="/mentor/students?create=true">
            <button className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs">
              + New Student
            </button>
          </Link>
        </div>
      </div>

      {/* ── 2. SEVEN COMPACT METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Students</span>
            <Users className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalStudentsCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Authorized Cohorts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Batches</span>
            <Layers className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{batches.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Assigned Workspaces</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today&apos;s Lectures</span>
            <Clock className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeLecturesToShow.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Syllabus Delivery</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Attendance</span>
            <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{pendingAttendanceCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Unlogged Sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Grading</span>
            <ClipboardList className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingGradingCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Submissions Queue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Upcoming Labs</span>
            <Terminal className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{allLabs.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Target Ranges</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Assessments</span>
            <Award className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{assessments.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Theoretical Tests</span>
        </div>
      </div>

      {/* ── 3. TODAY'S SESSIONS ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Today&apos;s Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Your live lectures, lab sessions, and classes scheduled for today.
            </p>
          </div>

          <Link href="/mentor/attendance">
            <button className="text-xs text-violet-700 hover:text-violet-900 flex items-center gap-1 font-semibold cursor-pointer">
              <span>View Attendance</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {activeLecturesToShow.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No sessions scheduled for today</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You have no active classes scheduled today. Schedule a lecture or review student submissions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLecturesToShow.map((sess: any) => {
              const batch = batchesMap[sess.batchId] || sess.batch;
              const hasRecords = sess.attendanceRecords && sess.attendanceRecords.length > 0;

              return (
                <div
                  key={sess.id}
                  className="p-5 rounded-2xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 transition-all text-slate-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 font-mono">
                          {batch?.batchCode || 'COHORT'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(sess.sessionDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasRecords
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {hasRecords ? 'ATTENDANCE LOGGED' : 'PENDING ATTENDANCE'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        {sess.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 block pt-0.5">
                        Batch: <strong className="text-slate-800">{batch?.title}</strong>
                      </span>
                    </div>

                    {sess.agenda && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {sess.agenda}
                      </p>
                    )}
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Link href={`/mentor/attendance?batchId=${sess.batchId}&sessionId=${sess.id}`}>
                      <button className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Attendance</span>
                      </button>
                    </Link>

                    <Link href="/mentor/lectures">
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Video className="w-3.5 h-3.5 text-violet-600" />
                        <span>Open Lecture</span>
                      </button>
                    </Link>

                    <Link href="/mentor/labs">
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Terminal className="w-3.5 h-3.5 text-violet-600" />
                        <span>Open Lab</span>
                      </button>
                    </Link>

                    <Link href="/mentor/assignments">
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Award className="w-3.5 h-3.5 text-violet-600" />
                        <span>View Assessment</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. ASSIGNED COHORT WORKSPACES ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">
                My Assigned Batches ({batches.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Isolated academic workspaces under your direct mentorship and instruction.
            </p>
          </div>

          <Link href="/mentor/batches">
            <button className="text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-xs cursor-pointer font-medium">
              View Batches Directory
            </button>
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Batches Assigned</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Contact your academic administrator to map your mentor account to cohort batches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch: any) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
