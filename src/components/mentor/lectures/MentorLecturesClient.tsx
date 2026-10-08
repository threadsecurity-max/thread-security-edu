'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Layers,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export interface BatchSessionItem {
  id: string;
  batchId: string;
  sessionNumber: number;
  title: string;
  sessionDate: string | Date;
  durationMins: number;
  agenda: string | null;
  status: string;
  topicsCovered: string | null;
  homework: string | null;
  importantNotes: string | null;
  batch: {
    id: string;
    batchCode: string;
    title: string;
    course?: { title: string } | null;
  };
  attendanceRecords: Array<{ id: string; status: string }>;
}

export interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
  course?: { id: string; title: string } | null;
}

export function MentorLecturesClient({
  sessions: initialSessions,
  batches,
  showCreateInitial = false,
}: {
  sessions: BatchSessionItem[];
  batches: BatchItem[];
  showCreateInitial?: boolean;
}) {
  const [sessions, setSessions] = useState<BatchSessionItem[]>(initialSessions);
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    batchId: batches[0]?.id || '',
    title: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    agenda: '',
    meetingLink: '',
    topicsCovered: '',
    homework: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Calculate duration in minutes automatically (Rule #16)
  const calculateDuration = () => {
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 90;
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.title || !formData.sessionDate) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule lecture.');
      }

      showToast(`Lecture scheduled successfully for ${data.lecture?.batch?.batchCode || 'batch'}!`, 'success');
      setCreateModalOpen(false);
      setFormData({
        batchId: batches[0]?.id || '',
        title: '',
        sessionDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:30',
        agenda: '',
        meetingLink: '',
        topicsCovered: '',
        homework: '',
      });

      // Refresh list
      const refreshed = await fetch('/api/mentor/lectures');
      const refreshedData = await refreshed.json();
      if (refreshedData.sessions) {
        setSessions(refreshedData.sessions);
      }
    } catch (err: any) {
      showToast(err.message || 'Error scheduling lecture', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-mono">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2 border ${
            toastMessage.type === 'success'
              ? 'bg-[#050706] border-[#C6FF34]/40 text-[#C6FF34]'
              : 'bg-[#050706] border-rose-500/40 text-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#C6FF34]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 uppercase">
              LECTURE SCHEDULING CONSOLE
            </span>
            <span className="text-xs text-zinc-400">
              COHORT CONDUCTION ENGINE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Schedule &amp; Conduction Hub
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Schedule live module deliveries, set automated meeting room access, allocate syllabus duration, and link directly to the attendance ledger.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Schedule New Lecture</span>
          </button>
        </div>
      </div>

      {/* ── SCHEDULED SESSIONS TIMELINE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C6FF34]" />
            Scheduled Cohort Sessions ({sessions.length})
          </h2>
          <span className="text-xs text-zinc-400">Batch-Isolated Calendar</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">No lectures scheduled yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
              Click &quot;Schedule New Lecture&quot; to arrange your next live terminal or classroom session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all backdrop-blur-xl flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                      {sess.batch.batchCode} • Session #{sess.sessionNumber}
                    </span>

                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {sess.durationMins} mins
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      {sess.title}
                    </h3>
                    <span className="text-[11px] text-zinc-400 block pt-0.5">
                      {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {sess.agenda && (
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                      {sess.agenda}
                    </p>
                  )}

                  {sess.importantNotes && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-400 truncate">
                      {sess.importantNotes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-500">
                    Attendance Logged: <strong className="text-white">{sess.attendanceRecords.length}</strong>
                  </span>

                  <Link href={`/mentor/attendance?batchId=${sess.batchId}&sessionId=${sess.id}`}>
                    <button className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#C6FF34] hover:text-black text-white border border-white/[0.1] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                      <span>Mark Attendance</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SCHEDULE LECTURE MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-xl font-serif font-bold text-white">Schedule Lecture</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Select Cohort Batch *</label>
                <select
                  required
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Session 4: Linux Privilege Escalation & SUID Abuse"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Calculated Conduction Duration:</span>
                <strong className="text-[#C6FF34]">{calculateDuration()} Minutes</strong>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Meeting Room / Terminal Link</label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz or Zoom link"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Session Agenda / Objectives</label>
                <textarea
                  rows={2}
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="What will be taught in this session..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {submitting ? 'Scheduling...' : 'Confirm & Schedule Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
