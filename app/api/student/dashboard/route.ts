import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getStudentDashboardData } from '@/server/services/student-dashboard.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getStudentDashboardData(session.userId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching student dashboard data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
