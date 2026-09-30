import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { submitAttempt } from '@/server/services/assessment/scoring.service';

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
    let isAutoSubmit = false;
    try {
      const body = await req.json();
      isAutoSubmit = !!body?.isAutoSubmit;
    } catch {
      // Body may be empty on direct submit
    }

    const scorecard = await submitAttempt(attemptId, session.userId, isAutoSubmit);

    return NextResponse.json({
      success: true,
      data: scorecard,
    });
  } catch (error: any) {
    console.error('[API /api/assessments/attempts/[attemptId]/submit POST Error]:', error);
    const isForbidden = error.message?.includes('FORBIDDEN');
    const status = isForbidden ? 403 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed submitting assessment' },
      { status }
    );
  }
}
