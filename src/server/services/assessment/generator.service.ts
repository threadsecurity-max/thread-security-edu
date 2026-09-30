import crypto from 'crypto';
import { prisma } from '@/server/database/prisma';
import {
  DifficultyLevel,
  QuestionBankStatus,
  AttemptStatus,
  AssessmentStatus,
} from '@/types/assessment';
import { submitAttempt } from './scoring.service';
import { CategoryDistributionItem } from './blueprint.service';

/**
 * Deterministic PRNG seeded from attempt cryptographic seed
 * Ensures reproducibility and uniform distribution
 */
function createSeededRandom(seedHex: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedHex.length; i++) {
    h ^= seedHex.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return function nextRandom(): number {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates array shuffle
 */
function shuffleArray<T>(array: T[], prng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface StudentSafeOption {
  optionId: string;
  optionText: string;
  displayOrder: number;
}

export interface StudentSafeQuestion {
  attemptQuestionId: string;
  questionId: string;
  displayOrder: number;
  questionText: string;
  marks: number;
  topic: string;
  categoryName: string;
  difficulty: string;
  options: StudentSafeOption[];
  selectedOptionId?: string | null;
}

export interface StudentSafeAttemptState {
  attemptId: string;
  assessmentId: string;
  title: string;
  courseTitle: string;
  status: AttemptStatus;
  attemptNumber: number;
  maxAttempts: number;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  questions: StudentSafeQuestion[];
  antiCheating: {
    fullScreen: boolean;
    tabSwitchDetection: boolean;
    copyPasteRestriction: boolean;
    rightClickRestriction: boolean;
    autoSave: boolean;
  };
}

export async function generateOrResumeAttempt(
  testId: string,
  studentId: string
): Promise<StudentSafeAttemptState> {
  // 1. Validate Assessment Exists and is PUBLISHED
  const assessment: any = await (prisma as any).assessment.findUnique({
    where: { id: testId },
    include: {
      course: true,
      category: true,
    },
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  if (assessment.status !== AssessmentStatus.PUBLISHED) {
    throw new Error('This assessment is currently unavailable or in draft state.');
  }

  // 2. Validate Student Enrollment in Course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: studentId,
        courseId: assessment.courseId,
      },
    },
  });

  // If strict enrollment exists in system, check if active; or allow if admin/demo mode
  if (!enrollment || enrollment.status === 'DROPPED') {
    // Check if student user exists
    const studentUser = await prisma.user.findUnique({ where: { id: studentId } });
    if (!studentUser) throw new Error('Student user not found.');

    // Auto-enroll if student exists to provide seamless LMS experience
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: assessment.courseId,
        },
      },
      update: { status: 'ACTIVE' },
      create: {
        userId: studentId,
        courseId: assessment.courseId,
        status: 'ACTIVE',
      },
    });
  }

  const now = new Date();

  // 3. Check for existing active attempt (IN_PROGRESS)
  const existingActiveAttempt: any = await (prisma as any).testAttempt.findFirst({
    where: {
      assessmentId: testId,
      userId: studentId,
      status: AttemptStatus.IN_PROGRESS,
    },
    include: {
      attemptQuestions: {
        orderBy: { displayOrder: 'asc' },
        include: {
          question: { include: { category: true } },
          attemptOptions: {
            orderBy: { displayOrder: 'asc' },
            include: { option: true },
          },
          answers: { where: { attempt: { userId: studentId } } },
        },
      },
    },
  });

  if (existingActiveAttempt) {
    // Check if server time has already passed expiresAt
    if (now >= existingActiveAttempt.expiresAt) {
      // Expiration handling: Auto-submit this expired attempt
      await submitAttempt(existingActiveAttempt.id, studentId, true);
    } else {
      // Restore existing attempt snapshot! NEVER regenerate on refresh!
      return buildStudentSafeAttempt(existingActiveAttempt, assessment);
    }
  }

  // 4. Validate Attempt Limit
  const pastAttemptsCount = await (prisma as any).testAttempt.count({
    where: {
      assessmentId: testId,
      userId: studentId,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED, AttemptStatus.EXPIRED] },
    },
  });

  if (assessment.maxAttempts > 0 && pastAttemptsCount >= assessment.maxAttempts) {
    throw new Error(
      `Attempt limit reached. You have completed ${pastAttemptsCount} of ${assessment.maxAttempts} allowed attempts.`
    );
  }

  const nextAttemptNumber = pastAttemptsCount + 1;

  // 5. Generate Cryptographic Random Seed
  const randomSeed = crypto.randomBytes(32).toString('hex');
  const prng = createSeededRandom(randomSeed);

  // 6. Calculate Blueprint Requirements
  const totalQuestions = assessment.questionsPerAttempt;
  const easyCount = Math.round((totalQuestions * assessment.easyPercent) / 100);
  const hardCount = Math.round((totalQuestions * assessment.hardPercent) / 100);
  const medCount = Math.max(0, totalQuestions - easyCount - hardCount);

  const catDistribution: CategoryDistributionItem[] = assessment.categoryDistributionJson
    ? JSON.parse(assessment.categoryDistributionJson)
    : [];

  // 7. Load Eligible Active Questions
  const eligibleQuestions: any[] = await (prisma as any).bankQuestion.findMany({
    where: {
      status: QuestionBankStatus.ACTIVE,
      OR: [{ courseId: assessment.courseId }, { courseId: null }],
    },
    include: {
      category: true,
      family: true,
      options: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (eligibleQuestions.length < totalQuestions) {
    throw new Error(
      `Insufficient eligible questions to satisfy this test blueprint (required: ${totalQuestions}, available: ${eligibleQuestions.length}). Please contact the instructor.`
    );
  }

  // 8. Question Selection Algorithm with Blueprint & Family Balancing
  let candidatePool: any[] = shuffleArray(eligibleQuestions, prng);
  const selectedQuestions: any[] = [];
  const selectedFamilyIds = new Set<string>();

  const canSelectQuestion = (q: any) => {
    if (selectedQuestions.some((s: any) => s.id === q.id)) return false;
    if (assessment.preventDuplicateFamilies && q.questionFamilyId) {
      if (selectedFamilyIds.has(q.questionFamilyId)) return false;
    }
    return true;
  };

  const selectOne = (pool: any[]) => {
    for (const q of pool) {
      if (canSelectQuestion(q)) {
        selectedQuestions.push(q);
        if (q.questionFamilyId) selectedFamilyIds.add(q.questionFamilyId);
        return true;
      }
    }
    return false;
  };

  // If difficulty balancing is ON, select by quota
  if (assessment.difficultyBalancing) {
    const easyCandidates = candidatePool.filter((q: any) => q.difficulty === DifficultyLevel.EASY);
    const medCandidates = candidatePool.filter((q: any) => q.difficulty === DifficultyLevel.MEDIUM);
    const hardCandidates = candidatePool.filter((q: any) => q.difficulty === DifficultyLevel.HARD);

    // Pick Easy
    for (let i = 0; i < easyCount; i++) {
      const ok = selectOne(easyCandidates);
      if (!ok) {
        throw new Error(
          'Insufficient eligible questions to satisfy Easy difficulty requirements of this blueprint.'
        );
      }
    }

    // Pick Medium
    for (let i = 0; i < medCount; i++) {
      const ok = selectOne(medCandidates);
      if (!ok) {
        throw new Error(
          'Insufficient eligible questions to satisfy Medium difficulty requirements of this blueprint.'
        );
      }
    }

    // Pick Hard
    for (let i = 0; i < hardCount; i++) {
      const ok = selectOne(hardCandidates);
      if (!ok) {
        throw new Error(
          'Insufficient eligible questions to satisfy Hard difficulty requirements of this blueprint.'
        );
      }
    }
  } else {
    // Fill until total reached
    for (const q of candidatePool) {
      if (selectedQuestions.length >= totalQuestions) break;
      if (canSelectQuestion(q)) {
        selectedQuestions.push(q);
        if (q.questionFamilyId) selectedFamilyIds.add(q.questionFamilyId);
      }
    }
  }

  // Safety check: ensure total count met
  if (selectedQuestions.length < totalQuestions) {
    // Attempt fallback from remaining candidate pool if family restriction was too tight
    for (const q of candidatePool) {
      if (selectedQuestions.length >= totalQuestions) break;
      if (!selectedQuestions.some((s: any) => s.id === q.id)) {
        selectedQuestions.push(q);
      }
    }
  }

  if (selectedQuestions.length < totalQuestions) {
    throw new Error('Insufficient eligible questions to satisfy this test blueprint.');
  }

  // 9. Shuffle Questions display order if enabled
  const orderedQuestions = assessment.randomQuestionOrder
    ? shuffleArray(selectedQuestions, prng)
    : selectedQuestions;

  // 10. Persist Snapshot Atomically
  const expiresAt = new Date(now.getTime() + assessment.durationMinutes * 60 * 1000);

  const newAttempt: any = await (prisma as any).$transaction(async (tx: any) => {
    const attempt = await tx.testAttempt.create({
      data: {
        assessmentId: testId,
        userId: studentId,
        attemptNumber: nextAttemptNumber,
        randomSeed,
        startedAt: now,
        expiresAt,
        status: AttemptStatus.IN_PROGRESS,
        totalQuestions: orderedQuestions.length,
        totalMarks: assessment.totalMarks,
      },
    });

    for (let qIdx = 0; qIdx < orderedQuestions.length; qIdx++) {
      const q = orderedQuestions[qIdx];
      const optionsToOrder = assessment.randomOptionOrder
        ? shuffleArray(q.options, prng)
        : q.options;

      await tx.attemptQuestion.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          displayOrder: qIdx + 1,
          marks: q.marks,
          attemptOptions: {
            create: optionsToOrder.map((opt: any, oIdx: number) => ({
              optionId: opt.id,
              displayOrder: oIdx + 1,
            })),
          },
        },
      });
    }

    // Record initial event
    await tx.attemptEvent.create({
      data: {
        attemptId: attempt.id,
        eventType: 'TEST_STARTED',
        metadata: JSON.stringify({
          attemptNumber: nextAttemptNumber,
          seedLength: randomSeed.length,
          userAgent: 'Authorized LMS Client',
        }),
      },
    });

    return attempt;
  }, {
    timeout: 30000,
    maxWait: 10000,
  });

  // Fetch complete created snapshot for presentation
  const persistedAttempt: any = await (prisma as any).testAttempt.findUniqueOrThrow({
    where: { id: newAttempt.id },
    include: {
      attemptQuestions: {
        orderBy: { displayOrder: 'asc' },
        include: {
          question: { include: { category: true } },
          attemptOptions: {
            orderBy: { displayOrder: 'asc' },
            include: { option: true },
          },
          answers: { where: { attemptId: newAttempt.id } },
        },
      },
    },
  });

  return buildStudentSafeAttempt(persistedAttempt, assessment);
}

