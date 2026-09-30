import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getActiveAttemptState } from '@/server/services/assessment/attempt.service';
import { ExamRoomClient } from './exam-room-client';

export const revalidate = 0;

export default async function ExamRoomPage(
  props: { params: Promise<{ attemptId: string }> }
) {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const { attemptId } = await props.params;

  try {
    const attemptState = await getActiveAttemptState(attemptId, session.userId);

    // If attempt has already been submitted or expired, navigate to results screen
    if (
      attemptState.status === 'SUBMITTED' ||
      attemptState.status === 'AUTO_SUBMITTED' ||
      attemptState.status === 'EXPIRED'
    ) {
      redirect(`/student/assessments/results/${attemptId}`);
    }

    return <ExamRoomClient initialAttempt={attemptState} />;
  } catch (error: any) {
    console.error('[ExamRoomPage Error]:', error);
    redirect('/student/assessments?error=AttemptNotFoundOrForbidden');
  }
}
