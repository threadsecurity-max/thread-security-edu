import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listBankQuestions, createBankQuestion } from '@/server/services/assessment/question-bank.service';
import { DifficultyLevel, QuestionBankStatus } from '@/types/assessment';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const difficulty = (searchParams.get('difficulty') as DifficultyLevel) || undefined;
    const courseId = searchParams.get('courseId') || undefined;
    const familyId = searchParams.get('familyId') || undefined;
    const status = (searchParams.get('status') as QuestionBankStatus) || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const result = await listBankQuestions({
      search,
      categoryId,
      difficulty,
      courseId,
      familyId,
      status,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed listing questions' },
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

    const created = await createBankQuestion({
      questionFamilyId: body.questionFamilyId || null,
      courseId: body.courseId || null,
      categoryId: body.categoryId,
      topic: body.topic,
      learningObjective: body.learningObjective || null,
      difficulty: body.difficulty,
      questionType: body.questionType || 'MCQ',
      marks: Number(body.marks) || 1.0,
      questionText: body.questionText,
      explanation: body.explanation || null,
      status: body.status || QuestionBankStatus.ACTIVE,
      options: body.options || [],
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed creating question' },
      { status: 400 }
    );
  }
}
