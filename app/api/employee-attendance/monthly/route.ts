import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getMonthlyAttendanceReportService } from '@/server/services/employee-attendance.service';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessEmployeeAttendance(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(searchParams.get('year') || String(now.getUTCFullYear()), 10);
    const month = parseInt(searchParams.get('month') || String(now.getUTCMonth() + 1), 10);

    const report = await getMonthlyAttendanceReportService(year, month);
    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

