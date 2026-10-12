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
                className={`p-6 md:p-8 rounded-3xl border transition-all duration-200 shadow-xs relative overflow-hidden ${
                  isLive
                    ? 'bg-white border-2 border-violet-600 shadow-md'
                    : isCompleted
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-violet-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Time and Title */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-sm flex items-center gap-2 border border-slate-200">
                        <Clock className="w-4 h-4 text-violet-600" />
                        {timeString}
                      </div>

                      <Badge className="bg-violet-50 text-violet-700 border border-violet-200 font-mono text-xs font-semibold">
                        {batch?.batchCode || 'COHORT'}
                      </Badge>

                      <Badge
                        className={`font-mono text-xs ${
                          isLive
                            ? 'bg-violet-600 text-white font-bold animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isLive ? '● LIVE SESSION NOW' : session.status}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-sans">
                        {session.title}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 font-sans mt-1">
                        Batch: <strong className="text-slate-900">{batch?.title}</strong> • {studentsCount} Enrolled Students
                      </p>
                    </div>

                    {session.agenda && (
                      <p className="text-xs text-slate-600 font-sans max-w-2xl bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <strong>Session Agenda:</strong> {session.agenda}
                      </p>
                    )}

                    {session.topicsCovered && (
                      <div className="text-xs font-sans text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 max-w-2xl">
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
                      className={`font-mono text-xs font-bold gap-2 cursor-pointer ${
                        fastAttendanceSuccess === session.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                      }`}
                    >
                      <Check className="w-4 h-4 text-white" />
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
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs gap-2 bg-white shadow-xs cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-violet-600" />
                      {recordsCount > 0 ? `Edit Attendance (${recordsCount})` : 'Individual Attendance'}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setActiveSessionForRecord(session)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs gap-2 bg-white shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-500" />
                      Record Lecture Topics
                    </Button>

                    <Link href={`/mentor/batches/${session.batchId}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-violet-700 hover:text-violet-900 font-mono text-xs gap-1 cursor-pointer"
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
