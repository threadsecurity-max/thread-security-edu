import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getAllBatchesService } from '@/server/services/batch.service';
import { BatchManagementClient } from './batch-management-client';
import { AdminAttendanceCorrectionQueue } from '@/components/admin/attendance/AdminAttendanceCorrectionQueue';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              ACADEMIC COHORT ARCHITECTURE
            </Badge>
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
              ACTIVE COHORTS ({batches.length})
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            ACADEMIC BATCHES & TIMETABLE CONDUCTION
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage cohort enrollment, lecture scheduling, session registers, and attendance auditing.
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
