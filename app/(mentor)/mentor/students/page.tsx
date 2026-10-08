import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getMentorAuthorizedStudents,
  getMentorAuthorizedBatches,
} from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';
import { MentorStudentDirectoryClient } from '@/components/mentor/students/MentorStudentDirectoryClient';

export const revalidate = 0;

export default async function MentorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; batchId?: string; create?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=Unauthorized');
  }

  const params = await searchParams;
  const query = params.q || '';
  const batchFilter = params.batchId || '';
  const showCreate = params.create === 'true';

  // Strict backend scoping: only fetches students belonging to this mentor's authorized batches
  const [{ students }, batches, courses] = await Promise.all([
    getMentorAuthorizedStudents(session.userId, {
      search: query,
      batchId: batchFilter,
      limit: 100,
    }),
    getMentorAuthorizedBatches(session.userId),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  const mappedBatches = batches.map((b: any) => ({
    id: b.id,
    batchCode: b.batchCode,
    title: b.title,
  }));

  return (
    <MentorStudentDirectoryClient
      initialStudents={students as any}
      batches={mappedBatches}
      courses={courses}
      showCreateInitial={showCreate}
    />
  );
}
