'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Edit3,
  User,
  Mail,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  Lock,
  History,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  rectifyEmployeeAttendanceAction,
  getEmployeeAttendanceDetailAction,
} from '@/features/employee-attendance/actions/attendance.actions';
import { EmployeeAttendanceStatus } from '@prisma/client';

interface EmployeeProfileData {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    employeeId: string;
    department: string;
    designation: string;
    joiningDate: string;
    status: string;
  };
  overall: {
    totalRecords: number;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    leaveDays: number;
    holidayDays: number;
    attendanceCredits: number;
    totalWorkingDays: number;
    attendancePercentage: number;
  };
  monthly: {
    year: number;
    month: number;
    totalDaysMarked: number;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    leaveDays: number;
    holidayDays: number;
    attendanceCredits: number;
    totalWorkingDays: number;
    attendancePercentage: number;
  };
  calendarMap: Record<
    string,
    {
      status: EmployeeAttendanceStatus;
      remarks?: string | null;
      isFinalized: boolean;
      markedBy?: string | null;
      attendanceId: string;
      hasAuditLogs: boolean;
    }
  >;
  recentHistory: Array<{
    id: string;
    date: string;
    status: EmployeeAttendanceStatus;
    remarks?: string | null;
    isFinalized: boolean;
    markedBy: string;
    updatedAt: string;
    auditLogsCount: number;
  }>;
}

