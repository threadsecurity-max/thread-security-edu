import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getMentorAuthorizedBatches,
} from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';
import { MentorLecturesClient } from '@/components/mentor/lectures/MentorLecturesClient';

export const revalidate = 0;

export default async function MentorLecturesPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=Unauthorized');
  }

  const params = await searchParams;
  const showCreate = params.create === 'true';

  const batches = await getMentorAuthorizedBatches(session.userId);
  const authorizedBatchIds = batches.map((b: any) => b.id);

  // Strict backend scoping: only fetch sessions belonging to the mentor's authorized batches
  const sessions = await prisma.batchSession.findMany({
    where: {
      batchId: { in: authorizedBatchIds },
    },
    include: {
      batch: {
        select: {
          id: true,
          batchCode: true,
          title: true,
          course: { select: { title: true } },
        },
      },
      attendanceRecords: {
        select: { id: true, status: true },
      },
    },
    orderBy: { sessionDate: 'desc' },
    take: 100,
  });

  const mappedBatches = batches.map((b: any) => ({
    id: b.id,
    batchCode: b.batchCode,
    title: b.title,
    course: b.course ? { id: b.course.id, title: b.course.title } : null,
  }));

  return (
    <MentorLecturesClient
      sessions={sessions as any}
      batches={mappedBatches}
      showCreateInitial={showCreate}
    />
  );
}
