'use server';

import { getSession } from '@/lib/auth/session';
import {
  createBatchService,
  assignStudentToBatchService,
  createBatchSessionService,
  markBatchAttendanceService,
} from '@/server/services/batch.service';
import { revalidatePath } from 'next/cache';

/**
 * Super Admin Creates a New Batch
 */
export async function createBatchAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Only Super Administrators can conduct batches.' };
  }

  const batchCode = formData.get('batchCode') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const courseId = formData.get('courseId') as string;
  const mentorId = formData.get('mentorId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const schedule = formData.get('schedule') as string;
  const maxCapacityStr = formData.get('maxCapacity') as string;

  if (!batchCode || !title || !startDateStr) {
    return { success: false, error: 'Batch Code, Title, and Start Date are required.' };
  }

  try {
    const batch = await createBatchService(
      {
        batchCode,
        title,
        description: description || undefined,
        courseId: courseId || undefined,
        mentorId: mentorId || undefined,
        startDate: new Date(startDateStr),
        endDate: endDateStr ? new Date(endDateStr) : undefined,
        schedule: schedule || 'Mon / Wed / Fri • 7:00 PM - 9:00 PM IST',
        maxCapacity: maxCapacityStr ? parseInt(maxCapacityStr, 10) : 30,
      },
      session.userId
    );

    revalidatePath('/admin/batches');
    revalidatePath('/admin/students');
    revalidatePath('/mentor');
    return { success: true, batch };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create batch.' };
  }
}

/**
 * Super Admin assigns or transfers student to a batch
 */
export async function assignStudentToBatchAction(studentProfileId: string, batchId: string | null) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await assignStudentToBatchService(studentProfileId, batchId, session.userId);
    revalidatePath('/admin/batches');
    revalidatePath('/admin/students');
    revalidatePath('/mentor');
    revalidatePath('/student');
    return { success: true, updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign batch.' };
  }
}

/**
 * Super Admin enrolls student into batch by Student ID (TS-ID or Email)
 */
export async function assignStudentToBatchByTsIdAction(tsIdOrEmail: string, batchId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const query = tsIdOrEmail.trim();
  if (!query) {
    return { success: false, error: 'Please provide a valid Student ID or Email.' };
  }

  try {
    const prisma = (await import('@/server/database/prisma')).prisma;
    const studentUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: query },
          { email: query.toLowerCase() },
          { tsIdentity: { tsId: query } },
        ],
      },
      include: {
        studentProfile: true,
        tsIdentity: true,
      },
    });

    if (!studentUser || !studentUser.studentProfile) {
      return {
        success: false,
        error: `No student record found matching Student ID / Email: '${query}'. Please check the student directory.`,
      };
    }

    const updated = await assignStudentToBatchService(
      studentUser.studentProfile.id,
      batchId,
      session.userId
    );

    revalidatePath('/admin/batches');
    revalidatePath('/admin/students');
    revalidatePath('/mentor');
    revalidatePath('/student');
    return {
      success: true,
      studentName: studentUser.name,
      tsId: studentUser.tsIdentity?.tsId || 'N/A',
      updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to enroll student into batch.' };
  }
}

/**
 * Mentor or Super Admin creates a new session for a batch
 */
export async function createBatchSessionAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const batchId = formData.get('batchId') as string;
  const title = formData.get('title') as string;
  const sessionDateStr = formData.get('sessionDate') as string;
  const durationMinsStr = formData.get('durationMins') as string;
  const agenda = formData.get('agenda') as string;

  if (!batchId || !title || !sessionDateStr) {
    return { success: false, error: 'Batch ID, Session Title, and Date are required.' };
  }

  try {
    const newSession = await createBatchSessionService(
      batchId,
      title,
      new Date(sessionDateStr),
      durationMinsStr ? parseInt(durationMinsStr, 10) : 120,
      agenda || undefined,
      session.userId
    );

    revalidatePath('/mentor');
    revalidatePath('/admin/batches');
    revalidatePath('/student');
    return { success: true, session: newSession };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create session.' };
  }
}

/**
 * Mentor explicitly marks student attendance
 */
export async function markBatchAttendanceAction(
  sessionId: string,
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[]
) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const updated = await markBatchAttendanceService(
      {
        sessionId,
        records,
        markedBy: session.name,
      },
      session.userId
    );

    revalidatePath('/mentor');
    revalidatePath('/student');
    revalidatePath('/admin/batches');
    return { success: true, count: updated.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark attendance.' };
  }
}

/**
 * Super Admin or Mentor fetches all delivered lectures audit data for date-based inspection
 */
export async function fetchDeliveredLecturesAuditAction() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN' && session.role !== 'MENTOR')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { getAllDeliveredSessionsService } = await import('@/server/services/batch.service');
    const lectures = await getAllDeliveredSessionsService();
    return { success: true, lectures };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch delivered lectures audit.' };
  }
}

/**
 * Super Admin or Academic Admin fetches all pending attendance correction requests
 */
export async function fetchPendingCorrectionRequestsAction() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { prisma } = await import('@/server/database/prisma');
    const requests = await (prisma as any).attendanceCorrectionRequest.findMany({
      include: {
        student: { include: { user: true } },
        mentor: { include: { user: true } },
        session: true,
        batch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, requests };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch correction requests.' };
  }
}

/**
 * Super Admin reviews an Attendance Correction Request
 */
export async function adminApproveOrRejectCorrectionAction(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  adminNotes: string = ''
) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { adminReviewCorrectionRequestService } = await import('@/server/services/batch.service');
    const req = await adminReviewCorrectionRequestService(
      requestId,
      decision,
      adminNotes,
      session.userId
    );

    revalidatePath('/admin/batches');
    revalidatePath('/mentor');
    revalidatePath('/student/attendance');
    return { success: true, request: req };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to review correction request.' };
  }
}

