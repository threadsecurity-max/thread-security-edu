import { prisma } from '@/server/database/prisma';
import { AssessmentStatus, AttemptStatus } from '@/types/assessment';

export async function getStudentAssessmentsList(studentId: string) {
  // 1. Get student enrolled courses
  const enrollments = await (prisma as any).enrollment.findMany({
    where: { userId: studentId, status: 'ACTIVE' },
    select: { courseId: true },
  });

  const enrolledCourseIds = enrollments.map((e: any) => e.courseId);

  // 2. Fetch published assessments for enrolled courses (or all published if student has no specific enrollments)
  const whereClause: any = {
    status: AssessmentStatus.PUBLISHED,
  };

  if (enrolledCourseIds.length > 0) {
    whereClause.OR = [
      { courseId: { in: enrolledCourseIds } },
      { course: { enrollments: { some: { userId: studentId } } } },
    ];
  }

  const assessments = await (prisma as any).assessment.findMany({
    where: whereClause,
    include: {
      course: { select: { id: true, title: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      testAttempts: {
        where: { userId: studentId },
        orderBy: { attemptNumber: 'desc' },
        include: {
          result: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Transform into rich student assessment cards
  const transformed = (assessments as any[]).map((a: any) => {
    const attempts = a.testAttempts || [];
    const completedAttempts = attempts.filter(
      (att: any) => att.status === AttemptStatus.SUBMITTED || att.status === AttemptStatus.AUTO_SUBMITTED
    );
    const activeAttempt = attempts.find((att: any) => att.status === AttemptStatus.IN_PROGRESS);

    const attemptsUsed = completedAttempts.length + (activeAttempt ? 1 : 0);
    const attemptsRemaining =
      a.maxAttempts > 0 ? Math.max(0, a.maxAttempts - attemptsUsed) : 999;

    // Highest score among completed
    const highestScore =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((att: any) => att.percentage))
        : null;

    const hasPassed = completedAttempts.some((att: any) => att.passed);

    let statusLabel:
      | 'Not Started'
      | 'Available'
      | 'In Progress'
      | 'Passed'
      | 'Failed'
      | 'Attempt Limit Reached' = 'Available';

    if (activeAttempt) {
      statusLabel = 'In Progress';
    } else if (hasPassed) {
      statusLabel = 'Passed';
    } else if (a.maxAttempts > 0 && attemptsUsed >= a.maxAttempts) {
      statusLabel = 'Attempt Limit Reached';
    } else if (completedAttempts.length > 0 && !hasPassed) {
      statusLabel = 'Failed';
    } else if (attemptsUsed === 0) {
      statusLabel = 'Not Started';
    }

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      courseId: a.course?.id,
      courseTitle: a.course?.title,
      categoryId: a.category?.id || null,
      categoryName: a.category?.name || 'General Cybersecurity',
      durationMinutes: a.durationMinutes,
      questionsPerAttempt: a.questionsPerAttempt,
      totalMarks: a.totalMarks,
      passingScore: a.passingScore,
      maxAttempts: a.maxAttempts,
      attemptsUsed,
      attemptsRemaining: a.maxAttempts > 0 ? attemptsRemaining : 'Unlimited',
      status: statusLabel,
      activeAttemptId: activeAttempt ? activeAttempt.id : null,
      highestScore,
      lastAttempt: completedAttempts[0]
        ? {
            id: completedAttempts[0].id,
            attemptNumber: completedAttempts[0].attemptNumber,
            score: completedAttempts[0].score,
            percentage: completedAttempts[0].percentage,
            passed: completedAttempts[0].passed,
            submittedAt: completedAttempts[0].submittedAt,
            timeTakenSeconds: completedAttempts[0].timeTakenSeconds,
          }
        : null,
      history: completedAttempts.map((att: any) => ({
        id: att.id,
        attemptNumber: att.attemptNumber,
        percentage: att.percentage,
        passed: att.passed,
        submittedAt: att.submittedAt,
        timeTakenSeconds: att.timeTakenSeconds,
      })),
    };
  });

  // Calculate Student Summary Metrics
  const totalCompleted = transformed.reduce((acc: number, t: any) => acc + (t.history?.length || 0), 0);
  const testsPassed = transformed.filter((t: any) => t.status === 'Passed').length;
  const inProgressCount = transformed.filter((t: any) => t.status === 'In Progress').length;
  const availableCount = transformed.filter(
    (t: any) => t.status === 'Available' || t.status === 'Not Started'
  ).length;

  const allPercentages = transformed.flatMap((t: any) => (t.history || []).map((h: any) => h.percentage));
  const averageScore =
    allPercentages.length > 0
      ? Math.round(allPercentages.reduce((a: number, b: number) => a + b, 0) / allPercentages.length)
      : 0;

  return {
    assessments: transformed,
    summary: {
      totalCompleted,
      testsPassed,
      inProgressCount,
      availableCount,
      averageScore,
    },
  };
}

export async function getAdminAssessmentAnalytics(params?: {
  courseId?: string;
  testId?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params?.page || 1);
  const limit = Math.min(100, Math.max(1, params?.limit || 20));
  const skip = (page - 1) * limit;

  const [
    totalTests,
    publishedTests,
    draftTests,
    totalQuestions,
    totalCategories,
    totalAttempts,
    completedAttempts,
  ] = await Promise.all([
    (prisma as any).assessment.count(),
    (prisma as any).assessment.count({ where: { status: AssessmentStatus.PUBLISHED } }),
    (prisma as any).assessment.count({ where: { status: AssessmentStatus.DRAFT } }),
    (prisma as any).bankQuestion.count(),
    (prisma as any).testCategory.count(),
    (prisma as any).testAttempt.count(),
    (prisma as any).testAttempt.count({
      where: {
        status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED] },
      },
    }),
  ]);

  const attemptsWhere: any = {};
  if (params?.courseId) attemptsWhere.assessment = { courseId: params.courseId };
  if (params?.testId) attemptsWhere.assessmentId = params.testId;

  const [attempts, totalAttemptsFiltered] = await Promise.all([
    (prisma as any).testAttempt.findMany({
      where: attemptsWhere,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assessment: {
          select: {
            id: true,
            title: true,
            course: { select: { title: true } },
            category: { select: { name: true } },
            passingScore: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
    }),
    (prisma as any).testAttempt.count({ where: attemptsWhere }),
  ]);

  // Aggregate metrics
  const completedRecords = await (prisma as any).testAttempt.findMany({
    where: {
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED] },
    },
    select: { percentage: true, passed: true, timeTakenSeconds: true },
  });

  const avgPercentage =
    completedRecords.length > 0
      ? Math.round(
          (completedRecords.reduce((acc: number, r: any) => acc + r.percentage, 0) / completedRecords.length) *
            10
        ) / 10
      : 0;

  const passRate =
    completedRecords.length > 0
      ? Math.round(
          (completedRecords.filter((r: any) => r.passed).length / completedRecords.length) * 100
        )
      : 0;

  return {
    overview: {
      totalTests,
      publishedTests,
      draftTests,
      totalQuestions,
      totalCategories,
      totalAttempts,
      completedAttempts,
      averagePercentage: avgPercentage,
      passRatePercent: passRate,
    },
    attempts: (attempts as any[]).map((att: any) => ({
      id: att.id,
      studentName: att.user.name,
      studentEmail: att.user.email,
      studentId: att.user.id,
      testId: att.assessment.id,
      testTitle: att.assessment.title,
      courseTitle: att.assessment.course.title,
      categoryName: att.assessment.category?.name || 'General',
      attemptNumber: att.attemptNumber,
      status: att.status,
      score: att.score,
      percentage: att.percentage,
      passed: att.passed,
      passingScore: att.assessment.passingScore,
      timeTakenSeconds: att.timeTakenSeconds,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
    })),
    pagination: {
      total: totalAttemptsFiltered,
      page,
      limit,
      totalPages: Math.ceil(totalAttemptsFiltered / limit),
    },
  };
}
