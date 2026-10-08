import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { gradeStudentSubmission } from '@/server/services/mentor-command-center.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, score, remarks } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: 'Submission ID and score are required.' }, { status: 400 });
    }

    const graded = await gradeStudentSubmission(
      session.userId,
      submissionId,
      parseFloat(score),
      remarks
    );

    return NextResponse.json({ success: true, submission: graded });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
