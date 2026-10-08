import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getMentorAuthorizedStudents,
  createStudentByMentor,
} from '@/server/services/mentor-command-center.service';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;
    const batchId = searchParams.get('batchId') || undefined;
    const courseId = searchParams.get('courseId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getMentorAuthorizedStudents(session.userId, {
      search,
      batchId,
      courseId,
      status,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API /api/mentor/students GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { firstName, lastName, email, phone, batchId, courseId } = body;

    if (!firstName || !lastName || !email || !batchId) {
      return NextResponse.json(
        { error: 'First name, last name, email, and batch are required.' },
        { status: 400 }
      );
    }

    const result = await createStudentByMentor(session.userId, {
      firstName,
      lastName,
      email,
      phone,
      batchId,
      courseId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API /api/mentor/students POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 400 });
  }
}
