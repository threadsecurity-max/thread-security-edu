import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminAssessmentAnalytics } from '@/server/services/assessment/analytics.service';
import { AdminAssessmentsClient } from './admin-assessments-client';

export const revalidate = 0;

export default async function AdminAssessmentsPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [tests, analytics] = await Promise.all([
    (prisma as any).assessment.findMany({
      include: {
        course: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { testAttempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    getAdminAssessmentAnalytics(),
  ]);

  const formattedTests = (tests as any[]).map((t: any) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    description: t.description,
    durationMinutes: t.durationMinutes,
    questionsPerAttempt: t.questionsPerAttempt,
    totalMarks: t.totalMarks,
    passingScore: t.passingScore,
    maxAttempts: t.maxAttempts,
    status: t.status as any,
    course: t.course,
    category: t.category,
    attemptsCount: t._count?.testAttempts || 0,
  }));

  return (
    <AdminAssessmentsClient
      initialTests={formattedTests}
      overview={analytics.overview}
    />
  );
}
