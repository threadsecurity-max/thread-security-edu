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
              ATTENDANCE CONDUCTION CONSOLE
            </span>
            <span className="text-xs text-zinc-400">
              REAL-TIME CHECK-IN RECORDING
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Cohort Attendance &amp; Observation Center
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Mark student presence, record per-session faculty observations (&ldquo;What they are up to&rdquo;), and accumulate verified learning hours.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center min-w-[120px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">SESSION FIDELITY</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {fidelityRate}%
            </span>
          </div>
        </div>
      </div>

      {/* ── SELECTOR RAIL (Batch & Session) ── */}
      <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Batch Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">Cohort Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-white/[0.08] bg-black/60 text-white focus:outline-none focus:border-[#C6FF34] cursor-pointer"
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
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">Conducted Lecture</label>
              <select
                value={selectedSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.08] bg-black/60 text-white focus:outline-none focus:border-[#C6FF34] cursor-pointer"
              >
                {currentBatch.sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session #{s.sessionNumber} — {s.title} ({new Date(s.sessionDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 py-2">No sessions scheduled for this cohort.</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.1] text-xs font-bold transition-all cursor-pointer"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || !currentSession}
            className="px-5 py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* ── SESSION CONDUCTION SUMMARY BADGES ── */}
      {currentSession && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Duration</span>
            <span className="text-sm font-bold text-white block">{currentSession.durationMins || 120} Minutes</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Present Count</span>
            <span className="text-sm font-bold text-[#C6FF34] block">{presentCount} Candidates</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Absent Count</span>
            <span className="text-sm font-bold text-rose-400 block">{totalCount - presentCount} Candidates</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Session Date</span>
            <span className="text-sm font-bold text-white block">
              {new Date(currentSession.sessionDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* ── CANDIDATE ATTENDANCE LEDGER ── */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-zinc-300 border-b border-white/[0.06]">
              <tr>
                <th className="p-4 font-bold">Candidate</th>
                <th className="p-4 font-bold">TS-ID</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Mentor Observation Remark (&quot;What you are up to&quot;)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No candidates enrolled in this cohort yet.
                  </td>
                </tr>
              ) : (
                studentsList.map((sp) => {
                  const state = attendanceState[sp.id] || { status: 'PRESENT', remarks: '' };

                  return (
                    <tr key={sp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5 font-sans">
                          <span className="font-bold text-white block text-sm">{sp.user.name}</span>
                          <span className="text-[11px] text-zinc-400 block font-mono">{sp.user.email}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20 inline-block">
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
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                state.status === st
                                  ? st === 'PRESENT'
                                    ? 'bg-[#C6FF34] text-black shadow-sm'
                                    : st === 'LATE'
                                    ? 'bg-amber-400 text-black shadow-sm'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-500 text-white shadow-sm'
                                    : 'bg-blue-400 text-black shadow-sm'
                                  : 'bg-white/[0.04] text-zinc-400 hover:text-white'
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
                          placeholder="e.g. Cleared packet analysis challenge. Active participation in terminal."
                          className="w-full px-3 py-1.5 rounded-xl border border-white/[0.08] bg-black/60 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34] text-xs font-sans"
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
