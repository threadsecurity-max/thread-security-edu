'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  ShieldCheck,
  Search,
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  attendanceId: string;
  attendanceDate: string;
  previousStatus: string;
  updatedStatus: string;
  reason: string;
  modifiedAt: string;
  modifiedBy: {
    id: string;
    name: string;
    email: string;
  };
  originallyMarkedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    department: string;
    designation: string;
  };
}

export function AttendanceAuditHistoryClient({
  logs = [],
}: {
  logs: AuditLogItem[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        log.employee?.name?.toLowerCase().includes(q) ||
        log.employee?.employeeId?.toLowerCase().includes(q) ||
        log.employee?.department?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q) ||
        log.attendanceDate?.includes(q)
      );
    });
  }, [logs, searchQuery]);

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
            <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase inline-block">
              IMMUTABLE AUDIT TRAIL
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Attendance Rectification Audit History
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employee-attendance/corrections">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm">
              <span>Override Console</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by employee, ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            {filtered.length} Recorded Modification Events
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Modification Timestamp</th>
                <th className="py-3 px-4">Target Employee</th>
                <th className="py-3 px-4">Attendance Date</th>
                <th className="py-3 px-4">Previous Status</th>
                <th className="py-3 px-4">Updated Status</th>
                <th className="py-3 px-4">Audit Reason / Remarks</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4">Originally Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-600" />
                    <p className="font-semibold text-xs text-slate-600">No attendance rectifications logged.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Any edits made by the Super Admin will appear here permanently.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.modifiedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.employee.name}</div>
                      <div className="text-[10px] font-mono text-violet-700">{log.employee.employeeId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {log.attendanceDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 line-through">
                        {log.previousStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {log.updatedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[240px] text-[11px] font-medium leading-relaxed">
                      &ldquo;{log.reason}&rdquo;
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.modifiedBy.name}</div>
                      <div className="text-[10px] text-slate-400">{log.modifiedBy.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.originallyMarkedBy ? (
                        <div>
                          <div className="font-medium text-slate-700">{log.originallyMarkedBy.name}</div>
                          <div className="text-[10px] text-slate-400">{log.originallyMarkedBy.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
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

