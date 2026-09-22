import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Terminal,
  Award,
  ShieldAlert,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Live database query

export default async function AdminDashboardOverviewPage() {
  const session = await getSession();
  if (session?.role === 'SECURITY_ADMIN') {
    redirect('/admin/security-analyst');
  }

  // Live database metric queries
  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const totalCourses = await prisma.course.count();
  const totalLabs = await prisma.lab.count();
  const totalCertificates = await prisma.certificate.count();
  const totalAuditLogs = await prisma.auditLog.count();

  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const studentsList = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      tsIdentity: true,
      enrollments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans relative z-10">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Academic &amp; Security Overview
          </h1>
          <p className="text-xs text-red-200/70 font-mono mt-1">
            Live database analytics, student TS-ID status, course publishing workflows, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS (REAL DATABASE QUERIES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-[#120408]/80 backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-red-300/70 uppercase tracking-wider">TOTAL STUDENTS</span>
            <Users className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-white block">{totalStudents}</span>
          <span className="text-xs text-slate-400 block mt-1">Registered TS-ID Accounts</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#120408]/80 backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-red-300/70 uppercase tracking-wider">COURSES IN SYSTEM</span>
            <BookOpen className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-white block">{totalCourses}</span>
          <span className="text-xs text-slate-400 block mt-1">Published &amp; Draft Courses</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#120408]/80 backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-red-300/70 uppercase tracking-wider">PRACTICAL LABS</span>
            <Terminal className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-white block">{totalLabs}</span>
          <span className="text-xs text-slate-400 block mt-1">Active Sandbox Targets</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#120408]/80 backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-red-300/70 uppercase tracking-wider">CERTIFICATES ISSUED</span>
            <Award className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-white block">{totalCertificates}</span>
          <span className="text-xs text-slate-400 block mt-1">Cryptographically Verified</span>
        </div>
      </div>

      {/* GRID: STUDENT DIRECTORY PREVIEW & AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Students Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Registered Students ({totalStudents})</h2>
              <span className="text-[11px] text-red-300/70 font-mono block">Latest registered TS-ID student accounts</span>
            </div>
            <Link href="/admin/students" className="text-xs font-mono text-red-400 hover:text-red-300 hover:underline font-bold">
              View Full Directory ({totalStudents}) →
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl shadow-xl">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1e070e] text-red-200 border-b border-red-500/20 sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">TS-ID</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-500/10 text-slate-200">
                  {studentsList.map((s) => (
                    <tr key={s.id} className="hover:bg-red-950/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">{s.name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-bold">
                          {s.tsIdentity?.tsId || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{s.email}</td>
                      <td className="p-3.5 text-right font-bold text-red-400">ACTIVE</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Live Audit Feed ({totalAuditLogs})</h2>
            <Link href="/admin/audit" className="text-xs font-mono text-red-400 hover:text-red-300 hover:underline">
              Full Audit Logs
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl space-y-3 font-mono text-xs shadow-xl">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-red-500/15 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-red-400 font-bold">{log.action}</span>
                  <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate">{log.details || `Entity: ${log.entity}`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
