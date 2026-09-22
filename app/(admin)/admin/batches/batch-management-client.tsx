'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  ShieldCheck,
  BookOpen,
  Search,
  Layers,
  UserPlus,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Database,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import {
  createBatchAction,
  assignStudentToBatchAction,
  assignStudentToBatchByTsIdAction,
  createBatchSessionAction,
  markBatchAttendanceAction,
  fetchDeliveredLecturesAuditAction,
  fetchPendingCorrectionRequestsAction,
  adminApproveOrRejectCorrectionAction,
} from '@/features/batch/actions/batch.actions';

export function BatchManagementClient({
  batches,
  courses,
  mentors,
  allStudents,
}: {
  batches: any[];
  courses: any[];
  mentors: any[];
  allStudents: any[];
}) {
  // Main Tab State: 'cohorts' | 'calendar' | 'audit' | 'corrections'
  const [activeTab, setActiveTab] = useState<'cohorts' | 'calendar' | 'audit' | 'corrections'>('cohorts');

  // Attendance Correction Requests State
  const [correctionRequests, setCorrectionRequests] = useState<any[]>([]);
  const [correctionFilter, setCorrectionFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Audit Ledger State
  const [deliveredLectures, setDeliveredLectures] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [loadingLectures, setLoadingLectures] = useState(false);

  // Dialog & Selection States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBatchForStudents, setSelectedBatchForStudents] = useState<any | null>(null);
  const [selectedBatchForSessions, setSelectedBatchForSessions] = useState<any | null>(null);
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<any | null>(null);

  // Form inputs
  const [tsIdInput, setTsIdInput] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionAgenda, setNewSessionAgenda] = useState('');

  // Attendance state
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [attendanceRemarks, setAttendanceRemarks] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load correction requests initially and on tab change
  useEffect(() => {
    loadCorrectionRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'corrections') {
      loadCorrectionRequests();
    }
  }, [activeTab]);

  const loadCorrectionRequests = async () => {
    setLoadingCorrections(true);
    const res = await fetchPendingCorrectionRequestsAction();
    if (res.success && res.requests) {
      setCorrectionRequests(res.requests);
    }
    setLoadingCorrections(false);
  };

  const handleAdminReview = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setProcessingRequestId(requestId);
    const notes = reviewNotes[requestId] || '';
    const res = await adminApproveOrRejectCorrectionAction(requestId, decision, notes);
    if (res.success) {
      await loadCorrectionRequests();
    } else {
      alert(res.error || 'Failed to review request');
    }
    setProcessingRequestId(null);
  };

  const pendingCorrectionsCount = correctionRequests.filter((r) => r.status === 'PENDING').length;

  // Load audit data automatically when audit tab is selected
  useEffect(() => {
    if (activeTab === 'audit' && deliveredLectures.length === 0) {
      loadDeliveredLectures();
    }
  }, [activeTab]);

  const loadDeliveredLectures = async () => {
    setLoadingLectures(true);
    const res = await fetchDeliveredLecturesAuditAction();
    if (res.success && res.lectures) {
      setDeliveredLectures(res.lectures);
    }
    setLoadingLectures(false);
  };

  const filteredStudents = allStudents.filter((s) => {
    const q = searchStudent.toLowerCase();
    const name = s.user?.name?.toLowerCase() || '';
    const email = s.user?.email?.toLowerCase() || '';
    const tsId = s.user?.tsIdentity?.tsId?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || tsId.includes(q);
  });

  // Flat list of all sessions across all batches for calendar placement
  const allSessions = batches.flatMap((batch) =>
    (batch.sessions || []).map((session: any) => ({
      ...session,
      batchCode: batch.batchCode,
      batchTitle: batch.title,
      mentorName: batch.mentor?.user?.name || batch.mentor?.title || 'Unassigned Faculty',
      batch,
    }))
  );

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createBatchAction(formData);
    setLoading(false);

    if (!res.success) {
      setFeedbackMsg(res.error || 'Failed to create batch');
    } else {
      setFeedbackMsg('✓ Academic Cohort created and launched successfully in Database!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setIsCreateOpen(false);
      }, 1500);
    }
  };

  const handleAssignStudent = async (studentProfileId: string, batchId: string | null) => {
    setLoading(true);
    setFeedbackMsg(null);
    const res = await assignStudentToBatchAction(studentProfileId, batchId);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg('✓ Student batch alignment updated in Database!');
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const handleFastEnrollByTsId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForStudents || !tsIdInput.trim()) return;
    setLoading(true);
    setFeedbackMsg(null);

    const res = await assignStudentToBatchByTsIdAction(tsIdInput.trim(), selectedBatchForStudents.id);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg(`✓ Student ${res.studentName} (${res.tsId}) successfully enrolled into ${selectedBatchForStudents.batchCode}!`);
      setTsIdInput('');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(res.error || 'Failed to enroll student by Student ID.');
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForSessions || !newSessionTitle || !newSessionDate) return;
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData();
    formData.append('batchId', selectedBatchForSessions.id);
    formData.append('title', newSessionTitle);
    formData.append('sessionDate', newSessionDate);
    formData.append('agenda', newSessionAgenda);

    const res = await createBatchSessionAction(formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('✓ Lecture session successfully scheduled in Database!');
      setNewSessionTitle('');
      setNewSessionDate('');
      setNewSessionAgenda('');
      setTimeout(() => setFeedbackMsg(null), 2000);
    } else {
      setFeedbackMsg(res.error || 'Failed to schedule lecture session.');
    }
  };

  const openAttendanceModal = (session: any, batch: any) => {
    setSelectedSessionForAttendance({ session, batch });
    const initialStatus: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
    const initialRemarks: Record<string, string> = {};

    batch.students?.forEach((s: any) => {
      const existingRecord = session.attendanceRecords?.find((r: any) => r.studentId === s.id);
      initialStatus[s.id] = existingRecord?.status || 'PRESENT';
      initialRemarks[s.id] = existingRecord?.remarks || '';
    });

    setAttendanceDraft(initialStatus);
    setAttendanceRemarks(initialRemarks);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionForAttendance) return;
    setLoading(true);
    setFeedbackMsg(null);

    const records = Object.keys(attendanceDraft).map((studentId) => ({
      studentId,
      status: attendanceDraft[studentId],
      remarks: attendanceRemarks[studentId] || undefined,
    }));

    const res = await markBatchAttendanceAction(
      selectedSessionForAttendance.session.id,
      records
    );
    setLoading(false);

    if (res.success) {
      setFeedbackMsg(`✓ Lecture attendance marked for ${res.count} student(s) in Database!`);
      setTimeout(() => {
        setFeedbackMsg(null);
        setSelectedSessionForAttendance(null);
        loadDeliveredLectures();
      }, 1500);
    } else {
      setFeedbackMsg(res.error || 'Failed to mark attendance.');
    }
  };

  // Calendar Date Math
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth(); // 0-indexed
  const monthName = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleCalendarDayClick = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}T16:00`;
    setNewSessionDate(dateStr);

    if (batches.length > 0) {
      setSelectedBatchForSessions(batches[0]);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Header & DB Persistence Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/30 to-black/60 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] flex items-center gap-1">
              <Database className="w-3 h-3 text-red-400" />
              PostgreSQL DB Persisted
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Real-Time Batch & Attendance Synchronization
            </span>
          </div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            Academic Batches, Timetable Calendar & Attendance Audit
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Schedule lecture sessions via the interactive calendar, track mentor delivery on specific dates, and manage student attendance logs with full database storage.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.3)] border border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct New Batch</span>
        </button>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-red-500/20 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('cohorts')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'cohorts'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Academic Cohorts & Batches ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 text-red-300" />
          <span>Interactive Lecture Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Lecture Delivery & Attendance Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'corrections'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Attendance Corrections</span>
          {pendingCorrectionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500 text-black shadow-sm">
              {pendingCorrectionsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📌 TAB 1: ACADEMIC COHORTS & BATCHES */}
      {/* ========================================================================= */}
      {activeTab === 'cohorts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const studentCount = batch.students?.length || 0;
            const sessionCount = batch.sessions?.length || 0;

            return (
              <Card
                key={batch.id}
                className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white hover:border-red-500/40 transition-all rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(220,38,38,0.05)]"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-red-300 border-red-500/40 bg-red-950/40"
                      >
                        {batch.batchCode}
                      </Badge>
                      <Badge
                        className={`text-[10px] font-mono ${
                          batch.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {batch.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold font-sans text-white">
                      {batch.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3.5 text-xs text-slate-300">
                    <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                          Faculty Lead:
                        </span>
                        <strong className="text-white font-bold truncate max-w-[150px]">
                          {batch.mentor?.user?.name || 'Unassigned'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Schedule:
                        </span>
                        <span className="text-[10px] text-red-300 font-bold truncate max-w-[150px]">
                          {batch.schedule || 'Mon/Wed/Fri 7-9 PM'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          Lectures Conducted:
                        </span>
                        <strong className="text-white">{sessionCount} Live Classes</strong>
                      </div>
                    </div>

                    {/* Enrollment Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span>Enrolled Students:</span>
                        <strong className="text-red-300 font-bold">
                          {studentCount} / {batch.maxCapacity} Max
                        </strong>
                      </div>
                      <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-red-500/20">
                        <div
                          className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (studentCount / batch.maxCapacity) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 border-t border-red-500/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBatchForStudents(batch)}
                    className="flex-1 px-3 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-red-400" />
                    <span>Student Roster ({studentCount})</span>
                  </button>

                  <button
                    onClick={() => setSelectedBatchForSessions(batch)}
                    className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="View Live Lectures & Attendance"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attendance</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📅 TAB 2: INTERACTIVE LECTURE CALENDAR & CONDUCT SESSION */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="p-6 rounded-3xl bg-red-950/20 backdrop-blur-xl border border-red-500/20 space-y-6 shadow-[0_4px_25px_rgba(220,38,38,0.05)]">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
            <div>
              <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-400" />
                {monthName} Lecture Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any calendar date cell to schedule a lecture, or click existing session badges to review/mark attendance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl bg-black/50 hover:bg-red-950 text-slate-300 hover:text-white border border-red-500/30 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sm font-bold text-red-300 min-w-[120px] text-center">
                {monthName}
              </span>
              <button
                onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl bg-black/50 hover:bg-red-950 text-slate-300 hover:text-white border border-red-500/30 cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monthly Calendar Grid */}
          <div className="border border-red-500/20 rounded-2xl overflow-hidden bg-black/60">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-red-500/20 bg-red-950/40 text-center font-mono text-xs font-bold text-red-300 py-2.5">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-red-500/10 text-xs">
              {/* Padding Days Before First Day of Month */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`pad-${idx}`} className="h-28 bg-black/20 p-2 text-slate-700 pointer-events-none" />
              ))}

              {/* Days of the Month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedMonth = String(month + 1).padStart(2, '0');
                const formattedDay = String(dayNum).padStart(2, '0');
                const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

                // Filter sessions matching this calendar day
                const daySessions = allSessions.filter((sess: any) => {
                  const sDate = new Date(sess.sessionDate);
                  return (
                    sDate.getFullYear() === year &&
                    sDate.getMonth() === month &&
                    sDate.getDate() === dayNum
                  );
                });

                const isToday =
                  new Date().getFullYear() === year &&
                  new Date().getMonth() === month &&
                  new Date().getDate() === dayNum;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => handleCalendarDayClick(dayNum)}
                    className={`h-32 p-2 border-red-500/10 hover:bg-red-950/30 transition-colors cursor-pointer flex flex-col justify-between group ${
                      isToday ? 'bg-red-950/50 border border-red-500/40' : 'bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                          isToday
                            ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                            : 'text-slate-300 group-hover:text-red-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <span className="text-[9px] text-slate-600 group-hover:text-red-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        + Schedule
                      </span>
                    </div>

                    {/* Session Pills on this Date */}
                    <div className="space-y-1 overflow-y-auto max-h-20 my-1">
                      {daySessions.map((sess: any) => {
                        const sessTime = new Date(sess.sessionDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={sess.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openAttendanceModal(sess, sess.batch);
                            }}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-[10px] font-mono space-y-0.5 shadow-sm transition-all"
                            title="Click to Review & Mark Attendance"
                          >
                            <div className="flex items-center justify-between text-red-200">
                              <span className="font-bold truncate max-w-[80px]">{sess.batchCode}</span>
                              <span className="text-[9px] text-red-300 font-bold">{sessTime}</span>
                            </div>
                            <span className="text-white block truncate text-[10px]">{sess.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 TAB 3: DEDICATED LECTURE DELIVERY & ATTENDANCE AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-red-950/20 backdrop-blur-xl border border-red-500/20 space-y-6 shadow-[0_4px_25px_rgba(220,38,38,0.05)] font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
            <div>
              <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] mb-1">
                ATTENDANCE AUDIT LEDGER
              </Badge>
              <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Date & Lecture Inspection Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit every lecture delivered on any specific date, verify faculty agenda logs, and inspect student check-in records.
              </p>
            </div>

            <button
              onClick={loadDeliveredLectures}
              className="px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 space-y-3 font-mono text-xs">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-red-400" />
              Filter Delivered Lectures by Date, Cohort & Faculty
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">
                  Select Specific Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-black/60 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">
                  Filter by Cohort / Batch
                </label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full bg-[#1a080d] border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                >
                  <option value="ALL">-- All Batches --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.batchCode}>
                      {b.batchCode} ({b.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">
                  Filter by Faculty Lead
                </label>
                <select
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                  className="w-full bg-[#1a080d] border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                >
                  <option value="ALL">-- All Mentors --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.user?.name || m.title}>
                      {m.user?.name || m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(dateFilter || batchFilter !== 'ALL' || mentorFilter !== 'ALL') && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-300">
                  Showing filtered delivered lectures for:{' '}
                  <strong className="text-red-300">
                    {dateFilter ? new Date(dateFilter).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : 'All Dates'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('');
                    setBatchFilter('ALL');
                    setMentorFilter('ALL');
                  }}
                  className="text-[11px] text-red-300 hover:text-white underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Delivered Lectures Audit List */}
          {loadingLectures ? (
            <div className="p-8 text-center text-slate-400 font-mono">Loading delivered lectures ledger...</div>
          ) : deliveredLectures.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">No delivered lectures recorded yet.</div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              {deliveredLectures
                .filter((sess) => {
                  if (dateFilter) {
                    const sessDateStr = new Date(sess.sessionDate).toISOString().split('T')[0];
                    if (sessDateStr !== dateFilter) return false;
                  }
                  if (batchFilter !== 'ALL' && sess.batchCode !== batchFilter) return false;
                  if (mentorFilter !== 'ALL' && sess.mentorName !== mentorFilter) return false;
                  return true;
                })
                .map((sess) => {
                  const formattedDate = new Date(sess.sessionDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = new Date(sess.sessionDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sess.id}
                      className="p-5 rounded-2xl bg-black/40 border border-red-500/20 space-y-3 hover:border-red-500/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-950 text-red-300 border-red-500/30 text-[10px]">
                              {sess.batchCode}
                            </Badge>
                            <span className="font-bold text-white text-sm">{sess.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-300 block mt-1 font-sans">
                            Faculty Lead: <strong className="text-white">{sess.mentorName}</strong> ({sess.mentorEmail})
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                            {sess.attendancePercentage}% Attendance Rate
                          </Badge>
                          <span className="text-[11px] text-red-300 font-mono font-bold">
                            📅 {formattedDate} • {formattedTime}
                          </span>
                        </div>
                      </div>

                      {/* Agenda & Deliverables */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Delivered Topic & Agenda
                        </span>
                        <p className="text-slate-200 text-xs leading-relaxed font-sans">
                          {sess.agenda || 'Standard hands-on live lecture and lab instruction.'}
                        </p>
                      </div>

                      {/* Attendance Breakdown Pills */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                          <span className="text-slate-400 block">Present</span>
                          <span className="text-sm font-bold text-emerald-300 block">{sess.presentCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                          <span className="text-slate-400 block">Late</span>
                          <span className="text-sm font-bold text-amber-300 block">{sess.lateCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30">
                          <span className="text-slate-400 block">Absent</span>
                          <span className="text-sm font-bold text-red-300 block">{sess.absentCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                          <span className="text-slate-400 block">Excused</span>
                          <span className="text-sm font-bold text-purple-300 block">{sess.excusedCount}</span>
                        </div>
                      </div>

                      {/* Detailed Student Roster Accordion */}
                      {sess.records?.length > 0 && (
                        <div className="pt-2">
                          <details className="group">
                            <summary className="text-xs text-red-300 hover:text-white cursor-pointer select-none font-bold flex items-center gap-1.5 p-2 rounded-xl bg-red-950/30 border border-red-500/20">
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                              <span>View Lecture Student Check-In List ({sess.records.length} Students Tracked)</span>
                            </summary>

                            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-red-500/20 bg-black/60">
                              <table className="w-full text-left text-[11px] font-mono">
                                <thead>
                                  <tr className="bg-white/5 border-b border-red-500/20 text-slate-400 uppercase text-[10px]">
                                    <th className="p-2.5">Student</th>
                                    <th className="p-2.5">TS-ID</th>
                                    <th className="p-2.5">Status</th>
                                    <th className="p-2.5">Check-In Time</th>
                                    <th className="p-2.5">Remarks / Lab Hash</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-red-500/10">
                                  {sess.records.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                      <td className="p-2.5 font-bold text-white">{r.studentName}</td>
                                      <td className="p-2.5 text-red-300">{r.tsId}</td>
                                      <td className="p-2.5">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                            r.status === 'PRESENT'
                                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                              : r.status === 'ABSENT'
                                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                              : r.status === 'LATE'
                                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                          }`}
                                        >
                                          {r.status}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-slate-400">
                                        {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : 'N/A'}
                                      </td>
                                      <td className="p-2.5 text-slate-300 max-w-[200px] truncate font-sans">
                                        {r.remarks || 'Standard lecture check-in.'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛡️ TAB 4: MENTOR ATTENDANCE CORRECTION REQUESTS REVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'corrections' && (
        <div className="p-6 rounded-3xl bg-red-950/20 backdrop-blur-xl border border-red-500/20 space-y-6 shadow-[0_4px_25px_rgba(220,38,38,0.05)] font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px]">
                  IMMUTABLE AUDIT WORKFLOW
                </Badge>
                {pendingCorrectionsCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px]">
                    {pendingCorrectionsCount} PENDING ACTION
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Mentor Attendance Correction Requests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and approve or reject attendance correction requests submitted by mentors after the batch 24-hour attendance edit window has locked.
              </p>
            </div>

            <button
              onClick={loadCorrectionRequests}
              className="px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh Requests</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Filter Status:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => {
              const count =
                st === 'ALL'
                  ? correctionRequests.length
                  : correctionRequests.filter((r) => r.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setCorrectionFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    correctionFilter === st
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-black/40 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Requests List */}
          {loadingCorrections ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400">
              Loading attendance correction requests from database...
            </div>
          ) : correctionRequests.filter(
              (r) => correctionFilter === 'ALL' || r.status === correctionFilter
            ).length === 0 ? (
            <div className="p-10 rounded-2xl bg-black/40 border border-red-500/10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-mono text-slate-300">
                No correction requests found for filter: {correctionFilter}
              </p>
              <p className="text-xs text-slate-500">
                When mentors request an attendance change for past locked sessions, they will appear here for administrator review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {correctionRequests
                .filter(
                  (r) => correctionFilter === 'ALL' || r.status === correctionFilter
                )
                .map((req) => {
                  const studentName = req.student?.user?.name || 'Student';
                  const studentTsId = req.student?.tsId || 'N/A';
                  const mentorName = req.mentor?.user?.name || req.mentor?.title || 'Mentor';
                  const batchCode = req.batch?.batchCode || 'Cohort';
                  const sessionTitle = req.session?.title || 'Session';
                  const sessionDate = req.session?.date
                    ? new Date(req.session.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';
                  const requestDate = new Date(req.createdAt).toLocaleString();
                  const isProcessing = processingRequestId === req.id;

                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-black/50 border border-red-500/20 hover:border-amber-500/30 transition-all space-y-4 shadow-sm"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              req.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {req.status}
                          </span>
                          <Badge className="bg-red-950/60 text-red-300 border border-red-500/30 font-mono text-[10px]">
                            {batchCode}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">
                            Requested on: {requestDate}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 font-mono">
                          Mentor: <span className="text-white font-bold">{mentorName}</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        {/* Student Info */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">
                            Target Student
                          </span>
                          <p className="text-sm font-bold text-white font-sans">{studentName}</p>
                          <p className="text-xs text-red-400">{studentTsId}</p>
                        </div>

                        {/* Session Info */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">
                            Lecture Session
                          </span>
                          <p className="text-sm font-bold text-white font-sans truncate">
                            {sessionTitle}
                          </p>
                          <p className="text-xs text-slate-400">{sessionDate}</p>
                        </div>

                        {/* Status Change */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">
                            Attendance Change
                          </span>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                              {req.currentStatus}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.requestedStatus === 'PRESENT'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : req.requestedStatus === 'ABSENT'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : req.requestedStatus === 'LATE'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              }`}
                            >
                              {req.requestedStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mentor's Reason */}
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" />
                          Mentor Justification & Notes
                        </span>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed">
                          &quot;{req.reason}&quot;
                        </p>
                      </div>

                      {/* Administrative Review Section */}
                      {req.status === 'PENDING' ? (
                        <div className="pt-2 border-t border-white/10 space-y-3">
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 mb-1">
                              ADMIN AUDIT NOTES / REASON FOR DECISION:
                            </label>
                            <input
                              type="text"
                              value={reviewNotes[req.id] || ''}
                              onChange={(e) =>
                                setReviewNotes({ ...reviewNotes, [req.id]: e.target.value })
                              }
                              placeholder="e.g., Verified mentor medical justification receipt. Approved change."
                              className="w-full bg-black/60 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAdminReview(req.id, 'APPROVED')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isProcessing ? 'Processing...' : 'Approve Correction'}</span>
                            </button>

                            <button
                              disabled={isProcessing}
                              onClick={() => handleAdminReview(req.id, 'REJECTED')}
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{isProcessing ? 'Processing...' : 'Reject Request'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-white/10 text-xs font-mono flex items-center justify-between text-slate-400">
                          <div>
                            Reviewed on:{' '}
                            <span className="text-white">
                              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : 'N/A'}
                            </span>
                            {req.adminNotes && (
                              <span className="ml-3 italic text-slate-300 font-sans">
                                Note: &quot;{req.adminNotes}&quot;
                              </span>
                            )}
                          </div>
                          <Badge
                            className={`font-mono text-[10px] ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {req.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 🚀 CONDUCT NEW BATCH DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
          <DialogHeader className="border-b border-red-500/20 pb-3">
            <DialogTitle className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-400" />
              Conduct New Academic Batch / Cohort
            </DialogTitle>
          </DialogHeader>

          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
              {feedbackMsg}
            </div>
          )}

          <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-bold mb-1">BATCH CODE / ID *</label>
              <input
                name="batchCode"
                placeholder="e.g. TSE-COHORT-2026-GAMMA"
                required
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">COHORT TITLE *</label>
              <input
                name="title"
                placeholder="e.g. Advanced Bug Bounty & Web Application Security"
                required
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">COURSE CURRICULUM</label>
                <select
                  name="courseId"
                  className="w-full bg-[#1a080d] border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                >
                  <option value="">-- General Track --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">FACULTY MENTOR</label>
                <select
                  name="mentorId"
                  className="w-full bg-[#1a080d] border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                >
                  <option value="">-- Assign Mentor --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name || m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">START DATE *</label>
                <input type="date" name="startDate" required className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">MAX CAPACITY</label>
                <input type="number" name="maxCapacity" defaultValue="30" className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">SCHEDULE & TIMINGS</label>
              <input
                name="schedule"
                defaultValue="Mon / Wed / Fri • 7:00 PM - 9:00 PM IST"
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.3)]"
              >
                {loading ? 'Creating...' : 'Launch Batch'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 👥 BATCH STUDENT ROSTER & FAST ENROLLMENT BY TS-ID */}
      {selectedBatchForStudents && (
        <Dialog
          open={!!selectedBatchForStudents}
          onOpenChange={(open) => !open && setSelectedBatchForStudents(null)}
        >
          <DialogContent className="max-w-2xl bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 max-h-[88vh] flex flex-col font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] mb-1">
                    {selectedBatchForStudents.batchCode}
                  </Badge>
                  <DialogTitle className="text-lg font-bold font-mono text-white">
                    Batch Student Roster & TS-ID Enrollment
                  </DialogTitle>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-red-300 border-red-500/30">
                  {selectedBatchForStudents.students?.length || 0} Students Enrolled
                </Badge>
              </div>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <div className="py-3 space-y-4 flex-1 overflow-hidden flex flex-col text-xs font-mono">
              <form onSubmit={handleFastEnrollByTsId} className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-2">
                <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-red-400" />
                  Fast Enroll Student by Student ID (TS-ID / Email)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Student TS-ID (e.g. TS-C126, TS-A103) or Email..."
                    value={tsIdInput}
                    onChange={(e) => setTsIdInput(e.target.value)}
                    className="flex-1 bg-black/60 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.3)] whitespace-nowrap"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  placeholder="Filter student directory by Name, Email, or TS-ID..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full bg-black/50 border border-red-500/20 text-white pl-9 pr-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-red-500/20 rounded-2xl divide-y divide-red-500/10 bg-black/40">
                {filteredStudents.map((student) => {
                  const isAssigned = student.batchId === selectedBatchForStudents.id;
                  const tsId = student.user?.tsIdentity?.tsId || 'TS-STUDENT';

                  return (
                    <div
                      key={student.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-red-950/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {student.user?.name || 'Student'}
                          </span>
                          <span className="font-mono text-[10px] text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                            {tsId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-sans">
                          {student.user?.email} • Goal: {student.careerGoal || 'Cyber Security'}
                        </span>
                      </div>

                      {isAssigned ? (
                        <button
                          disabled={loading}
                          onClick={() => handleAssignStudent(student.id, null)}
                          className="px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
                        >
                          Remove from Batch
                        </button>
                      ) : (
                        <button
                          disabled={loading}
                          onClick={() =>
                            handleAssignStudent(student.id, selectedBatchForStudents.id)
                          }
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-red-400" />
                          <span>Assign</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-red-500/20">
              <button
                onClick={() => setSelectedBatchForStudents(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 📅 BATCH SESSIONS & LECTURE ATTENDANCE LEDGER */}
      {selectedBatchForSessions && (
        <Dialog
          open={!!selectedBatchForSessions}
          onOpenChange={(open) => !open && setSelectedBatchForSessions(null)}
        >
          <DialogContent className="max-w-2xl bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 max-h-[88vh] flex flex-col font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] mb-1">
                    {selectedBatchForSessions.batchCode}
                  </Badge>
                  <DialogTitle className="text-lg font-bold font-mono text-white">
                    Conducted Lectures & Attendance Ledger
                  </DialogTitle>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-red-300 border-red-500/30">
                  {selectedBatchForSessions.sessions?.length || 0} Lectures Conducted
                </Badge>
              </div>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <div className="py-3 space-y-4 flex-1 overflow-y-auto text-xs font-mono">
              <form onSubmit={handleCreateSession} className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-3">
                <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  Schedule / Conduct Lecture Session
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Lecture Title (e.g. Session 3: Packet Analysis)..."
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    required
                    className="bg-black/60 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                  />
                  <input
                    type="datetime-local"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    required
                    className="bg-black/60 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Session Agenda / Target Labs..."
                  value={newSessionAgenda}
                  onChange={(e) => setNewSessionAgenda(e.target.value)}
                  className="w-full bg-black/60 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                >
                  Schedule Session
                </button>
              </form>

              <div className="space-y-2">
                <span className="font-bold text-slate-300 block uppercase text-[11px]">
                  Conducted Lecture Sessions ({selectedBatchForSessions.sessions?.length || 0})
                </span>

                {(!selectedBatchForSessions.sessions || selectedBatchForSessions.sessions.length === 0) ? (
                  <div className="p-6 text-center text-slate-500 font-sans border border-red-500/20 rounded-2xl">
                    No lecture sessions recorded for this batch yet.
                  </div>
                ) : (
                  selectedBatchForSessions.sessions.map((sess: any) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-950 text-red-300 border-red-500/30 text-[9px]">
                            Session {sess.sessionNumber}
                          </Badge>
                          <span className="font-bold text-white text-xs">{sess.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          Date: {new Date(sess.sessionDate).toLocaleString()} • Duration: {sess.durationMins}m
                        </span>
                        {sess.agenda && (
                          <span className="text-[10px] text-red-300 block font-sans mt-0.5">
                            Agenda: {sess.agenda}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => openAttendanceModal(sess, selectedBatchForSessions)}
                        className="px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark / Review Attendance ({sess.attendanceRecords?.length || 0})</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-red-500/20">
              <button
                onClick={() => setSelectedBatchForSessions(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 📝 ATTENDANCE MARKING MODAL FOR A SPECIFIC SESSION */}
      {selectedSessionForAttendance && (
        <Dialog
          open={!!selectedSessionForAttendance}
          onOpenChange={(open) => !open && setSelectedSessionForAttendance(null)}
        >
          <DialogContent className="max-w-2xl bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 max-h-[88vh] flex flex-col font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] mb-1">
                    ATTENDANCE LEDGER
                  </Badge>
                  <DialogTitle className="text-base font-bold font-mono text-white">
                    {selectedSessionForAttendance.session.title}
                  </DialogTitle>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedSessionForAttendance.batch.batchCode}
                </span>
              </div>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <div className="py-3 space-y-3 flex-1 overflow-y-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-slate-300 text-[11px]">
                Toggle attendance status for each enrolled student in this cohort and click <strong>Save Attendance Ledger</strong>.
              </div>

              <div className="border border-red-500/20 rounded-2xl divide-y divide-red-500/10 bg-black/40">
                {selectedSessionForAttendance.batch.students?.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No students currently enrolled in this batch. Fast-enroll students via Student Roster.
                  </div>
                ) : (
                  selectedSessionForAttendance.batch.students.map((student: any) => {
                    const status = attendanceDraft[student.id] || 'PRESENT';
                    const tsId = student.user?.tsIdentity?.tsId || 'TS-STUDENT';

                    return (
                      <div key={student.id} className="p-3 space-y-2 hover:bg-white/5 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-white text-xs block">
                              {student.user?.name}
                            </span>
                            <span className="text-[10px] text-red-300 block">
                              {tsId} • {student.user?.email}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  setAttendanceDraft((prev) => ({ ...prev, [student.id]: st }))
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  status === st
                                    ? st === 'PRESENT'
                                      ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                      : st === 'ABSENT'
                                      ? 'bg-red-600 text-white border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                      : st === 'LATE'
                                      ? 'bg-amber-500 text-black border border-amber-400'
                                      : 'bg-purple-500 text-white border border-purple-400'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. Completed lab exercise early)..."
                          value={attendanceRemarks[student.id] || ''}
                          onChange={(e) =>
                            setAttendanceRemarks((prev) => ({ ...prev, [student.id]: e.target.value }))
                          }
                          className="w-full bg-black/60 border border-red-500/20 text-white px-3 py-1.5 rounded-xl text-[11px] placeholder:text-slate-600"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
              <button
                type="button"
                onClick={() => setSelectedSessionForAttendance(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveAttendance}
                className="px-5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                {loading ? 'Saving...' : 'Save Attendance Ledger'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
