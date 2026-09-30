import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generateOrResumeAttempt } from '@/server/services/assessment/generator.service';

export async function POST(
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

    const attemptState = await generateOrResumeAttempt(testId, session.userId);

    return NextResponse.json({
      success: true,
      data: attemptState,
    });
  } catch (error: any) {
    console.error('[API /api/assessments/[testId]/start Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed starting assessment' },
      { status: 400 }
    );
  }
}