export function EmployeeAttendanceProfileClient({
  currentUser,
  initialData,
}: {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  initialData: EmployeeProfileData;
}) {
  const [data, setData] = useState<EmployeeProfileData>(initialData);
  const [currentYear, setCurrentYear] = useState(initialData.monthly.year);
  const [currentMonth, setCurrentMonth] = useState(initialData.monthly.month); // 1-12
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Super Admin Rectification modal state
  const [rectifyModal, setRectifyModal] = useState<{
    attendanceId: string;
    date: string;
    currentStatus: EmployeeAttendanceStatus;
    currentRemarks: string;
  } | null>(null);
  const [rectifyForm, setRectifyForm] = useState<{
    newStatus: EmployeeAttendanceStatus;
    remarks: string;
  }>({
    newStatus: 'PRESENT',
    remarks: '',
  });

  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isSuperAdmin =
    currentUser.email?.trim().toLowerCase() === 'threadsecurity@gmail.com' ||
    currentUser.role?.toUpperCase() === 'SUPER_ADMIN';

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleMonthChange = (offset: number) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);

    startTransition(async () => {
      const res = await getEmployeeAttendanceDetailAction(data.employee.id, nextYear, nextMonth);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // First day of month and total days
  const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay(); // 0 = Sun
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();

  // Rectification submit
  const handleRectifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rectifyModal?.attendanceId) return;
    if (!rectifyForm.remarks.trim()) {
      showToast('Mandatory correction remarks must be provided.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await rectifyEmployeeAttendanceAction({
        attendanceId: rectifyModal.attendanceId,
        newStatus: rectifyForm.newStatus,
        remarks: rectifyForm.remarks.trim(),
      });

      if (res.success) {
        showToast('Attendance status successfully rectified and recorded in audit log.');
        setRectifyModal(null);
        // Refresh data
        const refreshed = await getEmployeeAttendanceDetailAction(data.employee.id, currentYear, currentMonth);
        if (refreshed.success && refreshed.data) {
          setData(refreshed.data);
        }
      } else {
        showToast(res.error || 'Failed to rectify attendance', 'error');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present (1.0)
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Half Day (0.5)
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Absent (0.0)
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3 h-3 text-blue-600" /> Leave (Excused)
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" /> Holiday / Off
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">Unrecorded</span>;
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/employee-attendance">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 uppercase">
                INDIVIDUAL ATTENDANCE DOSSIER
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {data.employee.employeeId}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {data.employee.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/employee-attendance/capture`}>
            <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-sm">
              Capture Today
            </button>
          </Link>
        </div>
      </div>

      {/* Profile Overview Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee Metadata Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {data.employee.name.charAt(0)}
            </div>
            <div>
              <div className="font-black text-slate-900 text-base">{data.employee.name}</div>
              <div className="text-xs text-slate-500 font-medium">{data.employee.email}</div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Employee ID</span>
              <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/50">
                {data.employee.employeeId}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-800">{data.employee.department}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Designation</span>
              <span className="font-semibold text-slate-800">{data.employee.designation}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Organization Role</span>
              <span className="font-semibold text-slate-800">{data.employee.role}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Joining Date</span>
              <span className="font-mono text-slate-700">
                {new Date(data.employee.joiningDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Staff Status</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {data.employee.status}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Formula Attribution
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed font-mono">
              Credits = (Present × 1) + (HalfDay × 0.5)<br />
              Working Days = Present + HalfDay + Absent<br />
              Attendance % = (Credits ÷ Working Days) × 100
            </div>
          </div>
        </div>

        {/* Right: Key Performance Statistics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Overall Attendance % */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1 bg-gradient-to-br from-violet-50/40 to-transparent">
            <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
              Overall Attendance %
            </div>
            <div className="text-3xl font-black text-violet-900 mt-2">
              {data.overall.attendancePercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {data.overall.attendanceCredits} credits / {data.overall.totalWorkingDays} days
            </div>
          </div>

          {/* Monthly Attendance % */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-50/40 to-transparent">
            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {monthNames[currentMonth - 1]} Attendance %
            </div>
            <div className="text-3xl font-black text-indigo-900 mt-2">
              {data.monthly.attendancePercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {data.monthly.attendanceCredits} credits / {data.monthly.totalWorkingDays} days
            </div>
          </div>

          {/* Present Days */}
          <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-emerald-50/30 to-transparent">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Present Days</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">
              {data.overall.presentDays}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-1">
              Month: {data.monthly.presentDays} days
            </div>
          </div>

          {/* Half Days */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-amber-50/30 to-transparent">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
              <span>Half Days</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-2">
              {data.overall.halfDays}
            </div>
            <div className="text-[10px] text-amber-600/80 mt-1">
              Month: {data.monthly.halfDays} days
            </div>
          </div>

          {/* Absent Days */}
          <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-rose-50/30 to-transparent">
            <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
              <span>Absent Days</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700 mt-2">
              {data.overall.absentDays}
            </div>
            <div className="text-[10px] text-rose-600/80 mt-1">
              Month: {data.monthly.absentDays} days
            </div>
          </div>

          {/* Approved Leaves */}
          <div className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-blue-50/30 to-transparent">
            <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
              <span>Approved Leave</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700 mt-2">
              {data.overall.leaveDays}
            </div>
            <div className="text-[10px] text-blue-600/80 mt-1">
              Excluded from working days
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Interactive Calendar (Section 5 of prompt) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        {/* Calendar Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              <span>
                {monthNames[currentMonth - 1]} {currentYear} &bull; Monthly Register
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any date to inspect recorded attendance parameters or perform Super Admin rectification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs text-slate-800 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg min-w-[120px] text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 py-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Present (1.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Absent (0.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>Half Day (0.5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span>Holiday / Weekly Off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
            <span>Not Marked</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center font-bold text-[11px] text-slate-400 py-1 uppercase">
              {d}
            </div>
          ))}

          {/* Empty prefix slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-50/40 border border-slate-100" />
          ))}

          {/* Actual days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = data.calendarMap[dateKey];
            const isSelected = selectedCalendarDate === dateKey;

            let dotColor = 'bg-slate-200';
            let bgTint = 'bg-white hover:bg-slate-50';

            if (record) {
              if (record.status === 'PRESENT') {
                dotColor = 'bg-emerald-500';
                bgTint = 'bg-emerald-50/20 hover:bg-emerald-50/40 border-emerald-200/50';
              } else if (record.status === 'HALF_DAY') {
                dotColor = 'bg-amber-500';
                bgTint = 'bg-amber-50/20 hover:bg-amber-50/40 border-amber-200/50';
              } else if (record.status === 'ABSENT') {
                dotColor = 'bg-rose-500';
                bgTint = 'bg-rose-50/20 hover:bg-rose-50/40 border-rose-200/50';
              } else if (record.status === 'LEAVE') {
                dotColor = 'bg-blue-500';
                bgTint = 'bg-blue-50/20 hover:bg-blue-50/40 border-blue-200/50';
              } else if (record.status === 'HOLIDAY') {
                dotColor = 'bg-purple-500';
                bgTint = 'bg-purple-50/20 hover:bg-purple-50/40 border-purple-200/50';
              }
            }

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedCalendarDate(dateKey)}
                className={`h-20 rounded-xl p-2 border transition-all cursor-pointer flex flex-col justify-between ${bgTint} ${
                  isSelected ? 'ring-2 ring-violet-500 border-violet-500 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{dayNum}</span>
                  {record?.hasAuditLogs && (
                    <span title="Rectified Record">
                      <History className="w-3 h-3 text-amber-600" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-[10px] font-bold text-slate-600 truncate">
                    {record ? record.status : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Inspector Panel */}
        {selectedCalendarDate && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Inspection Target: {selectedCalendarDate}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-sm text-slate-900">Recorded Status:</span>
                {data.calendarMap[selectedCalendarDate] ? (
                  getStatusBadge(data.calendarMap[selectedCalendarDate].status)
                ) : (
                  <span className="text-xs text-slate-400">No attendance captured for this date</span>
                )}
              </div>
              {data.calendarMap[selectedCalendarDate]?.remarks && (
                <div className="text-xs text-slate-600 mt-1 italic">
                  &ldquo;{data.calendarMap[selectedCalendarDate].remarks}&rdquo;
                </div>
              )}
              {data.calendarMap[selectedCalendarDate]?.markedBy && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Marked by: {data.calendarMap[selectedCalendarDate].markedBy}
                </div>
              )}
            </div>

            {isSuperAdmin && data.calendarMap[selectedCalendarDate] && (
              <button
                type="button"
                onClick={() => {
                  const rec = data.calendarMap[selectedCalendarDate];
                  setRectifyModal({
                    attendanceId: rec.attendanceId,
                    date: selectedCalendarDate,
                    currentStatus: rec.status,
                    currentRemarks: rec.remarks || '',
                  });
                  setRectifyForm({
                    newStatus: rec.status,
                    remarks: rec.remarks || '',
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>Super Admin Rectify</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Attendance History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Attendance History Register (Recent 31 Days)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Recorded Status</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4">Marked By</th>
                <th className="py-3 px-4">Audit Status</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right">Rectification</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {data.recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No historical attendance entries logged for this employee.
                  </td>
                </tr>
              ) : (
                data.recentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.date}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-[240px] truncate">
                      {item.remarks || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">{item.markedBy}</td>
                    <td className="py-3 px-4">
                      {item.auditLogsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <History className="w-3 h-3 text-amber-600" /> {item.auditLogsCount} Rectification(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Original Register</span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setRectifyModal({
                              attendanceId: item.id,
                              date: item.date,
                              currentStatus: item.status,
                              currentRemarks: item.remarks || '',
                            });
                            setRectifyForm({
                              newStatus: item.status,
                              remarks: item.remarks || '',
                            });
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                          title="Rectify Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SUPER ADMIN RECTIFICATION MODAL ── */}
      {rectifyModal && (
        <Dialog open={Boolean(rectifyModal)} onOpenChange={() => setRectifyModal(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Super Admin Attendance Rectification</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleRectifySubmit} className="space-y-4 pt-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                <div className="font-bold">Exclusive Rectification Authority Active</div>
                <div>Employee: <span className="font-semibold">{data.employee.name}</span></div>
                <div>Date: <span className="font-semibold">{rectifyModal.date}</span></div>
                <div>Current Status: <span className="font-bold underline">{rectifyModal.currentStatus}</span></div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Corrected Attendance Status *
                </label>
                <select
                  required
                  value={rectifyForm.newStatus}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, newStatus: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="PRESENT">Present (1.0 Credit)</option>
                  <option value="HALF_DAY">Half Day (0.5 Credit)</option>
                  <option value="ABSENT">Absent (0 Credit)</option>
                  <option value="LEAVE">Approved Leave (Excluded)</option>
                  <option value="HOLIDAY">Holiday / Weekly Off (Excluded)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Mandatory Correction Reason &amp; Audit Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Verified official sick leave certificate with HR coordinator; rectified to Leave."
                  value={rectifyForm.remarks}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRectifyModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Logging Audit & Rectifying...' : 'Confirm Rectification'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
