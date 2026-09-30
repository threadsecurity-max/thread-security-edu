import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { validateBlueprint } from '@/server/services/assessment/blueprint.service';
import { AssessmentStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const test: any = await prisma.assessment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!test) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    }

    const catDistribution = test.categoryDistributionJson
      ? JSON.parse(test.categoryDistributionJson)
      : [];

    // Strictly validate question pool and blueprint before publishing
    const validation = await validateBlueprint({
      testId: test.id,
      courseId: test.courseId,
      questionsPerAttempt: test.questionsPerAttempt,
      easyPercent: test.easyPercent,
      mediumPercent: test.mediumPercent,
      hardPercent: test.hardPercent,
      categoryBalancing: test.categoryBalancing,
      difficultyBalancing: test.difficultyBalancing,
      preventDuplicateFamilies: test.preventDuplicateFamilies,
      categoryDistribution: catDistribution,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot publish assessment due to blueprint or question pool shortfalls.',
          validation,
        },
        { status: 400 }
      );
    }

    const published = await (prisma.assessment as any).update({
      where: { id },
      data: { status: AssessmentStatus.PUBLISHED },
    });

    return NextResponse.json({
      success: true,
      data: published,
      validation,
      message: 'Assessment successfully validated and published for student enrollments.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/[id]/publish POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed publishing assessment' },
      { status: 500 }
    );
  }
}
