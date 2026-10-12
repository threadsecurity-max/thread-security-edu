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
        <DialogContent className="max-w-3xl bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl md:rounded-3xl shadow-xl max-h-[90vh] flex flex-col font-sans">
          {/* Header */}
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs font-semibold">
                  {batch.batchCode}
                </Badge>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Session Attendance Manager
                </DialogTitle>
              </div>

              {isLockedState ? (
                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked (Policy Expired)
                </Badge>
              ) : (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Open for Attendance
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Session: <strong className="text-slate-800 font-semibold">{session.title}</strong> •{' '}
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
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 shrink-0 flex items-start gap-2.5 my-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 block font-semibold">Attendance Editing Window Expired</strong>
                <p className="text-[11px] text-amber-800">
                  This session is locked in accordance with academic policy ({batch.attendanceLockHours}h limit). You cannot edit records directly. Click on any student below to submit a formal <strong>Attendance Correction Request</strong> to the Admin.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 shrink-0 my-2">
              {errorMsg}
            </div>
          )}

          {/* Rapid Bulk Action & Search Toolbar */}
          {!isLockedState && !isConfirming && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold gap-1.5 cursor-pointer shadow-none rounded-xl"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark All Present
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-xl cursor-pointer"
                >
                  Mark All Absent
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Filter student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 w-48 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          )}

          {/* Student Roster Table */}
          {!isConfirming ? (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 min-h-[220px]">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students found in this cohort.
                </div>
              ) : (
                filteredStudents.map((st: any) => {
                  const studentStatus = draft[st.id]?.status || 'PRESENT';
                  return (
                    <div
                      key={st.id}
                      className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {st.user?.name}
                          </span>
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] rounded-md font-normal">
                            {st.user?.tsIdentity?.tsId || 'TS-STUDENT'}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
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
                            className="text-xs border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 gap-1 rounded-xl cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Request Correction ({studentStatus})
                          </Button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'PRESENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                studentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'ABSENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                studentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, 'LATE')}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                studentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <div className="flex-1 py-4 space-y-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Confirm Attendance Submission
                </h4>
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Total Present:</span>
                    <strong className="text-emerald-600 text-2xl font-bold">{presentCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Total Absent:</span>
                    <strong className="text-rose-600 text-2xl font-bold">{absentCount}</strong>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Submitting will officially record attendance for this session and reflect in student accounts.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>Present: <strong className="text-emerald-700 font-semibold">{presentCount}</strong></span>
              <span>Absent: <strong className="text-rose-700 font-semibold">{absentCount}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={isConfirming ? () => setIsConfirming(false) : onClose}
                className="text-xs text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                {isConfirming ? 'Back to Editing' : 'Close'}
              </Button>

              {!isLockedState && (
                !isConfirming ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsConfirming(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium gap-1.5 shadow-xs rounded-xl cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Review & Save Attendance
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading}
                    onClick={handleSaveAttendance}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium gap-1.5 shadow-xs rounded-xl cursor-pointer"
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
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl md:rounded-3xl shadow-xl font-sans">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <Badge className="w-fit bg-violet-50 text-violet-700 border-violet-200 text-xs font-semibold mb-1">
                Attendance Correction Request
              </Badge>
              <DialogTitle className="text-base font-bold text-slate-900">
                Request Attendance Correction
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Student: <strong className="text-slate-800">{correctionTargetStudent.user?.name}</strong> (
                {correctionTargetStudent.user?.tsIdentity?.tsId || 'TS-STUDENT'})
              </p>
            </DialogHeader>

            <form onSubmit={handleSendCorrectionRequest} className="space-y-4 pt-3">
              {correctionFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    correctionFeedback.includes('successfully')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {correctionFeedback}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Requested Attendance Status
                </label>
                <select
                  value={correctionStatus}
                  onChange={(e: any) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="PRESENT">Mark as PRESENT</option>
                  <option value="ABSENT">Mark as ABSENT</option>
                  <option value="LATE">Mark as LATE</option>
                  <option value="EXCUSED">Mark as EXCUSED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Reason for Attendance Correction *
                </label>
                <Input
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Student attended lab session on backup laptop / Verified network check-in"
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCorrectionTargetStudent(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={correctionLoading}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium gap-1.5 rounded-xl cursor-pointer shadow-xs"
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
