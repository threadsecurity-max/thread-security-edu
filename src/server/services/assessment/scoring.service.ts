import { prisma } from '@/server/database/prisma';
import { AttemptStatus } from '@/types/assessment';

export interface ScorecardBreakdownItem {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface DifficultyBreakdownItem {
  difficulty: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface FinalScorecard {
  attemptId: string;
  testTitle: string;
  courseTitle: string;
  attemptNumber: number;
  status: AttemptStatus;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  timeTakenSeconds: number;
  submittedAt: string;
  categoryBreakdown: ScorecardBreakdownItem[];
  difficultyBreakdown: DifficultyBreakdownItem[];
}

export async function submitAttempt(
  attemptId: string,
  studentId: string,
  isAutoSubmit = false
): Promise<FinalScorecard> {
  const attempt = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: { include: { course: true } },
      result: true,
    },
  });

  if (!attempt) {
    throw new Error('Test attempt not found.');
  }

  // IDOR & Authorization Check
  if (attempt.userId !== studentId) {
    throw new Error('FORBIDDEN: You do not have permission to submit this attempt.');
  }

  // Idempotency & Double-Submit Protection:
  // If already submitted, return the existing authoritative scorecard!
  if (
    attempt.status === AttemptStatus.SUBMITTED ||
    attempt.status === AttemptStatus.AUTO_SUBMITTED ||
    attempt.status === AttemptStatus.EXPIRED
  ) {
    return await getAttemptResult(attemptId, studentId);
  }

  const now = new Date();
  const submissionStatus = isAutoSubmit ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED;

  // 1. Fetch Complete Snapshot with Questions and Correct Answers from database
  const fullSnapshot = await (prisma as any).testAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      attemptQuestions: {
        orderBy: { displayOrder: 'asc' },
        include: {
          question: {
            include: {
              category: true,
              options: true,
            },
          },
          attemptOptions: {
            orderBy: { displayOrder: 'asc' },
            include: { option: true },
          },
          answers: { where: { attemptId } },
        },
      },
    },
  });

  let totalMarks = 0;
  let obtainedMarks = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const categoryStatsMap = new Map<string, { correct: number; total: number }>();
  const difficultyStatsMap = new Map<string, { correct: number; total: number }>();

  const answerUpdates: Array<{
    attemptQuestionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
    marksAwarded: number;
  }> = [];

  for (const aq of fullSnapshot.attemptQuestions as any[]) {
    const qMarks = aq.marks || 1.0;
    totalMarks += qMarks;

    const catName = aq.question.category?.name || 'General';
    const diffName = aq.question.difficulty || 'MEDIUM';

    if (!categoryStatsMap.has(catName)) {
      categoryStatsMap.set(catName, { correct: 0, total: 0 });
    }
    categoryStatsMap.get(catName)!.total += 1;

    if (!difficultyStatsMap.has(diffName)) {
      difficultyStatsMap.set(diffName, { correct: 0, total: 0 });
    }
    difficultyStatsMap.get(diffName)!.total += 1;

    // Correct option from official options in DB
    const correctOption = aq.question.options.find((o: any) => o.isCorrect);
    const correctOptionId = correctOption?.id;

    // Student's answer for this attempt question
    const studentAnswer = aq.answers && aq.answers.length > 0 ? aq.answers[0] : null;
    const selectedOptionId = studentAnswer?.selectedOptionId || null;

    if (!selectedOptionId) {
      unansweredCount++;
      answerUpdates.push({
        attemptQuestionId: aq.id,
        selectedOptionId: null,
        isCorrect: false,
        marksAwarded: 0,
      });
    } else if (selectedOptionId === correctOptionId) {
      correctCount++;
      obtainedMarks += qMarks;
      categoryStatsMap.get(catName)!.correct += 1;
      difficultyStatsMap.get(diffName)!.correct += 1;
      answerUpdates.push({
        attemptQuestionId: aq.id,
        selectedOptionId,
        isCorrect: true,
        marksAwarded: qMarks,
      });
    } else {
      wrongCount++;
      answerUpdates.push({
        attemptQuestionId: aq.id,
        selectedOptionId,
        isCorrect: false,
        marksAwarded: 0,
      });
    }
  }

  // Calculate final percentage and pass/fail
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100 * 10) / 10 : 0;
  const passed = percentage >= attempt.assessment.passingScore;

  // Time taken in seconds
  const startedMs = new Date(attempt.startedAt).getTime();
  const durationMaxMs = attempt.assessment.durationMinutes * 60 * 1000;
  const elapsedMs = Math.min(now.getTime() - startedMs, durationMaxMs);
  const timeTakenSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

  // Build Breakdown JSON structures
  const categoryBreakdown: ScorecardBreakdownItem[] = Array.from(categoryStatsMap.entries()).map(
    ([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  const difficultyBreakdown: DifficultyBreakdownItem[] = Array.from(difficultyStatsMap.entries()).map(
    ([difficulty, stats]) => ({
      difficulty,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  // 2. Perform Atomic Finalization Transaction
  await (prisma as any).$transaction(async (tx: any) => {
    // Concurrency / Idempotency double-check inside transaction
    const currentAttempt = await tx.testAttempt.findUnique({
      where: { id: attemptId },
      select: { status: true },
    });
    if (
      currentAttempt &&
      (currentAttempt.status === AttemptStatus.SUBMITTED ||
        currentAttempt.status === AttemptStatus.AUTO_SUBMITTED ||
        currentAttempt.status === AttemptStatus.EXPIRED)
    ) {
      return; // Already finalized by concurrent request!
    }

    // Update individual answers with authoritative grades
    for (const update of answerUpdates) {
      if (update.selectedOptionId) {
        await tx.studentAnswer.update({
          where: {
            attemptId_attemptQuestionId: {
              attemptId,
              attemptQuestionId: update.attemptQuestionId,
            },
          },
          data: {
            isCorrect: update.isCorrect,
            marksAwarded: update.marksAwarded,
          },
        });
      }
    }

    // Finalize TestAttempt
    await tx.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: submissionStatus,
        submittedAt: now,
        score: obtainedMarks,
        obtainedMarks,
        totalMarks,
        percentage,
        passed,
        correctCount,
        wrongCount,
        unansweredCount,
        timeTakenSeconds,
      },
    });

    // Create or Upsert AssessmentResult record
    await tx.assessmentResult.upsert({
      where: { attemptId },
      update: {
        totalQuestions: fullSnapshot.attemptQuestions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unansweredQuestions: unansweredCount,
        totalMarks,
        obtainedMarks,
        percentage,
        passed,
        timeTakenSeconds,
        categoryBreakdownJson: JSON.stringify(categoryBreakdown),
        difficultyBreakdownJson: JSON.stringify(difficultyBreakdown),
      },
      create: {
        attemptId,
        totalQuestions: fullSnapshot.attemptQuestions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unansweredQuestions: unansweredCount,
        totalMarks,
        obtainedMarks,
        percentage,
        passed,
        timeTakenSeconds,
        categoryBreakdownJson: JSON.stringify(categoryBreakdown),
        difficultyBreakdownJson: JSON.stringify(difficultyBreakdown),
      },
    });

    // Record submission event
    await tx.attemptEvent.create({
      data: {
        attemptId,
        eventType: isAutoSubmit ? 'AUTO_SUBMITTED' : 'TEST_SUBMITTED',
        metadata: JSON.stringify({
          percentage,
          passed,
          obtainedMarks,
          totalMarks,
          timeTakenSeconds,
        }),
      },
    });
  });

  return {
    attemptId,
    testTitle: attempt.assessment.title,
    courseTitle: attempt.assessment.course.title,
    attemptNumber: attempt.attemptNumber,
    status: submissionStatus,
    totalQuestions: fullSnapshot.attemptQuestions.length,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    unansweredQuestions: unansweredCount,
    totalMarks,
    obtainedMarks,
    percentage,
    passed,
    passingScore: attempt.assessment.passingScore,
    timeTakenSeconds,
    submittedAt: now.toISOString(),
    categoryBreakdown,
    difficultyBreakdown,
  };
}

export async function getAttemptResult(
  attemptId: string,
  requesterUserId: string,
  isAdmin = false
): Promise<FinalScorecard> {
  const attempt = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: { include: { course: true } },
      result: true,
    },
  });

  if (!attempt) throw new Error('Attempt not found');

  if (!isAdmin && attempt.userId !== requesterUserId) {
    throw new Error('FORBIDDEN: You do not have permission to view this result.');
  }

  // Pre-submission answer leak prevention
  if (!isAdmin && attempt.status === AttemptStatus.IN_PROGRESS) {
    throw new Error('FORBIDDEN: Assessment results are only available after submission.');
  }

  const result = attempt.result;
  const categoryBreakdown: ScorecardBreakdownItem[] = result?.categoryBreakdownJson
    ? JSON.parse(result.categoryBreakdownJson)
    : [];

  const difficultyBreakdown: DifficultyBreakdownItem[] = result?.difficultyBreakdownJson
    ? JSON.parse(result.difficultyBreakdownJson)
    : [];

  return {
    attemptId,
    testTitle: attempt.assessment.title,
    courseTitle: attempt.assessment.course.title,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    correctAnswers: attempt.correctCount,
    wrongAnswers: attempt.wrongCount,
    unansweredQuestions: attempt.unansweredCount,
    totalMarks: attempt.totalMarks,
    obtainedMarks: attempt.obtainedMarks,
    percentage: attempt.percentage,
    passed: attempt.passed,
    passingScore: attempt.assessment.passingScore,
    timeTakenSeconds: attempt.timeTakenSeconds,
    submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt).toISOString() : new Date().toISOString(),
    categoryBreakdown,
    difficultyBreakdown,
  };
}

