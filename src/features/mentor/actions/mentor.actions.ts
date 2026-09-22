'use server';

import { gradeLabSubmission } from '@/server/services/mentor.service';

export async function gradeLabAttemptAction(attemptId: string, score: number, feedback: string) {
  if (!attemptId) {
    return { success: false, error: 'Invalid attempt ID.' };
  }

  if (score < 0 || score > 100) {
    return { success: false, error: 'Score must be between 0 and 100.' };
  }

  try {
    // In production, mentor ID comes from authenticated session context
    const updated = await gradeLabSubmission('mentor-demo-id', attemptId, score, feedback);
    return {
      success: true,
      updated,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save grade.';
    return { success: false, error: msg };
  }
}
