import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { MentorLabSubmissionsClient } from '@/components/mentor/labs/MentorLabSubmissionsClient';

export const revalidate = 0;

export default async function MentorSubmissionsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/unauthorized');
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN';

  // Scoped student filtering if mentor
  let studentIds: string[] | undefined;
  if (!isSuperAdmin) {
    const batches = await getMentorAuthorizedBatches(session.userId);
    studentIds = Array.from(
      new Set(
        batches.flatMap((b: any) =>
          (b.students || []).map((s: any) => s.user?.id || s.userId).filter(Boolean)
        )
      )
    ) as string[];
  }

  const attempts = await prisma.labAttempt.findMany({
    where: studentIds && studentIds.length > 0 ? { userId: { in: studentIds } } : {},
    take: 50,
    orderBy: { startedAt: 'desc' },
    include: {
      lab: {
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          tsIdentity: {
            select: { tsId: true },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <MentorLabSubmissionsClient initialAttempts={attempts as any} />
    </div>
  );
}
