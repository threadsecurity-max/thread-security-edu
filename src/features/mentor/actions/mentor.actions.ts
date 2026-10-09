'use server';

import { getSession } from '@/lib/auth/session';
import { gradeLabSubmission } from '@/server/services/mentor.service';
import { revalidatePath } from 'next/cache';

export async function gradeLabAttemptAction(attemptId: string, score: number, feedback: string) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Mentor or Administrator privileges required.' };
  }

  if (!attemptId) {
    return { success: false, error: 'Invalid attempt ID.' };
  }

  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
    return { success: false, error: 'Score must be a number between 0 and 100.' };
  }

  try {
    const updated = await gradeLabSubmission(session.userId, attemptId, score, feedback.trim());
    revalidatePath('/mentor/submissions');
    revalidatePath('/mentor/labs');
    revalidatePath('/student/labs');

    return {
      success: true,
      updated,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save grade.';
    return { success: false, error: msg };
  }
}
