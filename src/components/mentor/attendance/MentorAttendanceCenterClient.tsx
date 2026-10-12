'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Check,
  Save,
  Users,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
  students: Array<{
    id: string; // StudentProfile id
    user: {
      id: string;
      name: string;
      email: string;
      tsIdentity?: { tsId: string } | null;
    };
  }>;
  sessions: Array<{
    id: string;
    sessionNumber: number;
    title: string;
    sessionDate: string | Date;
    durationMins: number;
    status: string;
    attendanceRecords: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks?: string | null;
    }>;
  }>;
}

export function MentorAttendanceCenterClient({
  batches,
  initialBatchId,
  initialSessionId,
}: {
  batches: BatchItem[];
  initialBatchId?: string;
  initialSessionId?: string;
}) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || batches[0]?.id || ''
  );

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessionId || currentBatch?.sessions[0]?.id || ''
  );

  const currentSession = currentBatch?.sessions.find((s) => s.id === selectedSessionId) || currentBatch?.sessions[0];

  // Map of studentId -> { status, remarks }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>
  >(() => {
    const state: Record<string, any> = {};
    const students = currentBatch?.students || [];
    const records = currentSession?.attendanceRecords || [];

    students.forEach((sp) => {
      const rec = records.find((r) => r.studentId === sp.id);
      state[sp.id] = {
        status: rec?.status || 'PRESENT',
        remarks: rec?.remarks || '',
      };
    });
    return state;
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state when session or batch changes
  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const session = currentBatch?.sessions.find((s) => s.id === sessionId);
    const state: Record<string, any> = {};
    const students = currentBatch?.students || [];
    const records = session?.attendanceRecords || [];

    students.forEach((sp) => {
      const rec = records.find((r) => r.studentId === sp.id);
      state[sp.id] = {
        status: rec?.status || 'PRESENT',
        remarks: rec?.remarks || '',
      };
    });
    setAttendanceState(state);
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    const batch = batches.find((b) => b.id === batchId);
    const firstSession = batch?.sessions[0];
    setSelectedSessionId(firstSession?.id || '');

    const state: Record<string, any> = {};
    const students = batch?.students || [];
    const records = firstSession?.attendanceRecords || [];

    students.forEach((sp) => {
      const rec = records.find((r) => r.studentId === sp.id);
      state[sp.id] = {
        status: rec?.status || 'PRESENT',
        remarks: rec?.remarks || '',
      };
    });
    setAttendanceState(state);
  };

  // Mark all present in one click (Rule #18, #49)
  const handleMarkAllPresent = () => {
    const students = currentBatch?.students || [];
    const nextState = { ...attendanceState };
    students.forEach((sp) => {
      nextState[sp.id] = {
        status: 'PRESENT',
        remarks: nextState[sp.id]?.remarks || '',
      };
    });
    setAttendanceState(nextState);
    showToast('All candidates marked PRESENT.', 'success');
  };

  // Save Attendance to API
  const handleSaveAttendance = async () => {
    if (!currentBatch || !currentSession) return;

    setSaving(true);
    try {
      const recordsPayload = Object.entries(attendanceState).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks || undefined,
      }));

      const res = await fetch('/api/mentor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: currentBatch.id,
          sessionId: currentSession.id,
          records: recordsPayload,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error?.message || 'Failed to record attendance');
      }

      showToast(`Attendance saved successfully for ${recordsPayload.length} students!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error saving attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const studentsList = currentBatch?.students || [];
  const totalCount = studentsList.length;
  const presentCount = Object.values(attendanceState).filter(
    (v) => v.status === 'PRESENT' || v.status === 'LATE'
  ).length;
  const fidelityRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

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
              Class Attendance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Student Presence &amp; Observation Ledger
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Attendance &amp; Participation Ledger
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Record candidate attendance, add per-session faculty notes, and track overall cohort attendance rates seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 text-center min-w-[130px]">
            <span className="text-[11px] text-violet-700 font-semibold tracking-wider uppercase block">ATTENDANCE RATE</span>
            <span className="text-2xl font-bold text-violet-900 block mt-0.5">
              {fidelityRate}%
            </span>
          </div>
        </div>
      </div>

      {/* ── SELECTOR RAIL (Batch & Session) ── */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Batch Selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider block">Cohort Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer font-medium"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} ({b.students.length} students)
                </option>
              ))}
            </select>
          </div>

          {/* Session Selector */}
          {currentBatch?.sessions.length ? (
            <div className="space-y-1 flex-1">
              <label className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider block">Lecture Session</label>
              <select
                value={selectedSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer font-medium"
              >
                {currentBatch.sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session #{s.sessionNumber} — {s.title} ({new Date(s.sessionDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-2">No sessions scheduled for this cohort.</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || !currentSession}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* ── SESSION CONDUCTION SUMMARY BADGES ── */}
      {currentSession && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium block">Duration</span>
            <span className="text-base font-bold text-slate-900 block">{currentSession.durationMins || 90} Minutes</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium block">Present</span>
            <span className="text-base font-bold text-emerald-600 block">{presentCount} Students</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium block">Absent</span>
            <span className="text-base font-bold text-rose-600 block">{totalCount - presentCount} Students</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium block">Session Date</span>
            <span className="text-base font-bold text-slate-900 block">
              {new Date(currentSession.sessionDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* ── CANDIDATE ATTENDANCE LEDGER ── */}
      <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Student ID</th>
                <th className="p-4 font-semibold">Attendance Status</th>
                <th className="p-4 font-semibold">Instructor Notes &amp; Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No students enrolled in this cohort yet.
                  </td>
                </tr>
              ) : (
                studentsList.map((sp) => {
                  const state = attendanceState[sp.id] || { status: 'PRESENT', remarks: '' };

                  return (
                    <tr key={sp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block text-sm">{sp.user.name}</span>
                          <span className="text-xs text-slate-500 block font-normal">{sp.user.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 font-mono inline-block">
                          {sp.user.tsIdentity?.tsId || 'N/A'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                setAttendanceState({
                                  ...attendanceState,
                                  [sp.id]: { ...state, status: st },
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                state.status === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {st === 'PRESENT'
                                ? '✓ Present'
                                : st === 'LATE'
                                ? '~ Late'
                                : st === 'ABSENT'
                                ? '× Absent'
                                : 'Excused'}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={state.remarks}
                          onChange={(e) =>
                            setAttendanceState({
                              ...attendanceState,
                              [sp.id]: { ...state, remarks: e.target.value },
                            })
                          }
                          placeholder="e.g. Active participation, completed practical exercise"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
