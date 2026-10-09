import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { StudentLabInteractiveClient } from '@/components/student/labs/StudentLabInteractiveClient';

export const revalidate = 0;

export default async function StudentLabTargetPage({
  params,
  searchParams,
}: {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{ flagResult?: string }>;
}) {
  const { labId } = await params;
  const { flagResult } = await searchParams;

  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { tsIdentity: true },
  });

  if (!student) {
    redirect('/login');
  }

  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: { course: true },
  });

  if (!lab) {
    notFound();
  }

  // Get or create initial lab attempt
  let attempt = await prisma.labAttempt.findFirst({
    where: {
      labId: lab.id,
      userId: student.id,
    },
  });

  if (!attempt) {
    attempt = await prisma.labAttempt.create({
      data: {
        labId: lab.id,
        userId: student.id,
        state: 'IN_PROGRESS',
      },
    });
  }

  const studentData = {
    id: student.id,
    name: student.name || session.name || 'Cadet',
    email: student.email,
    tsId: student.tsIdentity?.tsId || session.tsId || `TSE-2026-${student.id.slice(-6).toUpperCase()}`,
  };

  return (
    <div className="py-2">
      <StudentLabInteractiveClient
        lab={lab as any}
        attempt={attempt as any}
        student={studentData}
        initialFlagResult={flagResult}
      />
    </div>
  );
}
