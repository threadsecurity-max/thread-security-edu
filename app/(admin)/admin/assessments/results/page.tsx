import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { AdminResultsClient } from './admin-results-client';

export const revalidate = 0;

export default async function AdminResultsPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [attempts, courses, categories] = await Promise.all([
    prisma.testAttempt.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        assessment: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, title: true } },
            category: { select: { id: true, name: true } },
          },
        },
        result: {
          select: {
            totalQuestions: true,
            correctAnswers: true,
            wrongAnswers: true,
            unansweredQuestions: true,
            timeTakenSeconds: true,
          },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    prisma.testCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedAttempts = (attempts as any[]).map((a) => ({
    id: a.id,
    attemptNumber: a.attemptNumber,
    status: a.status,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    score: a.score,
    percentage: a.percentage,
    user: a.user,
    assessment: a.assessment,
    result: a.result,
    eventsCount: a._count?.events || 0,
  }));

  return (
    <AdminResultsClient
      initialAttempts={formattedAttempts}
      courses={courses}
      categories={categories}
    />
  );
}
