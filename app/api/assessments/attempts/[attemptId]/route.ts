import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getActiveAttemptState } from '@/server/services/assessment/attempt.service';

export async function GET(
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

    const attemptState = await getActiveAttemptState(attemptId, session.userId);

    return NextResponse.json({
      success: true,
      data: attemptState,
    });
  } catch (error: any) {
    console.error('[API /api/assessments/attempts/[attemptId] GET Error]:', error);
    const status = error.message?.includes('FORBIDDEN') ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching attempt state' },
      { status }
    );
  }
}
