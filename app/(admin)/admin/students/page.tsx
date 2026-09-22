import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, TSIDBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Phone, ExternalLink, ShieldCheck, Clock, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { createStudentAction } from '@/features/admin/actions/admin.actions';
import { StudentActionsClient } from './student-actions-client';

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminStudentDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getSession();
  if (session?.role === 'SECURITY_ADMIN') {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const params = await searchParams;
  const query = params.q || '';
  const statusFilter = params.status || 'ALL';

  const whereClause: any = {
    role: { in: ['STUDENT', 'GUEST'] },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { tsIdentity: { tsId: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  if (statusFilter === 'APPROVED') {
    whereClause.isDashboardAccessGranted = true;
  } else if (statusFilter === 'PENDING') {
    whereClause.isDashboardAccessGranted = false;
  }

  const students = await prisma.user.findMany({
    where: whereClause,
    include: {
      tsIdentity: true,
      studentProfile: true,
      enrollments: { include: { course: true } },
      certificates: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCount = await (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] } } });
  const approvedCount = await (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: true } });
  const pendingCount = await (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: false } });

  const allCourses = await prisma.course.findMany({
    select: { id: true, title: true },
    where: { status: 'PUBLISHED' },
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Student &amp; Guest Identity Directory
          </h1>
          <p className="text-xs text-red-200/70 font-mono mt-1">
            Manage student TS-ID credentials, grant/revoke dashboard access with a single toggle, and audit student access.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link href="/admin/students?status=ALL">
            <span className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold ${
              statusFilter === 'ALL'
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}>
              All ({totalCount})
            </span>
          </Link>
          <Link href="/admin/students?status=APPROVED">
            <span className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold inline-flex items-center gap-1 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
            }`}>
              <Unlock className="w-3 h-3 mr-1" /> Approved ({approvedCount})
            </span>
          </Link>
          <Link href="/admin/students?status=PENDING">
            <span className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold inline-flex items-center gap-1 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:border-amber-400'
            }`}>
              <Lock className="w-3 h-3 mr-1" /> Pending ({pendingCount})
            </span>
          </Link>
        </div>
      </div>

      {/* Add New Student Account Container - Simple Translucent Dark Glass */}
      <div className="p-6 rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
          <UserPlus className="w-4 h-4 text-red-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Provision New Student Account &amp; TS-ID
          </h3>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server';
            await createStudentAction(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
                Student Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. rahul.sharma@gmail.com"
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
                Specialization Track *
              </label>
              <select
                name="track"
                defaultValue="CYBER"
                className="w-full bg-[#1a060d] border border-red-500/30 text-white text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono font-bold"
              >
                <option value="CYBER">🛡️ Cybersecurity Track (TS-CXXX)</option>
                <option value="AI">🤖 AI &amp; ML Track (TS-AXXX)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. +91 98765-43210"
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
                Career Objective
              </label>
              <input
                type="text"
                name="careerGoal"
                placeholder="e.g. VAPT / AI Engineer"
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Track Student Account &amp; TS-ID</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search & Segregation Filters */}
      <div className="p-4 rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl flex flex-col md:flex-row gap-3 items-center justify-between font-mono text-xs shadow-xl">
        <form method="GET" className="flex-1 w-full flex gap-3">
          <input type="hidden" name="status" value={statusFilter} />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by student name, email, contact number, or TS-ID (e.g. TS-C126 or TS-A103)..."
              className="w-full pl-10 pr-4 py-2.5 bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold border border-white/15 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 font-mono">Filter:</span>
          <Link href={`/admin/students?q=${query}&status=ALL`}>
            <span className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
              statusFilter === 'ALL' ? 'bg-red-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:text-white'
            }`}>
              All
            </span>
          </Link>
          <Link href={`/admin/students?q=${query}&status=APPROVED`}>
            <span className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
              statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:text-white'
            }`}>
              Approved
            </span>
          </Link>
          <Link href={`/admin/students?q=${query}&status=PENDING`}>
            <span className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
              statusFilter === 'PENDING' ? 'bg-amber-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:text-white'
            }`}>
              Pending Guests
            </span>
          </Link>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1e070e] text-red-200 border-b border-red-500/20 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">TS-ID Identity</th>
                <th className="p-4 font-bold">Student Full Name</th>
                <th className="p-4 font-bold">Email &amp; Contact</th>
                <th className="p-4 font-bold">Career Objective</th>
                <th className="p-4 font-bold text-center">Dashboard Access</th>
                <th className="p-4 font-bold text-center">Enrolled Courses</th>
                <th className="p-4 font-bold text-right">Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10 text-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                    No student records matching your query or filter.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const tsId = student.tsIdentity?.tsId || 'TSE-PENDING';
                  const isApproved = (student as any).isDashboardAccessGranted;

                  return (
                    <tr key={student.id} className="hover:bg-red-950/30 transition-colors">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-[11px]">
                          {tsId}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">
                        {student.name}
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="font-mono text-xs">{student.email}</div>
                        {student.studentProfile?.phone && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-red-400" />
                            {student.studentProfile.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">
                        {student.studentProfile?.careerGoal || 'Cybersecurity Specialist'}
                      </td>
                      <td className="p-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            <Unlock className="w-3 h-3 text-emerald-400" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            <Lock className="w-3 h-3 text-amber-400" /> GUEST / PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-white">{student.enrollments.length}</span>
                      </td>
                      <td className="p-4 text-right">
                        <StudentActionsClient
                          allCourses={allCourses}
                          student={{
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            tsId: tsId,
                            phone: student.studentProfile?.phone || null,
                            careerGoal: student.studentProfile?.careerGoal || null,
                            enrollmentsCount: student.enrollments.length,
                            certificatesCount: student.certificates.length,
                            isDashboardAccessGranted: !!isApproved,
                            createdAt: student.createdAt.toISOString(),
                          }}
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
    </div>
  );
}
