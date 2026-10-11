import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getAllBatchesService } from '@/server/services/batch.service';
import { BatchManagementClient } from './batch-management-client';
import { AdminAttendanceCorrectionQueue } from '@/components/admin/attendance/AdminAttendanceCorrectionQueue';
import { Layers } from 'lucide-react';

export const revalidate = 0;

export default async function AdminBatchesPage() {
  const session = await getSession();

  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const batches = await getAllBatchesService();

  const [courses, mentors, allStudents, correctionRequests] = await Promise.all([
    prisma.course.findMany({ select: { id: true, title: true } }),
    prisma.mentorProfile.findMany({ include: { user: true } }),
    prisma.studentProfile.findMany({
      include: {
        user: { include: { tsIdentity: true } },
      },
      orderBy: { user: { name: 'asc' } },
    }),
    (prisma as any).attendanceCorrectionRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        batch: { select: { batchCode: true, title: true } },
        session: { select: { title: true, sessionNumber: true, sessionDate: true } },
        student: {
          include: {
            user: { select: { name: true, email: true, tsIdentity: { select: { tsId: true } } } },
          },
        },
        mentor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-600" />
              Cohorts &amp; Conduction
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Active Batches ({batches.length})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Academic Batches &amp; Timetable Conduction
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage cohort schedules, calendar dates, student roster enrollments, and batch CRUD operations.
          </p>
        </div>
      </div>

      {/* Admin Attendance Correction Queue */}
      <AdminAttendanceCorrectionQueue initialRequests={correctionRequests as any} />

      {/* Interactive Batch Management Client Component */}
      <BatchManagementClient
        batches={batches}
        courses={courses}
        mentors={mentors}
        allStudents={allStudents}
      />
    </div>
  );
}
