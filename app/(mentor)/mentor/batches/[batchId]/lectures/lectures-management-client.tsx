'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit3,
  FileText,
  Users,
  Video,
  Plus,
} from 'lucide-react';
import { RecordLectureModal } from '@/components/mentor/record-lecture-modal';
import { QuickAttendanceModal } from '@/components/mentor/quick-attendance-modal';

export interface LecturesManagementClientProps {
  batch: any;
  sessions: any[];
  modules: any[];
}

export function LecturesManagementClient({
  batch,
  sessions,
  modules,
}: LecturesManagementClientProps) {
  const [selectedSessionForRecord, setSelectedSessionForRecord] = useState<any | null>(null);
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C6FF34]" />
            Lecture Conduction & Curriculum Schedule ({sessions.length})
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Track scheduled sessions, conduct live classes, and publish lecture notes for <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'SCHEDULED', 'LIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Lectures List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono text-slate-500">
            No lectures found for this filter.
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const isCompleted = sess.status === 'COMPLETED';
            const isLive = sess.status === 'LIVE';
            const recordsCount = sess.attendanceRecords?.length || 0;

            return (
              <div
                key={sess.id}
                className={`p-6 rounded-3xl border transition-all duration-200 shadow-xl ${
                  isLive
                    ? 'bg-gradient-to-r from-[#0a0a0a] via-[#102010] to-[#0a0a0a] border-[#C6FF34]'
                    : isCompleted
                    ? 'bg-[#0d0d0d] border-emerald-500/20'
                    : 'bg-[#0d0d0d] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Info */}
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs">
                        SESSION {sess.sessionNumber}
                      </Badge>

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(sess.sessionDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sess.durationMins || 120} Mins
                      </span>

                      <Badge
                        className={`font-mono text-xs ${
                          isLive
                            ? 'bg-[#C6FF34] text-black font-bold animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/20'
                        }`}
                      >
                        {sess.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white font-sans">
                        {sess.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Curriculum Module:{' '}
                        <strong className="text-white">
                          {sess.module?.title || 'Core Security Module'}
                        </strong>
                      </p>
                    </div>

                    {sess.agenda && (
                      <p className="text-xs text-slate-400 font-sans bg-white/5 p-3 rounded-xl border border-white/5">
                        <strong>Session Agenda:</strong> {sess.agenda}
                      </p>
                    )}

                    {/* Conduction Details */}
                    {sess.topicsCovered && (
                      <div className="text-xs font-mono text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                        <strong className="block text-emerald-400">✓ Topics Covered in Session:</strong>
                        <p className="whitespace-pre-line text-[11px] text-slate-200">
                          {sess.topicsCovered}
                        </p>
                      </div>
                    )}

                    {sess.importantNotes && (
                      <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 space-y-1">
                        <strong className="block text-cyan-400">Important Teaching Notes:</strong>
                        <p className="text-[11px] text-slate-200">{sess.importantNotes}</p>
                      </div>
                    )}

                    {sess.homework && (
                      <div className="text-xs font-mono text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        <strong>Assigned Homework / Lab:</strong> {sess.homework}
                      </div>
                    )}
                  </div>

                  {/* Operational Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-48">
                    <Button
                      size="sm"
                      onClick={() => setSelectedSessionForRecord(sess)}
                      className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-1.5 shadow-md"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      Record & Notes
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSessionForAttendance(sess)}
                      className="border-white/15 text-slate-200 hover:text-white font-mono text-xs gap-1.5 bg-white/5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF34]" />
                      {recordsCount > 0 ? `Attendance (${recordsCount})` : 'Mark Attendance'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Lecture Modal */}
      {selectedSessionForRecord && (
        <RecordLectureModal
          isOpen={true}
          onClose={() => setSelectedSessionForRecord(null)}
          session={selectedSessionForRecord}
          batchId={batch.id}
          modules={modules}
          onSuccess={() => setSelectedSessionForRecord(null)}
        />
      )}

      {/* Quick Attendance Modal */}
      {selectedSessionForAttendance && (
        <QuickAttendanceModal
          isOpen={true}
          onClose={() => setSelectedSessionForAttendance(null)}
          session={selectedSessionForAttendance}
          batch={batch}
          onSuccess={() => setSelectedSessionForAttendance(null)}
        />
      )}
    </div>
  );
}
