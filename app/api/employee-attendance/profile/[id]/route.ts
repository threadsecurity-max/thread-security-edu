import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getEmployeeAttendanceProfileService } from '@/server/services/employee-attendance.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || (!canAccessEmployeeAttendance(session) && session.userId !== id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;

    const profile = await getEmployeeAttendanceProfileService(id, year, month);
    return NextResponse.json({ success: true, profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

