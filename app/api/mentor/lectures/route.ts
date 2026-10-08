import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { scheduleLectureByMentor, getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const batches = await getMentorAuthorizedBatches(session.userId);
    const batchIds = batches.map((b: any) => b.id);

    const sessions = await (prisma as any).batchSession.findMany({
      where: { batchId: { in: batchIds } },
      include: {
        batch: { include: { course: true } },
        attendanceRecords: true,
      },
      orderBy: { sessionDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { batchId, title, sessionDate, startTime, endTime, agenda, meetingLink, topicsCovered, homework } = body;

    if (!batchId || !title || !sessionDate) {
      return NextResponse.json({ error: 'Batch, title, and session date are required.' }, { status: 400 });
    }

    const lecture = await scheduleLectureByMentor(session.userId, {
      batchId,
      title,
      sessionDate: new Date(sessionDate),
      startTime: startTime || '10:00',
      endTime: endTime || '11:30',
      agenda,
      meetingLink,
      topicsCovered,
      homework,
    });

    return NextResponse.json({ success: true, lecture });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
