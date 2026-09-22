import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getAllBatchesService } from '@/server/services/batch.service';
import { BatchManagementClient } from './batch-management-client';
import { Badge } from '@/components/ui/badge';
import { Layers, ShieldCheck, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function AdminBatchesPage() {
  const session = await getSession();

  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const batches = await getAllBatchesService();

  const [courses, mentors, allStudents] = await Promise.all([
    prisma.course.findMany({ select: { id: true, title: true } }),
    prisma.mentorProfile.findMany({ include: { user: true } }),
    prisma.studentProfile.findMany({
      include: {
        user: { include: { tsIdentity: true } },
      },
      orderBy: { user: { name: 'asc' } },
    }),
  ]);

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-400" />
              ACADEMIC COHORT ARCHITECTURE
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
              ACTIVE COHORTS ({batches.length})
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Batch Conduction & Student Segregation
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Manage academic batches, map course curriculum, assign faculty leads, fast-enroll students by TS-ID, and record lecture attendance.
          </p>
        </div>
      </div>

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
