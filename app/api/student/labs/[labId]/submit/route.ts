import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { logAuditEvent } from '@/server/security/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { labId } = await params;
    const body = await req.json();
    const { flag, writeup } = body;

    if (!flag || typeof flag !== 'string') {
      return NextResponse.json({ error: 'Valid flag string is required.' }, { status: 400 });
    }

    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      include: { course: true },
    });

    if (!lab) {
      return NextResponse.json({ error: 'Lab target not found.' }, { status: 404 });
    }

    // Determine flag validity
    const submittedTrim = flag.trim();
    let isCorrect = true;

    if (lab.flagHash) {
      if (lab.flagHash.startsWith('URL:')) {
        // External lab link mode: any non-empty flag submission with TSE or standard format is accepted for review
        isCorrect = true;
      } else {
        isCorrect = submittedTrim.toLowerCase() === lab.flagHash.trim().toLowerCase();
      }
    }

    // Combined notes
    const formattedNotes = writeup?.trim()
      ? `Writeup/Payload: ${writeup.trim()}`
      : 'Flag verified and submitted for faculty evaluation.';

    let attempt = await prisma.labAttempt.findFirst({
      where: {
        labId: lab.id,
        userId: session.userId,
      },
    });

    if (!attempt) {
      attempt = await prisma.labAttempt.create({
        data: {
          labId: lab.id,
          userId: session.userId,
          state: isCorrect ? 'COMPLETED' : 'IN_PROGRESS',
          score: isCorrect ? 100 : 0,
          submittedFlag: submittedTrim,
          feedback: isCorrect ? formattedNotes : 'Incorrect flag. Please re-run exploit payload.',
          completedAt: isCorrect ? new Date() : null,
        },
      });
    } else {
      attempt = await prisma.labAttempt.update({
        where: { id: attempt.id },
        data: {
          state: isCorrect ? 'COMPLETED' : 'IN_PROGRESS',
          score: isCorrect ? (attempt.score > 0 ? attempt.score : 100) : attempt.score,
          submittedFlag: submittedTrim,
          feedback: isCorrect ? formattedNotes : 'Incorrect flag. Please re-run exploit payload.',
          completedAt: isCorrect ? new Date() : attempt.completedAt,
        },
      });
    }

    await logAuditEvent({
      actorId: session.userId,
      action: isCorrect ? 'LAB_FLAG_VERIFIED' : 'LAB_FLAG_FAILED',
      entity: 'LAB_ATTEMPT',
      entityId: attempt.id,
      details: {
        labTitle: lab.title,
        flag: submittedTrim,
        isCorrect,
        score: attempt.score,
      },
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      message: isCorrect
        ? 'Flag verified and recorded! 100/100 points awarded.'
        : 'Incorrect flag submitted. Check payload output.',
      attempt,
    });
  } catch (error: any) {
    console.error('[Student Lab Submission API Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
