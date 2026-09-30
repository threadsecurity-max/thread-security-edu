import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAttemptResult, getDetailedAttemptReview } from '@/server/services/assessment/scoring.service';
import { ResultClient } from './result-client';

export const revalidate = 0;

export default async function StudentAssessmentResultPage(
  props: { params: Promise<{ attemptId: string }> }
) {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const { attemptId } = await props.params;

  try {
    const isAdmin = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role);

    const [scorecard, detailedReview] = await Promise.all([
      getAttemptResult(attemptId, session.userId, isAdmin),
      getDetailedAttemptReview(attemptId, session.userId, isAdmin).catch(() => undefined),
    ]);

    return <ResultClient scorecard={scorecard} detailedReview={detailedReview as any} />;
  } catch (error: any) {
    console.error('[StudentAssessmentResultPage Error]:', error);
    notFound();
  }
}
