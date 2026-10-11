import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAllBatchesService } from '@/server/services/batch.service';
import { TimetableClient } from '@/app/(admin)/admin/timetable/timetable-client';

export const metadata = {
  title: 'Academic Timetable & Scheduling | Thread Security Admin',
  description: 'Conflict-free lecture scheduling, session calendar, and batch timetable coordination.',
};

export const revalidate = 0;

export default async function AdminTimetablePage() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== 'ADMIN' &&
      session.role !== 'SUPER_ADMIN' &&
      session.role !== 'ACADEMIC_ADMIN')
  ) {
    redirect('/auth/login');
  }

  const [batches, mentors, courses] = await Promise.all([
    getAllBatchesService(),
    prisma.mentorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.course.findMany({
      select: { id: true, title: true, slug: true },
    }),
  ]);

  return <TimetableClient initialBatches={batches} mentors={mentors} courses={courses} />;
}
