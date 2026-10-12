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
  GraduationCap,
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
  const [createStep, setCreateStep] = useState(1);
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

  // Calculate duration in minutes automatically
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
      setCreateStep(1);
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
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-800'
              : 'bg-white border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              Faculty Sessions
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Curriculum &amp; Timetable
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Lectures &amp; Classes
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Schedule live cohort sessions, set class timings, share virtual room links, and connect directly to attendance registers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Lecture</span>
          </button>
        </div>
      </div>

      {/* ── SCHEDULED SESSIONS TIMELINE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-600" />
            Scheduled Cohort Sessions ({sessions.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Cohort Timetable</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No lectures scheduled yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Schedule Lecture&quot; to plan your next live instruction or workshop session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-6 rounded-2xl md:rounded-3xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                      {sess.batch.batchCode} • Session #{sess.sessionNumber}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sess.durationMins} mins
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {sess.title}
                    </h3>
                    <span className="text-xs text-slate-500 block pt-0.5 font-medium">
                      {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {sess.agenda && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {sess.agenda}
                    </p>
                  )}

                  {sess.importantNotes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 truncate">
                      {sess.importantNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Attendance Marked: <strong className="text-slate-900 font-semibold">{sess.attendanceRecords.length}</strong>
                  </span>

                  <Link href={`/mentor/attendance?batchId=${sess.batchId}&sessionId=${sess.id}`}>
                    <button className="px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 hover:border-violet-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
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

      {/* ── SCHEDULE LECTURE MODAL (PAGINATED MULTI-STEP WIZARD) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => {
              setCreateModalOpen(false);
              setCreateStep(1);
            }}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs text-slate-900">
            {/* Modal Header & Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Schedule New Lecture</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-violet-700">
                      Step {createStep} of 3:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {createStep === 1 && 'Session Basics'}
                      {createStep === 2 && 'Timing & Virtual Room'}
                      {createStep === 3 && 'Agenda & Confirmation'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateStep(1);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step <= createStep ? 'bg-violet-600' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              {/* ── STEP 1: SESSION BASICS (3 Fields) ── */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Select Cohort Batch *</label>
                    <select
                      required
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchCode} — {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Lecture Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Session 4: Linux Privilege Escalation & SUID Abuse"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Scheduled Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.sessionDate}
                      onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.batchId || !formData.title || !formData.sessionDate}
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Time &amp; Room</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: TIMING & ROOM (3 Fields) ── */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium block text-xs">1. Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium block text-xs">2. End Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-900 flex items-center justify-between">
                    <span>Calculated Duration:</span>
                    <strong className="text-violet-700 font-bold">{calculateDuration()} Minutes</strong>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Meeting Room Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/xyz or Zoom link"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Agenda &amp; Review</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: AGENDA & REVIEW (1 Field + Summary) ── */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">Session Agenda / Objectives</label>
                    <textarea
                      rows={3}
                      value={formData.agenda}
                      onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                      placeholder="Key lecture topics, hands-on terminal demos, homework tasks..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cohort:</span>
                      <strong className="text-slate-900">
                        {batches.find((b) => b.id === formData.batchId)?.batchCode}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lecture:</span>
                      <strong className="text-slate-900 truncate max-w-[240px]">{formData.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date &amp; Time:</span>
                      <strong className="text-violet-700">
                        {formData.sessionDate} • {formData.startTime} - {formData.endTime}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs disabled:opacity-50 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      {submitting ? 'Scheduling...' : 'Confirm & Schedule Lecture'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

