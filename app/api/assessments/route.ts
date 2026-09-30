import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getStudentAssessmentsList } from '@/server/services/assessment/analytics.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await getStudentAssessmentsList(session.userId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API /api/assessments GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching assessments' },
      { status: 500 }
    );
  }
}
