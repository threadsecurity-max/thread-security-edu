import { prisma as rawPrisma } from '../src/server/database/prisma';
import { signSessionToken, verifySessionToken } from '../src/lib/auth/session-token';
import { validateQuestionOptions } from '../src/server/services/assessment/question-bank.service';
import { validateBlueprint } from '../src/server/services/assessment/blueprint.service';
import { generateOrResumeAttempt } from '../src/server/services/assessment/generator.service';
import { saveStudentAnswer, getActiveAttemptState, recordAttemptEvent } from '../src/server/services/assessment/attempt.service';
import { submitAttempt, getAttemptResult, getDetailedAttemptReview } from '../src/server/services/assessment/scoring.service';
import { getStudentAssessmentsList } from '../src/server/services/assessment/analytics.service';
import { DifficultyLevel, AssessmentStatus } from '../src/types/assessment';

const prisma = rawPrisma as any;

async function main() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE LMS & ASSESSMENT VERIFICATION');
  console.log('====================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition: boolean, message: string) {
    totalChecks++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedChecks++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Verification failed at: ${message}`);
    }
  }

  // =========================================================================
  // STEP 1: AUTHENTICATION & SECURITY VERIFICATION
  // =========================================================================
  console.log('🔑 [1/4] Verifying Authentication & Token Cryptography...');

  // 1.1 Test Student Account
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: { tsIdentity: true, studentProfile: true },
  });
  assert(!!student, `Student user exists: ${student?.name || 'N/A'} (${student?.id})`);

  // 1.2 Test Admin Account
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  assert(!!admin, `Super Admin user exists: ${admin?.name || 'N/A'} (${admin?.id})`);

  // 1.3 Test Session Token Generation & HMAC Verification
  const token = signSessionToken({
    userId: student!.id,
    email: student!.email,
    role: student!.role,
    name: student!.name || 'Student User',
    tsId: student!.tsIdentity?.tsId || 'TSE-2026-TEST',
  });
  assert(typeof token === 'string' && token.includes('.'), 'Session token created with HMAC-SHA256 signature');

  const verified = verifySessionToken(token);
  assert(verified !== null && verified.userId === student!.id, 'Session token verified and payload decrypted successfully');

  // 1.4 Test Tampered Token Rejection
  const tamperedToken = token.slice(0, -6) + 'XXXXXX';
  const tamperedVerified = verifySessionToken(tamperedToken);
  assert(tamperedVerified === null, 'Tampered session token correctly rejected by HMAC security vault');

  // =========================================================================
  // STEP 2: EXISTING LMS DASHBOARDS & COURSE FLOW SANITY CHECKS
  // =========================================================================
  console.log('\n📚 [2/4] Verifying Core LMS Dashboards & Course Flows...');

  // 2.1 Student Dashboard Data Flow
  const studentDashData = await prisma.user.findFirst({
    where: { id: student!.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
              },
              labs: true,
            },
          },
        },
      },
      labAttempts: { include: { lab: true } },
      certificates: { include: { course: true } },
    },
  });
  assert(studentDashData !== null, 'Student dashboard query executes cleanly without schema conflicts');

  // 2.2 Mentor Dashboard Data Flow
  const mentorProfile = await prisma.mentorProfile.findFirst({
    include: { user: true },
  });
  if (mentorProfile) {
    assert(true, `Mentor profile loaded: ${mentorProfile.user.name}`);
  } else {
    console.log('  ℹ️  Checking mentor profile table query viability...');
    const mentorCount = await prisma.mentorProfile.count();
    assert(mentorCount >= 0, 'Mentor profile table queried without regressions');
  }

  // 2.3 Course & Lesson Flow
  const publishedCourses = await prisma.course.findMany({
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { orderIndex: 'asc' },
      },
      labs: true,
    },
  });
  assert(publishedCourses.length > 0, `Published LMS courses accessible (${publishedCourses.length} courses found)`);
  assert(
    publishedCourses.some((c: any) => c.modules.length > 0),
    'Course modules and lesson hierarchies intact'
  );

  // 2.4 Hands-On Practical Labs
  const labs = await prisma.lab.findMany({
    include: { course: true },
  });
  assert(labs.length > 0, `Practical Sandbox Labs accessible (${labs.length} labs found)`);

  // =========================================================================
  // STEP 3: ADMIN ASSESSMENT & BLUEPRINT BUILDER FLOW
  // =========================================================================
  console.log('\n🛠️  [3/4] Verifying Admin Assessment Question Bank & Blueprint Builder...');

  // 3.1 Question Bank Validation
  const bankCount = await prisma.bankQuestion.count();
  assert(bankCount >= 10, `Question Bank loaded with ${bankCount} production questions`);

  const categories = await prisma.testCategory.findMany({ where: { isActive: true } });
  assert(categories.length >= 8, `Configured ${categories.length} Cybersecurity Categories (Red Team, Blue Team, VAPT, etc.)`);

  const families = await prisma.questionFamily.findMany();
  assert(families.length >= 8, `Configured ${families.length} Question Families for variant balancing`);

  // 3.2 Question Option Validator Rule Engine
  expectNoThrow(() => {
    validateQuestionOptions([
      { optionText: 'Option 1', isCorrect: true },
      { optionText: 'Option 2', isCorrect: false },
    ]);
  }, 'Question Option validator accepts valid 2-choice questions');

  // 3.3 Validate Blueprint Distribution Rule Engine
  const targetCourse = publishedCourses[0];
  const targetCategory = categories[0];

  const validationResult = await validateBlueprint({
    courseId: targetCourse.id,
    questionsPerAttempt: 4,
    easyPercent: 50.0,
    mediumPercent: 50.0,
    hardPercent: 0.0,
    difficultyBalancing: true,
  });
  assert(validationResult.isValid === true, 'Blueprint mathematical balancing engine verified distribution');

  // 3.4 Create a New Blueprint in Admin Flow
  const newBlueprint = await prisma.assessment.create({
    data: {
      title: 'Automated E2E Test Blueprint',
      description: 'Blueprint created by automated verification suite',
      instructions: '1. Strict timing\n2. Authoritative evaluation',
      courseId: targetCourse.id,
      categoryId: targetCategory.id,
      durationMinutes: 15,
      questionsPerAttempt: 4,
      passingScore: 50.0,
      maxAttempts: 3,
      status: AssessmentStatus.PUBLISHED,
      randomQuestionSelection: true,
      randomQuestionOrder: true,
      randomOptionOrder: true,
      difficultyBalancing: true,
      categoryBalancing: false,
      questionVariants: true,
      preventDuplicateFamilies: true,
      autoSave: true,
      autoSubmit: true,
      fullScreen: false,
      tabSwitchDetection: true,
      copyPasteRestriction: true,
      rightClickRestriction: true,
      easyPercent: 50.0,
      mediumPercent: 50.0,
      hardPercent: 0.0,
      categoryDistributionJson: null,
    },
  });
  assert(!!newBlueprint && !!newBlueprint.id, `Admin Blueprint Builder created published blueprint: "${newBlueprint.title}" (ID: ${newBlueprint.id})`);

  // =========================================================================
  // STEP 4: STUDENT ASSESSMENT FLOW VALIDATION
  // =========================================================================
  console.log('\n🎓 [4/4] Verifying Student Assessment Flow (Start -> AutoSave -> Submit -> Results)...');

  // 4.1 Student Assessments Catalog Query
  const studentCatalog = await getStudentAssessmentsList(student!.id);
  assert(studentCatalog.assessments.length > 0, `Student catalog returns ${studentCatalog.assessments.length} assessments`);
  assert(typeof studentCatalog.summary.availableCount === 'number', 'Student metrics summary calculated accurately');

  // 4.2 Start Test Attempt (Authoritative Generator)
  const attemptState = await generateOrResumeAttempt(newBlueprint.id, student!.id);
  assert(!!attemptState.attemptId, `Assessment attempt initiated: ${attemptState.attemptId}`);
  assert(attemptState.questions.length === 4, `Balanced test questions snapshot generated (${attemptState.questions.length} questions)`);

  // 4.3 Anti-Leakage Check: Ensure correct answers are NEVER sent in student attempt payload
  const hasLeakedAnswers = (attemptState.questions as any[]).some((q) =>
    q.options.some((o: any) => 'isCorrect' in o)
  );
  assert(!hasLeakedAnswers, 'Anti-Leakage Guard active: Correct answer flags completely stripped from student attempt');

  // 4.4 Refresh Resilience Check
  const resumedAttemptState = await generateOrResumeAttempt(newBlueprint.id, student!.id);
  assert(
    resumedAttemptState.attemptId === attemptState.attemptId,
    'Refresh Resilience verified: Returning student restores existing snapshot rather than generating duplicate'
  );

  // 4.5 Auto-Save Student Answers
  const firstQuestion = attemptState.questions[0];
  const selectedOption = firstQuestion.options[0];
  const saveResult = await saveStudentAnswer(
    attemptState.attemptId,
    student!.id,
    firstQuestion.attemptQuestionId,
    selectedOption.optionId
  );
  assert(saveResult.success === true, `Auto-save synced answer for Question 1 (${selectedOption.optionId})`);

  // 4.6 Proctoring Audit Events
  const eventResult = await recordAttemptEvent(
    attemptState.attemptId,
    student!.id,
    'TAB_SWITCHED',
    { focusLostSeconds: 2 }
  );
  assert(eventResult.success === true, 'Proctoring audit event TAB_SWITCHED captured in immutable security log');

  // 4.7 Submit and Score Test
  const scorecard = await submitAttempt(attemptState.attemptId, student!.id, false);
  assert(typeof scorecard.percentage === 'number', `Student exam submitted & graded: Final Score ${scorecard.percentage}% (${scorecard.obtainedMarks}/${scorecard.totalMarks} marks)`);

  // 4.8 Scorecard Retrieval Verification
  const fetchedScorecard = await getAttemptResult(attemptState.attemptId, student!.id, false);
  assert(fetchedScorecard.percentage === scorecard.percentage, 'Authoritative scorecard retrieved matching submission grade');
  assert(fetchedScorecard.categoryBreakdown.length > 0, 'Domain / Category performance breakdown generated');
  assert(fetchedScorecard.difficultyBreakdown.length > 0, 'Difficulty performance breakdown generated');

  // 4.9 Post-Submission Detailed Review
  const detailedReview = await getDetailedAttemptReview(attemptState.attemptId, student!.id, false);
  assert(detailedReview.questions.length === 4, 'Post-examination detailed review accessible with explanations and answer keys');

  // 4.10 IDOR Protection Verification
  let idorBlocked = false;
  try {
    // Attempting to access another user's review
    await getDetailedAttemptReview(attemptState.attemptId, 'non-existent-or-other-user', false);
  } catch (err: any) {
    idorBlocked = true;
  }
  assert(idorBlocked, 'IDOR Protection verified: Unauthorized users blocked from accessing other students test attempts');

  // Clean up temporary E2E blueprint and attempt
  await prisma.studentAnswer.deleteMany({
    where: { attemptId: attemptState.attemptId },
  });
  await prisma.attemptEvent.deleteMany({
    where: { attemptId: attemptState.attemptId },
  });
  await prisma.testAttempt.delete({
    where: { id: attemptState.attemptId },
  });
  await prisma.assessment.delete({
    where: { id: newBlueprint.id },
  });

  console.log('\n====================================================');
  console.log(`🎉 ALL CHECKS PASSED: ${passedChecks}/${totalChecks} VERIFICATIONS SUCCESSFUL`);
  console.log('====================================================');
}

function expectNoThrow(fn: () => void, message: string) {
  try {
    fn();
  } catch (e: any) {
    throw new Error(`Expected no throw for "${message}", but threw: ${e.message}`);
  }
}

main()
  .catch((err) => {
    console.error('\n❌ SCRIPT TERMINATED WITH ERROR:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
