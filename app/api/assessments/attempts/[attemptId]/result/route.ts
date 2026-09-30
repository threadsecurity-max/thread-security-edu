import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAttemptResult, getDetailedAttemptReview } from '@/server/services/assessment/scoring.service';

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
    const url = new URL(req.url);
    const detailed = url.searchParams.get('detailed') === 'true';

    const isAdmin = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role);

    if (detailed) {
      const review = await getDetailedAttemptReview(attemptId, session.userId, isAdmin);
      return NextResponse.json({ success: true, data: review });
    }

    const scorecard = await getAttemptResult(attemptId, session.userId, isAdmin);
    return NextResponse.json({ success: true, data: scorecard });
  } catch (error: any) {
    console.error('[API /api/assessments/attempts/[attemptId]/result GET Error]:', error);
    const isForbidden = error.message?.includes('FORBIDDEN');
    const status = isForbidden ? 403 : 400;

    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching result' },
      { status }
    );
  }
}
