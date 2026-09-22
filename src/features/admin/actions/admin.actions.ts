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
} from '../../../server/services/admin.service';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { StudentTrack } from '@/lib/auth/ts-id';

export async function createStudentAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const careerGoal = (formData.get('careerGoal') as string)?.trim();
  const rawTrack = (formData.get('track') as string)?.trim() as StudentTrack;
  const track: StudentTrack = rawTrack === 'AI' ? 'AI' : 'CYBER';

  if (!name || !email) {
    return { success: false, error: 'Name and Email are required fields.' };
  }

  try {
    const result = await createStudentService({ name, email, phone, careerGoal, track });
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    return { success: true, user: result.user, tsId: result.tsId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create student account.';
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
    });

    revalidatePath('/admin/mentors');
    revalidatePath('/admin/students');
    revalidatePath('/admin/audit');
    return { success: true, mentor: result.mentor };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create mentor.';
    return { success: false, error: msg };
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


