import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isSuperAdminAttendanceUser } from '@/lib/auth/employee-attendance-auth';
import { getAttendanceAuditHistoryService } from '@/server/services/employee-attendance.service';

/**
 * GET /api/employee-attendance/audit
 * Immutable Audit History Viewer (Super Admin Only)
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdminAttendanceUser(session)) {
      return NextResponse.json(
        { error: 'Forbidden: Audit logs are accessible strictly to Super Admin (threadsecurity@gmail.com).' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') || undefined;
    const take = searchParams.get('take') ? parseInt(searchParams.get('take')!, 10) : 100;

    const logs = await getAttendanceAuditHistoryService({ employeeId, take });
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

