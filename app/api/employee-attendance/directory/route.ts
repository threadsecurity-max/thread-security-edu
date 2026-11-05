import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getEmployeeDirectoryService } from '@/server/services/employee-attendance.service';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessEmployeeAttendance(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || undefined;
    const search = searchParams.get('search') || undefined;

    const directory = await getEmployeeDirectoryService({ department, search });
    return NextResponse.json({ success: true, count: directory.length, directory });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

