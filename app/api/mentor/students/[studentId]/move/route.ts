import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { moveStudentBatch } from '@/server/services/mentor-command-center.service';

export async function POST(
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
    const { targetBatchId } = body;

    if (!targetBatchId) {
      return NextResponse.json({ error: 'Target batch ID is required.' }, { status: 400 });
    }

    const result = await moveStudentBatch(session.userId, {
      studentId,
      targetBatchId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/mentor/students/[studentId]/move Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to move student' }, { status: 400 });
  }
}
