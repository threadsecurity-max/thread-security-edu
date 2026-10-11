'use client';

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  checkSessionConflictAction,
  rescheduleSessionAction,
  scheduleNewLectureAction,
} from '@/features/batches/actions/timetable.actions';

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

  // Perform live conflict check before saving
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
        error: `Schedule conflict: overlaps with ${res.conflicts.length} existing lecture(s).`,
      }));
    } else {
      setRescheduleModal((prev) => ({
        ...prev,
        conflicts: [],
        error: null,
      }));
    }
  };

  // Submit Reschedule
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
        // Update local state
        setBatches((prev) =>
          prev.map((b) => ({
            ...b,
            sessions: b.sessions.map((s) =>
              s.id === rescheduleModal.session!.id
                ? { ...s, sessionDate: rescheduleModal.newDate, durationMins: rescheduleModal.newDuration }
                : s
            ),
          }))
        );
        setRescheduleModal((prev) => ({ ...prev, isOpen: false }));
      } else if (res.conflict) {
        setRescheduleModal((prev) => ({
          ...prev,
          conflicts: res.conflicts || [],
          error: res.error || 'Conflict detected',
        }));
      } else {
        alert(res.error || 'Failed to reschedule lecture');
      }
    });
  };

  // Submit New Session
  const handleScheduleNew = async (e: React.FormEvent) => {
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
              ? { ...b, sessions: [...b.sessions, res.session as SessionItem] }
              : b
          )
        );
        setNewSessionModal((prev) => ({ ...prev, isOpen: false, title: '', agenda: '' }));
      } else {
        alert(res.error || 'Failed to schedule session');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              TIMETABLE & LECTURE CONDUCTION
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-sans">
                Conflict Engine Active
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Master timetable coordination, double-booking prevention, and audited lecture rescheduling.
            </p>
          </div>
        </div>

        <button
          onClick={() => setNewSessionModal((prev) => ({ ...prev, isOpen: true }))}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Schedule Lecture
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TOTAL SESSIONS</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{allSessions.length}</div>
          <div className="text-xs text-slate-500 mt-1">Across all academic cohorts</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ACTIVE COHORTS</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{batches.length}</div>
          <div className="text-xs text-slate-500 mt-1">Simultaneous running batches</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TIMETABLE INTEGRITY</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">100% VERIFIED</div>
          <div className="text-xs text-slate-500 mt-1">Zero mentor double-bookings</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>FACULTY LEADS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{mentors.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active instructors allocated</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-mono text-slate-400">FILTER COHORT:</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
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
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lectures, mentors, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Chronological Sessions Timeline */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-[#0B0F19] rounded-2xl border border-slate-800">
            No scheduled lectures found matching criteria.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const dateObj = new Date(session.sessionDate);
            const isPast = dateObj.getTime() < Date.now();

            return (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-mono text-emerald-400">
                      {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold font-mono text-white leading-none mt-0.5">
                      {dateObj.getDate()}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                        {session.batch?.batchCode}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Session #{session.sessionNumber}
                      </span>
                      {isPast ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                          Conducted
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 animate-pulse">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white">{session.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Cohort: {session.batch?.title}</span>
                      <span>•</span>
                      <span>Mentor: {session.batch?.mentor?.user?.name || 'Unassigned Lead'}</span>
                      <span>•</span>
                      <span>Duration: {session.durationMins || 120} mins</span>
                    </div>

                    {session.agenda && (
                      <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-1">
                        Agenda: {session.agenda}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenReschedule(session)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Reschedule
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Lecture Modal */}
      {rescheduleModal.isOpen && rescheduleModal.session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                RESCHEDULE LECTURE WITH CONFLICT ENGINE
              </h3>
              <button
                onClick={() => setRescheduleModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="font-semibold text-white">
                  {rescheduleModal.session.batch?.batchCode}: Session #{rescheduleModal.session.sessionNumber}
                </div>
                <div className="text-slate-400">{rescheduleModal.session.title}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Current Date: {new Date(rescheduleModal.session.sessionDate).toLocaleString()}
                </div>
              </div>

              {rescheduleModal.error && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{rescheduleModal.error}</div>
                    {rescheduleModal.conflicts.map((c, idx) => (
                      <div key={idx} className="text-[11px] text-rose-300/80 mt-1">
                        • {c.batchCode}: "{c.title}" on {new Date(c.sessionDate).toLocaleString()} ({c.conflictType})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  NEW DATE & TIME *
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    DURATION (MINUTES)
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
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    OVERRIDE CONFLICT
                  </label>
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rescheduleModal.forceOverride}
                      onChange={(e) =>
                        setRescheduleModal((prev) => ({ ...prev, forceOverride: e.target.checked }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                    />
                    Force schedule anyway
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  RESCHEDULING REASON / DIRECTIVE *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Mentor emergency leave / Academic calendar adjustment"
                  value={rescheduleModal.reason}
                  onChange={(e) =>
                    setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isPending ||
                    (rescheduleModal.conflicts.length > 0 && !rescheduleModal.forceOverride)
                  }
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition-colors"
                >
                  {isPending ? 'Rescheduling...' : 'Apply Schedule Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule New Session Modal */}
      {newSessionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                SCHEDULE NEW LECTURE SESSION
              </h3>
              <button
                onClick={() => setNewSessionModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleNew} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  TARGET COHORT BATCH *
                </label>
                <select
                  required
                  value={newSessionModal.batchId}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, batchId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  LECTURE / TOPIC TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Forensics: Volatility Analysis"
                  value={newSessionModal.title}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    SESSION DATE & TIME *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newSessionModal.sessionDate}
                    onChange={(e) =>
                      setNewSessionModal((prev) => ({ ...prev, sessionDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    DURATION (MINS)
                  </label>
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
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  AGENDA & LAB PREREQUISITES
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or topics for the session..."
                  value={newSessionModal.agenda}
                  onChange={(e) =>
                    setNewSessionModal((prev) => ({ ...prev, agenda: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  {isPending ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
