import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDetailedAttemptReview } from '@/server/services/assessment/scoring.service';

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
    const review = await getDetailedAttemptReview(id, session.userId, true);

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/attempts/[id] GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching attempt details' },
      { status: 500 }
    );
  }
}
