import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Search, Phone, Layers, Lock, Unlock, ShieldAlert, GraduationCap, CheckCircle } from 'lucide-react';
import { StudentActionsClient } from './student-actions-client';
import { StudentProvisionForm } from './student-provision-form';
import { getNextSuggestedTSID } from '@/server/services/admin.service';
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

  const [students, totalCount, approvedCount, pendingCount, allCourses, allBatches, suggestedId] =
    await Promise.all([
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
      (prisma.user as any).count({
        where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: true },
      }),
      (prisma.user as any).count({
        where: { role: { in: ['STUDENT', 'GUEST'] }, isDashboardAccessGranted: false },
      }),
      prisma.course.findMany({
        select: { id: true, title: true },
        where: { status: 'PUBLISHED' },
      }),
      prisma.batch.findMany({
        select: { id: true, batchCode: true, title: true },
        orderBy: { batchCode: 'asc' },
      }),
      getNextSuggestedTSID('CYBER'),
    ]);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
              Student Identity &amp; Cohort Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Directory &amp; TS-ID Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic TS-ID provisioning, cohort transfers, dashboard access management, and academic profile audits.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 text-xs">
          <Link href="/admin/students?status=ALL">
            <span
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                statusFilter === 'ALL'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'
              }`}
            >
              All ({totalCount})
            </span>
          </Link>
          <Link href="/admin/students?status=APPROVED">
            <span
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium inline-flex items-center gap-1.5 ${
                statusFilter === 'APPROVED'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </span>
          </Link>
          <Link href="/admin/students?status=PENDING">
            <span
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium inline-flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </span>
          </Link>
        </div>
      </div>

      {/* ── PROVISION NEW STUDENT CLIENT FORM (Task 7) ── */}
      <StudentProvisionForm initialSuggestedId={suggestedId} />

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between text-xs shadow-xs">
        <form method="GET" className="flex-1 w-full flex gap-3">
          <input type="hidden" name="status" value={statusFilter} />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by student name, email, phone, or TS-ID (e.g. TS-C146)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* ── STUDENTS DIRECTORY TABLE ── */}
      <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">TS-ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Email &amp; Contact</th>
                <th className="p-4">Current Batch</th>
                <th className="p-4 text-center">Dashboard Access</th>
                <th className="p-4 text-center">Courses</th>
                <th className="p-4 text-right">Actions &amp; Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No student records matching your query or filter.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const tsId = student.tsIdentity?.tsId || 'TSE-PENDING';
                  const isApproved = (student as any).isDashboardAccessGranted;
                  const currentBatch = student.studentProfile?.batch;

                  return (
                    <tr key={student.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-violet-50 border border-violet-200 text-violet-700 font-mono font-bold text-[11px]">
                          {tsId}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="font-sans text-xs text-slate-800">{student.email}</div>
                        {student.studentProfile?.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student.studentProfile.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {currentBatch ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-medium">
                            <Layers className="w-3 h-3 text-indigo-600" />
                            {currentBatch.batchCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                            <Unlock className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                            <Lock className="w-3 h-3 text-amber-600" /> Guest / Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
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
