'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Send,
  AlertTriangle,
  History,
  ShieldCheck,
  Search,
  Check,
  Filter,
} from 'lucide-react';
import {
  markBatchAttendanceWithLockCheckAction,
  requestAttendanceCorrectionAction,
} from '@/features/mentor/actions/mentor-workspace.actions';

export interface BatchAttendanceClientProps {
  batch: any;
  sessions: any[];
  students: any[];
}

export function BatchAttendanceClient({
  batch,
  sessions,
  students,
}: BatchAttendanceClientProps) {
  // Currently selected session for attendance
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[sessions.length - 1]?.id || ''
  );

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || sessions[0],
    [sessions, selectedSessionId]
  );

  // Draft attendance state: studentId -> { status, remarks }
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>
  >(() => {
    const initial: Record<string, { status: any; remarks: string }> = {};
    if (!selectedSession) return initial;

    for (const st of students) {
      const existing = selectedSession.attendanceRecords?.find((r: any) => r.studentId === st.id);
      initial[st.id] = {
        status: existing?.status || 'PRESENT',
        remarks: existing?.remarks || '',
      };
    }
    return initial;
  });

  // When selectedSession changes, sync draft
  const syncDraftForSession = (sess: any) => {
    setSelectedSessionId(sess.id);
    const initial: Record<string, { status: any; remarks: string }> = {};
    for (const st of students) {
      const existing = sess.attendanceRecords?.find((r: any) => r.studentId === st.id);
      initial[st.id] = {
        status: existing?.status || 'PRESENT',
        remarks: existing?.remarks || '',
      };
    }
    setAttendanceDraft(initial);
    setIsConfirmModalOpen(false);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // 24-hour lock calculation
  const isLocked = useMemo(() => {
    if (!selectedSession) return false;
    const sessionTime = new Date(selectedSession.sessionDate).getTime();
    const elapsedHours = (Date.now() - sessionTime) / (1000 * 60 * 60);
    return elapsedHours > (batch.attendanceLockHours || 24);
  }, [selectedSession, batch.attendanceLockHours]);

  // Modals & UI states
  const [searchStudent, setSearchStudent] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Correction Request State
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('PRESENT');
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [correctionResultMsg, setCorrectionResultMsg] = useState<string | null>(null);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    if (isLocked) return;
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    if (isLocked) return;
    const updated: Record<string, any> = {};
    for (const st of students) {
      updated[st.id] = {
        status,
        remarks: attendanceDraft[st.id]?.remarks || '',
      };
    }
    setAttendanceDraft(updated);
  };

  const presentCount = Object.values(attendanceDraft).filter(
    (d) => d.status === 'PRESENT' || d.status === 'LATE'
  ).length;
  const absentCount = Object.values(attendanceDraft).filter((d) => d.status === 'ABSENT').length;

  const handleFinalSubmit = async () => {
    if (!selectedSession) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const records = Object.entries(attendanceDraft).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    const res = await markBatchAttendanceWithLockCheckAction(selectedSession.id, batch.id, records);

    setIsSaving(false);
    setIsConfirmModalOpen(false);

    if (res.success) {
      setSuccessMsg(`Attendance successfully recorded for ${res.count} students.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to record attendance.');
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !selectedSession) return;

    setIsSubmittingCorrection(true);
    setCorrectionResultMsg(null);

    const res = await requestAttendanceCorrectionAction(
      batch.id,
      selectedSession.id,
      correctionTarget.id,
      correctionStatus,
      correctionReason
    );

    setIsSubmittingCorrection(false);
    if (res.success) {
      setCorrectionResultMsg('Correction request successfully submitted to Admin.');
      setTimeout(() => {
        setCorrectionTarget(null);
        setCorrectionReason('');
        setCorrectionResultMsg(null);
      }, 1500);
    } else {
      setCorrectionResultMsg(res.error || 'Failed to submit correction request.');
    }
  };

  const filteredStudents = students.filter((s: any) => {
    const q = searchStudent.toLowerCase();
    const name = s.user?.name?.toLowerCase() || '';
    const tsId = s.user?.tsIdentity?.tsId?.toLowerCase() || '';
    return name.includes(q) || tsId.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Audit Logs button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#C6FF34]" />
            Session Attendance & Conduction Ledger
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Date-based academic attendance. Records are synchronized with the Student Panel in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditModalOpen(true)}
              className="border-white/15 text-slate-300 font-mono text-xs gap-1.5 bg-white/5 hover:border-[#C6FF34]"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              Audit Log ({selectedSession.attendanceAudits?.length || 0})
            </Button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Session Date Selector (Left) + Attendance Roster (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lecture Session Calendar / Date Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C6FF34]" />
                Lecture Dates ({sessions.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Lock: {batch.attendanceLockHours}h</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-500 font-mono">
                  No sessions created yet for this batch.
                </p>
              ) : (
                sessions.map((sess: any) => {
                  const isSessSelected = sess.id === selectedSession?.id;
                  const sessDate = new Date(sess.sessionDate);
                  const sessLocked =
                    (Date.now() - sessDate.getTime()) / (1000 * 60 * 60) >
                    (batch.attendanceLockHours || 24);
                  const markedCount = sess.attendanceRecords?.length || 0;

                  return (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => syncDraftForSession(sess)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSessSelected
                          ? 'bg-white/10 border-[#C6FF34] shadow-md'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-[#C6FF34]">
                          SESSION {sess.sessionNumber}
                        </span>
                        {sessLocked ? (
                          <span className="text-[9px] font-mono text-red-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Editable
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-white font-sans truncate">
                        {sess.title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                        <span>
                          {sessDate.toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span>
                          {markedCount > 0 ? (
                            <span className="text-emerald-400 font-bold">✓ Logged ({markedCount})</span>
                          ) : (
                            <span className="text-amber-400">● Unmarked</span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Marking Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSession ? (
            <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-xl space-y-4">
              {/* Session Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs">
                      SESSION {selectedSession.sessionNumber}
                    </Badge>
                    {isLocked ? (
                      <Badge className="bg-red-500/15 text-red-300 border border-red-500/30 font-mono text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        🔒 Attendance Locked ({batch.attendanceLockHours}h window expired)
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Editable Window Active
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans mt-1">
                    {selectedSession.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Conducted on:{' '}
                    <strong className="text-slate-200">
                      {new Date(selectedSession.sessionDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>{' '}
                    • {selectedSession.module?.title || 'General Curriculum Module'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Present: {presentCount}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs font-mono text-red-400 font-bold">
                    Absent: {absentCount}
                  </span>
                </div>
              </div>

              {/* Locked Warning Banner */}
              {isLocked && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-300 block">Attendance Editing Window Expired</strong>
                    <p className="text-[11px] text-red-300/80">
                      In accordance with TSE academic policy, attendance locks after {batch.attendanceLockHours} hours. To amend any student record, click <strong>"Request Correction"</strong> next to the student's name to submit a formal audit request to Admin.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {!isLocked ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleMarkAll('PRESENT')}
                      className="bg-[#C6FF34]/15 hover:bg-[#C6FF34]/25 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs font-bold gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark All Present
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
                ) : (
                  <span className="text-xs font-mono text-slate-400">
                    Read-only view • Corrections subject to admin approval
                  </span>
                )}

                <Input
                  type="text"
                  placeholder="Filter student or TS-ID..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="h-8 text-xs font-mono bg-white/5 border-white/10 text-white sm:w-56 focus:border-[#C6FF34]"
                />
              </div>

              {/* Student Attendance List */}
              <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="p-8 text-center text-xs font-mono text-slate-500">
                    No students match the search filter.
                  </p>
                ) : (
                  filteredStudents.map((st: any) => {
                    const status = attendanceDraft[st.id]?.status || 'PRESENT';
                    return (
                      <div
                        key={st.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors"
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

                        {/* Status Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLocked ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setCorrectionTarget(st);
                                setCorrectionStatus(status);
                              }}
                              className="text-[11px] font-mono border border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Request Correction ({status})
                            </Button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                  status === 'PRESENT'
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
                                  status === 'ABSENT'
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
                                  status === 'LATE'
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

              {/* Submit Action Bar */}
              {!isLocked && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Review count before final submission: <strong className="text-emerald-400">{presentCount} Present</strong>, <strong className="text-red-400">{absentCount} Absent</strong>
                  </span>

                  <Button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-2 shadow-lg"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    Review & Submit Attendance
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono text-slate-500">
              Select a lecture date on the left to inspect or record attendance.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsConfirmModalOpen(false)}>
          <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl shadow-2xl font-mono">
            <DialogHeader className="border-b border-white/10 pb-3">
              <Badge className="w-fit bg-[#C6FF34]/15 text-[#C6FF34] text-[10px] mb-1">
                ATTENDANCE SUBMISSION CONFIRMATION
              </Badge>
              <DialogTitle className="text-base font-bold text-white">
                Confirm Attendance Submission
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Session: <strong className="text-white">{selectedSession?.title}</strong>
              </p>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Present</span>
                  <strong className="text-2xl text-emerald-400 font-bold">{presentCount}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Absent</span>
                  <strong className="text-2xl text-red-400 font-bold">{absentCount}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Are you sure you want to submit this attendance record? This will create an audit record and synchronize with each student's portal.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-xs text-slate-400"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isSaving}
                onClick={handleFinalSubmit}
                className="bg-white hover:bg-slate-200 text-black text-xs font-bold gap-1.5 shadow-md"
              >
                {isSaving ? 'Submitting...' : 'Confirm & Save Attendance'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Audit Log Modal */}
      {isAuditModalOpen && selectedSession && (
        <Dialog open={true} onOpenChange={() => setIsAuditModalOpen(false)}>
          <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl shadow-2xl font-mono max-h-[80vh] flex flex-col">
            <DialogHeader className="border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#C6FF34]" />
                <DialogTitle className="text-base font-bold text-white">
                  Session Attendance Audit Trail
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-400">
                Immutable audit ledger of changes recorded for Session {selectedSession.sessionNumber}.
              </p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 py-2">
              {(selectedSession.attendanceAudits || []).length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">
                  No previous audit events recorded for this session.
                </p>
              ) : (
                selectedSession.attendanceAudits.map((audit: any) => (
                  <div key={audit.id} className="py-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/10 text-slate-300 text-[10px]">
                        {audit.action}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(audit.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      Status Change:{' '}
                      <span className="text-red-400">{audit.oldStatus || 'NONE'}</span> →{' '}
                      <span className="text-emerald-400 font-bold">{audit.newStatus}</span>
                    </p>
                    {audit.reason && (
                      <p className="text-[11px] text-slate-400 italic">
                        Reason: {audit.reason}
                      </p>
                    )}
                    {audit.approvedBy && (
                      <p className="text-[10px] text-[#C6FF34]">
                        Approved By Admin: {audit.approvedBy}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0 text-right">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAuditModalOpen(false)}
                className="border-white/15 text-xs text-slate-300"
              >
                Close Audit Trail
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Attendance Correction Modal */}
      {correctionTarget && selectedSession && (
        <Dialog open={true} onOpenChange={() => setCorrectionTarget(null)}>
          <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl shadow-2xl font-mono">
            <DialogHeader className="border-b border-white/10 pb-3">
              <Badge className="w-fit bg-amber-500/20 text-amber-300 text-[10px] mb-1">
                ATTENDANCE CORRECTION REQUEST
              </Badge>
              <DialogTitle className="text-base font-bold text-white">
                Request Attendance Amendment
              </DialogTitle>
              <p className="text-xs text-slate-300">
                Student: <strong className="text-white">{correctionTarget.user?.name}</strong> (
                {correctionTarget.user?.tsIdentity?.tsId || 'TS-STUDENT'})
              </p>
            </DialogHeader>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4 pt-3 text-xs">
              {correctionResultMsg && (
                <div
                  className={`p-3 rounded-xl ${
                    correctionResultMsg.includes('successfully')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                >
                  {correctionResultMsg}
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">
                  Requested Attendance Status
                </label>
                <select
                  value={correctionStatus}
                  onChange={(e: any) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/20 text-white text-xs font-mono outline-none focus:border-[#C6FF34]"
                >
                  <option value="PRESENT" className="bg-[#141414] text-white">Mark as PRESENT</option>
                  <option value="ABSENT" className="bg-[#141414] text-white">Mark as ABSENT</option>
                  <option value="LATE" className="bg-[#141414] text-white">Mark as LATE</option>
                  <option value="EXCUSED" className="bg-[#141414] text-white">Mark as EXCUSED</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Reason / Audit Justification *
                </label>
                <Input
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Student joined session via backup stream / check-in confirmed"
                  className="bg-white/5 border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCorrectionTarget(null)}
                  className="text-xs text-slate-400"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmittingCorrection}
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingCorrection ? 'Submitting...' : 'Submit to Admin'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
