'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Save,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lock,
  Unlock,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { captureEmployeeAttendanceAction } from '@/features/employee-attendance/actions/attendance.actions';
import { EmployeeAttendanceStatus } from '@prisma/client';

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  avatarUrl?: string | null;
}

interface CaptureEmployeeAttendanceClientProps {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  employees: EmployeeItem[];
  initialRecords: Array<{
    employeeId: string;
    status: EmployeeAttendanceStatus;
    remarks?: string | null;
  }>;
  initialDate: string;
  isDateFinalized: boolean;
}

export function CaptureEmployeeAttendanceClient({
  currentUser,
  employees,
  initialRecords,
  initialDate,
  isDateFinalized,
}: CaptureEmployeeAttendanceClientProps) {
  const router = useRouter();
  const [attendanceDate, setAttendanceDate] = useState(initialDate);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [shiftSlot, setShiftSlot] = useState('09:00 AM - 06:00 PM (Standard Tech Operations)');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [isFinalizedState, setIsFinalizedState] = useState(isDateFinalized);

  const [isPending, startTransition] = useTransition();
  const [toastNotice, setToastNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isSuperAdmin =
    currentUser.email?.trim().toLowerCase() === 'threadsecurity@gmail.com' ||
    currentUser.role?.toUpperCase() === 'SUPER_ADMIN';

  // State map: employeeId -> { status, remarks }
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: EmployeeAttendanceStatus; remarks: string }>
  >(() => {
    const map: Record<string, { status: EmployeeAttendanceStatus; remarks: string }> = {};
    const existingMap = new Map(initialRecords.map((r) => [r.employeeId, r]));

    employees.forEach((emp) => {
      const rec = existingMap.get(emp.id);
      map[emp.id] = {
        status: rec ? rec.status : 'PRESENT',
        remarks: rec?.remarks || '',
      };
    });
    return map;
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastNotice({ text, type });
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  // Bulk actions
  const handleBulkMark = (status: EmployeeAttendanceStatus) => {
    if (isFinalizedState && !isSuperAdmin) {
      showToast('Attendance is finalized and locked. Only Super Admin can modify.', 'error');
      return;
    }

    setAttendanceMap((prev) => {
      const next = { ...prev };
      filteredEmployees.forEach((emp) => {
        next[emp.id] = {
          ...next[emp.id],
          status,
        };
      });
      return next;
    });

    showToast(`Marked ${filteredEmployees.length} employees as ${status}.`);
  };

  // Single employee change
  const handleStatusChange = (employeeId: string, status: EmployeeAttendanceStatus) => {
    if (isFinalizedState && !isSuperAdmin) {
      showToast('Attendance for this date is finalized & locked for Attendance Manager.', 'error');
      return;
    }

    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        status,
      },
    }));
  };

  const handleRemarksChange = (employeeId: string, remarks: string) => {
    if (isFinalizedState && !isSuperAdmin) return;
    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        remarks,
      },
    }));
  };

  // Calculations for modal breakdown
  const summaryBreakdown = useMemo(() => {
    let present = 0;
    let wfh = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;

    employees.forEach((emp) => {
      const s = attendanceMap[emp.id]?.status || 'PRESENT';
      if (s === 'PRESENT') present++;
      if (s === 'WFH') wfh++;
      if (s === 'HALF_DAY') halfDay++;
      if (s === 'ABSENT') absent++;
      if (s === 'LEAVE') leave++;
      if (s === 'HOLIDAY') holiday++;
    });

    const credits = present * 1 + wfh * 1 + halfDay * 0.5;
    const workingDays = present + wfh + halfDay + absent;
    const percentage = workingDays > 0 ? Math.round((credits / workingDays) * 1000) / 10 : 100;

    return {
      total: employees.length,
      present,
      wfh,
      halfDay,
      absent,
      leave,
      holiday,
      credits,
      workingDays,
      percentage,
    };
  }, [employees, attendanceMap]);

  // Submission handler
  const executeSubmit = (isFinalized: boolean) => {
    if (isFinalizedState && !isSuperAdmin) {
      showToast('Attendance is finalized. Only Super Admin has rectification authority.', 'error');
      return;
    }

    startTransition(async () => {
      const records = employees.map((emp) => ({
        employeeId: emp.id,
        status: attendanceMap[emp.id]?.status || 'PRESENT',
        remarks: attendanceMap[emp.id]?.remarks || undefined,
      }));

      const res = await captureEmployeeAttendanceAction({
        date: attendanceDate,
        records,
        isFinalized,
      });

      if (res.success) {
        setIsFinalizedState(isFinalized);
        setShowConfirmModal(false);
        showToast(
          isFinalized
            ? 'Daily attendance finalized and locked successfully.'
            : 'Attendance saved as draft successfully.'
        );
        router.refresh();
      } else {
        showToast(res.error || 'Failed to save attendance', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
            toastNotice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toastNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastNotice.text}</span>
        </div>
      )}

      {/* Breadcrumb / Top Bar */}
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
                ATTENDANCE CAPTURE WORKFLOW
              </span>
              {isFinalizedState ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-700" /> FINALIZED RECORD (LOCKED)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <Unlock className="w-3 h-3 text-slate-500" /> READY FOR CAPTURE
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Capture Employee Attendance
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => executeSubmit(false)}
            disabled={isPending || (isFinalizedState && !isSuperAdmin)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={isPending || (isFinalizedState && !isSuperAdmin)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isFinalizedState && isSuperAdmin ? 'Update & Finalize' : 'Submit & Finalize'}</span>
          </button>
        </div>
      </div>

      {/* Lock Notice if Finalized */}
      {isFinalizedState && !isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold">Daily Attendance Finalized for this Date</div>
            <div className="text-[11px] text-amber-700">
              This attendance register has been submitted and locked. Akshay Kumar (Attendance Manager) cannot edit historical attendance. Only Super Admin ([threadsecurity@gmail.com](mailto:threadsecurity@gmail.com)) possesses rectification authority.
            </div>
          </div>
        </div>
      )}

      {/* Top Filter Card (UI matching reference screenshot media_1793802459452_6e02eeeb.png) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
              Attendance Date *
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => {
                setAttendanceDate(e.target.value);
                router.push(`/admin/employee-attendance/capture?date=${e.target.value}`);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
              Department *
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Departments ({employees.length} Staff)</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!filterCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Shift / Operational Hours *
              </label>
              <select
                value={shiftSlot}
                onChange={(e) => setShiftSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-violet-500"
              >
                <option value="09:00 AM - 06:00 PM (Standard Tech Operations)">
                  09:00 AM - 06:00 PM (Standard Tech Operations)
                </option>
                <option value="10:00 AM - 07:00 PM (Academic & Lab Instruction Shift)">
                  10:00 AM - 07:00 PM (Academic &amp; Lab Instruction Shift)
                </option>
                <option value="02:00 PM - 10:00 PM (Evening Offensive Security Range)">
                  02:00 PM - 10:00 PM (Evening Offensive Security Range)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Search Employee
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by full name, ID, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Trigger */}
        <div className="flex justify-center -mb-2">
          <button
            type="button"
            onClick={() => setFilterCollapsed(!filterCollapsed)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Toggle filter view"
          >
            {filterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Bulk Action Radios (Matching UI screenshot media_1793802459452_6e02eeeb.png) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700">
              <input
                type="radio"
                name="bulkActionRadio"
                onChange={() => handleBulkMark('PRESENT')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Mark all - Present</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-700">
              <input
                type="radio"
                name="bulkActionRadio"
                onChange={() => handleBulkMark('WFH')}
                className="text-cyan-600 focus:ring-cyan-500"
              />
              <span>Mark all - WFH</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-rose-700">
              <input
                type="radio"
                name="bulkActionRadio"
                onChange={() => handleBulkMark('ABSENT')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span>Mark all - Absent</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-700">
              <input
                type="radio"
                name="bulkActionRadio"
                onChange={() => handleBulkMark('HALF_DAY')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>Mark all - Half Day</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700">
              <input
                type="radio"
                name="bulkActionRadio"
                onChange={() => handleBulkMark('LEAVE')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Mark all - Leave</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('ALL');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table (Matching Reference Screenshot Layout) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Employee Attendance List
            </h2>
            <p className="text-[11px] text-slate-500">
              Showing {filteredEmployees.length} of {employees.length} total staff members
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f3ff] text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">SR. NO.</th>
                <th className="py-3 px-3">EMPLOYEE ID</th>
                <th className="py-3 px-4">EMPLOYEE NAME</th>
                <th className="py-3 px-4">DEPARTMENT</th>
                <th className="py-3 px-3">DESIGNATION</th>
                <th className="py-3 px-3 text-center">PRESENT</th>
                <th className="py-3 px-3 text-center">WFH</th>
                <th className="py-3 px-3 text-center">ABSENT</th>
                <th className="py-3 px-3 text-center">HALF DAY</th>
                <th className="py-3 px-3 text-center">LEAVE</th>
                <th className="py-3 px-3 text-center">HOLIDAY</th>
                <th className="py-3 px-4">REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs text-slate-600">No employees found for this department or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const state = attendanceMap[emp.id] || { status: 'PRESENT', remarks: '' };
                  const isLocked = isFinalizedState && !isSuperAdmin;

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        state.status === 'ABSENT'
                          ? 'bg-rose-50/20'
                          : state.status === 'WFH'
                          ? 'bg-cyan-50/20'
                          : state.status === 'HALF_DAY'
                          ? 'bg-amber-50/20'
                          : state.status === 'LEAVE'
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-violet-700">
                        <span className="bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60 text-[11px]">
                          {emp.employeeId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {emp.name}
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[160px]">
                          {emp.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {emp.department}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {emp.designation}
                      </td>

                      {/* PRESENT Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'PRESENT'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'PRESENT')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* WFH Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'WFH'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'WFH')}
                          className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* ABSENT Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'ABSENT'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'ABSENT')}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* HALF DAY Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'HALF_DAY'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'HALF_DAY')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* LEAVE Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'LEAVE'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'LEAVE')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* HOLIDAY Radio */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name={`status-${emp.id}`}
                          checked={state.status === 'HOLIDAY'}
                          disabled={isLocked}
                          onChange={() => handleStatusChange(emp.id, 'HOLIDAY')}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* REMARKS */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={state.remarks}
                          disabled={isLocked}
                          onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-violet-500 disabled:bg-slate-100"
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

      {/* ── CONFIRMATION MODAL BEFORE FINAL SUBMISSION ── */}
      {showConfirmModal && (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
                <span>Confirm &amp; Finalize Attendance</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-slate-600 text-[11px]">
                Please review the attendance breakdown for <span className="font-bold text-slate-900">{attendanceDate}</span> before locking. Once submitted, records are finalized for the Attendance Manager and can only be rectified by the Super Admin.
              </p>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-semibold">Total Employees</div>
                  <div className="text-lg font-black text-slate-900">{summaryBreakdown.total}</div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-[10px] text-emerald-700 font-semibold">Present (1.0 Credit)</div>
                  <div className="text-lg font-black text-emerald-800">{summaryBreakdown.present}</div>
                </div>

                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                  <div className="text-[10px] text-cyan-700 font-semibold">WFH (1.0 Credit)</div>
                  <div className="text-lg font-black text-cyan-800">{summaryBreakdown.wfh}</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-[10px] text-amber-700 font-semibold">Half Day (0.5 Credit)</div>
                  <div className="text-lg font-black text-amber-800">{summaryBreakdown.halfDay}</div>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="text-[10px] text-rose-700 font-semibold">Absent (0 Credit)</div>
                  <div className="text-lg font-black text-rose-800">{summaryBreakdown.absent}</div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-[10px] text-blue-700 font-semibold">Approved Leave</div>
                  <div className="text-lg font-black text-blue-800">{summaryBreakdown.leave}</div>
                </div>

                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="text-[10px] text-violet-700 font-semibold">Day Attendance %</div>
                  <div className="text-lg font-black text-violet-800">{summaryBreakdown.percentage}%</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Irreversible Lockout Notice:</span> After submission, this date will be sealed against further edits by the Attendance Manager.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeSubmit(true)}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Finalizing...' : 'Submit & Lock Register'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

