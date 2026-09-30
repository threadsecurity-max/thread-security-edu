import { describe, it, expect, beforeAll } from 'vitest';
import { validateQuestionOptions } from '../../src/server/services/assessment/question-bank.service';
import { validateBlueprint } from '../../src/server/services/assessment/blueprint.service';
import { prisma } from '../../src/server/database/prisma';
import { generateOrResumeAttempt } from '../../src/server/services/assessment/generator.service';
import { saveStudentAnswer, getActiveAttemptState, recordAttemptEvent } from '../../src/server/services/assessment/attempt.service';
import { submitAttempt, getAttemptResult, getDetailedAttemptReview } from '../../src/server/services/assessment/scoring.service';
import { DifficultyLevel } from '@/types/assessment';

describe('Assessment Question Bank Validation Rules', () => {
  it('rejects questions with fewer than 2 options', () => {
    expect(() => {
      validateQuestionOptions([{ optionText: 'Only One', isCorrect: true }]);
    }).toThrow('A question must have at least 2 options.');
  });

  it('rejects questions with empty option text', () => {
    expect(() => {
      validateQuestionOptions([
        { optionText: 'Option A', isCorrect: true },
        { optionText: '   ', isCorrect: false },
      ]);
    }).toThrow('Options cannot have empty text.');
  });

  it('rejects duplicate option choices', () => {
    expect(() => {
      validateQuestionOptions([
        { optionText: 'Option A', isCorrect: true },
        { optionText: 'Option A', isCorrect: false },
      ]);
    }).toThrow('Options must contain unique text choices.');
  });

  it('rejects questions with zero or multiple correct answers in single-choice MCQ', () => {
    expect(() => {
      validateQuestionOptions([
        { optionText: 'Option A', isCorrect: false },
        { optionText: 'Option B', isCorrect: false },
      ]);
    }).toThrow('MCQ questions must designate exactly one correct option.');

    expect(() => {
      validateQuestionOptions([
        { optionText: 'Option A', isCorrect: true },
        { optionText: 'Option B', isCorrect: true },
      ]);
    }).toThrow('MCQ questions must designate exactly one correct option.');
  });

  it('accepts valid 4-choice MCQ options', () => {
    expect(() => {
      validateQuestionOptions([
        { optionText: 'Option A', isCorrect: true },
        { optionText: 'Option B', isCorrect: false },
        { optionText: 'Option C', isCorrect: false },
        { optionText: 'Option D', isCorrect: false },
      ]);
    }).not.toThrow();
  });
});

