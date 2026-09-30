import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { recordAttemptEvent } from '@/server/services/assessment/attempt.service';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { attemptId } = await context.params;
    const body = await req.json();

    const { eventType, metadata } = body;
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType is required' },
        { status: 400 }
      );
    }

    const result = await recordAttemptEvent(
      attemptId,
      session.userId,
      eventType,
      metadata
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { eventId: result.eventId, eventType: result.eventType },
    });
  } catch (error: any) {
    console.error('[API /api/assessments/attempts/[attemptId]/events POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed recording audit event' },
      { status: 400 }
    );
  }
}
