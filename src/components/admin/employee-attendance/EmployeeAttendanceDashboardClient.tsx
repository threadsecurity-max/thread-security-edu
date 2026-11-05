'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Edit3,
  ExternalLink,
  Lock,
  Unlock,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  rectifyEmployeeAttendanceAction,
  getDailyAttendanceAction,
} from '@/features/employee-attendance/actions/attendance.actions';
import { EmployeeAttendanceStatus } from '@prisma/client';

interface EmployeeAttendanceDashboardProps {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  initialOverview: any;
  initialDaily: any;
  initialDate: string;
}

export function EmployeeAttendanceDashboardClient({
  currentUser,
  initialOverview,
  initialDaily,
  initialDate,
}: EmployeeAttendanceDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [dailyData, setDailyData] = useState(initialDaily);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  const [toastNotice, setToastNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Rectification Modal (Super Admin only)
  const [rectifyModalItem, setRectifyModalItem] = useState<any | null>(null);
  const [rectifyForm, setRectifyForm] = useState<{
    newStatus: EmployeeAttendanceStatus;
    remarks: string;
  }>({
    newStatus: 'PRESENT',
    remarks: '',
  });

  const isSuperAdmin =
    currentUser.email?.trim().toLowerCase() === 'threadsecurity@gmail.com' ||
    currentUser.role?.toUpperCase() === 'SUPER_ADMIN';

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastNotice({ text, type });
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Change date and fetch new day data
  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    startTransition(async () => {
      const res = await getDailyAttendanceAction(newDateStr);
      if (res.success && res.data) {
        setDailyData(res.data);
      } else {
        showToast(res.error || 'Failed to load date', 'error');
      }
    });
  };

  // Extract distinct departments for filtering
  const departments = useMemo(() => {
    const set = new Set<string>();
    (dailyData?.items || []).forEach((item: any) => {
      if (item.employee?.department) set.add(item.employee.department);
    });
    return Array.from(set);
  }, [dailyData]);

  // Filter items
  const filteredItems = useMemo(() => {
    const list = dailyData?.items || [];
    return list.filter((item: any) => {
      const name = item.employee?.name?.toLowerCase() || '';
      const email = item.employee?.email?.toLowerCase() || '';
      const empId = item.employee?.employeeId?.toLowerCase() || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || empId.includes(q);
      const matchesDept = selectedDept === 'ALL' || item.employee?.department === selectedDept;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'MARKED' && item.isMarked) ||
        (selectedStatus === 'UNMARKED' && !item.isMarked) ||
        item.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [dailyData, searchQuery, selectedDept, selectedStatus]);

  // Handle Super Admin Rectification Submit
  const handleRectifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rectifyModalItem?.attendanceId) {
      showToast('No saved attendance record found to rectify. Please capture attendance first.', 'error');
      return;
    }
    if (!rectifyForm.remarks.trim()) {
      showToast('Mandatory correction remarks must be provided.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await rectifyEmployeeAttendanceAction({
        attendanceId: rectifyModalItem.attendanceId,
        newStatus: rectifyForm.newStatus,
        remarks: rectifyForm.remarks.trim(),
      });

      if (res.success) {
        showToast('Attendance status successfully rectified and recorded in audit log.');
        setRectifyModalItem(null);
        setRectifyForm({ newStatus: 'PRESENT', remarks: '' });
        // Refresh day data
        const refreshed = await getDailyAttendanceAction(selectedDate);
        if (refreshed.success && refreshed.data) {
          setDailyData(refreshed.data);
        }
      } else {
        showToast(res.error || 'Failed to rectify attendance', 'error');
      }
    });
  };

  const getStatusBadge = (status: string, isMarked: boolean) => {
    if (!isMarked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <Clock className="w-3 h-3" /> Not Marked
        </span>
      );
    }
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present (1.0)
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Half Day (0.5)
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Absent (0.0)
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3 h-3 text-blue-600" /> Approved Leave
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" /> Holiday / Off
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
            toastNotice.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
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

      {/* Header & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-violet-50 text-violet-700 border border-violet-200">
              OPERATIONAL ATTENDANCE ENGINE
            </span>
            {dailyData?.isFinalized ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Lock className="w-3 h-3 text-amber-700" /> FINALIZED & LOCKED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Unlock className="w-3 h-3 text-slate-500" /> UNFINALIZED / DRAFT
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Employee Attendance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily attendance tracking, automated percentage credits, and hierarchical audit governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <Link href={`/admin/employee-attendance/capture?date=${selectedDate}`}>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-sm">
              <UserCheck className="w-4 h-4" />
              <span>Capture Daily Attendance</span>
            </button>
          </Link>

          <Link href="/admin/employee-attendance/reports">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Reports</span>
            </button>
          </Link>

          {isSuperAdmin && (
            <Link href="/admin/employee-attendance/corrections">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all border border-amber-200">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Rectification Panel</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Cards (Section 3 of prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Employees */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dailyData?.totalEmployees || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {dailyData?.markedCount || 0} recorded for date
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-emerald-50/30 to-transparent">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {dailyData?.presentCount || 0}
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-1 font-medium">
            Full 1.0 Day Credit
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-rose-50/30 to-transparent">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            {dailyData?.absentCount || 0}
          </div>
          <div className="text-[10px] text-rose-600/80 mt-1 font-medium">
            0 Credit (Non-excused)
          </div>
        </div>

        {/* Half Day */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-amber-50/30 to-transparent">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Half Day</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {dailyData?.halfDayCount || 0}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-1 font-medium">
            0.5 Working Credit
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-blue-50/30 to-transparent">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>On Leave</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            {dailyData?.leaveCount || 0}
          </div>
          <div className="text-[10px] text-blue-600/80 mt-1 font-medium">
            Approved (Excluded Denom)
          </div>
        </div>

        {/* Overall Percentage */}
        <div className="bg-white border border-violet-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-violet-50/30 to-transparent">
          <div className="flex items-center justify-between text-violet-800 text-xs font-semibold">
            <span>Attendance %</span>
            <BarChart3 className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-violet-700 mt-2">
            {dailyData?.overallPercentage ?? 100}%
          </div>
          <div className="text-[10px] text-violet-600/80 mt-1 font-medium">
            Dynamic Credits Ratio
          </div>
        </div>
      </div>

      {/* Table & Filter Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
              <option value="HALF_DAY">Half Day Only</option>
              <option value="LEAVE">Leave Only</option>
              <option value="HOLIDAY">Holiday / Off</option>
              <option value="MARKED">Marked Only</option>
              <option value="UNMARKED">Unmarked Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Sr. No.</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department &amp; Designation</th>
                <th className="py-3 px-4">Status ({selectedDate})</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs text-slate-600">No employee records match the filter criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any, idx: number) => {
                  const emp = item.employee;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60 text-[11px]">
                          {emp.employeeId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{emp.department}</div>
                        <div className="text-[11px] text-slate-500">{emp.designation}</div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(item.status, item.isMarked)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span
                            className={
                              emp.attendancePercentage >= 85
                                ? 'text-emerald-700'
                                : emp.attendancePercentage >= 75
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {emp.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 max-w-[200px] truncate">
                        {item.remarks || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link href={`/admin/employee-attendance/employees/${emp.id}`}>
                            <button
                              title="View Individual Attendance Profile"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </Link>

                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setRectifyModalItem(item);
                                setRectifyForm({
                                  newStatus: item.status || 'PRESENT',
                                  remarks: item.remarks || '',
                                });
                              }}
                              title="Super Admin Rectification"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SUPER ADMIN RECTIFICATION MODAL ── */}
      {rectifyModalItem && (
        <Dialog open={Boolean(rectifyModalItem)} onOpenChange={() => setRectifyModalItem(null)}>
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
                <div>
                  Employee: <span className="font-semibold">{rectifyModalItem.employee.name}</span> ({rectifyModalItem.employee.employeeId})
                </div>
                <div>Date: <span className="font-semibold">{selectedDate}</span></div>
                <div>Current Recorded Status: <span className="font-bold underline">{rectifyModalItem.status}</span></div>
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
                  placeholder="e.g. Approved medical leave certificate submitted to HR; manual status corrected by Super Admin."
                  value={rectifyForm.remarks}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRectifyModalItem(null)}
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

