'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  CheckCircle2,
  Clock,
  Lock,
  Layers,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { QuickAttendanceModal } from './quick-attendance-modal';
import { RecordLectureModal } from './record-lecture-modal';
import { markBatchAttendanceWithLockCheckAction } from '@/features/mentor/actions/mentor-workspace.actions';
import { createBatchSessionAction } from '@/features/batch/actions/batch.actions';

export interface DashboardAttendanceCastSectionProps {
  batches: any[];
}

export function DashboardAttendanceCastSection({
  batches,
}: DashboardAttendanceCastSectionProps) {
  const router = useRouter();

  // Selected Batch filter ('ALL' or batch.id)
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches.length > 0 ? batches[0].id : 'ALL'
  );

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  // Modal states
  const [activeModalSession, setActiveModalSession] = useState<any | null>(null);
  const [activeModalBatch, setActiveModalBatch] = useState<any | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRecordLectureModalOpen, setIsRecordLectureModalOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);

  // Quick 1-tap all present loading state
  const [oneTapLoadingId, setOneTapLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ad-hoc session creation form inputs
  const [newSessionBatchId, setNewSessionBatchId] = useState<string>(
    batches.length > 0 ? batches[0].id : ''
  );
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('16:00');
  const [newSessionDuration, setNewSessionDuration] = useState('120');
  const [newSessionAgenda, setNewSessionAgenda] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // Map batches for fast lookup
  const batchesMap = useMemo(() => {
    const map: Record<string, any> = {};
    batches.forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, [batches]);

  // Extract all sessions across assigned batches
  const allSessions = useMemo(() => {
    const list: any[] = [];
    batches.forEach((b) => {
      (b.sessions || []).forEach((s: any) => {
        list.push({
          ...s,
          batch: b,
        });
      });
    });
    return list;
  }, [batches]);

  // Helper to get local YYYY-MM-DD string
  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedDateStr = toDateString(selectedDate);

  // Calendar month details
  const viewYear = calendarMonth.getFullYear();
  const viewMonth = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Sessions map indexed by YYYY-MM-DD for visual calendar dot indicators
  const sessionsByDate = useMemo(() => {
    const map: Record<string, { total: number; marked: number; sessions: any[] }> = {};
    allSessions.forEach((s) => {
      if (selectedBatchId !== 'ALL' && s.batchId !== selectedBatchId) return;
      const sDate = new Date(s.sessionDate);
      const ds = toDateString(sDate);
      if (!map[ds]) {
        map[ds] = { total: 0, marked: 0, sessions: [] };
      }
      map[ds].total++;
      map[ds].sessions.push(s);
      if (s.attendanceRecords && s.attendanceRecords.length > 0) {
        map[ds].marked++;
      }
    });
    return map;
  }, [allSessions, selectedBatchId]);

  // Sessions on the currently selected date
  const selectedDateSessions = useMemo(() => {
    return allSessions.filter((s) => {
      if (selectedBatchId !== 'ALL' && s.batchId !== selectedBatchId) return false;
      const sDate = new Date(s.sessionDate);
      return toDateString(sDate) === selectedDateStr;
    });
  }, [allSessions, selectedBatchId, selectedDateStr]);

  // Quick jump date helpers
  const handleJumpToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleJumpToYesterday = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setSelectedDate(y);
    setCalendarMonth(new Date(y.getFullYear(), y.getMonth(), 1));
  };

  const handleJumpToTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setSelectedDate(t);
    setCalendarMonth(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCalendarMonth(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(viewYear, viewMonth + 1, 1));
  };

  // 1-Tap Mark All Present
  const handleOneTapAllPresent = async (session: any, batch: any) => {
    setOneTapLoadingId(session.id);
    setFeedbackMsg(null);

    const students = batch?.students || [];
    if (students.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'No students enrolled in this batch to cast attendance.' });
      setOneTapLoadingId(null);
      return;
    }

    const records = students.map((sp: any) => ({
      studentId: sp.id,
      status: 'PRESENT' as const,
      remarks: 'Quick Cast: 1-Tap All Present confirmed by Mentor',
    }));

    const res = await markBatchAttendanceWithLockCheckAction(session.id, batch.id, records);
    setOneTapLoadingId(null);

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Successfully cast attendance for ${records.length} students in ${batch.batchCode}!`,
      });
      router.refresh();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to cast attendance.',
      });
    }
  };

  // Open Full Attendance Modal
  const handleOpenAttendanceModal = (session: any, batch: any) => {
    setActiveModalSession(session);
    setActiveModalBatch(batch);
    setIsAttendanceModalOpen(true);
  };

  // Open Lecture Conduction Modal
  const handleOpenRecordLectureModal = (session: any, batch: any) => {
    setActiveModalSession(session);
    setActiveModalBatch(batch);
    setIsRecordLectureModalOpen(true);
  };

  // Create Ad-hoc Lecture Session on selected date
  const handleCreateAdHocSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSession(true);
    setFeedbackMsg(null);

    const targetBatchId = newSessionBatchId || (selectedBatchId !== 'ALL' ? selectedBatchId : batches[0]?.id);
    if (!targetBatchId || !newSessionTitle) {
      setFeedbackMsg({ type: 'error', text: 'Please choose a cohort and enter a lecture title.' });
      setCreatingSession(false);
      return;
    }

    const sessionDateTime = `${selectedDateStr}T${newSessionTime || '16:00'}:00`;

    const formData = new FormData();
    formData.append('batchId', targetBatchId);
    formData.append('title', newSessionTitle);
    formData.append('sessionDate', sessionDateTime);
    formData.append('durationMins', newSessionDuration || '120');
    formData.append('agenda', newSessionAgenda);

    const res = await createBatchSessionAction(formData);
    setCreatingSession(false);

    if (res.success) {
      setIsCreateSessionOpen(false);
      setNewSessionTitle('');
      setNewSessionAgenda('');
      setFeedbackMsg({
        type: 'success',
        text: 'Lecture session scheduled successfully! You can now cast attendance.',
      });
      router.refresh();

      // Automatically open attendance casting for this new session
      if (res.session) {
        const parentBatch = batchesMap[targetBatchId];
        handleOpenAttendanceModal(res.session, parentBatch);
      }
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to schedule session.',
      });
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[#04111C]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6 font-sans">
      {/* 🟢 TOP HEADER WITH LIVE CONSOLE TELEMETRY */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#C6FF34]" />
              BATCH ATTENDANCE CASTING CONSOLE
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-white/10 font-mono text-[10px]">
              24H LOCK ENFORCED
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            Cast Attendance By Date & Cohort
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans max-w-3xl">
            Select any assigned cohort and pick any calendar date to inspect conduction records, execute 1-tap student check-ins, and record topics covered.
          </p>
        </div>

        {/* Global Action Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => {
              setNewSessionBatchId(selectedBatchId !== 'ALL' ? selectedBatchId : batches[0]?.id || '');
              setIsCreateSessionOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Conduct / Schedule Lecture</span>
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-[#C6FF34]/15 border border-[#C6FF34]/30 text-[#C6FF34]'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs text-slate-400 hover:text-white font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🚀 TWO-COLUMN WORKSPACE: LEFT = CALENDAR & BATCH SELECTOR | RIGHT = SESSION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* 🎛️ LEFT COLUMN: COHORT SELECTOR & INTERACTIVE CALENDAR (5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cohort Selector Dropdown & Pills */}
          <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C6FF34]" />
                Select Cohort Batch
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {batches.length} Assigned
              </span>
            </div>

            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full bg-[#141414] border border-white/20 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C6FF34] cursor-pointer"
            >
              <option value="ALL">All Assigned Cohorts ({batches.length})</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} — {b.title} ({b.students?.length || 0} students)
                </option>
              ))}
            </select>

            {/* Quick Cohort Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                onClick={() => setSelectedBatchId('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  selectedBatchId === 'ALL'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                All
              </button>
              {batches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer truncate max-w-[140px] ${
                    selectedBatchId === b.id
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={b.title}
                >
                  {b.batchCode}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Timetable Calendar Picker */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            {/* Month Navigation & Quick Jump */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#C6FF34]" />
                {monthName}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Date Chips */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleJumpToYesterday}
                className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 text-center transition-colors cursor-pointer"
              >
                Yesterday
              </button>
              <button
                onClick={handleJumpToToday}
                className="flex-1 py-1 px-2 rounded-lg bg-[#C6FF34]/15 hover:bg-[#C6FF34]/25 border border-[#C6FF34]/30 text-[10px] font-mono font-bold text-[#C6FF34] text-center transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleJumpToTomorrow}
                className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 text-center transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
            </div>

            {/* 7-Column Day Names */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-400 font-bold border-b border-white/5 pb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 rounded-xl opacity-0" />
              ))}

              {/* Day cells */}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(viewYear, viewMonth, dayNum);
                const cellDateStr = toDateString(cellDate);
                const isSelected = cellDateStr === selectedDateStr;
                const isToday = cellDateStr === toDateString(new Date());

                const dateInfo = sessionsByDate[cellDateStr];
                const hasSessions = dateInfo && dateInfo.total > 0;
                const allMarked = hasSessions && dateInfo.marked === dateInfo.total;
                const anyPending = hasSessions && dateInfo.marked < dateInfo.total;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDate(cellDate)}
                    className={`h-9 rounded-xl font-mono text-xs flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C6FF34] text-[#04111C] font-bold shadow-[0_0_15px_rgba(198,255,52,0.4)] scale-105 z-10'
                        : isToday
                        ? 'bg-white/10 border border-[#C6FF34]/60 text-white font-bold'
                        : 'bg-black/30 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    <span>{dayNum}</span>

                    {/* Status Dot */}
                    {hasSessions && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                          isSelected
                            ? 'bg-[#04111C]'
                            : allMarked
                            ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]'
                            : anyPending
                            ? 'bg-amber-400 animate-pulse shadow-[0_0_5px_rgba(251,191,36,0.8)]'
                            : 'bg-slate-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Attendance Cast
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Check-in Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34]" />
                Selected
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 📋 RIGHT COLUMN: ATTENDANCE CASTING CARDS FOR SELECTED DATE (7 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Date Context Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                Selected Timetable Date:
              </span>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-[#C6FF34]" />
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-white/5 text-slate-300 font-mono text-xs border-white/10">
                {selectedDateSessions.length} {selectedDateSessions.length === 1 ? 'Lecture' : 'Lectures'} Found
              </Badge>
              {selectedBatchId !== 'ALL' && batchesMap[selectedBatchId] && (
                <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                  {batchesMap[selectedBatchId].batchCode}
                </Badge>
              )}
            </div>
          </div>

          {/* Sessions List */}
          {selectedDateSessions.length === 0 ? (
            /* Empty State for Selected Date */
            <div className="p-8 md:p-10 rounded-3xl bg-black/40 border border-white/10 text-center space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 w-fit mx-auto text-slate-400">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-mono">
                  No Lecture Sessions on this Date
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                  No class is currently scheduled for{' '}
                  <strong className="text-slate-200">{selectedDateStr}</strong> in{' '}
                  <span className="text-[#C6FF34]">
                    {selectedBatchId === 'ALL' ? 'assigned batches' : batchesMap[selectedBatchId]?.batchCode || 'this batch'}
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    setNewSessionBatchId(selectedBatchId !== 'ALL' ? selectedBatchId : batches[0]?.id || '');
                    setIsCreateSessionOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Schedule Lecture on this Date</span>
                </Button>

                <button
                  onClick={handleJumpToToday}
                  className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer py-1"
                >
                  Jump to Today's Sessions
                </button>
              </div>
            </div>
          ) : (
            /* Render Each Lecture Session Card */
            <div className="space-y-4">
              {selectedDateSessions.map((session) => {
                const parentBatch = session.batch || batchesMap[session.batchId] || {};
                const studentCount = parentBatch.students?.length || 0;
                const attendanceRecords = session.attendanceRecords || [];
                const isMarked = attendanceRecords.length > 0;
                const presentCount = attendanceRecords.filter(
                  (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
                ).length;
                const attendancePercent =
                  studentCount > 0 ? Math.round((presentCount / studentCount) * 100) : 100;

                // Check 24-hour attendance locking window
                const lockHours = parentBatch.attendanceLockHours || 24;
                const sDate = new Date(session.sessionDate);
                const lockDeadline = new Date(sDate.getTime() + lockHours * 60 * 60 * 1000);
                const isLocked = new Date() > lockDeadline;

                const sessionTime = new Date(session.sessionDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isOneTapLoading = oneTapLoadingId === session.id;

                return (
                  <div
                    key={session.id}
                    className="p-5 md:p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-sm"
                  >
                    {/* Top Row: Badges & Timing */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                          {parentBatch.batchCode || 'COHORT'}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-white">
                          Session #{session.sessionNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-400" suppressHydrationWarning>
                          • {sessionTime} ({session.durationMins || 120} mins)
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isLocked ? (
                          <Badge className="bg-red-500/15 text-red-300 border border-red-500/30 font-mono text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-400" />
                            24H LOCK EXPIRED
                          </Badge>
                        ) : isMarked ? (
                          <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ATTENDANCE CAST ({attendancePercent}%)
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            ATTENDANCE PENDING
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Session Title & Curriculum Details */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-white font-sans">
                        {session.title}
                      </h4>
                      {session.agenda && (
                        <p className="text-xs text-slate-400 font-sans line-clamp-2">
                          {session.agenda}
                        </p>
                      )}
                      {session.topicsCovered && (
                        <div className="mt-1 text-xs text-slate-300 bg-white/[0.03] border border-white/5 rounded-xl p-2 font-mono">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">
                            Delivered Topics:
                          </span>
                          {session.topicsCovered}
                        </div>
                      )}
                    </div>

                    {/* Attendance Vitals Progress Bar */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Student Participation:
                        </span>
                        <span className="font-bold text-white">
                          {isMarked
                            ? `${presentCount} / ${studentCount} Present (${attendancePercent}%)`
                            : `0 / ${studentCount} Marked`}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isMarked
                              ? attendancePercent >= 80
                                ? 'bg-[#C6FF34]'
                                : 'bg-amber-400'
                              : 'bg-transparent'
                          }`}
                          style={{ width: `${isMarked ? attendancePercent : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* 1-Tap All Present Quick Action */}
                        {!isLocked && (
                          <Button
                            onClick={() => handleOneTapAllPresent(session, parentBatch)}
                            disabled={isOneTapLoading}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {isOneTapLoading ? 'Casting...' : '1-Tap All Present'}
                            </span>
                          </Button>
                        )}

                        {/* Open Comprehensive Attendance Sheet Modal */}
                        <Button
                          onClick={() => handleOpenAttendanceModal(session, parentBatch)}
                          size="sm"
                          className={`font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                            isMarked
                              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                              : 'bg-white hover:bg-slate-200 text-black shadow-md'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {isLocked
                              ? 'Inspect Attendance / Correction'
                              : isMarked
                              ? 'Review & Edit Sheet'
                              : 'Cast Attendance Sheet'}
                          </span>
                        </Button>
                      </div>

                      {/* Record Lecture Notes Button */}
                      <Button
                        onClick={() => handleOpenRecordLectureModal(session, parentBatch)}
                        variant="outline"
                        size="sm"
                        className="border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Log Topics & Notes</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 QUICK ATTENDANCE CAST MODAL */}
      {activeModalSession && activeModalBatch && (
        <QuickAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          session={activeModalSession}
          batch={activeModalBatch}
          onSuccess={() => {
            setIsAttendanceModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* 🚀 RECORD LECTURE TOPICS MODAL */}
      {activeModalSession && activeModalBatch && (
        <RecordLectureModal
          isOpen={isRecordLectureModalOpen}
          onClose={() => setIsRecordLectureModalOpen(false)}
          session={activeModalSession}
          batchId={activeModalBatch.id}
          modules={activeModalBatch.course?.modules || []}
          onSuccess={() => {
            setIsRecordLectureModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* 🚀 CONDUCT / SCHEDULE AD-HOC LECTURE DIALOG */}
      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/20 text-white rounded-3xl p-6 font-sans">
          <DialogHeader className="border-b border-white/10 pb-3">
            <DialogTitle className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C6FF34]" />
              Schedule / Conduct Lecture on {selectedDateStr}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAdHocSession} className="space-y-3.5 text-xs font-mono pt-2">
            <div>
              <label className="block text-slate-300 font-bold mb-1">TARGET COHORT BATCH *</label>
              <select
                value={newSessionBatchId}
                onChange={(e) => setNewSessionBatchId(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchCode} — {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">LECTURE TITLE *</label>
              <Input
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="e.g. Session #4 — Reverse Engineering Binaries"
                required
                className="bg-black/60 border-white/20 text-white font-sans text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">START TIME</label>
                <Input
                  type="time"
                  value={newSessionTime}
                  onChange={(e) => setNewSessionTime(e.target.value)}
                  className="bg-black/60 border-white/20 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">DURATION (MINS)</label>
                <Input
                  type="number"
                  value={newSessionDuration}
                  onChange={(e) => setNewSessionDuration(e.target.value)}
                  placeholder="120"
                  className="bg-black/60 border-white/20 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">SESSION AGENDA / TOPICS</label>
              <Textarea
                value={newSessionAgenda}
                onChange={(e) => setNewSessionAgenda(e.target.value)}
                placeholder="Brief outline of topics to cover in this session..."
                className="bg-black/60 border-white/20 text-white font-sans text-xs min-h-[70px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateSessionOpen(false)}
                className="w-1/3 border-white/20 text-slate-300 hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingSession}
                className="w-2/3 bg-[#C6FF34] hover:bg-[#b2ee24] text-[#04111C] font-bold text-xs font-mono"
              >
                {creatingSession ? 'Scheduling...' : 'Create & Open Attendance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