describe('Blueprint Validation Engine', () => {
  it('rejects difficulty distributions that do not sum to 100%', async () => {
    const result = await validateBlueprint({
      questionsPerAttempt: 10,
      easyPercent: 50,
      mediumPercent: 20,
      hardPercent: 20, // Sum = 90%
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('must equal 100%'))).toBe(true);
  });

  it('accurately calculates required question counts for 100% distribution', async () => {
    const result = await validateBlueprint({
      questionsPerAttempt: 20,
      easyPercent: 40,
      mediumPercent: 40,
      hardPercent: 20,
    });

    expect(result.calculatedCounts.easy).toBe(8);
    expect(result.calculatedCounts.medium).toBe(8);
    expect(result.calculatedCounts.hard).toBe(4);
    expect(result.calculatedCounts.total).toBe(20);
  });

  it('flags insufficient questions in question bank with exact count needed', async () => {
    const result = await validateBlueprint({
      questionsPerAttempt: 500, // Impossibly large
      easyPercent: 40,
      mediumPercent: 40,
      hardPercent: 20,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Insufficient total eligible questions'))).toBe(true);
  });
});

describe('Online Test Generation, Snapshot & Server Scoring Flow', () => {
  let testStudentId: string;
  let testExamId: string;

  beforeAll(async () => {
    // Find or create test student
    let student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: 'test_student_assessment@threadsecurity.edu',
          name: 'Unit Test Student',
          passwordHash: 'dummy_hash',
          role: 'STUDENT',
          isDashboardAccessGranted: true,
        },
      });
    }
    testStudentId = student.id;

    // Find seeded published assessment
    const exam = await prisma.assessment.findFirst({
      where: { status: 'PUBLISHED' },
    });
    if (!exam) {
      throw new Error('No published assessment found. Run prisma:seed first.');
    }
    testExamId = exam.id;

    // Clean up any test attempts from previous test runs to ensure isolation
    await (prisma as any).testAttempt.deleteMany({
      where: { assessmentId: testExamId, userId: testStudentId },
    });
  });

  it('generates a fresh attempt without exposing correct answers in the presentation', async () => {
    const attemptState = await generateOrResumeAttempt(testExamId, testStudentId);

    expect(attemptState.attemptId).toBeDefined();
    expect(attemptState.status).toBe('IN_PROGRESS');
    expect(attemptState.questions.length).toBeGreaterThan(0);
    expect(attemptState.remainingSeconds).toBeGreaterThan(0);

    // SECURITY VERIFICATION: Verify that isCorrect, correctAnswer, explanation are ABSENT
    for (const q of attemptState.questions) {
      expect((q as any).isCorrect).toBeUndefined();
      expect((q as any).correctAnswer).toBeUndefined();
      expect((q as any).explanation).toBeUndefined();
      for (const opt of q.options) {
        expect((opt as any).isCorrect).toBeUndefined();
      }
    }
  });

  it('restores the existing attempt on refresh rather than regenerating a new attempt', async () => {
    // Call generate again for the same student while active
    const secondCall = await generateOrResumeAttempt(testExamId, testStudentId);
    const activeState = await getActiveAttemptState(secondCall.attemptId, testStudentId);

    expect(activeState.attemptId).toBe(secondCall.attemptId);
    expect(activeState.status).toBe('IN_PROGRESS');
  });

  it('autosaves student answers safely and updates attempt state', async () => {
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);
    const firstQ = activeState.questions[0];
    const firstOptionId = firstQ.options[0].optionId;

    const saveResult = await saveStudentAnswer(
      activeState.attemptId,
      testStudentId,
      firstQ.attemptQuestionId,
      firstOptionId
    );

    expect(saveResult.success).toBe(true);
    expect(saveResult.data.selectedOptionId).toBe(firstOptionId);

    // Verify recovery has saved selection
    const recovered = await getActiveAttemptState(activeState.attemptId, testStudentId);
    const recoveredFirstQ = recovered.questions.find(
      (q) => q.attemptQuestionId === firstQ.attemptQuestionId
    );
    expect(recoveredFirstQ?.selectedOptionId).toBe(firstOptionId);
  });

  it('rejects answer submission for unauthorized students (IDOR protection)', async () => {
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);
    const firstQ = activeState.questions[0];
    const firstOptionId = firstQ.options[0].optionId;

    await expect(
      saveStudentAnswer(
        activeState.attemptId,
        'unauthorized_attacker_id_999',
        firstQ.attemptQuestionId,
        firstOptionId
      )
    ).rejects.toThrow('FORBIDDEN');
  });

  it('rejects answers with options belonging to other questions', async () => {
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);
    const firstQ = activeState.questions[0];
    const foreignOptionId = 'invalid_foreign_option_id_xyz';

    await expect(
      saveStudentAnswer(
        activeState.attemptId,
        testStudentId,
        firstQ.attemptQuestionId,
        foreignOptionId
      )
    ).rejects.toThrow('Invalid option selected');
  });

  it('scores the attempt server-side and prevents duplicate submissions', async () => {
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);

    // Submit attempt
    const scorecard1 = await submitAttempt(activeState.attemptId, testStudentId, false);

    expect(scorecard1.attemptId).toBe(activeState.attemptId);
    expect(['SUBMITTED', 'AUTO_SUBMITTED']).toContain(scorecard1.status);
    expect(scorecard1.totalQuestions).toBe(activeState.questions.length);
    expect(typeof scorecard1.percentage).toBe('number');
    expect(typeof scorecard1.passed).toBe('boolean');
    expect(scorecard1.categoryBreakdown.length).toBeGreaterThan(0);

    // Double Submission Test: Second submit must be idempotent and not re-calculate
    const scorecard2 = await submitAttempt(activeState.attemptId, testStudentId, false);
    expect(scorecard2.percentage).toBe(scorecard1.percentage);
    expect(scorecard2.obtainedMarks).toBe(scorecard1.obtainedMarks);
  });

  it('blocks pre-submission detailed answer review while attempt is IN_PROGRESS (Anti-Leakage Guard)', async () => {
    // Generate fresh attempt
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);

    // Attempting to read detailed review or scorecard during active test must be rejected
    await expect(
      getDetailedAttemptReview(activeState.attemptId, testStudentId, false)
    ).rejects.toThrow('FORBIDDEN');

    await expect(
      getAttemptResult(activeState.attemptId, testStudentId, false)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('rejects unauthorized audit event types and oversized metadata (Audit Integrity)', async () => {
    const activeState = await generateOrResumeAttempt(testExamId, testStudentId);

    // Unknown event type
    await expect(
      recordAttemptEvent(activeState.attemptId, testStudentId, 'MALICIOUS_INJECTED_EVENT')
    ).rejects.toThrow('Invalid eventType');

    // Oversized metadata (>2KB)
    const giantPayload = { data: 'A'.repeat(3000) };
    await expect(
      recordAttemptEvent(activeState.attemptId, testStudentId, 'TAB_SWITCHED', giantPayload)
    ).rejects.toThrow('exceeds maximum permitted size');
  });
});
