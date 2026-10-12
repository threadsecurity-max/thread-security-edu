'use server';

import {
  createMentorService,
  updateMentorService,
  deleteMentorService,
  createStudentService,
  updateStudentService,
  deleteStudentService,
  logStudentViewService,
  reassignStudentTrackService,
  toggleStudentDashboardAccessService,
  toggleStudentCourseEnrollmentService,
  toggleMentorAccessService,
  reassignStudentBatchService,
  getNextSuggestedTSID,
  dispatchStudentCredentialsService,
  dispatchMentorCredentialsService,
} from '../../../server/services/admin.service';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { StudentTrack } from '@/lib/auth/ts-id';

export async function getSuggestedTSIDAction(track: StudentTrack = 'CYBER') {
  try {
    const tsId = await getNextSuggestedTSID(track);
    return { success: true, tsId };
  } catch {
    return { success: false, error: 'Failed to generate suggested TS-ID' };
  }
}

export async function createStudentAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const careerGoal = (formData.get('careerGoal') as string)?.trim();
  const customTsId = (formData.get('customTsId') as string)?.trim();
  const rawTrack = (formData.get('track') as string)?.trim() as StudentTrack;
  const track: StudentTrack = rawTrack === 'AI' ? 'AI' : 'CYBER';
  const batchId = (formData.get('batchId') as string)?.trim() || undefined;
  const tempPassword = (formData.get('tempPassword') as string)?.trim() || undefined;
  const dispatchEmail = formData.get('dispatchEmail') !== 'false' && formData.get('dispatchEmail') !== 'off';

  if (!name || !email) {
    return { success: false, error: 'Name and Email are required fields.' };
  }

  try {
    const result = await createStudentService({
      name,
      email,
      phone,
      careerGoal,
      track,
      customTsId: customTsId || undefined,
      batchId: batchId || undefined,
      tempPassword,
      dispatchEmail,
    });
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/batches');
    revalidatePath('/admin/audit');
    return {
      success: true,
      user: result.user,
      tsId: result.tsId,
      emailDispatched: result.emailDispatched,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create student account.';
    return { success: false, error: msg };
  }
}

export async function dispatchStudentCredentialsAction(userId: string, customPassword?: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const res = await dispatchStudentCredentialsService(userId, customPassword);
    revalidatePath('/admin/students');
    return { success: true, email: res.email, tsId: res.tsId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch credentials email.';
    return { success: false, error: msg };
  }
}

export async function reassignStudentTrackAction(userId: string, track: StudentTrack) {
  try {
    const newTsId = await reassignStudentTrackService(userId, track);
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    return { success: true, tsId: newTsId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reassign TS-ID track.';
    return { success: false, error: msg };
  }
}

export async function updateStudentAction(userId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const careerGoal = (formData.get('careerGoal') as string)?.trim();

  try {
    await updateStudentService(userId, { name, email, phone, careerGoal });
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update student.';
    return { success: false, error: msg };
  }
}

export async function deleteStudentAction(userId: string) {
  try {
    await deleteStudentService(userId);
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete student.';
    return { success: false, error: msg };
  }
}

export async function logStudentViewAction(userId: string) {
  try {
    const session = await getSession();
    await logStudentViewService(userId, session?.userId);
    revalidatePath('/admin');
    revalidatePath('/admin/audit');
    return { success: true };
  } catch (err: unknown) {
    return { success: false };
  }
}

export async function createMentorAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const title = (formData.get('title') as string)?.trim() || 'Security Instructor';
  const company = (formData.get('company') as string)?.trim() || 'Thread Security Education';
  const expertise = (formData.get('expertise') as string)?.trim() || 'Cybersecurity, VAPT';
  const bio = (formData.get('bio') as string)?.trim() || 'Lead instructor in offensive security.';
  const batchId = (formData.get('batchId') as string)?.trim() || undefined;
  
  const rawBatchIds = formData.getAll('batchIds');
  const batchIds = rawBatchIds.length > 0 ? (rawBatchIds as string[]) : batchId ? [batchId] : undefined;
  
  const rawCourseIds = formData.getAll('courseIds');
  const courseIds = rawCourseIds.length > 0 ? (rawCourseIds as string[]) : undefined;

  const schedule = (formData.get('schedule') as string)?.trim() || undefined;
  const passkey = (formData.get('passkey') as string)?.trim() || undefined;
  const dispatchEmail = formData.get('dispatchEmail') !== 'false' && formData.get('dispatchEmail') !== 'off';

  if (!name || !email) {
    return { success: false, error: 'Name and Email are required fields.' };
  }

  try {
    const result = await createMentorService({
      name,
      email,
      title,
      company,
      expertise,
      bio,
      batchId: batchId || undefined,
      batchIds,
      courseIds,
      schedule,
      passkey,
      dispatchEmail,
    });

    revalidatePath('/admin/mentors');
    revalidatePath('/admin/batches');
    revalidatePath('/admin/courses');
    revalidatePath('/admin/students');
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/audit');
    return { success: true, mentor: result.mentor, emailDispatched: result.emailDispatched };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create mentor.';
    return { success: false, error: msg };
  }
}

