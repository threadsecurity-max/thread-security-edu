import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { AssessmentStatus } from '@/types/assessment';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const tests: any = await (prisma as any).assessment.findMany({
      include: {
        course: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { testAttempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: (tests || []).map((t: any) => ({
        ...t,
        attemptsCount: t._count?.testAttempts || 0,
      })),
    });
  } catch (error: any) {
    console.error('[API /api/admin/assessments GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching assessments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.title || !body.courseId) {
      return NextResponse.json(
        { success: false, error: 'Title and Course are required' },
        { status: 400 }
      );
    }

    const totalQuestions = Number(body.questionsPerAttempt) || 10;
    const duration = Number(body.durationMinutes) || 30;
    const marks = Number(body.totalMarks) || 20;
    const passing = Number(body.passingScore) || 70;

    const easyPct = Number(body.easyPercent) || 40;
    const medPct = Number(body.mediumPercent) || 40;
    const hardPct = Number(body.hardPercent) || 20;

    if (easyPct + medPct + hardPct !== 100) {
      return NextResponse.json(
        { success: false, error: 'Difficulty distribution must equal 100%' },
        { status: 400 }
      );
    }

    const test = await (prisma.assessment as any).create({
      data: {
        title: body.title.trim(),
        slug: body.slug?.trim() || null,
        description: body.description?.trim() || '',
        instructions: body.instructions?.trim() || null,
        courseId: body.courseId,
        categoryId: body.categoryId || null,
        durationMinutes: duration,
        questionsPerAttempt: totalQuestions,
        totalMarks: marks,
        passingScore: passing,
        maxAttempts: Number(body.maxAttempts) >= 0 ? Number(body.maxAttempts) : 3,
        status: AssessmentStatus.DRAFT,

        // Anti-cheating & Randomization flags
        randomQuestionSelection: body.randomQuestionSelection ?? true,
        randomQuestionOrder: body.randomQuestionOrder ?? true,
        randomOptionOrder: body.randomOptionOrder ?? true,
        difficultyBalancing: body.difficultyBalancing ?? true,
        categoryBalancing: body.categoryBalancing ?? true,
        questionVariants: body.questionVariants ?? true,
        preventDuplicateFamilies: body.preventDuplicateFamilies ?? true,
        autoSave: body.autoSave ?? true,
        autoSubmit: body.autoSubmit ?? true,
        fullScreen: body.fullScreen ?? false,
        tabSwitchDetection: body.tabSwitchDetection ?? true,
        copyPasteRestriction: body.copyPasteRestriction ?? true,
        rightClickRestriction: body.rightClickRestriction ?? true,

        // Blueprint
        easyPercent: easyPct,
        mediumPercent: medPct,
        hardPercent: hardPct,
        categoryDistributionJson: body.categoryDistribution
          ? JSON.stringify(body.categoryDistribution)
          : null,
      },
      include: {
        course: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/assessments POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed creating assessment' },
      { status: 500 }
    );
  }
}
