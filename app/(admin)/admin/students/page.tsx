import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Phone, ExternalLink, ShieldCheck, Clock, CheckCircle2, Lock, Unlock, Users, Layers } from 'lucide-react';
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

  const [students, totalCount, approvedCount, pendingCount, allCourses, allBatches] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        tsIdentity: true,
        studentProfile: { include: { batch: true } },
        enrollments: { include: { course: true } },
        certificates: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] } } }),
    (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: true } }),
    (prisma.user as any).count({ where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: false } }),
    prisma.course.findMany({
      select: { id: true, title: true },
      where: { status: 'PUBLISHED' },
    }),
    prisma.batch.findMany({
      select: { id: true, batchCode: true, title: true },
      orderBy: { batchCode: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8 text-slate-100 font-sans relative z-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              STUDENT IDENTITY &amp; CREDENTIAL OPS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-mono">
            Student Directory &amp; TS-ID Roster
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
            Atomic TS-ID provisioning, direct cohort batch transfers, instant dashboard clearance switching, and academic profile audits.
          </p>
        </div>

        {/* Quick Summary Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link href="/admin/students?status=ALL">
            <span className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
              statusFilter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}>
              All ({totalCount})
            </span>
          </Link>
          <Link href="/admin/students?status=APPROVED">
            <span className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold inline-flex items-center gap-1 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}>
              <Unlock className="w-3 h-3 mr-1" /> Approved ({approvedCount})
            </span>
          </Link>
          <Link href="/admin/students?status=PENDING">
            <span className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold inline-flex items-center gap-1 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}>
              <Lock className="w-3 h-3 mr-1" /> Guests/Pending ({pendingCount})
            </span>
          </Link>
        </div>
      </div>

      {/* ── PROVISION NEW STUDENT ACCOUNT CONTAINER ── */}
      <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Provision New Student Account &amp; Immutable TS-ID
          </h3>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server';
            await createStudentAction(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. rahul.sharma@example.com"
                className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Specialization Track *
              </label>
              <select
                name="track"
                defaultValue="CYBER"
                className="w-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              >
                <option value="CYBER">🛡️ Cybersecurity Track (TS-CXXX)</option>
                <option value="AI">🤖 AI &amp; ML Track (TS-AXXX)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. +91 98765-43210"
                className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Career Goal
              </label>
              <input
                type="text"
                name="careerGoal"
                placeholder="e.g. SOC Analyst / VAPT"
                className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Student Account &amp; TS-ID</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 flex flex-col md:flex-row gap-3 items-center justify-between font-mono text-xs shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <form method="GET" className="flex-1 w-full flex gap-3">
          <input type="hidden" name="status" value={statusFilter} />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by student name, email, phone, or TS-ID (e.g. TS-C126 or TS-A103)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white font-bold border border-slate-850 transition-all cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* ── STUDENTS DIRECTORY TABLE ── */}
      <div className="overflow-hidden rounded-2xl bg-[#0B0F19]/90 border border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 font-bold">TS-ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Email &amp; Contact</th>
                <th className="p-4 font-bold">Current Batch</th>
                <th className="p-4 font-bold text-center">Dashboard Access</th>
                <th className="p-4 font-bold text-center">Courses</th>
                <th className="p-4 font-bold text-right">Actions &amp; Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                    No student records matching your query or filter.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const tsId = student.tsIdentity?.tsId || 'TSE-PENDING';
                  const isApproved = (student as any).isDashboardAccessGranted;
                  const currentBatch = student.studentProfile?.batch;

                  return (
                    <tr key={student.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                          {tsId}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">
                        {student.name}
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="font-mono text-xs text-slate-300">{student.email}</div>
                        {student.studentProfile?.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {student.studentProfile.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {currentBatch ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
                            <Layers className="w-3 h-3" />
                            {currentBatch.batchCode}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <Unlock className="w-3 h-3 text-emerald-400" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            <Lock className="w-3 h-3 text-amber-400" /> GUEST / PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {student.enrollments.length}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <StudentActionsClient
                          allCourses={allCourses}
                          allBatches={allBatches}
                          student={{
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            tsId: tsId,
                            phone: student.studentProfile?.phone || null,
                            careerGoal: student.studentProfile?.careerGoal || null,
                            batchId: student.studentProfile?.batchId || null,
                            batchCode: currentBatch?.batchCode || null,
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
