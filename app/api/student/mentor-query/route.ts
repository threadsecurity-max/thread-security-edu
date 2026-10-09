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
    const { mentorEmail, subject, message } = body;

    if (!mentorEmail || !message?.trim()) {
      return NextResponse.json(
        { error: 'Mentor email and query message are required.' },
        { status: 400 }
      );
    }

    const mentorUser = await prisma.user.findUnique({
      where: { email: mentorEmail },
      select: { id: true, name: true, email: true },
    });

    if (!mentorUser) {
      return NextResponse.json({ error: 'Faculty mentor not found.' }, { status: 404 });
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { tsIdentity: true },
    });

    const studentTsId = studentUser?.tsIdentity?.tsId || session.tsId || 'TSE-STUDENT';
    const cleanSubject = subject?.trim() || 'Academic Inquiry / Lab Doubt';

    // 1. Create in-app notification for the faculty mentor
    await prisma.notification.create({
      data: {
        userId: mentorUser.id,
        title: `Academic Query: ${cleanSubject}`,
        message: `Cadet ${studentUser?.name || 'Student'} (${studentTsId}, ${studentUser?.email}) submitted: "${message.trim()}"`,
        type: 'ACADEMIC_QUERY',
        linkUrl: '/mentor/students',
      },
    });

    // 2. Log audit event
    await logAuditEvent({
      actorId: session.userId,
      action: 'STUDENT_MENTOR_QUERY_SENT',
      entity: 'NOTIFICATION',
      entityId: mentorUser.id,
      details: {
        mentor: mentorUser.email,
        subject: cleanSubject,
        preview: message.trim().slice(0, 100),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your query has been dispatched directly to your faculty mentor.',
    });
  } catch (error: any) {
    console.error('[Mentor Query API Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
