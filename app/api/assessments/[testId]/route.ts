import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { AttemptStatus, AssessmentStatus } from '@/types/assessment';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { testId } = await context.params;

    const assessment: any = await (prisma as any).assessment.findUnique({
      where: { id: testId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        testAttempts: {
          where: { userId: session.userId },
          orderBy: { attemptNumber: 'desc' },
        },
      },
    });

    const isAdmin = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role);

    if (!assessment || (!isAdmin && assessment.status !== AssessmentStatus.PUBLISHED)) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const completedAttempts = (assessment.testAttempts || []).filter(
      (a: any) => a.status === AttemptStatus.SUBMITTED || a.status === AttemptStatus.AUTO_SUBMITTED
    );
    const activeAttempt = (assessment.testAttempts || []).find(
      (a: any) => a.status === AttemptStatus.IN_PROGRESS
    );

    const attemptsUsed = completedAttempts.length + (activeAttempt ? 1 : 0);
    const attemptsRemaining =
      assessment.maxAttempts > 0 ? Math.max(0, assessment.maxAttempts - attemptsUsed) : 999;

    return NextResponse.json({
      success: true,
      data: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        instructions: assessment.instructions,
        courseTitle: assessment.course?.title || 'Cybersecurity Course',
        courseId: assessment.course?.id || assessment.courseId,
        categoryName: assessment.category?.name || 'General Cybersecurity',
        durationMinutes: assessment.durationMinutes,
        questionsPerAttempt: assessment.questionsPerAttempt,
        totalMarks: assessment.totalMarks,
        passingScore: assessment.passingScore,
        maxAttempts: assessment.maxAttempts,
        attemptsUsed,
        attemptsRemaining: assessment.maxAttempts > 0 ? attemptsRemaining : 'Unlimited',
        activeAttemptId: activeAttempt ? activeAttempt.id : null,
        antiCheating: {
          fullScreen: assessment.fullScreen,
          tabSwitchDetection: assessment.tabSwitchDetection,
          copyPasteRestriction: assessment.copyPasteRestriction,
          rightClickRestriction: assessment.rightClickRestriction,
        },
        previousAttempts: completedAttempts.map((att: any) => ({
          id: att.id,
          attemptNumber: att.attemptNumber,
          score: att.score,
          percentage: att.percentage,
          passed: att.passed,
          submittedAt: att.submittedAt,
          timeTakenSeconds: att.timeTakenSeconds,
        })),
      },
    });
  } catch (error: any) {
    console.error('[API /api/assessments/[testId] GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching assessment' },
      { status: 500 }
    );
  }
}