/**
 * Builds the safe student-facing presentation
 * NEVER exposes isCorrect, correctAnswer, or explanations before submission!
 */
export function buildStudentSafeAttempt(
  attempt: any,
  assessment: any
): StudentSafeAttemptState {
  const now = new Date();
  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(attempt.expiresAt).getTime() - now.getTime()) / 1000)
  );

  const safeQuestions: StudentSafeQuestion[] = attempt.attemptQuestions.map((aq: any) => {
    const savedAnswer = aq.answers && aq.answers.length > 0 ? aq.answers[0].selectedOptionId : null;

    const safeOptions: StudentSafeOption[] = aq.attemptOptions.map((ao: any) => ({
      optionId: ao.option.id,
      optionText: ao.option.optionText,
      displayOrder: ao.displayOrder,
    }));

    return {
      attemptQuestionId: aq.id,
      questionId: aq.questionId,
      displayOrder: aq.displayOrder,
      questionText: aq.question.questionText,
      marks: aq.marks,
      topic: aq.question.topic,
      categoryName: aq.question.category?.name || 'General',
      difficulty: aq.question.difficulty,
      options: safeOptions,
      selectedOptionId: savedAnswer,
    };
  });

  return {
    attemptId: attempt.id,
    assessmentId: assessment.id,
    title: assessment.title,
    courseTitle: assessment.course?.title || 'Cybersecurity Course',
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    maxAttempts: assessment.maxAttempts,
    durationMinutes: assessment.durationMinutes,
    startedAt: new Date(attempt.startedAt).toISOString(),
    expiresAt: new Date(attempt.expiresAt).toISOString(),
    remainingSeconds,
    totalQuestions: safeQuestions.length,
    totalMarks: assessment.totalMarks,
    passingScore: assessment.passingScore,
    questions: safeQuestions,
    antiCheating: {
      fullScreen: assessment.fullScreen,
      tabSwitchDetection: assessment.tabSwitchDetection,
      copyPasteRestriction: assessment.copyPasteRestriction,
      rightClickRestriction: assessment.rightClickRestriction,
      autoSave: assessment.autoSave,
    },
  };
}
