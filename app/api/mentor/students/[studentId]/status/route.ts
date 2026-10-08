import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { toggleStudentStatus } from '@/server/services/mentor-command-center.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== 'MENTOR' &&
        session.role !== 'SUPER_ADMIN' &&
        session.role !== 'ACADEMIC_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized. Mentor access required.' }, { status: 401 });
    }

    const { studentId } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive boolean flag is required.' }, { status: 400 });
    }

    const result = await toggleStudentStatus(session.userId, studentId, isActive);

    return NextResponse.json({ success: true, student: result });
  } catch (error: any) {
    console.error('[API /api/mentor/students/[studentId]/status Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update student status' }, { status: 400 });
  }
}
