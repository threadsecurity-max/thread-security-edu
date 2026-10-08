import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const batches = await getMentorAuthorizedBatches(session.userId);
    const courseIds = Array.from(
      new Set(batches.map((b: any) => b.courseId).filter(Boolean))
    ) as string[];

    const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN';

    const assessments = await prisma.assessment.findMany({
      where: isSuperAdmin ? {} : { courseId: { in: courseIds } },
      include: {
        course: {
          select: { id: true, title: true, slug: true, category: true },
        },
        _count: {
          select: {
            questions: true,
            testAttempts: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      courseId,
      description,
      instructions,
      durationMinutes,
      totalMarks,
      passingScore,
      questionsPerAttempt,
      maxAttempts,
      status,
      randomQuestionOrder,
      tabSwitchDetection,
      copyPasteRestriction,
    } = body;

    if (!title || !courseId) {
      return NextResponse.json({ error: 'Title and course are required.' }, { status: 400 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title: title.trim(),
        courseId,
        description: description?.trim() || 'Comprehensive security proficiency test.',
        instructions: instructions?.trim() || 'Complete all randomized questions within the allocated timeframe.',
        durationMinutes: parseInt(durationMinutes || '45', 10),
        totalMarks: parseFloat(totalMarks || '100'),
        passingScore: parseFloat(passingScore || '70'),
        questionsPerAttempt: parseInt(questionsPerAttempt || '20', 10),
        maxAttempts: parseInt(maxAttempts || '3', 10),
        status: status || 'PUBLISHED',
        randomQuestionOrder: randomQuestionOrder !== false,
        tabSwitchDetection: tabSwitchDetection !== false,
        copyPasteRestriction: copyPasteRestriction !== false,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
