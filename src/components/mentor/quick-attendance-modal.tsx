'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Send,
  AlertTriangle,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';
import {
  markBatchAttendanceWithLockCheckAction,
  requestAttendanceCorrectionAction,
} from '@/features/mentor/actions/mentor-workspace.actions';

export interface QuickAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any | null;
  batch: any;
  onSuccess?: () => void;
}

export function QuickAttendanceModal({
  isOpen,
  onClose,
  session,
  batch,
  onSuccess,
}: QuickAttendanceModalProps) {
  const [draft, setDraft] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLockedState, setIsLockedState] = useState(false);

  // Correction Request Modal state
  const [correctionTargetStudent, setCorrectionTargetStudent] = useState<any | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('PRESENT');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionFeedback, setCorrectionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !batch) return;

    // Check if locked
    const sessionTime = new Date(session.sessionDate).getTime();
    const elapsedHours = (Date.now() - sessionTime) / (1000 * 60 * 60);
    const locked = elapsedHours > (batch.attendanceLockHours || 24);
    setIsLockedState(locked);

    // Populate draft
    const initial: Record<string, { status: any; remarks: string }> = {};
    const students = batch.students || [];

    for (const st of students) {
      const existing = session.attendanceRecords?.find(
        (r: any) => r.studentId === st.id || r.student?.id === st.id
      );
      initial[st.id] = {
        status: existing?.status || 'PRESENT',
        remarks: existing?.remarks || '',
      };
    }
    setDraft(initial);
    setIsConfirming(false);
    setErrorMsg(null);
  }, [session, batch]);

  if (!session || !batch) return null;

  const students = batch.students || [];

  const handleStatusChange = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  ) => {
    if (isLockedState) return;
    setDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    if (isLockedState) return;
    const updated: Record<string, any> = {};
    for (const st of students) {
      updated[st.id] = {
        status,
        remarks: draft[st.id]?.remarks || '',
      };
    }
    setDraft(updated);
  };

  const presentCount = Object.values(draft).filter(
    (d) => d.status === 'PRESENT' || d.status === 'LATE'
  ).length;
  const absentCount = Object.values(draft).filter((d) => d.status === 'ABSENT').length;

  const handleSaveAttendance = async () => {
    setLoading(true);
    setErrorMsg(null);

    const records = Object.entries(draft).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    const res = await markBatchAttendanceWithLockCheckAction(session.id, batch.id, records);

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save attendance.');
      if (res.isLocked) {
        setIsLockedState(true);
      }
    }
  };

  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTargetStudent) return;

    setCorrectionLoading(true);
    setCorrectionFeedback(null);

    const res = await requestAttendanceCorrectionAction(
      batch.id,
      session.id,
      correctionTargetStudent.id,
      correctionStatus,
      correctionReason
    );

    setCorrectionLoading(false);
    if (res.success) {
      setCorrectionFeedback('Correction request submitted to Admin successfully.');
      setTimeout(() => {
        setCorrectionTargetStudent(null);
        setCorrectionFeedback(null);
        setCorrectionReason('');
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setCorrectionFeedback(res.error || 'Failed to submit correction request.');
    }
  };

  const filteredStudents = students.filter((s: any) => {
    const q = searchQuery.toLowerCase();
    const name = s.user?.name?.toLowerCase() || '';
    const tsId = s.user?.tsIdentity?.tsId?.toLowerCase() || '';
    return name.includes(q) || tsId.includes(q);
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <DialogHeader className="border-b border-white/10 pb-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                  {batch.batchCode}
                </Badge>
                <DialogTitle className="text-base font-mono font-bold text-white">
                  Session Attendance Manager
                </DialogTitle>
              </div>

              {isLockedState ? (
                <Badge className="bg-red-500/15 text-red-300 border border-red-500/30 font-mono text-[10px] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  ATTENDANCE LOCKED (24H EXPIRED)
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  EDITING WINDOW ACTIVE
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 font-mono">
              Session: <strong className="text-white">{session.title}</strong> •{' '}
              {new Date(session.sessionDate).toLocaleDateString(undefined, {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </DialogHeader>

          {/* Locked Notice Banner */}
          {isLockedState && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-200 shrink-0 flex items-start gap-2.5 my-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-300 block">Attendance Editing Window Expired</strong>
                <p className="text-[11px] text-red-300/80">
                  This session is locked in accordance with TSE academic policy ({batch.attendanceLockHours}h limit). You cannot edit records directly. Click on any student to submit a formal <strong>Attendance Correction Request</strong> to Admin.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300 shrink-0 my-2">
              {errorMsg}
            </div>
          )}

          {/* Rapid Bulk Action & Search Toolbar */}
          {!isLockedState && !isConfirming && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="bg-[#C6FF34]/15 hover:bg-[#C6FF34]/25 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs font-bold gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MARK ALL PRESENT
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="border-white/10 text-slate-400 hover:text-white font-mono text-xs"
                >
                  Mark All Absent
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Filter student or TS-ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs font-mono bg-white/5 border-white/10 text-white w-48 focus:border-[#C6FF34]"
                />
              </div>
            </div>
          )}

          {/* Student Roster Table */}
          {!isConfirming ? (
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1 min-h-[220px]">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  No students found in this cohort.
                </div>
              ) : (
                filteredStudents.map((st: any) => {
                  const studentStatus = draft[st.id]?.status || 'PRESENT';
                  return (
                    <div
                      key={st.id}
                      className="py-2.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] rounded-lg transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-sans">
                            {st.user?.name}
                          </span>
                          <Badge className="bg-white/10 text-slate-300 font-mono text-[9px]">
                            {st.user?.tsIdentity?.tsId || 'TS-STUDENT'}
                          </Badge>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block truncate">
                          {st.user?.email}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-1.5">
                        {isLockedState ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setCorrectionTargetStudent(st);
                              setCorrectionStatus(studentStatus);
                            }}
                            className="text-[11px] font-mono border border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Request Correction ({studentStatus})
                          </Button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                studentStatus === 'PRESENT'
                                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                studentStatus === 'ABSENT'
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'LATE')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                studentStatus === 'LATE'
                                  ? 'bg-amber-500 text-slate-950 shadow-md'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              Late
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Confirmation Screen */
            <div className="flex-1 py-4 space-y-4 text-center font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Confirm Attendance Submission
                </h4>
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Present:</span>
                    <strong className="text-emerald-400 text-xl">{presentCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Absent:</span>
                    <strong className="text-red-400 text-xl">{absentCount}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Submitting will record the official faculty attendance and synchronize with the Student Panel immediately.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span>Present: <strong className="text-emerald-400">{presentCount}</strong></span>
              <span>Absent: <strong className="text-red-400">{absentCount}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={isConfirming ? () => setIsConfirming(false) : onClose}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                {isConfirming ? 'Back to Editing' : 'Close'}
              </Button>

              {!isLockedState && (
                !isConfirming ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsConfirming(true)}
                    className="bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Review & Submit Attendance
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading}
                    onClick={handleSaveAttendance}
                    className="bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold gap-1.5 shadow-md"
                  >
                    {loading ? 'Submitting...' : 'Confirm & Save Attendance'}
                  </Button>
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Correction Modal */}
      {correctionTargetStudent && (
        <Dialog open={true} onOpenChange={() => setCorrectionTargetStudent(null)}>
          <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl shadow-2xl">
            <DialogHeader className="border-b border-white/10 pb-3">
              <Badge className="w-fit bg-amber-500/20 text-amber-300 font-mono text-[10px] mb-1">
                ATTENDANCE CORRECTION WORKFLOW
              </Badge>
              <DialogTitle className="text-base font-mono font-bold text-white">
                Request Attendance Correction
              </DialogTitle>
              <p className="text-xs text-slate-300">
                Student: <strong className="text-white">{correctionTargetStudent.user?.name}</strong> (
                {correctionTargetStudent.user?.tsIdentity?.tsId || 'TS-STUDENT'})
              </p>
            </DialogHeader>

            <form onSubmit={handleSendCorrectionRequest} className="space-y-4 pt-3">
              {correctionFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    correctionFeedback.includes('successfully')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                >
                  {correctionFeedback}
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Requested Attendance Status
                </label>
                <select
                  value={correctionStatus}
                  onChange={(e: any) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-mono outline-none focus:border-[#C6FF34]"
                >
                  <option value="PRESENT" className="bg-[#141414]">Mark as PRESENT</option>
                  <option value="ABSENT" className="bg-[#141414]">Mark as ABSENT</option>
                  <option value="LATE" className="bg-[#141414]">Mark as LATE</option>
                  <option value="EXCUSED" className="bg-[#141414]">Mark as EXCUSED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Reason for Attendance Correction *
                </label>
                <Input
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Student attended lab session on backup laptop / Verified network check-in"
                  className="bg-white/5 border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCorrectionTargetStudent(null)}
                  className="text-xs font-mono text-slate-400"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={correctionLoading}
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-mono text-xs font-bold gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {correctionLoading ? 'Submitting...' : 'Submit to Admin'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
