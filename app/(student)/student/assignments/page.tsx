import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { StudentAssignmentsClient } from '@/components/student/student-assignments-client';

export const revalidate = 0; // Fresh academic data on every load

export default async function StudentAssignmentsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Find student profile and batch
  let student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      studentProfile: {
        include: {
          batch: true,
        },
      },
    },
  });

  if (!student) {
    student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      include: {
        tsIdentity: true,
        studentProfile: {
          include: {
            batch: true,
          },
        },
      },
    });
  }

  // Determine assigned batch
  const assignedBatchId = student?.studentProfile?.batchId;
  let batch = student?.studentProfile?.batch;

  // Build inclusive where clause:
  // 1. If student is linked to a batch, query that batch OR any assignments where they submitted
  // 2. If student has no batch assigned, query all assignments across cohorts
  const whereClause: any = assignedBatchId
    ? {
        OR: [
          { batchId: assignedBatchId },
          { submissions: { some: { studentId: session.userId } } },
        ],
      }
    : {};

  let assignments = await (prisma as any).assignment.findMany({
    where: whereClause,
    include: {
      batch: true,
      module: true,
      submissions: {
        where: { studentId: session.userId },
      },
    },
    orderBy: { deadline: 'asc' },
  });

  // If student is assigned to a batch that has no assignments yet, also load any other active assignments
  // so the student is never locked out of testing or completing coursework
  if (assignments.length === 0 && assignedBatchId) {
    assignments = await (prisma as any).assignment.findMany({
      include: {
        batch: true,
        module: true,
        submissions: {
          where: { studentId: session.userId },
        },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  // Fallback for batch header details
  if (!batch) {
    if (assignments.length > 0 && assignments[0].batch) {
      batch = assignments[0].batch;
    } else {
      batch = await prisma.batch.findFirst({
        orderBy: { startDate: 'desc' },
      });
    }
  }

  const studentName = student?.name || session.name || 'Student';
  const tsId = student?.tsIdentity?.tsId || session.tsId || 'TSE-STUDENT';

  return (
    <StudentAssignmentsClient
      assignments={assignments}
      batch={batch}
      studentName={studentName}
      tsId={tsId}
      userId={session.userId}
    />
  );
}
