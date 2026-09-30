import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAdminAssessmentAnalytics } from '@/server/services/assessment/analytics.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId') || undefined;
    const testId = searchParams.get('testId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const data = await getAdminAssessmentAnalytics({
      courseId,
      testId,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/analytics GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching admin analytics' },
      { status: 500 }
    );
  }
}
