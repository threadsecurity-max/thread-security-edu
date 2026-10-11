import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { CourseManagementClient } from './course-management-client';

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const [courses, mentors] = await Promise.all([
    prisma.course.findMany({
      include: {
        mentor: { include: { user: true } },
        modules: true,
        labs: true,
        batches: { select: { id: true, batchCode: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mentorProfile.findMany({
      include: { user: true },
    }),
  ]);

  return <CourseManagementClient courses={courses} mentors={mentors} />;
}
