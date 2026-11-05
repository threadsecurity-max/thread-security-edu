'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';

interface EmployeeDirectoryClientProps {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  initialDirectory: any[];
}

export function EmployeeDirectoryClient({
  currentUser,
  initialDirectory = [],
}: EmployeeDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = useMemo(() => {
    const set = new Set<string>();
    initialDirectory.forEach((emp) => {
      if (emp.department) set.add(emp.department);
    });
    return Array.from(set);
  }, [initialDirectory]);

  const filtered = useMemo(() => {
    return initialDirectory.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [initialDirectory, searchQuery, selectedDept]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/employee-attendance">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 uppercase inline-block">
              STAFF &amp; FACULTY ROSTER
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Employee Directory
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employee-attendance/capture">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-sm">
              <UserCheck className="w-4 h-4" />
              <span>Capture Attendance</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full md:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Departments ({initialDirectory.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Overall Attendance %</th>
                <th className="py-3 px-4">Record Breakdown</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs text-slate-600">No employees match this filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60 text-[11px]">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {emp.name}
                      <div className="text-[11px] text-slate-400 font-normal">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{emp.department}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{emp.designation}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-black text-sm">
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
                      <div className="text-[10px] text-slate-400">
                        {emp.attendanceCredits} credits / {emp.totalWorkingDays} days
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">{emp.presentDays}P</span>
                        <span className="text-amber-700 font-bold">{emp.halfDays}H</span>
                        <span className="text-rose-700 font-bold">{emp.absentDays}A</span>
                        <span className="text-blue-700 font-bold">{emp.leaveDays}L</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/employee-attendance/employees/${emp.id}`}>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 transition-colors cursor-pointer">
                          <span>Day-to-Day Records</span>
                          <ExternalLink className="w-3 h-3 text-violet-600" />
                        </button>
                      </Link>
                    </td>
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

