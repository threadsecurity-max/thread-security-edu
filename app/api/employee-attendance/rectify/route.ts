import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { canRectifyEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { rectifyAttendanceRecordService } from '@/server/services/employee-attendance.service';

/**
 * PATCH /api/employee-attendance/rectify
 * Super Admin Exclusive Rectification Endpoint
 * STRICT AUTHORIZATION: Authenticated email MUST be threadsecurity@gmail.com / SUPER_ADMIN
 */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    if (!canRectifyEmployeeAttendance(session)) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Exclusive rectification authority belongs strictly to Super Admin (threadsecurity@gmail.com).',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { attendanceId, newStatus, remarks } = body;

    if (!attendanceId || !newStatus || !remarks?.trim()) {
      return NextResponse.json(
        { error: 'Missing required parameters: attendanceId, newStatus, and mandatory remarks' },
        { status: 400 }
      );
    }

    const result = await rectifyAttendanceRecordService({
      attendanceId,
      newStatus,
      remarks,
      superAdminId: session.userId,
      superAdminEmail: session.email || '',
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Rectification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

