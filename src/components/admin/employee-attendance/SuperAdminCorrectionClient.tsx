'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ArrowLeft,
  User,
  Users,
} from 'lucide-react';
import {
  rectifyEmployeeAttendanceAction,
  getDailyAttendanceAction,
} from '@/features/employee-attendance/actions/attendance.actions';
import { EmployeeAttendanceStatus } from '@prisma/client';

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
}

interface SuperAdminCorrectionClientProps {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  employees: EmployeeItem[];
  initialDaily: any;
  initialDate: string;
}

export function SuperAdminCorrectionClient({
  currentUser,
  employees = [],
  initialDaily,
  initialDate,
}: SuperAdminCorrectionClientProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  const [targetDate, setTargetDate] = useState<string>(initialDate);
  const [dailyData, setDailyData] = useState<any>(initialDaily);

  const [correctedStatus, setCorrectedStatus] = useState<EmployeeAttendanceStatus>('PRESENT');
  const [remarks, setRemarks] = useState('');
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Find selected employee
  const currentEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) || employees[0],
    [employees, selectedEmployeeId]
  );

  // Find attendance item for selected employee
  const existingItem = useMemo(() => {
    const list = dailyData?.items || [];
    return list.find((i: any) => i.employee?.id === selectedEmployeeId);
  }, [dailyData, selectedEmployeeId]);

  // When date changes, fetch day data
  const handleDateChange = (newDate: string) => {
    setTargetDate(newDate);
    startTransition(async () => {
      const res = await getDailyAttendanceAction(newDate);
      if (res.success && res.data) {
        setDailyData(res.data);
      }
    });
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingItem?.attendanceId) {
      showToast('No existing attendance record found for this employee on this date. Please capture attendance first.', 'error');
      return;
    }

    if (!remarks.trim()) {
      showToast('Mandatory correction remarks/reason must be provided.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await rectifyEmployeeAttendanceAction({
        attendanceId: existingItem.attendanceId,
        newStatus: correctedStatus,
        remarks: remarks.trim(),
      });

      if (res.success) {
        showToast('Attendance successfully rectified and logged in immutable audit history.');
        setRemarks('');
        // Refresh day data
        const refreshed = await getDailyAttendanceAction(targetDate);
        if (refreshed.success && refreshed.data) {
          setDailyData(refreshed.data);
        }
      } else {
        showToast(res.error || 'Failed to rectify attendance', 'error');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
            notice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/employee-attendance">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase inline-block">
              SUPER ADMIN SOVEREIGN CONSOLE
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Attendance Rectification &amp; Override
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employee-attendance/audit">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer">
              <History className="w-4 h-4 text-slate-600" />
              <span>Audit Log History</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Authority Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3.5 text-amber-900 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Exclusive Authority: threadsecurity@gmail.com</div>
          <div className="text-[11px] text-amber-800/90 mt-0.5">
            Attendance Manager (Akshay Kumar) is strictly locked from editing previously submitted registers. Any modifications performed in this console generate permanent, tamper-evident audit log entries preserving the previous status, updated status, modifier identity, and reasoning.
          </div>
        </div>
      </div>

      {/* Main Rectification Form */}
      <form onSubmit={handleCorrectionSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
              1. Select Target Employee *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId}) &bull; {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
              2. Select Attendance Date *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Current State Inspector */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Current Recorded State ({targetDate})
          </div>

          {existingItem?.isMarked ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 text-[11px]">Recorded Status:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{existingItem.status}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Marked By:</span>
                <div className="font-semibold text-slate-800 text-xs mt-0.5">
                  {existingItem.markedBy?.name || existingItem.markedBy?.email || 'System'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Existing Remarks:</span>
                <div className="text-slate-600 text-xs italic mt-0.5">
                  {existingItem.remarks || 'None'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-rose-600 font-semibold text-xs py-1">
              ⚠️ No attendance record found for this employee on {targetDate}.
            </div>
          )}
        </div>

        {/* Corrected Status */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
            3. Choose Corrected Status *
          </label>
          <select
            value={correctedStatus}
            onChange={(e) => setCorrectedStatus(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="PRESENT">Present (1.0 Credit)</option>
            <option value="WFH">Work From Home (1.0 Credit)</option>
            <option value="HALF_DAY">Half Day (0.5 Credit)</option>
            <option value="ABSENT">Absent (0.0 Credit)</option>
            <option value="LEAVE">Approved Leave (Excluded from Denominator)</option>
            <option value="HOLIDAY">Holiday / Weekly Off (Excluded from Denominator)</option>
          </select>
        </div>

        {/* Mandatory Remarks */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
            4. Mandatory Reason for Rectification (Immutable Audit Trail) *
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Employee was on authorized university outreach duty; proof verified by HR lead."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link href="/admin/employee-attendance">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            disabled={isPending || !existingItem?.attendanceId}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isPending ? 'Logging Audit & Rectifying...' : 'Commit Rectification & Log Audit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

