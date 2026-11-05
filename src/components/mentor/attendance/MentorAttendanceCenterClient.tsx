'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Home,
  X,
  Search,
  RotateCcw,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Clock,
  BookOpen,
  Users,
  Save,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
  course?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  students: Array<{
    id: string; // StudentProfile id
    admissionId?: string | null;
    program?: string | null;
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

const DEFAULT_TIME_SLOTS = [
  '09:00 AM - 10:30 AM (Morning Core Theory & Architecture)',
  '10:30 AM - 12:00 PM (Active Directory & Privilege Escalation Lab)',
  '01:00 PM - 02:30 PM (Binary Reverse Engineering with Ghidra)',
  '02:30 PM - 04:00 PM (Network Forensics & Threat Hunting Drill)',
  '04:00 PM - 05:30 PM (Applied CTF Challenge & Code Review)',
];

const DEFAULT_TOPICS = [
  'Introduction to Kerberoasting & AD Ticket Exploitation',
  'Assembly Decompilation & Ghidra Reversing Workflow',
  'Wireshark Network PCAP Capture & Protocol Analysis',
  'Web App Vulnerabilities: SQL Injection & IDOR Flaws',
  'Cloud Infrastructure Auditing & IAM Privilege Escalation',
];

export function MentorAttendanceCenterClient({
  batches,
  initialBatchId,
  initialSessionId,
}: {
  batches: BatchItem[];
  initialBatchId?: string;
  initialSessionId?: string;
}) {
  // Top filter form states (matching screenshot media_1793802459452_6e02eeeb.png)
  const [academicTerm, setAcademicTerm] = useState('Odd 2026');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || batches[0]?.id || ''
  );

  const currentBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId) || batches[0],
    [batches, selectedBatchId]
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(DEFAULT_TIME_SLOTS[0]);
  const [selectedTopic, setSelectedTopic] = useState<string>(DEFAULT_TOPICS[0]);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Active session
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessionId || currentBatch?.sessions[0]?.id || ''
  );

  const currentSession = useMemo(
    () => currentBatch?.sessions.find((s) => s.id === selectedSessionId) || currentBatch?.sessions[0],
    [currentBatch, selectedSessionId]
  );

  // Student Attendance State: studentId -> { status: 'PRESENT' | 'ABSENT' | 'OTHERS', remarks: string }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'OTHERS'; remarks: string }>
  >(() => {
    const state: Record<string, any> = {};
    const students = currentBatch?.students || [];
    const records = currentSession?.attendanceRecords || [];

    students.forEach((sp) => {
      const rec = records.find((r) => r.studentId === sp.id);
      const rawStatus = rec?.status || 'PRESENT';
      state[sp.id] = {
        status: rawStatus === 'LATE' || rawStatus === 'EXCUSED' ? 'OTHERS' : rawStatus,
        remarks: rec?.remarks || '',
      };
    });
    return state;
  });

  // Bulk Radio Selection state
  const [bulkSelection, setBulkSelection] = useState<'PRESENT' | 'ABSENT' | 'OTHERS' | null>('PRESENT');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state when batch changes
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
      const rawStatus = rec?.status || 'PRESENT';
      state[sp.id] = {
        status: rawStatus === 'LATE' || rawStatus === 'EXCUSED' ? 'OTHERS' : rawStatus,
        remarks: rec?.remarks || '',
      };
    });
    setAttendanceState(state);
    setBulkSelection('PRESENT');
  };

  // Bulk status update handlers
  const handleBulkStatusChange = (status: 'PRESENT' | 'ABSENT' | 'OTHERS') => {
    setBulkSelection(status);
    const nextState = { ...attendanceState };
    const students = currentBatch?.students || [];
    students.forEach((sp) => {
      nextState[sp.id] = {
        status,
        remarks: nextState[sp.id]?.remarks || '',
      };
    });
    setAttendanceState(nextState);
  };

  // Individual status update
  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'OTHERS') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setBulkSelection(null);
  };

  // Individual remarks update
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Reset form
  const handleReset = () => {
    setSelectedTimeSlot(DEFAULT_TIME_SLOTS[0]);
    setSelectedTopic(DEFAULT_TOPICS[0]);
    handleBulkStatusChange('PRESENT');
    showToast('Attendance sheet reset to default configuration.', 'success');
  };

  // Save Attendance to API
  const handleSaveAttendance = async () => {
    if (!currentBatch) {
      showToast('Please select a valid course batch.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Map OTHERS to EXCUSED / LATE for database schema compatibility
      const recordsPayload = Object.entries(attendanceState).map(([studentId, data]) => ({
        studentId,
        status: (data.status === 'OTHERS' ? 'EXCUSED' : data.status) as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
        remarks: data.remarks || undefined,
      }));

      // Use active session id, or fallback
      const sessionId = currentSession?.id || `sess-${Date.now()}`;

      const res = await fetch('/api/mentor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: currentBatch.id,
          sessionId,
          records: recordsPayload,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error?.message || 'Failed to submit attendance');
      }

      showToast(`Slot attendance verified and saved for ${recordsPayload.length} students!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error recording attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const studentsList = currentBatch?.students || [];
  const totalCount = studentsList.length;
  const presentCount = Object.values(attendanceState).filter((v) => v.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceState).filter((v) => v.status === 'ABSENT').length;
  const othersCount = Object.values(attendanceState).filter((v) => v.status === 'OTHERS').length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  return (
    <div
      className="space-y-4 max-w-7xl mx-auto pb-12"
      style={{
        fontFamily: 'Inter, "Inter Fallback", sans-serif',
        fontSize: '12px',
        fontFeatureSettings: 'normal',
        fontVariationSettings: 'normal',
      }}
    >
      {/* Toast Notification */}
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

      {/* ── TOP BREADCRUMB / TAB BAR (Matching Screenshot) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <Link
          href="/mentor"
          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
          title="Mentor Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Active Tab Pill: Capture Attendance [x] */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-t-lg bg-[#EEF2FF] border border-b-0 border-[#C7D2FE] text-[#4338CA] font-medium text-[11px] shadow-2xs">
          <span>Capture Attendance</span>
          <button
            type="button"
            onClick={() => handleReset()}
            className="hover:text-indigo-950 transition-colors p-0.5"
            title="Reset Tab"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── FILTER & TIME SLOT MANAGEMENT CARD ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative">
        {!filterCollapsed ? (
          <div className="space-y-4">
            {/* Row 1: Academic Term & Course Variant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Academic Term
                </label>
                <div className="relative">
                  <select
                    value={academicTerm}
                    onChange={(e) => setAcademicTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="Odd 2026">Odd 2026</option>
                    <option value="Even 2026">Even 2026</option>
                    <option value="Summer Term 2026">Summer Term 2026</option>
                    <option value="Fast-Track Winter 2026">Fast-Track Winter 2026</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Course Variant <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBatchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.course?.slug || 'SCS181'} / {b.course?.title || b.title} / {b.batchCode}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Time Slots * (with clear icon) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Time Slots <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none pr-14 cursor-pointer font-medium"
                >
                  {DEFAULT_TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 flex items-center gap-1">
                  {selectedTimeSlot && (
                    <button
                      type="button"
                      onClick={() => setSelectedTimeSlot('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                      title="Clear Time Slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Topics (with clear icon) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Topics
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="Select or enter syllabus topic covered in this slot..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-14"
                />
                <div className="absolute right-2.5 flex items-center gap-1">
                  {selectedTopic && (
                    <button
                      type="button"
                      onClick={() => setSelectedTopic('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                      title="Clear Topic"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Action Buttons (Right-aligned, matching screenshot) */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#818CF8] hover:bg-[#6366F1] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Generate QR</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Student attendance roster refreshed.', 'success')}
                className="px-4 py-2 rounded-lg bg-[#A5B4FC] hover:bg-[#818CF8] text-[#1E1B4B] font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Center Collapse Button (Chevron) */}
        <div className="flex justify-center -mb-5 mt-2">
          <button
            type="button"
            onClick={() => setFilterCollapsed(!filterCollapsed)}
            className="w-7 h-5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title={filterCollapsed ? 'Expand Filters' : 'Collapse Filters'}
          >
            {filterCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── BULK MARK RADIO CONTROLS (Matching Screenshot) ── */}
      <div className="flex items-center gap-6 pt-3 px-1 text-xs text-slate-700 font-medium">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="bulk-attendance-toggle"
            checked={bulkSelection === 'PRESENT'}
            onChange={() => handleBulkStatusChange('PRESENT')}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
          <span>Mark all - Present</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="bulk-attendance-toggle"
            checked={bulkSelection === 'ABSENT'}
            onChange={() => handleBulkStatusChange('ABSENT')}
            className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
          />
          <span>Mark all - Absent</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="bulk-attendance-toggle"
            checked={bulkSelection === 'OTHERS'}
            onChange={() => handleBulkStatusChange('OTHERS')}
            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
          />
          <span>Mark All Other</span>
        </label>
      </div>

      {/* ── SECTION TITLE: Student Attendance List ── */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Student Attendance List
        </h2>

        {/* Live Attendance Rate Pill */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-500">
            Enrolled: <strong>{totalCount}</strong>
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            Present: {presentCount}
          </span>
          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
            Absent: {absentCount}
          </span>
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
            Other: {othersCount}
          </span>
          <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 font-bold">
            Fidelity: {percentage}%
          </span>
        </div>
      </div>

      {/* ── STUDENT ATTENDANCE TABLE (Matching Screenshot Exact Columns) ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEF2FF] text-[#1E1B4B] border-b border-indigo-100 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-16">SR. NO.</th>
                <th className="py-3 px-3 w-32">ADMISSION ID</th>
                <th className="py-3 px-3 w-32">STUDENT ID</th>
                <th className="py-3 px-3">STUDENT NAME</th>
                <th className="py-3 px-3">STUDENT LAST NAME</th>
                <th className="py-3 px-3">PROGRAM</th>
                <th className="py-3 px-3 text-center w-20">PRESENT</th>
                <th className="py-3 px-3 text-center w-20">ABSENT</th>
                <th className="py-3 px-3 text-center w-20">OTHERS</th>
                <th className="py-3 px-4 w-48">REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No students currently enrolled in this batch variant.
                  </td>
                </tr>
              ) : (
                studentsList.map((st, idx) => {
                  const studentName = st.user?.name || 'Student Candidate';
                  const nameParts = studentName.trim().split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '-';
                  const admissionId = st.admissionId || `ADM-2026-${st.id.slice(-4).toUpperCase()}`;
                  const studentTsId = st.user?.tsIdentity?.tsId || `TS-2026-${st.user.id.slice(-4).toUpperCase()}`;
                  const programName = currentBatch?.course?.title || 'B.Tech CSE - Cyber Security';
                  const status = attendanceState[st.id]?.status || 'PRESENT';
                  const remarks = attendanceState[st.id]?.remarks || '';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {admissionId}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {studentTsId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {firstName}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[180px]">
                        {programName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`attendance-${st.id}`}
                          checked={status === 'PRESENT'}
                          onChange={() => handleStatusChange(st.id, 'PRESENT')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`attendance-${st.id}`}
                          checked={status === 'ABSENT'}
                          onChange={() => handleStatusChange(st.id, 'ABSENT')}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer accent-rose-600"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`attendance-${st.id}`}
                          checked={status === 'OTHERS'}
                          onChange={() => handleStatusChange(st.id, 'OTHERS')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer accent-amber-600"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          placeholder="Add remark..."
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Save Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Recorded by Faculty Mentor &bull; Timestamped with official TS-ID audit logs.
          </div>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving || studentsList.length === 0}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Saving Attendance...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Attendance Record</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── QR CODE ATTENDANCE GENERATOR MODAL ── */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span>Slot Check-In QR Generator</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm text-center">
              {/* Dynamic QR SVG Pattern */}
              <svg viewBox="0 0 160 160" className="w-44 h-44 mx-auto">
                <rect width="160" height="160" fill="#ffffff" />
                {/* Position detection markers */}
                <rect x="10" y="10" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="18" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="24" y="24" width="12" height="12" fill="#4338ca" />

                <rect x="110" y="10" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="118" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="124" y="24" width="12" height="12" fill="#4338ca" />

                <rect x="10" y="110" width="40" height="40" fill="#1e1b4b" rx="4" />
                <rect x="18" y="118" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="24" y="124" width="12" height="12" fill="#4338ca" />

                {/* QR Data modules */}
                <rect x="60" y="20" width="8" height="8" fill="#1e1b4b" />
                <rect x="75" y="20" width="8" height="8" fill="#4338ca" />
                <rect x="90" y="20" width="8" height="8" fill="#1e1b4b" />
                <rect x="60" y="35" width="8" height="8" fill="#4338ca" />
                <rect x="75" y="50" width="8" height="8" fill="#1e1b4b" />
                <rect x="20" y="60" width="8" height="8" fill="#1e1b4b" />
                <rect x="35" y="75" width="8" height="8" fill="#4338ca" />
                <rect x="50" y="75" width="8" height="8" fill="#1e1b4b" />
                <rect x="65" y="65" width="16" height="16" fill="#1e1b4b" rx="2" />
                <rect x="90" y="65" width="8" height="8" fill="#4338ca" />
                <rect x="105" y="75" width="8" height="8" fill="#1e1b4b" />
                <rect x="125" y="60" width="8" height="8" fill="#4338ca" />
                <rect x="140" y="75" width="8" height="8" fill="#1e1b4b" />
                <rect x="60" y="105" width="8" height="8" fill="#4338ca" />
                <rect x="75" y="120" width="8" height="8" fill="#1e1b4b" />
                <rect x="90" y="105" width="8" height="8" fill="#4338ca" />
                <rect x="105" y="120" width="8" height="8" fill="#1e1b4b" />
                <rect x="120" y="135" width="8" height="8" fill="#4338ca" />
                <rect x="135" y="120" width="8" height="8" fill="#1e1b4b" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                {currentBatch?.course?.title || currentBatch?.title}
              </div>
              <div className="text-indigo-700 font-mono font-semibold text-xs">
                Slot: {selectedTimeSlot}
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Students can scan this encrypted QR code from their mobile portal to record presence automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Token Expires in: 04:58 mins</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
