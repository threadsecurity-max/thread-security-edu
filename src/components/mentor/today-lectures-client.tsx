'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Edit3,
  Users,
  Video,
} from 'lucide-react';
import { QuickAttendanceModal } from './quick-attendance-modal';
import { RecordLectureModal } from './record-lecture-modal';

export interface TodayLecturesClientProps {
  sessions: any[];
  batchesMap: Record<string, any>;
}

export function TodayLecturesClient({ sessions, batchesMap }: TodayLecturesClientProps) {
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<any | null>(null);
  const [selectedSessionForRecord, setSelectedSessionForRecord] = useState<any | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0d0d0d] border border-white/10 text-center font-mono space-y-3">
        <Clock className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-sm text-white font-bold">No lectures scheduled for today.</p>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All your scheduled sessions are up-to-date. You can inspect upcoming calendar sessions or review batch rosters below.
        </p>
        <Link href="/mentor/calendar">
          <Button variant="outline" size="sm" className="border-white/20 text-xs font-mono text-white hover:bg-white/10 mt-2">
            View Full Academic Calendar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session) => {
        const batch = batchesMap[session.batchId] || session.batch;
        const recordsCount = session.attendanceRecords?.length || 0;
        const isCompleted = session.status === 'COMPLETED';
        const isLive = session.status === 'LIVE';

        return (
          <div
            key={session.id}
            className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 hover:border-[#C6FF34]/30 transition-all shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                    {batch?.batchCode || 'BATCH'}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(session.sessionDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <Badge
                  className={`font-mono text-[10px] ${
                    isCompleted
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isLive
                      ? 'bg-[#C6FF34] text-[#04111C] font-bold animate-pulse'
                      : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {session.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-sans">
                  {session.title}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                  Batch: <strong className="text-slate-200">{batch?.title}</strong>
                </p>
              </div>

              {session.agenda && (
                <p className="text-xs text-slate-400 font-sans line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  {session.agenda}
                </p>
              )}

              {session.topicsCovered && (
                <div className="text-[11px] font-mono text-emerald-300/90 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
                  <strong>Covered:</strong> {session.topicsCovered}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setSelectedSessionForAttendance(session)}
                className="bg-[#C6FF34] text-[#04111C] hover:bg-[#b2eb2a] font-mono text-xs font-bold gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {recordsCount > 0 ? `Attendance (${recordsCount})` : 'Mark Attendance'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedSessionForRecord(session)}
                className="border-white/15 text-slate-200 hover:text-white font-mono text-xs gap-1 hover:bg-white/5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                Update Record
              </Button>

              <Link href={`/mentor/batches/${session.batchId}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white font-mono text-xs gap-1"
                >
                  View Batch
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}

      {/* Attendance Modal */}
      {selectedSessionForAttendance && (
        <QuickAttendanceModal
          isOpen={true}
          onClose={() => setSelectedSessionForAttendance(null)}
          session={selectedSessionForAttendance}
          batch={batchesMap[selectedSessionForAttendance.batchId] || selectedSessionForAttendance.batch}
          onSuccess={() => setSelectedSessionForAttendance(null)}
        />
      )}

      {/* Record Lecture Modal */}
      {selectedSessionForRecord && (
        <RecordLectureModal
          isOpen={true}
          onClose={() => setSelectedSessionForRecord(null)}
          session={selectedSessionForRecord}
          batchId={selectedSessionForRecord.batchId}
          modules={batchesMap[selectedSessionForRecord.batchId]?.course?.modules || []}
          onSuccess={() => setSelectedSessionForRecord(null)}
        />
      )}
    </div>
  );
}
