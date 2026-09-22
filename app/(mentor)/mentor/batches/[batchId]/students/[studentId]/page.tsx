import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getStudentDossierInBatchService } from '@/server/services/batch.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const revalidate = 0;

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ batchId: string; studentId: string }>;
}) {
  const session = await getSession();
  const { batchId, studentId } = await params;

  let data: any;
  try {
    data = await getStudentDossierInBatchService(batchId, studentId, session?.userId || '');
  } catch (err) {
    notFound();
  }

  const { student, metrics } = data;
  const user = student.user;
  const batch = student.batch;
  const course = batch?.course;
  const sessions = batch?.sessions || [];
  const attendanceRecords = student.attendanceRecords || [];

  return (
    <div className="space-y-6 text-slate-100 max-w-6xl mx-auto">
      {/* Return link */}
      <div className="flex items-center justify-between">
        <Link
          href={`/mentor/batches/${batchId}/students`}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Batch Students Roster</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">
          Cohort: <strong className="text-white">{batch.batchCode}</strong>
        </span>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0a0a0a] via-[#121212] to-[#050505] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-black font-mono text-xs font-bold">
              {user?.tsIdentity?.tsId || 'TS-STUDENT'}
            </Badge>
            <Badge
              className={`font-mono text-xs ${
                metrics.riskStatus === 'ON_TRACK'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : metrics.riskStatus === 'NEEDS_ATTENTION'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-red-500/15 text-red-300 border border-red-500/30'
              }`}
            >
              ● {metrics.riskStatus.replace('_', ' ')}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-mono">
            {user?.email} • Enrolled Course: <strong className="text-white">{course?.title}</strong>
          </p>
          <p className="text-xs font-mono text-slate-400 pt-1">
            {metrics.riskReason}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 text-center font-mono">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
            <strong className={`text-2xl font-bold ${metrics.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.attendancePercentage}%
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">Attended</span>
            <strong className="text-2xl font-bold text-white">
              {metrics.attendedClasses} / {metrics.totalClasses}
            </strong>
          </div>
        </div>
      </div>

      {/* LECTURE HISTORY & MODULE PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecture Attendance History */}
        <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C6FF34]" />
              <h3 className="text-sm font-bold text-white font-mono">
                Conducted Lecture Attendance History
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {attendanceRecords.length} Sessions Logged
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">
                No lectures recorded yet for this cohort.
              </p>
            ) : (
              sessions.map((sess: any) => {
                const record = attendanceRecords.find(
                  (r: any) => r.sessionId === sess.id
                );
                const isPresent = record?.status === 'PRESENT' || record?.status === 'LATE';
                const status = record?.status || 'NOT_LOGGED';

                return (
                  <div key={sess.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-bold text-white truncate font-sans">
                        {sess.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })} • {sess.module?.title || 'Core Module'}
                      </span>
                    </div>

                    <Badge
                      className={`font-mono text-[10px] shrink-0 ${
                        isPresent
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : status === 'ABSENT'
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {status === 'PRESENT' ? '✓ Present' : status === 'ABSENT' ? '✕ Absent' : status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Curriculum Module Progress */}
        <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C6FF34]" />
              <h3 className="text-sm font-bold text-white font-mono">
                Curriculum Module Progress
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {course?.modules?.length || 0} Modules
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {(course?.modules || []).map((m: any, idx: number) => {
              const lessons = m.lessons || [];
              const completedCount = lessons.filter((l: any) =>
                user?.progress?.some((p: any) => p.lessonId === l.id && p.isCompleted)
              ).length;
              const modulePercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
              const isDone = modulePercent === 100;

              return (
                <div key={m.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-sans truncate">
                      Module 0{idx + 1}: {m.title}
                    </span>
                    <Badge
                      className={`font-mono text-[9px] ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : modulePercent > 0
                          ? 'bg-[#C6FF34]/20 text-[#C6FF34]'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {isDone ? 'Completed' : modulePercent > 0 ? 'In Progress' : 'Upcoming'}
                    </Badge>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-[#C6FF34]'}`}
                      style={{ width: `${Math.max(4, modulePercent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{completedCount} of {lessons.length} Lessons Finished</span>
                    <span>{modulePercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LAB ATTEMPTS & CERTIFICATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lab Submissions */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <Award className="w-4 h-4 text-[#C6FF34]" />
            <h4 className="text-xs font-bold font-mono text-white">Lab Exploitation Attempts</h4>
          </div>

          <div className="divide-y divide-white/5">
            {(user?.labAttempts || []).length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2 text-center">No lab attempts submitted yet.</p>
            ) : (
              user.labAttempts.map((la: any) => (
                <div key={la.id} className="py-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200 truncate">{la.lab?.title}</span>
                  <Badge className="bg-white/10 text-[#C6FF34] font-mono text-[10px]">
                    Score: {la.score}%
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issued Certificates */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold font-mono text-white">Earned Credentials</h4>
          </div>

          <div className="divide-y divide-white/5">
            {(user?.certificates || []).length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2 text-center">No certificates issued yet.</p>
            ) : (
              user.certificates.map((c: any) => (
                <div key={c.id} className="py-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200">{c.certificateId}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    VERIFIED
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
