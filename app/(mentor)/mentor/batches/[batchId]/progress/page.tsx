import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { MetricCard } from '@/components/mentor/metric-card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle2,
  Award,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const revalidate = 0;

export default async function BatchProgressPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch, metrics } = await getBatchWorkspaceService(batchId, session?.userId || '');

  const students = batch.students || [];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C6FF34]" />
            Batch Academic Progress & Learning Metrics
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Calculated from real LMS activity for <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 font-mono text-xs">
          ● Cohort Health: Normal
        </Badge>
      </div>

      {/* 4 DISTINCT METRICS (DO NOT COMBINE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Module Delivery"
          value={`${metrics.moduleDeliveryPercent}%`}
          subtitle="Conducted by Mentor"
          icon={BookOpen}
          accentColor="amber"
        />

        <MetricCard
          label="Student Learning"
          value={`${metrics.averageStudentLearning}%`}
          subtitle="Lessons Completed"
          icon={TrendingUp}
          accentColor="green"
        />

        <MetricCard
          label="Assessment Mastery"
          value={`${metrics.assessmentCompletionPercent}%`}
          subtitle="Exams & Quizzes Passed"
          icon={Award}
          accentColor="purple"
        />

        <MetricCard
          label="Attendance Rate"
          value={`${metrics.averageAttendance}%`}
          subtitle="Live Classroom Sessions"
          icon={CheckCircle2}
          accentColor="blue"
        />
      </div>

      {/* Informative distinction card */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#C6FF34] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white">Academic Metric Differentiation Principle:</strong>
          <p className="text-slate-400">
            In accordance with TSE LMS architecture, <strong>Module Delivery</strong> (what the faculty has taught), <strong>Student Learning</strong> (lessons digested), <strong>Assessment Completion</strong> (verified exam submissions), and <strong>Attendance</strong> (classroom presence) are tracked independently. They must not be blended into a single percentage.
          </p>
        </div>
      </div>

      {/* Student Roster Progress Breakdown */}
      <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C6FF34]" />
            Student-by-Student Activity Matrix ({students.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Attendance vs Mastery
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {students.length === 0 ? (
            <p className="p-8 text-center text-xs font-mono text-slate-500">
              No students enrolled in this batch yet.
            </p>
          ) : (
            students.map((st: any) => {
              const records = st.attendanceRecords || [];
              const presentCount = records.filter(
                (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
              ).length;
              const totalSessions = batch.sessions?.length || 1;
              const attPercent = Math.round((presentCount / totalSessions) * 100);

              const completedLessons = st.user?.progress?.filter((p: any) => p.isCompleted)?.length || 0;
              const totalLessons = (batch.course?.modules || []).reduce(
                (acc: number, m: any) => acc + (m.lessons?.length || 0),
                0
              ) || 1;
              const learnPercent = Math.round((completedLessons / totalLessons) * 100);

              return (
                <div
                  key={st.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-sans text-sm">
                        {st.user?.name}
                      </span>
                      <Badge className="bg-white/10 text-slate-300 text-[9px]">
                        {st.user?.tsIdentity?.tsId || 'TS-STUDENT'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400">{st.user?.email}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Attendance</span>
                      <strong className={`font-bold ${attPercent >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {attPercent}%
                      </strong>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Syllabus Mastery</span>
                      <strong className="text-[#C6FF34] font-bold">
                        {learnPercent}%
                      </strong>
                    </div>

                    <Badge
                      className={`font-mono text-[10px] shrink-0 ${
                        attPercent >= 75 && learnPercent >= 40
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {attPercent >= 75 && learnPercent >= 40 ? 'On Track' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
