'use server';

import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import {
  updateLectureRecordService,
  markBatchAttendanceWithLockCheckService,
  requestAttendanceCorrectionService,
  adminReviewCorrectionRequestService,
  createBatchResourceService,
  sendBatchBroadcastService,
} from '@/server/services/batch.service';

/**
 * Mentor records or updates a delivered lecture
 */
export async function recordLectureAction(
  sessionId: string,
  batchId: string,
  data: {
    status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    topicsCovered?: string;
    importantNotes?: string;
    homework?: string;
    resourcesJson?: string;
    moduleId?: string;
    agenda?: string;
    durationMins?: number;
  }
) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await updateLectureRecordService(sessionId, data, session.userId);

    revalidatePath(`/mentor/batches/${batchId}`);
    revalidatePath(`/mentor/batches/${batchId}/lectures`);
    revalidatePath('/mentor');
    revalidatePath('/student/attendance');
    return { success: true, lecture: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update lecture record.' };
  }
}

/**
 * Mentor marks attendance with 24h locking check
 */
export async function markBatchAttendanceWithLockCheckAction(
  sessionId: string,
  batchId: string,
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[],
  forceAdminBypass: boolean = false
) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await markBatchAttendanceWithLockCheckService(
      {
        sessionId,
        records,
        markedBy: session.name,
        forceAdminBypass,
      },
      session.userId
    );

    revalidatePath(`/mentor/batches/${batchId}`);
    revalidatePath(`/mentor/batches/${batchId}/attendance`);
    revalidatePath(`/mentor/batches/${batchId}/students`);
    revalidatePath('/mentor');
    revalidatePath('/student/attendance');
    revalidatePath('/admin/batches');
    return { success: true, count: updated.length };
  } catch (err: any) {
    const isLocked = err.message?.includes('ATTENDANCE_LOCKED');
    return {
      success: false,
      error: err.message || 'Failed to record attendance.',
      isLocked,
    };
  }
}

/**
 * Mentor submits an Attendance Correction Request
 */
export async function requestAttendanceCorrectionAction(
  batchId: string,
  sessionId: string,
  studentId: string,
  requestedStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
  reason: string
) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (!reason.trim()) {
    return { success: false, error: 'A justification reason is required for attendance correction.' };
  }

  try {
    const req = await requestAttendanceCorrectionService(
      {
        batchId,
        sessionId,
        studentId,
        requestedStatus,
        reason,
      },
      session.userId
    );

    revalidatePath(`/mentor/batches/${batchId}/attendance`);
    revalidatePath('/admin/batches');
    return { success: true, request: req };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit correction request.' };
  }
}

/**
 * Admin reviews (Approves or Rejects) an Attendance Correction Request
 */
export async function adminReviewCorrectionRequestAction(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  adminNotes: string,
  batchId?: string
) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Only Admins can review correction requests.' };
  }

  try {
    const req = await adminReviewCorrectionRequestService(
      requestId,
      decision,
      adminNotes,
      session.userId
    );

    if (batchId) {
      revalidatePath(`/mentor/batches/${batchId}/attendance`);
    }
    revalidatePath('/admin/batches');
    revalidatePath('/mentor');
    revalidatePath('/student/attendance');
    return { success: true, request: req };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to review correction request.' };
  }
}

/**
 * Mentor shares a resource with the batch
 */
export async function createBatchResourceAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const batchId = formData.get('batchId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const resourceType = formData.get('resourceType') as string;
  const url = formData.get('url') as string;
  const driveFileId = formData.get('driveFileId') as string;
  const moduleId = formData.get('moduleId') as string;
  const sessionId = formData.get('sessionId') as string;

  if (!batchId || !title || !url) {
    return { success: false, error: 'Batch ID, title, and URL are required.' };
  }

  try {
    const resource = await createBatchResourceService(
      {
        batchId,
        title,
        description: description || undefined,
        resourceType: resourceType || 'PDF',
        url,
        driveFileId: driveFileId || undefined,
        moduleId: moduleId || undefined,
        sessionId: sessionId || undefined,
      },
      session.userId
    );

    revalidatePath(`/mentor/batches/${batchId}/resources`);
    revalidatePath(`/mentor/batches/${batchId}`);
    return { success: true, resource };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to share resource.' };
  }
}

/**
 * Mentor publishes a one-way broadcast announcement
 */
export async function sendBatchBroadcastAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const batchId = formData.get('batchId') as string;
  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const attachmentUrl = formData.get('attachmentUrl') as string;

  if (!batchId || !title || !message) {
    return { success: false, error: 'Batch ID, announcement title, and message are required.' };
  }

  try {
    const broadcast = await sendBatchBroadcastService(
      {
        batchId,
        title,
        message,
        attachmentUrl: attachmentUrl || undefined,
      },
      session.userId
    );

    revalidatePath(`/mentor/batches/${batchId}/broadcast`);
    revalidatePath(`/mentor/batches/${batchId}`);
    revalidatePath('/student/attendance');
    return { success: true, broadcast };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send broadcast.' };
  }
}
