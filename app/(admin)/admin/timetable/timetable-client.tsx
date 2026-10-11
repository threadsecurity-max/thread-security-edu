'use client';

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Layers,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  checkSessionConflictAction,
  rescheduleSessionAction,
  scheduleNewLectureAction,
} from '@/features/batches/actions/timetable.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SessionItem {
  id: string;
  batchId: string;
  sessionNumber: number;
  title: string;
  sessionDate: string | Date;
  durationMins: number;
  agenda?: string | null;
  batch?: {
    id: string;
    batchCode: string;
    title: string;
    mentor?: {
      user?: {
        name: string | null;
        email: string;
      };
    } | null;
  };
}

interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
  schedule?: string | null;
  sessions: SessionItem[];
  mentor?: {
    id: string;
    user?: {
      name: string | null;
      email: string;
    };
  } | null;
}

interface TimetableClientProps {
  initialBatches: BatchItem[];
  mentors: any[];
  courses: any[];
}

export function TimetableClient({ initialBatches, mentors, courses }: TimetableClientProps) {
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    session: SessionItem | null;
    newDate: string;
    newDuration: number;
    reason: string;
    conflicts: any[];
    forceOverride: boolean;
    error: string | null;
  }>({
    isOpen: false,
    session: null,
    newDate: '',
    newDuration: 120,
    reason: '',
    conflicts: [],
    forceOverride: false,
    error: null,
  });

  // Schedule New Session Modal State
  const [newSessionModal, setNewSessionModal] = useState({
    isOpen: false,
    batchId: initialBatches[0]?.id || '',
    title: '',
    sessionDate: '',
    durationMins: 120,
    agenda: '',
  });

  // Collect all sessions across all batches
  const allSessions: SessionItem[] = batches.flatMap((b) =>
    (b.sessions || []).map((s) => ({
      ...s,
      batch: {
        id: b.id,
        batchCode: b.batchCode,
        title: b.title,
        mentor: b.mentor,
      },
    }))
  );

  // Sort sessions chronologically
  const sortedSessions = [...allSessions].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  const filteredSessions = sortedSessions.filter((s) => {
    const matchesBatch = selectedBatchId === 'ALL' || s.batchId === selectedBatchId;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batch?.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.batch?.mentor?.user?.name &&
        s.batch.mentor.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBatch && matchesSearch;
  });

  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);

  // Open reschedule modal
  const handleOpenReschedule = (session: SessionItem) => {
    const d = new Date(session.sessionDate);
    const dateStr = d.toISOString().slice(0, 16);
    setRescheduleModal({
      isOpen: true,
      session,
      newDate: dateStr,
      newDuration: session.durationMins || 120,
      reason: '',
      conflicts: [],
      forceOverride: false,
      error: null,
    });
  };

  const handleValidateConflict = async (newDateStr: string) => {
    if (!rescheduleModal.session || !newDateStr) return;

    const res = await checkSessionConflictAction({
      targetSessionId: rescheduleModal.session.id,
      batchId: rescheduleModal.session.batchId,
      sessionDate: newDateStr,
      durationMins: rescheduleModal.newDuration,
    });

    if (res.success && res.hasConflict) {
      setRescheduleModal((prev) => ({
        ...prev,
        conflicts: res.conflicts || [],
        error: 'Conflict detected with another lecture scheduled in this time window.',
      }));
    } else {
      setRescheduleModal((prev) => ({
        ...prev,
        conflicts: [],
        error: null,
      }));
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal.session || !rescheduleModal.newDate) return;

    startTransition(async () => {
      const res = (await rescheduleSessionAction({
        sessionId: rescheduleModal.session!.id,
        newSessionDate: rescheduleModal.newDate,
        newDurationMins: rescheduleModal.newDuration,
        reason: rescheduleModal.reason,
        forceOverride: rescheduleModal.forceOverride,
      })) as any;

      if (res.success && res.session) {
        setBatches((prev) =>
          prev.map((b) => ({
            ...b,
            sessions: b.sessions.map((s) => (s.id === res.session.id ? res.session : s)),
          }))
        );
        setRescheduleModal({
          isOpen: false,
          session: null,
          newDate: '',
          newDuration: 120,
          reason: '',
          conflicts: [],
          forceOverride: false,
          error: null,
        });
      } else {
        setRescheduleModal((prev) => ({
          ...prev,
          error: res.error || 'Failed to reschedule lecture.',
          conflicts: res.conflicts || prev.conflicts,
        }));
      }
    });
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionModal.batchId || !newSessionModal.title || !newSessionModal.sessionDate) return;

    startTransition(async () => {
      const res = await scheduleNewLectureAction({
        batchId: newSessionModal.batchId,
        title: newSessionModal.title,
        sessionDate: newSessionModal.sessionDate,
        durationMins: newSessionModal.durationMins,
        agenda: newSessionModal.agenda,
      });

      if (res.success && res.session) {
        setBatches((prev) =>
          prev.map((b) =>
            b.id === newSessionModal.batchId
              ? { ...b, sessions: [...b.sessions, res.session] }
              : b
          )
        );
        setNewSessionModal({
          isOpen: false,
          batchId: batches[0]?.id || '',
          title: '',
          sessionDate: '',
          durationMins: 120,
          agenda: '',
        });
      } else {
        alert(res.error || 'Failed to schedule lecture.');
      }
    });
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Timetable &amp; Batch Lecture Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master timetable aligned directly to cohorts, lecture conduction slots, and conflict prevention.
          </p>
        </div>

        <button
          onClick={() => setNewSessionModal((prev) => ({ ...prev, isOpen: true }))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Lecture</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Sessions</span>
            <Layers className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allSessions.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Conducted &amp; Scheduled</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Cohorts</span>
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{batches.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Running Batches</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Schedule Alignment</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">Aligned</div>
          <div className="text-[11px] text-slate-400 mt-1">Batch Timetable Integrity</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Faculty Mentors</span>
            <User className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{mentors.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Assigned Instructors</div>
        </div>
      </div>

      {/* Cohort Alignment Bar (Task 5: Aligned to Batches) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Align To Batch:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600 w-full md:w-80"
          >
            <option value="ALL">All Academic Batches ({batches.length})</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} — {b.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lectures, mentors, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      {/* Selected Batch Summary Banner */}
      {selectedBatchObj && (
        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-violet-600 text-white font-mono text-[10px] font-bold">
                {selectedBatchObj.batchCode}
              </span>
              <strong className="text-slate-900 text-sm">{selectedBatchObj.title}</strong>
            </div>
            <div className="text-slate-600 flex items-center gap-3 text-[11px]">
              <span>Faculty: <strong>{selectedBatchObj.mentor?.user?.name || 'Unassigned'}</strong></span>
              <span>Schedule: <strong>{selectedBatchObj.schedule || 'Regular Timings'}</strong></span>
            </div>
          </div>

          <span className="text-violet-700 font-semibold px-3 py-1 rounded-full bg-white border border-violet-200 text-xs">
            {selectedBatchObj.sessions?.length || 0} Scheduled Lectures
          </span>
        </div>
      )}

      {/* Chronological Sessions Timeline */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No scheduled lectures found matching criteria.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const dateObj = new Date(session.sessionDate);
            const isPast = dateObj.getTime() < Date.now();

            return (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-violet-700">
                      {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-slate-900 leading-none mt-0.5">
                      {dateObj.getDate()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-bold border border-violet-200">
                        {session.batch?.batchCode}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Session #{session.sessionNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isPast
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isPast ? 'Conducted' : 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Cohort: {session.batch?.title}</span>
                      <span>•</span>
                      <span>Faculty: {session.batch?.mentor?.user?.name || 'Unassigned Lead'}</span>
                      <span>•</span>
                      <span>Duration: {session.durationMins || 120} mins</span>
                    </div>

                    {session.agenda && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        Agenda: {session.agenda}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenReschedule(session)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-violet-600" />
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Lecture Modal */}
      {rescheduleModal.isOpen && rescheduleModal.session && (
        <Dialog
          open={rescheduleModal.isOpen}
          onOpenChange={(open) => !open && setRescheduleModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-violet-600" />
                Reschedule Lecture
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900">
                  {rescheduleModal.session.batch?.batchCode}: Session #{rescheduleModal.session.sessionNumber}
                </div>
                <div className="text-slate-600">{rescheduleModal.session.title}</div>
                <div className="text-[11px] text-slate-400">
                  Current Date: {new Date(rescheduleModal.session.sessionDate).toLocaleString()}
                </div>
              </div>

              {rescheduleModal.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{rescheduleModal.error}</div>
                    {rescheduleModal.conflicts.map((c, idx) => (
                      <div key={idx} className="text-[11px] text-rose-700 mt-1">
                        • {c.batchCode}: &quot;{c.title}&quot; ({c.conflictType})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleModal.newDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRescheduleModal((prev) => ({ ...prev, newDate: val }));
                    handleValidateConflict(val);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    step="15"
                    value={rescheduleModal.newDuration}
                    onChange={(e) =>
                      setRescheduleModal((prev) => ({
                        ...prev,
                        newDuration: parseInt(e.target.value) || 120,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rescheduling Reason
                  </label>
                  <input
                    type="text"
                    value={rescheduleModal.reason}
                    onChange={(e) =>
                      setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="e.g. Mentor availability"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
                >
                  {isPending ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule New Lecture Modal */}
      {newSessionModal.isOpen && (
        <Dialog
          open={newSessionModal.isOpen}
          onOpenChange={(open) => !open && setNewSessionModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-600" />
                Schedule Lecture Session
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateSession} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Batch *</label>
                <select
                  value={newSessionModal.batchId}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, batchId: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hands-On Exploitation &amp; Privilege Escalation"
                  value={newSessionModal.title}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newSessionModal.sessionDate}
                    onChange={(e) =>
                      setNewSessionModal((prev) => ({ ...prev, sessionDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="30"
                    step="15"
                    value={newSessionModal.durationMins}
                    onChange={(e) =>
                      setNewSessionModal((prev) => ({
                        ...prev,
                        durationMins: parseInt(e.target.value) || 120,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agenda &amp; Notes</label>
                <textarea
                  rows={2}
                  value={newSessionModal.agenda}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, agenda: e.target.value }))
                  }
                  placeholder="Topics covered, target machines, lab steps..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
                >
                  {isPending ? 'Scheduling...' : 'Schedule Lecture'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
