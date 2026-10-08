import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { MentorAssessmentsClient } from '@/components/mentor/assessments/MentorAssessmentsClient';

export const revalidate = 0;

export default async function MentorAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/unauthorized');
  }

  const params = await searchParams;
  const showCreate = params.create === 'true';

  const batches = await getMentorAuthorizedBatches(session.userId);
  const courseIds = Array.from(
    new Set(batches.map((b: any) => b.courseId).filter(Boolean))
  ) as string[];

  const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN';

  const [assessments, courses] = await Promise.all([
    prisma.assessment.findMany({
      where: isSuperAdmin ? {} : { courseId: { in: courseIds } },
      include: {
        course: {
          select: { id: true, title: true, slug: true, category: true },
        },
        _count: {
          select: {
            questions: true,
            testAttempts: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    prisma.course.findMany({
      select: { id: true, title: true, category: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  return (
    <MentorAssessmentsClient
      initialAssessments={assessments as any}
      courses={courses}
      showCreateInitial={showCreate}
    />
  );
}
