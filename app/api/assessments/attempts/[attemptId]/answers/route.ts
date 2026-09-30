import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { saveStudentAnswer } from '@/server/services/assessment/attempt.service';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { attemptId } = await context.params;
    const body = await req.json();

    const { attemptQuestionId, selectedOptionId } = body;
    if (!attemptQuestionId || !selectedOptionId) {
      return NextResponse.json(
        { success: false, error: 'attemptQuestionId and selectedOptionId are required' },
        { status: 400 }
      );
    }

    const result = await saveStudentAnswer(
      attemptId,
      session.userId,
      attemptQuestionId,
      selectedOptionId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/assessments/attempts/[attemptId]/answers POST Error]:', error);
    const isExpired = error.message?.includes('EXPIRED');
    const isForbidden = error.message?.includes('FORBIDDEN');
    const status = isForbidden ? 403 : isExpired ? 410 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed saving answer', expired: isExpired },
      { status }
    );
  }
}
