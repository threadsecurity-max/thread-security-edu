import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { sendBatchAnnouncement, getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const batches = await getMentorAuthorizedBatches(session.userId);
    const batchIds = batches.map((b: any) => b.id);

    const broadcasts = await (prisma as any).broadcast.findMany({
      where: { batchId: { in: batchIds } },
      include: {
        batch: true,
        recipients: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, broadcasts });
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
    const { batchId, title, message, attachmentUrl } = body;

    if (!batchId || !title || !message) {
      return NextResponse.json({ error: 'Batch, title, and message are required.' }, { status: 400 });
    }

    const broadcast = await sendBatchAnnouncement(session.userId, {
      batchId,
      title,
      message,
      attachmentUrl,
    });

    return NextResponse.json({ success: true, broadcast });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
