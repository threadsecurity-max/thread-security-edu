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
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  attendanceId: string;
  attendanceDate: string;
  previousStatus: string;
  updatedStatus: string;
  checkInTime?: string | null;
  sequenceNumber?: number;
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
  const [filterType, setFilterType] = useState<'ALL' | 'COORDINATOR' | 'SUPER_ADMIN'>('ALL');

  const coordinatorCount = useMemo(() => {
    return logs.filter((l) => {
      const email = (l.modifiedBy?.email || '').toLowerCase();
      const name = (l.modifiedBy?.name || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      return email.includes('akshay') || name.includes('akshay') || reason.includes('akshay') || reason.includes('coordinator');
    }).length;
  }, [logs]);

  const superAdminCount = useMemo(() => {
    return logs.filter((l) => {
      const email = (l.modifiedBy?.email || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      return email === 'threadsecurity@gmail.com' || reason.includes('rectified') || reason.includes('super admin');
    }).length;
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const email = (log.modifiedBy?.email || '').toLowerCase();
      const name = (log.modifiedBy?.name || '').toLowerCase();
      const reason = (log.reason || '').toLowerCase();

      const isCoord = email.includes('akshay') || name.includes('akshay') || reason.includes('akshay') || reason.includes('coordinator');
      const isSuper = email === 'threadsecurity@gmail.com' || reason.includes('rectified') || reason.includes('super admin');

      if (filterType === 'COORDINATOR' && !isCoord) return false;
      if (filterType === 'SUPER_ADMIN' && !isSuper) return false;

      if (!q) return true;
      return (
        log.employee?.name?.toLowerCase().includes(q) ||
        log.employee?.employeeId?.toLowerCase().includes(q) ||
        log.employee?.department?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q) ||
        log.attendanceDate?.includes(q) ||
        log.checkInTime?.toLowerCase().includes(q) ||
        log.modifiedBy?.name?.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/employee-attendance">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase inline-block">
                SUPER ADMIN AUDIT OVERSIGHT
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> LIVE DISPATCH ACTIVE
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Employee Attendance Audit History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit verification of all daily markings by Attendance Coordinator (Akshay Kumar) and Super Admin overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employee-attendance/corrections">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
              <span>Override Console</span>
            </button>
          </Link>
          <Link href="/admin/employee-attendance/capture">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer">
              <span>Capture Register</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Recorded Audit Acts</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{logs.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Immutable audit trail</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Akshay Kumar Submissions</div>
            <div className="text-2xl font-black text-indigo-900 mt-0.5">{coordinatorCount}</div>
            <div className="text-[10px] text-indigo-600 mt-0.5">Daily 24-hr sequence acts</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700 border border-indigo-100">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Super Admin Overrides</div>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{superAdminCount}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Historical rectifications</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 border border-amber-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Audits ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('COORDINATOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'COORDINATOR'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Akshay Kumar (Coordinator) ({coordinatorCount})
            </button>
            <button
              onClick={() => setFilterType('SUPER_ADMIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'SUPER_ADMIN'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Super Admin Overrides ({superAdminCount})
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee, ID, time, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f3ff] text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">TARGET EMPLOYEE</th>
                <th className="py-3 px-4">ATTENDANCE DATE</th>
                <th className="py-3 px-3 text-center">SEQUENCE ACT</th>
                <th className="py-3 px-3 text-center">24-HR CLOCK</th>
                <th className="py-3 px-4 text-center">STATUS TRANSITION</th>
                <th className="py-3 px-4">AUDIT REASON & REMARKS</th>
                <th className="py-3 px-4">ACTOR / SUBMITTED BY</th>
                <th className="py-3 px-4">ORIGINAL MARKER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-600" />
                    <p className="font-semibold text-xs text-slate-600">No attendance audit acts found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submissions by Akshay Kumar and Super Admin will appear here permanently in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const isAkshay =
                    log.modifiedBy?.email?.toLowerCase().includes('akshay') ||
                    log.modifiedBy?.name?.toLowerCase().includes('akshay') ||
                    log.reason?.toLowerCase().includes('akshay');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.modifiedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.employee.name}</div>
                        <div className="text-[10px] font-mono text-violet-700">{log.employee.employeeId}</div>
                        <div className="text-[10px] text-slate-400">{log.employee.department}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {log.attendanceDate}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Act #{log.sequenceNumber || 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {log.checkInTime ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800">
                            {log.checkInTime} IST
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 line-through">
                            {log.previousStatus}
                          </span>
                          <span className="text-slate-400 font-bold">&rarr;</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {log.updatedStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[260px] text-[11px] font-medium leading-relaxed">
                        &ldquo;{log.reason}&rdquo;
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {isAkshay ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                              Coordinator
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 mt-0.5">{log.modifiedBy.name}</div>
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


