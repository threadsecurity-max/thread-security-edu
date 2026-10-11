'use server';

import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { logAuditEvent } from '@/server/security/audit';
import { revalidatePath } from 'next/cache';

export async function createCourseAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const subtitle = (formData.get('subtitle') as string)?.trim();
  const category = (formData.get('category') as string)?.trim();
  const level = (formData.get('level') as any) || 'INTERMEDIATE';
  const durationHours = parseFloat((formData.get('durationHours') as string) || '24');
  const mentorId = (formData.get('mentorId') as string)?.trim() || null;
  const status = (formData.get('status') as any) || 'PUBLISHED';

  if (!title || !category) {
    return { success: false, error: 'Course title and category are required.' };
  }

  try {
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    const course = await prisma.course.create({
      data: {
        slug,
        title,
        subtitle: subtitle || title,
        description: subtitle || title,
        category,
        level,
        durationHours: isNaN(durationHours) ? 24 : durationHours,
        mentorId: mentorId || null,
        status,
      },
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'COURSE_CREATED',
      entity: 'COURSE',
      entityId: course.id,
      details: `Created course ${title} (${category}, Level: ${level})`,
    });

    revalidatePath('/admin/courses');
    revalidatePath('/admin/batches');
    revalidatePath('/workshops');
    revalidatePath('/');
    return { success: true, course };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create course.' };
  }
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const subtitle = (formData.get('subtitle') as string)?.trim();
  const category = (formData.get('category') as string)?.trim();
  const level = (formData.get('level') as any);
  const durationHoursStr = formData.get('durationHours') as string;
  const mentorId = (formData.get('mentorId') as string)?.trim();
  const status = (formData.get('status') as any);

  try {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle, description: subtitle } : {}),
        ...(category ? { category } : {}),
        ...(level ? { level } : {}),
        ...(durationHoursStr ? { durationHours: parseFloat(durationHoursStr) || 24 } : {}),
        ...(mentorId !== undefined ? { mentorId: mentorId || null } : {}),
        ...(status ? { status } : {}),
      },
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'COURSE_UPDATED',
      entity: 'COURSE',
      entityId: courseId,
      details: `Updated course ${updated.title}`,
    });

    revalidatePath('/admin/courses');
    revalidatePath('/admin/batches');
    revalidatePath('/workshops');
    revalidatePath('/');
    return { success: true, course: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update course.' };
  }
}

export async function deleteCourseAction(courseId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    // Check if any batches depend on this course
    const dependentBatches = await prisma.batch.findMany({
      where: { courseId },
      select: { batchCode: true, title: true },
    });

    if (dependentBatches.length > 0) {
      return {
        success: false,
        error: `Cannot delete course: ${dependentBatches.length} batch(es) (${dependentBatches.map(b => b.batchCode).join(', ')}) depend on this course. Reassign or delete those batches first.`,
      };
    }

    const course = await prisma.course.delete({
      where: { id: courseId },
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'COURSE_DELETED',
      entity: 'COURSE',
      entityId: courseId,
      details: `Deleted course ${course.title}`,
    });

    revalidatePath('/admin/courses');
    revalidatePath('/admin/batches');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete course.' };
  }
}
