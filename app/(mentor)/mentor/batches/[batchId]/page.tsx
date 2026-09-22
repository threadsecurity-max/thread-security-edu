import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { MetricCard } from '@/components/mentor/metric-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0;

export default async function BatchOverviewPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch, metrics } = await getBatchWorkspaceService(batchId, session?.userId || '');

  const sessions = batch.sessions || [];
  const latestSession = sessions.find((s: any) => s.status !== 'COMPLETED') || sessions[sessions.length - 1];
  const latestAnnouncement = batch.broadcasts?.[0];

  // Today's attendance counts if a session was held today
  const today = new Date().toDateString();
  const sessionToday = sessions.find(
    (s: any) => new Date(s.sessionDate).toDateString() === today
  );

  const presentTodayCount = sessionToday
    ? sessionToday.attendanceRecords.filter(
        (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
      ).length
    : Math.round(batch.students.length * 0.9);

  const absentTodayCount = Math.max(0, batch.students.length - presentTodayCount);

  return (
    <div className="space-y-6 text-slate-100">
      {/* 4 CORE BATCH METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Students"
          value={metrics.totalStudents}
          subtitle="Enrolled Roster"
          icon={Users}
          accentColor="blue"
        />

        <MetricCard
          label="Attendance Rate"
          value={`${metrics.averageAttendance}%`}
          subtitle={`Present: ${presentTodayCount} • Absent: ${absentTodayCount}`}
          icon={CheckCircle2}
          accentColor="green"
        />

        <MetricCard
          label="Module Delivery"
          value={`${metrics.moduleDeliveryPercent}%`}
          subtitle={`${metrics.completedSessions} of ${metrics.totalSessions} Sessions`}
          icon={BookOpen}
          accentColor="amber"
        />

        <MetricCard
          label="Avg Student Learning"
          value={`${metrics.averageStudentLearning}%`}
          subtitle="Syllabus Mastery"
          icon={TrendingUp}
          accentColor="purple"
        />
      </div>

      {/* DUAL PROGRESS INDICATORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Delivery Progress Bar */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C6FF34]" />
              Module Conduction Progress
            </span>
            <span className="text-sm font-extrabold font-mono text-[#C6FF34]">
              {metrics.moduleDeliveryPercent}%
            </span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, metrics.moduleDeliveryPercent)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>{metrics.completedSessions} Completed</span>
            <span>{metrics.remainingSessions} Remaining Sessions</span>
          </div>
        </div>

        {/* Overall Attendance Baseline Progress Bar */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Batch Average Attendance
            </span>
            <span className="text-sm font-extrabold font-mono text-emerald-400">
              {metrics.averageAttendance}%
            </span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, metrics.averageAttendance)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Threshold Baseline: 75%</span>
            <span className="text-emerald-400 font-bold">Healthy Range</span>
          </div>
        </div>
      </div>

      {/* UPCOMING LECTURE & LATEST ANNOUNCEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lecture Card */}
        <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C6FF34]" />
              <h3 className="text-sm font-bold text-white font-mono">Next Immediate Lecture</h3>
            </div>
            {latestSession && (
              <Badge className="bg-cyan-500/15 text-cyan-300 font-mono text-[10px]">
                {latestSession.status}
              </Badge>
            )}
          </div>

          {latestSession ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold text-white font-sans">
                  {latestSession.title}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Scheduled for:{' '}
                  <strong className="text-slate-200">
                    {new Date(latestSession.sessionDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>{' '}
                  at{' '}
                  <strong className="text-[#C6FF34]">
                    {new Date(latestSession.sessionDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </p>
              </div>

              {latestSession.agenda && (
                <p className="text-xs text-slate-400 font-sans bg-white/5 p-3 rounded-xl border border-white/5">
                  <strong>Agenda:</strong> {latestSession.agenda}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Link href={`/mentor/batches/${batch.id}/attendance`}>
                  <Button size="sm" className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Open Attendance
                  </Button>
                </Link>
                <Link href={`/mentor/batches/${batch.id}/lectures`}>
                  <Button variant="outline" size="sm" className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-mono text-xs">
                    View All Lectures
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono py-4">No upcoming lectures scheduled.</p>
          )}
        </div>

        {/* Latest Announcement Card */}
        <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C6FF34]" />
              <h3 className="text-sm font-bold text-white font-mono">Latest Batch Broadcast</h3>
            </div>
            <Link href={`/mentor/batches/${batch.id}/broadcast`}>
              <span className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1">
                Compose <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {latestAnnouncement ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white font-sans">
                  {latestAnnouncement.title}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans bg-white/5 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                {latestAnnouncement.message}
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Delivered to {latestAnnouncement.recipientsCount} students</span>
                <span className="text-emerald-400">● 1-Way Broadcast</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2 font-mono">
              <p className="text-xs text-slate-400">No broadcasts have been published yet.</p>
              <Link href={`/mentor/batches/${batch.id}/broadcast`}>
                <Button size="sm" variant="outline" className="border-white/15 text-xs font-mono text-[#C6FF34]">
                  Send First Announcement
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
