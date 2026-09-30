import { prisma } from '@/server/database/prisma';
import { AttemptStatus } from '@/types/assessment';
import { buildStudentSafeAttempt, StudentSafeAttemptState } from './generator.service';
import { submitAttempt } from './scoring.service';

export async function getActiveAttemptState(
  attemptId: string,
  studentId: string
): Promise<StudentSafeAttemptState> {
  const attempt: any = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: { course: true },
      },
      attemptQuestions: {
        orderBy: { displayOrder: 'asc' },
        include: {
          question: { include: { category: true } },
          attemptOptions: {
            orderBy: { displayOrder: 'asc' },
            include: { option: true },
          },
          answers: { where: { attemptId } },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error('Test attempt not found');
  }

  // IDOR & Authorization check: verify student ownership
  if (attempt.userId !== studentId) {
    throw new Error('FORBIDDEN: You do not have permission to view or resume this attempt.');
  }

  const now = new Date();

  // If expired while in progress, auto-submit
  if (attempt.status === AttemptStatus.IN_PROGRESS && now >= attempt.expiresAt) {
    await submitAttempt(attemptId, studentId, true);
    // Reload state after auto-submit
    return await getActiveAttemptState(attemptId, studentId);
  }

  return buildStudentSafeAttempt(attempt, attempt.assessment);
}

export async function saveStudentAnswer(
  attemptId: string,
  studentId: string,
  attemptQuestionId: string,
  selectedOptionId: string
) {
  const attempt: any = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  if (attempt.userId !== studentId) {
    throw new Error('FORBIDDEN: Attempt ownership violation.');
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw new Error(`Cannot submit answer. Attempt is currently ${attempt.status}.`);
  }

  // Server-authoritative expiration check
  const now = new Date();
  if (now >= attempt.expiresAt) {
    await submitAttempt(attemptId, studentId, true);
    throw new Error('EXPIRED: Test time has expired. Your attempt has been automatically submitted.');
  }

  // Validate attemptQuestion belongs to this attempt
  const attemptQuestion: any = await (prisma as any).attemptQuestion.findFirst({
    where: {
      id: attemptQuestionId,
      attemptId: attemptId,
    },
    include: {
      attemptOptions: true,
    },
  });

  if (!attemptQuestion) {
    throw new Error('Invalid question for this attempt.');
  }

  // Validate option belongs to this question
  const validOption = (attemptQuestion.attemptOptions || []).some(
    (ao: any) => ao.optionId === selectedOptionId
  );
  if (!validOption) {
    throw new Error('Invalid option selected for this question.');
  }

  // Check existing answer to record ANSWER_SELECTED vs ANSWER_CHANGED
  const existingAnswer: any = await (prisma as any).studentAnswer.findUnique({
    where: {
      attemptId_attemptQuestionId: {
        attemptId,
        attemptQuestionId,
      },
    },
  });

  const eventType = existingAnswer ? 'ANSWER_CHANGED' : 'ANSWER_SELECTED';

  const savedAnswer = await (prisma as any).$transaction(async (tx: any) => {
    const answer = await tx.studentAnswer.upsert({
      where: {
        attemptId_attemptQuestionId: {
          attemptId,
          attemptQuestionId,
        },
      },
      update: {
        selectedOptionId,
        answeredAt: now,
      },
      create: {
        attemptId,
        attemptQuestionId,
        selectedOptionId,
        answeredAt: now,
      },
    });

    await tx.attemptEvent.create({
      data: {
        attemptId,
        eventType,
        metadata: JSON.stringify({
          attemptQuestionId,
          selectedOptionId,
          timestamp: now.toISOString(),
        }),
      },
    });

    return answer;
  });

  return {
    success: true,
    data: {
      id: savedAnswer.id,
      attemptQuestionId: savedAnswer.attemptQuestionId,
      selectedOptionId: savedAnswer.selectedOptionId,
      answeredAt: savedAnswer.answeredAt,
    },
  };
}

export async function recordAttemptEvent(
  attemptId: string,
  studentId: string,
  eventType: string,
  metadata?: Record<string, any>
) {
  const attempt: any = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, status: true, expiresAt: true },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  if (attempt.userId !== studentId) {
    throw new Error('FORBIDDEN: Attempt ownership violation.');
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return { success: false, error: 'ATTEMPT_NOT_ACTIVE' };
  }

  // If expired while event is posted, trigger auto-submit
  const now = new Date();
  if (now >= attempt.expiresAt) {
    await submitAttempt(attemptId, studentId, true);
    return { success: false, error: 'ATTEMPT_EXPIRED' };
  }

  // Sanitize event type against permitted whitelist
  const allowedEvents = [
    'TEST_STARTED',
    'QUESTION_VIEWED',
    'ANSWER_SELECTED',
    'ANSWER_CHANGED',
    'PAGE_REFRESHED',
    'TAB_SWITCHED',
    'FOCUS_LOST',
    'FULLSCREEN_EXITED',
    'TIMER_WARNING',
    'TEST_SUBMITTED',
  ];

  if (!allowedEvents.includes(eventType)) {
    throw new Error(`Invalid eventType: "${eventType}". Must be one of authorized audit events.`);
  }

  // Prevent storage abuse with payload bounds
  let serializedMetadata: string | null = null;
  if (metadata) {
    serializedMetadata = JSON.stringify(metadata);
    if (serializedMetadata.length > 2048) {
      throw new Error('Metadata payload exceeds maximum permitted size (2KB).');
    }
  }

  const loggedEvent = await (prisma as any).attemptEvent.create({
    data: {
      attemptId,
      eventType,
      metadata: serializedMetadata,
    },
  });

  return {
    success: true,
    eventId: loggedEvent.id,
    eventType: loggedEvent.eventType,
    timestamp: loggedEvent.timestamp,
  };
}
