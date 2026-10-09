import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { logAuditEvent } from '@/server/security/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { broadcastId, message } = body;

    if (!broadcastId) {
      return NextResponse.json({ error: 'Broadcast ID is required.' }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        studentProfile: true,
        tsIdentity: true,
      },
    });

    if (!student || !student.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const broadcast = await prisma.broadcast.findUnique({
      where: { id: broadcastId },
      include: {
        batch: {
          include: { mentor: { include: { user: true } } },
        },
      },
    });

    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found.' }, { status: 404 });
    }

    // Update BroadcastRecipient if exists
    await prisma.broadcastRecipient.upsert({
      where: {
        broadcastId_studentId: {
          broadcastId,
          studentId: student.studentProfile.id,
        },
      },
      update: {
        isRead: true,
      },
      create: {
        broadcastId,
        studentId: student.studentProfile.id,
        isRead: true,
        deliveredAt: new Date(),
      },
    });

    // Notify mentor about student's acknowledgement
    const mentorUserId = broadcast.batch?.mentor?.userId;
    const ackNote = message?.trim() ? ` Message: "${message.trim()}"` : '';
    const studentIdentifier = student.name || student.tsIdentity?.tsId || 'Cadet';

    if (mentorUserId) {
      await prisma.notification.create({
        data: {
          userId: mentorUserId,
          title: `Announcement Acknowledged: ${broadcast.title}`,
          message: `${studentIdentifier} (${student.tsIdentity?.tsId || student.email}) confirmed receipt.${ackNote}`,
          type: 'BROADCAST_ACK',
          linkUrl: '/mentor/announcements',
        },
      }).catch((e) => console.error('[Notification Error]:', e));
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'STUDENT_ANNOUNCEMENT_ACKNOWLEDGED',
      entity: 'BROADCAST',
      entityId: broadcastId,
      details: {
        broadcastTitle: broadcast.title,
        message: message?.trim() || null,
        batchCode: broadcast.batch?.batchCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement acknowledged successfully.',
    });
  } catch (error: any) {
    console.error('[Announcement Acknowledge API Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
