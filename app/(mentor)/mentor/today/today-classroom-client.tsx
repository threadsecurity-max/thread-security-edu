'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Layers,
  CheckCircle2,
  Video,
  Edit3,
  Calendar,
  ExternalLink,
  Users,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { QuickAttendanceModal } from '@/components/mentor/quick-attendance-modal';
import { RecordLectureModal } from '@/components/mentor/record-lecture-modal';
import { markBatchAttendanceWithLockCheckAction } from '@/features/mentor/actions/mentor-workspace.actions';

export interface TodayClassroomClientProps {
  todaySessions: any[];
  allBatches: any[];
  batchesMap: Record<string, any>;
}

export function TodayClassroomClient({
  todaySessions,
  allBatches,
  batchesMap,
}: TodayClassroomClientProps) {
  const [activeSessionForAttendance, setActiveSessionForAttendance] = useState<any | null>(null);
  const [activeSessionForRecord, setActiveSessionForRecord] = useState<any | null>(null);
  const [fastAttendanceLoading, setFastAttendanceLoading] = useState<string | null>(null);
  const [fastAttendanceSuccess, setFastAttendanceSuccess] = useState<string | null>(null);

  // Fast 1-tap "Mark All Present" directly from the card
  const handleFastMarkAllPresent = async (session: any, batch: any) => {
    setFastAttendanceLoading(session.id);
    const students = batch.students || [];
    const records = students.map((s: any) => ({
      studentId: s.id,
      status: 'PRESENT' as const,
      remarks: 'Rapid 1-tap classroom check-in',
    }));

    const res = await markBatchAttendanceWithLockCheckAction(session.id, batch.id, records);
    setFastAttendanceLoading(null);

    if (res.success) {
      setFastAttendanceSuccess(session.id);
      setTimeout(() => setFastAttendanceSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {todaySessions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-4 font-mono">
          <Clock className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Scheduled Lectures Today</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You do not have any classes scheduled for today across your assigned batches.
            You can review the general academic calendar or prepare upcoming lecture materials.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/mentor/calendar">
              <Button size="sm" className="bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold shadow-lg">
                View Academic Calendar
              </Button>
            </Link>
            <Link href="/mentor/batches">
              <Button variant="outline" size="sm" className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-mono text-xs">
                Inspect Batches
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {todaySessions.map((session, index) => {
            const batch = batchesMap[session.batchId] || session.batch;
            const recordsCount = session.attendanceRecords?.length || 0;
            const isCompleted = session.status === 'COMPLETED';
            const isLive = session.status === 'LIVE';
            const studentsCount = batch?.students?.length || 0;

            const timeString = new Date(session.sessionDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className={`p-6 md:p-8 rounded-3xl border transition-all duration-200 shadow-2xl relative overflow-hidden ${
                  isLive
                    ? 'bg-gradient-to-r from-[#0a0a0a] via-[#102010] to-[#0a0a0a] border-[#C6FF34] shadow-[0_0_30px_rgba(198,255,52,0.15)]'
                    : isCompleted
                    ? 'bg-[#0a0a0a]/90 border-emerald-500/20'
                    : 'bg-[#0a0a0a] border-white/10 hover:border-[#C6FF34]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Time and Title */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-mono font-extrabold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C6FF34]" />
                        {timeString}
                      </div>

                      <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs font-semibold">
                        {batch?.batchCode || 'COHORT'}
                      </Badge>

                      <Badge
                        className={`font-mono text-xs ${
                          isLive
                            ? 'bg-[#C6FF34] text-black font-bold animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-slate-200 border border-white/20'
                        }`}
                      >
                        {isLive ? '● LIVE SESSION NOW' : session.status}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white font-sans">
                        {session.title}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-300 font-mono mt-1">
                        Batch: <strong className="text-white">{batch?.title}</strong> • {studentsCount} Enrolled Students
                      </p>
                    </div>

                    {session.agenda && (
                      <p className="text-xs text-slate-400 font-sans max-w-2xl bg-white/5 p-3 rounded-xl border border-white/5">
                        <strong>Session Agenda:</strong> {session.agenda}
                      </p>
                    )}

                    {session.topicsCovered && (
                      <div className="text-xs font-mono text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 max-w-2xl">
                        <strong>Recorded Topics:</strong> {session.topicsCovered}
                      </div>
                    )}
                  </div>

                  {/* Right: Operational Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-64">
                    {/* Fast 1-Tap Mark All Present button */}
                    <Button
                      size="lg"
                      disabled={fastAttendanceLoading === session.id}
                      onClick={() => handleFastMarkAllPresent(session, batch)}
                      className={`font-mono text-xs font-bold gap-2 ${
                        fastAttendanceSuccess === session.id
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white hover:bg-slate-200 text-black shadow-lg'
                      }`}
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      {fastAttendanceLoading === session.id
                        ? 'Marking All...'
                        : fastAttendanceSuccess === session.id
                        ? 'All Marked Present!'
                        : 'Fast Check-In: All Present'}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setActiveSessionForAttendance(session)}
                      className="border-white/20 text-slate-200 hover:text-white hover:border-[#C6FF34] font-mono text-xs gap-2 bg-white/5"
                    >
                      <Users className="w-4 h-4 text-[#C6FF34]" />
                      {recordsCount > 0 ? `Edit Attendance (${recordsCount})` : 'Individual Attendance'}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setActiveSessionForRecord(session)}
                      className="border-white/20 text-slate-200 hover:text-white font-mono text-xs gap-2 bg-white/5"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      Record Lecture Topics
                    </Button>

                    <Link href={`/mentor/batches/${session.batchId}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-slate-400 hover:text-white font-mono text-xs gap-1"
                      >
                        Enter Batch Workspace <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Attendance Modal */}
      {activeSessionForAttendance && (
        <QuickAttendanceModal
          isOpen={true}
          onClose={() => setActiveSessionForAttendance(null)}
          session={activeSessionForAttendance}
          batch={batchesMap[activeSessionForAttendance.batchId] || activeSessionForAttendance.batch}
          onSuccess={() => setActiveSessionForAttendance(null)}
        />
      )}

      {/* Record Lecture Modal */}
      {activeSessionForRecord && (
        <RecordLectureModal
          isOpen={true}
          onClose={() => setActiveSessionForRecord(null)}
          session={activeSessionForRecord}
          batchId={activeSessionForRecord.batchId}
          modules={batchesMap[activeSessionForRecord.batchId]?.course?.modules || []}
          onSuccess={() => setActiveSessionForRecord(null)}
        />
      )}
    </div>
  );
}
