'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { getMonthlyAttendanceReportAction } from '@/features/employee-attendance/actions/attendance.actions';

interface AttendanceReportsClientProps {
  initialReport: {
    year: number;
    month: number;
    daysInMonth: number;
    totalEmployees: number;
    rows: Array<{
      id: string;
      name: string;
      employeeId: string;
      department: string;
      designation: string;
      present: number;
      wfh?: number;
      halfDay: number;
      absent: number;
      leave: number;
      holiday: number;
      attendanceCredits: number;
      totalWorkingDays: number;
      attendancePercentage: number;
      days: Record<number, string>;
    }>;
  };
}

export function AttendanceReportsClient({ initialReport }: AttendanceReportsClientProps) {
  const [report, setReport] = useState(initialReport);
  const [year, setYear] = useState(initialReport.year);
  const [month, setMonth] = useState(initialReport.month);
  const [isPending, startTransition] = useTransition();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);

    startTransition(async () => {
      const res = await getMonthlyAttendanceReportAction(newYear, newMonth);
      if (res.success && res.data) {
        setReport(res.data);
      }
    });
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Designation',
      'Present Days',
      'WFH Days',
      'Half Days',
      'Absent Days',
      'Leave Days',
      'Working Days',
      'Attendance Credits',
      'Attendance %',
      ...Array.from({ length: report.daysInMonth }, (_, i) => `Day ${i + 1}`),
    ];

    const csvRows = [headers.join(',')];

    report.rows.forEach((r) => {
      const row = [
        `"${r.employeeId}"`,
        `"${r.name}"`,
        `"${r.department}"`,
        `"${r.designation}"`,
        r.present,
        r.wfh || 0,
        r.halfDay,
        r.absent,
        r.leave,
        r.totalWorkingDays,
        r.attendanceCredits,
        `"${r.attendancePercentage}%"`,
        ...Array.from({ length: report.daysInMonth }, (_, i) => `"${r.days[i + 1] || 'NOT_MARKED'}"`),
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThreadSecurity_Attendance_Report_${year}_${String(month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusInitial = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="text-emerald-700 font-bold">P</span>;
      case 'WFH':
        return <span className="text-cyan-700 font-bold">W</span>;
      case 'HALF_DAY':
        return <span className="text-amber-700 font-bold">H</span>;
      case 'ABSENT':
        return <span className="text-rose-700 font-bold">A</span>;
      case 'LEAVE':
        return <span className="text-blue-700 font-bold">L</span>;
      case 'HOLIDAY':
        return <span className="text-purple-700 font-bold">O</span>;
      default:
        return <span className="text-slate-300 font-normal">·</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/employee-attendance">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 uppercase inline-block">
              EXECUTIVE COMPLIANCE REPORTS
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Monthly Attendance Reports
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <button
              onClick={() => {
                let m = month - 1;
                let y = year;
                if (m < 1) {
                  m = 12;
                  y -= 1;
                }
                handleMonthChange(m, y);
              }}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-800 px-2 min-w-[110px] text-center">
              {monthNames[month - 1]} {year}
            </span>

            <button
              onClick={() => {
                let m = month + 1;
                let y = year;
                if (m > 12) {
                  m = 1;
                  y += 1;
                }
                handleMonthChange(m, y);
              }}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Report Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Day-by-Day Master Attendance Register &bull; {monthNames[month - 1]} {year}
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span><b>P</b> = Present (1.0)</span>
              <span><b>W</b> = WFH (1.0)</span>
              <span><b>H</b> = Half Day (0.5)</span>
              <span><b>A</b> = Absent (0.0)</span>
              <span><b>L</b> = Leave</span>
              <span><b>O</b> = Holiday / Off</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f3f4fd] text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-[#f3f4fd] z-10">EMPLOYEE</th>
                <th className="py-2.5 px-2 text-center">ID</th>
                <th className="py-2.5 px-2 text-center">%</th>
                <th className="py-2.5 px-1.5 text-center text-emerald-700">P</th>
                <th className="py-2.5 px-1.5 text-center text-cyan-700">W</th>
                <th className="py-2.5 px-1.5 text-center text-amber-700">H</th>
                <th className="py-2.5 px-1.5 text-center text-rose-700">A</th>
                <th className="py-2.5 px-1.5 text-center text-blue-700">L</th>

                {/* Day Columns 1..N */}
                {Array.from({ length: report.daysInMonth }, (_, idx) => (
                  <th key={idx + 1} className="py-2 px-1 text-center font-mono text-[9px] w-6">
                    {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={report.daysInMonth + 8} className="py-12 text-center text-slate-400 font-sans">
                    No employee records found.
                  </td>
                </tr>
              ) : (
                report.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100 max-w-[160px] truncate">
                      {row.name}
                      <div className="text-[9px] text-slate-400 font-normal truncate">{row.department}</div>
                    </td>
                    <td className="py-2 px-2 text-center text-violet-700 font-bold text-[10px]">
                      {row.employeeId}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900">
                      <span
                        className={
                          row.attendancePercentage >= 85
                            ? 'text-emerald-700'
                            : row.attendancePercentage >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {row.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center text-emerald-700 font-bold">{row.present}</td>
                    <td className="py-2 px-1.5 text-center text-cyan-700 font-bold">{row.wfh || 0}</td>
                    <td className="py-2 px-1.5 text-center text-amber-700 font-bold">{row.halfDay}</td>
                    <td className="py-2 px-1.5 text-center text-rose-700 font-bold">{row.absent}</td>
                    <td className="py-2 px-1.5 text-center text-blue-700 font-bold">{row.leave}</td>

                    {/* Day status initials */}
                    {Array.from({ length: report.daysInMonth }, (_, idx) => {
                      const dayNum = idx + 1;
                      const status = row.days[dayNum];
                      return (
                        <td
                          key={dayNum}
                          className="py-1 px-1 text-center text-[10px] border-l border-slate-50"
                        >
                          {getStatusInitial(status)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