export async function getDetailedAttemptReview(
  attemptId: string,
  requesterUserId: string,
  isAdmin = false
) {
  const attempt = await (prisma as any).testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assessment: { include: { course: true, category: true } },
      result: true,
      events: { orderBy: { timestamp: 'desc' }, take: 50 },
      attemptQuestions: {
        orderBy: { displayOrder: 'asc' },
        include: {
          question: {
            include: {
              category: true,
              options: true,
            },
          },
          attemptOptions: {
            orderBy: { displayOrder: 'asc' },
            include: { option: true },
          },
          answers: { where: { attemptId } },
        },
      },
    },
  });

  if (!attempt) throw new Error('Attempt not found');

  if (!isAdmin && attempt.userId !== requesterUserId) {
    throw new Error('FORBIDDEN: You do not have permission to view this review.');
  }

  // Pre-submission question & answer disclosure prevention
  if (!isAdmin && attempt.status === AttemptStatus.IN_PROGRESS) {
    throw new Error('FORBIDDEN: Detailed review and question explanations are only accessible after submission.');
  }

  // Build question review with full transparency now that test has been submitted
  const questionReviews = (attempt.attemptQuestions as any[]).map((aq: any) => {
    const studentAnswer = aq.answers[0];
    const selectedOptionId = studentAnswer?.selectedOptionId || null;
    const correctOption = aq.question.options.find((o: any) => o.isCorrect);

    return {
      attemptQuestionId: aq.id,
      displayOrder: aq.displayOrder,
      questionText: aq.question.questionText,
      explanation: aq.question.explanation,
      marks: aq.marks,
      topic: aq.question.topic,
      difficulty: aq.question.difficulty,
      category: aq.question.category.name,
      isCorrect: studentAnswer?.isCorrect || false,
      marksAwarded: studentAnswer?.marksAwarded || 0,
      selectedOptionId,
      correctOptionId: correctOption?.id,
      options: aq.attemptOptions.map((ao: any) => ({
        optionId: ao.option.id,
        optionText: ao.option.optionText,
        displayOrder: ao.displayOrder,
        isCorrect: ao.option.isCorrect,
        isSelected: ao.option.id === selectedOptionId,
      })),
    };
  });

  return {
    attemptId,
    student: attempt.user,
    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,
      courseTitle: attempt.assessment.course.title,
      passingScore: attempt.assessment.passingScore,
      durationMinutes: attempt.assessment.durationMinutes,
    },
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    timeTakenSeconds: attempt.timeTakenSeconds,
    totalMarks: attempt.totalMarks,
    obtainedMarks: attempt.obtainedMarks,
    percentage: attempt.percentage,
    passed: attempt.passed,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    unansweredCount: attempt.unansweredCount,
    questions: questionReviews,
    events: attempt.events,
  };
}
