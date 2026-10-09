import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { StudentMaterialsClient } from '@/components/student/materials/StudentMaterialsClient';

export const revalidate = 0;

export default async function StudentMaterialsPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      studentProfile: {
        include: {
          batch: true,
        },
      },
      enrollments: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!student) {
    redirect('/login');
  }

  const batchId = student.studentProfile?.batchId;

  // Fetch materials for student's batch, or general materials
  const resources = await prisma.batchResource.findMany({
    where: batchId ? { batchId } : {},
    include: {
      batch: {
        select: { id: true, batchCode: true, title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  return (
    <div className="py-2">
      <StudentMaterialsClient initialResources={resources as any} />
    </div>
  );
}