export async function dispatchMentorCredentialsAction(mentorProfileId: string, customPasskey?: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const res = await dispatchMentorCredentialsService(mentorProfileId, customPasskey);
    revalidatePath('/admin/mentors');
    return { success: true, email: res.email, mentorId: res.mentorId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch faculty credentials email.';
    return { success: false, error: msg };
  }
}

export async function assignBatchToMentorAction(mentorProfileId: string, batchId: string) {
  try {
    const prisma = (await import('@/server/database/prisma')).prisma;
    await prisma.batch.update({
      where: { id: batchId },
      data: { mentorId: mentorProfileId },
    });
    revalidatePath('/admin/mentors');
    revalidatePath('/admin/batches');
    revalidatePath('/admin/timetable');
    revalidatePath('/mentor');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign batch to mentor' };
  }
}

export async function updateMentorAction(mentorId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const title = (formData.get('title') as string)?.trim();
  const company = (formData.get('company') as string)?.trim();
  const expertise = (formData.get('expertise') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim();

  try {
    const updated = await updateMentorService(mentorId, {
      name,
      title,
      company,
      expertise,
      bio,
    });

    revalidatePath('/admin/mentors');
    return { success: true, updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update mentor.';
    return { success: false, error: msg };
  }
}

export async function deleteMentorAction(mentorId: string) {
  try {
    await deleteMentorService(mentorId);
    revalidatePath('/admin/mentors');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete mentor.';
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Single-toggle Grant/Revoke Student Dashboard Access
 */
export async function toggleStudentDashboardAccessAction(userId: string, grant: boolean) {
  try {
    const session = await getSession();
    await (toggleStudentDashboardAccessService as any)(userId, grant, session?.userId);
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    revalidatePath('/student');
    return { success: true, isGranted: grant };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update student dashboard access.';
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Toggle Course Enrollment for a Student
 */
export async function toggleStudentCourseEnrollmentAction(userId: string, courseId: string, active: boolean) {
  try {
    const session = await getSession();
    await (toggleStudentCourseEnrollmentService as any)(userId, courseId, active, session?.userId);
    revalidatePath('/admin/students');
    revalidatePath('/student/courses');
    return { success: true, active };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update student course enrollment.';
    return { success: false, error: msg };
  }
}

export async function toggleMentorAccessAction(mentorId: string, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') {
  try {
    const session = await getSession();
    await toggleMentorAccessService(mentorId, status, session?.userId);
    revalidatePath('/admin');
    revalidatePath('/admin/mentors');
    revalidatePath('/admin/audit');
    return { success: true, status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update mentor access status.';
    return { success: false, error: msg };
  }
}

export async function reassignStudentBatchAction(userId: string, newBatchId: string | null) {
  try {
    const session = await getSession();
    const res = await reassignStudentBatchService(userId, newBatchId, session?.userId);
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/batches');
    revalidatePath('/admin/audit');
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to transfer student batch.';
    return { success: false, error: msg };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return { success: false, error: 'Unauthorized to change user roles' };
    }
    const { prisma } = await import('@/server/database/prisma');
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
    revalidatePath('/admin/users');
    revalidatePath('/admin/students');
    revalidatePath('/admin/mentors');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user role';
    return { success: false, error: msg };
  }
}



