import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const test: any = await (prisma as any).assessment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { testAttempts: true } },
      },
    });

    if (!test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...test,
        categoryDistribution: test.categoryDistributionJson
          ? JSON.parse(test.categoryDistributionJson)
          : [],
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/[id] GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching test' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) updateData.slug = body.slug?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.instructions !== undefined) updateData.instructions = body.instructions?.trim() || null;
    if (body.courseId !== undefined) updateData.courseId = body.courseId;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.durationMinutes !== undefined) updateData.durationMinutes = Number(body.durationMinutes);
    if (body.questionsPerAttempt !== undefined) updateData.questionsPerAttempt = Number(body.questionsPerAttempt);
    if (body.totalMarks !== undefined) updateData.totalMarks = Number(body.totalMarks);
    if (body.passingScore !== undefined) updateData.passingScore = Number(body.passingScore);
    if (body.maxAttempts !== undefined) updateData.maxAttempts = Number(body.maxAttempts);
    if (body.status !== undefined) updateData.status = body.status;

    // Flags
    if (body.randomQuestionSelection !== undefined) updateData.randomQuestionSelection = body.randomQuestionSelection;
    if (body.randomQuestionOrder !== undefined) updateData.randomQuestionOrder = body.randomQuestionOrder;
    if (body.randomOptionOrder !== undefined) updateData.randomOptionOrder = body.randomOptionOrder;
    if (body.difficultyBalancing !== undefined) updateData.difficultyBalancing = body.difficultyBalancing;
    if (body.categoryBalancing !== undefined) updateData.categoryBalancing = body.categoryBalancing;
    if (body.questionVariants !== undefined) updateData.questionVariants = body.questionVariants;
    if (body.preventDuplicateFamilies !== undefined) updateData.preventDuplicateFamilies = body.preventDuplicateFamilies;
    if (body.autoSave !== undefined) updateData.autoSave = body.autoSave;
    if (body.autoSubmit !== undefined) updateData.autoSubmit = body.autoSubmit;
    if (body.fullScreen !== undefined) updateData.fullScreen = body.fullScreen;
    if (body.tabSwitchDetection !== undefined) updateData.tabSwitchDetection = body.tabSwitchDetection;
    if (body.copyPasteRestriction !== undefined) updateData.copyPasteRestriction = body.copyPasteRestriction;
    if (body.rightClickRestriction !== undefined) updateData.rightClickRestriction = body.rightClickRestriction;

    // Difficulty percentages
    if (body.easyPercent !== undefined) updateData.easyPercent = Number(body.easyPercent);
    if (body.mediumPercent !== undefined) updateData.mediumPercent = Number(body.mediumPercent);
    if (body.hardPercent !== undefined) updateData.hardPercent = Number(body.hardPercent);

    if (body.categoryDistribution !== undefined) {
      updateData.categoryDistributionJson = JSON.stringify(body.categoryDistribution);
    }

    const updated = await (prisma.assessment as any).update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/[id] PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed updating test' },
      { status: 400 }
    );
  }
}
