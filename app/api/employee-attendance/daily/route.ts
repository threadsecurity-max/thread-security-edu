import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  canAccessEmployeeAttendance,
  canCaptureEmployeeAttendance,
} from '@/lib/auth/employee-attendance-auth';
import {
  getDailyAttendanceService,
  captureDailyAttendanceService,
} from '@/server/services/employee-attendance.service';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessEmployeeAttendance(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString();
    const department = searchParams.get('department') || undefined;

    const data = await getDailyAttendanceService(dateStr, department);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canCaptureEmployeeAttendance(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, records, isFinalized } = body;

    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing required date or records' }, { status: 400 });
    }

    const result = await captureDailyAttendanceService({
      date,
      records,
      markedById: session.userId,
      markedByEmail: session.email || '',
      isFinalized: isFinalized ?? true,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save attendance';
    const status = msg.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

