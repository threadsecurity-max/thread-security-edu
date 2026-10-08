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
    <div className="space-y-8 text-white font-mono max-w-7xl mx-auto pb-12">
      {/* ── 1. GREETING & COMMAND OVERVIEW HEADER (Rule #7) ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 uppercase">
              THREAD SECURITY COMMAND CENTER
            </span>
            <span className="text-xs text-zinc-400">
              FACULTY OPERATIONAL CONSOLE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Good afternoon, Mentor.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Here&apos;s what&apos;s happening with your batches today. Manage active rosters, schedule hands-on labs, record student attendance, and evaluate security submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link href="/mentor/lectures?create=true">
            <button className="px-4 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>Schedule Session</span>
            </button>
          </Link>
          <Link href="/mentor/students?create=true">
            <button className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] text-xs font-bold transition-all cursor-pointer">
              + New Student
            </button>
          </Link>
        </div>
      </div>

      {/* ── 2. SEVEN COMPACT METRIC CARDS (Rule #7) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Students</span>
            <Users className="w-3.5 h-3.5 text-[#C6FF34]" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{totalStudentsCount}</p>
          <span className="text-[10px] text-zinc-500">Authorized Cohorts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Batches</span>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{batches.length}</p>
          <span className="text-[10px] text-zinc-500">Assigned Workspaces</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Today&apos;s Lectures</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{activeLecturesToShow.length}</p>
          <span className="text-[10px] text-zinc-500">Syllabus Delivery</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Pending Attendance</span>
            <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-rose-400">{pendingAttendanceCount}</p>
          <span className="text-[10px] text-zinc-500">Unlogged Sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Pending Grading</span>
            <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{pendingGradingCount}</p>
          <span className="text-[10px] text-zinc-500">Submissions Queue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Upcoming Labs</span>
            <Terminal className="w-3.5 h-3.5 text-[#C6FF34]" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{allLabs.length}</p>
          <span className="text-[10px] text-zinc-500">Target Ranges</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Assessments</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{assessments.length}</p>
          <span className="text-[10px] text-zinc-500">Theoretical Tests</span>
        </div>
      </div>

      {/* ── 3. TODAY'S COMMAND CENTER (Rule #8) ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF34]" />
              <h2 className="text-lg font-serif font-bold text-white">
                TODAY&apos;S COMMAND CENTER
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Immediate operational schedule. Jump directly into live lectures, attendance, lab terminals, or tests.
            </p>
          </div>

          <Link href="/mentor/attendance">
            <button className="text-xs text-[#C6FF34] hover:underline flex items-center gap-1 font-bold">
              <span>Open Fast Attendance Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {activeLecturesToShow.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">No conduction scheduled today</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
              All batch lectures and labs are cleared. Schedule your next live module or inspect student submissions.
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
                  className="p-5 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                          {batch?.batchCode || 'COHORT'}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {new Date(sess.sessionDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasRecords
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {hasRecords ? 'ATTENDANCE LOGGED' : 'PENDING ATTENDANCE'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-serif font-bold text-white tracking-tight">
                        {sess.title}
                      </h4>
                      <span className="text-[11px] text-zinc-400 block pt-0.5 font-sans">
                        Batch: <strong className="text-zinc-200">{batch?.title}</strong>
                      </span>
                    </div>

                    {sess.agenda && (
                      <p className="text-xs text-zinc-300 font-sans line-clamp-2 leading-relaxed">
                        {sess.agenda}
                      </p>
                    )}
                  </div>

                  {/* Contextual Action Buttons (Rule #8) */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                    <Link href={`/mentor/attendance?batchId=${sess.batchId}&sessionId=${sess.id}`}>
                      <button className="px-3.5 py-1.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>[Mark Attendance]</span>
                      </button>
                    </Link>

                    <Link href="/mentor/lectures">
                      <button className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer">
                        <Video className="w-3.5 h-3.5 text-[#C6FF34]" />
                        <span>[Open Lecture]</span>
                      </button>
                    </Link>

                    <Link href="/mentor/labs">
                      <button className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer">
                        <Terminal className="w-3.5 h-3.5 text-sky-400" />
                        <span>[Open Lab]</span>
                      </button>
                    </Link>

                    <Link href="/mentor/assignments">
                      <button className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>[View Assessment]</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. ASSIGNED COHORT WORKSPACES (Rule #13) ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C6FF34]" />
              <h2 className="text-lg font-serif font-bold text-white">
                My Assigned Batches ({batches.length})
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Isolated academic workspaces under your direct mentorship and instruction.
            </p>
          </div>

          <Link href="/mentor/batches">
            <button className="text-xs text-zinc-300 hover:text-white border border-white/[0.1] px-3 py-1.5 rounded-xl bg-white/[0.03]">
              View Batches Directory
            </button>
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] text-center space-y-3">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">No Batches Assigned</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
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
