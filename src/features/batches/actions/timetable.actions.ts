'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  checkScheduleConflictService,
  rescheduleBatchSessionService,
  createBatchSessionService,
} from '@/server/services/batch.service';

export async function checkSessionConflictAction({
  targetSessionId,
  batchId,
  sessionDate,
  durationMins,
}: {
  targetSessionId?: string;
  batchId: string;
  sessionDate: string | Date;
  durationMins?: number;
}) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== 'ADMIN' &&
        session.role !== 'SUPER_ADMIN' &&
        session.role !== 'ACADEMIC_ADMIN')
    ) {
      return { success: false, error: 'Unauthorized', hasConflict: false, conflicts: [] };
    }

    const res = await checkScheduleConflictService({
      targetSessionId,
      batchId,
      sessionDate: new Date(sessionDate),
      durationMins,
    });

    return { success: true, ...res };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to validate timetable conflict';
    return { success: false, error: msg, hasConflict: false, conflicts: [] };
  }
}

export async function rescheduleSessionAction({
  sessionId,
  newSessionDate,
  newDurationMins,
  reason,
  forceOverride,
}: {
  sessionId: string;
  newSessionDate: string | Date;
  newDurationMins?: number;
  reason?: string;
  forceOverride?: boolean;
}) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== 'ADMIN' &&
        session.role !== 'SUPER_ADMIN' &&
        session.role !== 'ACADEMIC_ADMIN')
    ) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await rescheduleBatchSessionService({
      sessionId,
      newSessionDate: new Date(newSessionDate),
      newDurationMins,
      reason,
      actorUserId: session.userId,
      forceOverride,
    });

    revalidatePath('/admin/batches');
    revalidatePath('/admin/timetable');
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reschedule lecture';
    return { success: false, error: msg };
  }
}

export async function scheduleNewLectureAction({
  batchId,
  title,
  sessionDate,
  durationMins,
  agenda,
}: {
  batchId: string;
  title: string;
  sessionDate: string | Date;
  durationMins?: number;
  agenda?: string;
}) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== 'ADMIN' &&
        session.role !== 'SUPER_ADMIN' &&
        session.role !== 'ACADEMIC_ADMIN')
    ) {
      return { success: false, error: 'Unauthorized' };
    }

    const created = await createBatchSessionService(
      batchId,
      title,
      new Date(sessionDate),
      durationMins || 120,
      agenda,
      session.userId
    );

    revalidatePath('/admin/batches');
    revalidatePath('/admin/timetable');
    return { success: true, session: created };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to schedule new session';
    return { success: false, error: msg };
  }
}
