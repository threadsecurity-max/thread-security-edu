import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  createAssignmentByMentor,
  getMentorAuthorizedBatches,
} from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const batches = await getMentorAuthorizedBatches(session.userId);
    const batchIds = batches.map((b: any) => b.id);

    const assignments = await (prisma as any).assignment.findMany({
      where: { batchId: { in: batchIds } },
      include: {
        batch: true,
        submissions: {
          include: { student: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, assignments });
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
    const { batchId, title, description, deadline, totalMarks, fileUrl, fileName } = body;

    if (!batchId || !title || !deadline) {
      return NextResponse.json({ error: 'Batch, title, and deadline are required.' }, { status: 400 });
    }

    const assignment = await createAssignmentByMentor(session.userId, {
      batchId,
      title,
      description: description || '',
      deadline: new Date(deadline),
      totalMarks: totalMarks ? parseInt(totalMarks, 10) : 100,
      fileUrl,
      fileName,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
