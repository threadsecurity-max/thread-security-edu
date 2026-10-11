import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { MentorDirectoryClient } from './mentor-directory-client';

export const revalidate = 0;

export default async function AdminMentorDirectoryPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  let mentors: any[] = [];
  let allBatches: any[] = [];

  try {
    const [fetchedMentors, fetchedBatches] = await Promise.all([
      prisma.mentorProfile.findMany({
        include: {
          user: {
            include: {
              tsIdentity: true,
            },
          },
          courses: true,
          batches: {
            include: {
              sessions: {
                orderBy: { sessionDate: 'asc' },
              },
            },
          },
          students: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { user: { name: 'asc' } },
      }),
      prisma.batch.findMany({
        select: {
          id: true,
          batchCode: true,
          title: true,
          mentorId: true,
          courseId: true,
          course: { select: { title: true } },
        },
        orderBy: { batchCode: 'asc' },
      }),
    ]);

    mentors = fetchedMentors;
    allBatches = fetchedBatches;
  } catch (e) {
    console.error('Failed to query mentors roster:', e);
  }

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
              Faculty &amp; Instructors
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Active Roster ({mentors.length})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Faculty Roster &amp; Mentors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Provision faculty accounts, assign batches from provision, manage lecture schedules, and inspect workload across cohorts.
          </p>
        </div>
      </div>

      {/* Interactive Mentor Directory Client Component */}
      <MentorDirectoryClient mentors={mentors} allBatches={allBatches} />
    </div>
  );
}
