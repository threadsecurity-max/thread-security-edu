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

  const durationPreset = formData.get('durationPreset') as any;
  const facultyRole = formData.get('facultyRole') as any;
  const autoGenerateTimetable =
    formData.get('autoGenerateTimetable') === 'true' ||
    formData.get('autoGenerateTimetable') === 'on';
  const rawDays = formData.getAll('daysOfWeek');
  const daysOfWeek =
    rawDays.length > 0
      ? (rawDays as string[])
      : formData.get('daysOfWeek')
      ? (formData.get('daysOfWeek') as string).split(',').map((s) => s.trim())
      : undefined;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const attendanceLockHoursStr = formData.get('attendanceLockHours') as string;

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
        schedule: schedule || undefined,
        maxCapacity: maxCapacityStr ? parseInt(maxCapacityStr, 10) : 30,
        durationPreset: durationPreset || undefined,
        facultyRole: facultyRole || undefined,
        autoGenerateTimetable,
        daysOfWeek,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        attendanceLockHours: attendanceLockHoursStr ? parseInt(attendanceLockHoursStr, 10) : 120,
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

/**
 * Super Admin or Academic Admin updates batch
 */
export async function updateBatchAction(batchId: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
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
  const status = formData.get('status') as string;

  try {
    const { updateBatchService } = await import('@/server/services/batch.service');
    const updated = await updateBatchService(
      batchId,
      {
        batchCode: batchCode || undefined,
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        courseId: courseId || null,
        mentorId: mentorId || null,
        startDate: startDateStr ? new Date(startDateStr) : undefined,
        endDate: endDateStr ? new Date(endDateStr) : null,
        schedule: schedule || undefined,
        maxCapacity: maxCapacityStr ? parseInt(maxCapacityStr, 10) : undefined,
        status: status || undefined,
      },
      session.userId
    );

    revalidatePath('/admin/batches');
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/mentors');
    revalidatePath('/mentor');
    return { success: true, batch: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update batch.' };
  }
}

/**
 * Super Admin deletes a batch
 */
export async function deleteBatchAction(batchId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { deleteBatchService } = await import('@/server/services/batch.service');
    await deleteBatchService(batchId, session.userId);

    revalidatePath('/admin/batches');
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/mentors');
    revalidatePath('/mentor');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete batch.' };
  }
}

/**
 * Super Admin or Academic Admin bulk-assigns multiple students to a batch (or unassigns if null)
 */
export async function bulkAssignStudentsToBatchAction(
  studentProfileIds: string[],
  batchId: string | null
) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (!studentProfileIds || studentProfileIds.length === 0) {
    return { success: false, error: 'No students selected.' };
  }

  try {
    const { prisma } = await import('@/server/database/prisma');

    await prisma.studentProfile.updateMany({
      where: { id: { in: studentProfileIds } },
      data: { batchId: batchId || null },
    });

    // Also link enrolled course if batch has a course
    if (batchId) {
      const targetBatch = await prisma.batch.findUnique({
        where: { id: batchId },
        select: { courseId: true },
      });

      if (targetBatch?.courseId) {
        const studentProfiles = await prisma.studentProfile.findMany({
          where: { id: { in: studentProfileIds } },
          select: { userId: true },
        });

        for (const sp of studentProfiles) {
          try {
            await (prisma as any).enrollment.upsert({
              where: {
                userId_courseId: {
                  userId: sp.userId,
                  courseId: targetBatch.courseId,
                },
              },
              update: { status: 'ACTIVE' },
              create: {
                userId: sp.userId,
                courseId: targetBatch.courseId,
                progressPercent: 0,
                status: 'ACTIVE',
              },
            });
          } catch {}
        }
      }
    }

    revalidatePath('/admin/batches');
    revalidatePath('/admin/students');
    revalidatePath('/mentor');
    revalidatePath('/student');
    return { success: true, count: studentProfileIds.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to bulk assign students.' };
  }
}

/**
 * Super Admin or Academic Admin assigns or updates the faculty mentor for a batch
 */
export async function assignBatchMentorAction(batchId: string, mentorId: string | null) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { prisma } = await import('@/server/database/prisma');
    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: { mentorId: mentorId || null },
      include: {
        mentor: { include: { user: true } },
      },
    });

    revalidatePath('/admin/batches');
    revalidatePath('/admin/mentors');
    revalidatePath('/admin/timetable');
    revalidatePath('/mentor');
    return { success: true, batch: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign mentor to batch.' };
  }
}



