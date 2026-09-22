import { redirect } from 'next/navigation';
import { getSession, hasMentorClearance } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { AssignmentsManagerClient } from '@/components/mentor/assignments-manager-client';
import { MentorVerifyClient } from '../verify/mentor-verify-client';

export const revalidate = 0; // Fresh academic data on every load

export default async function MentorAssignmentsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Mentor clearance check
  const hasClearance = await hasMentorClearance();
  if (session.role === 'MENTOR' && !hasClearance) {
    return (
      <MentorVerifyClient
        mentorEmail={session.email}
        mentorName={session.name || 'Faculty Mentor'}
      />
    );
  }

  // Find mentor profile
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.userId },
  });

  // Fetch batches assigned to this mentor or all batches if admin
  const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN';
  const batches = await prisma.batch.findMany({
    where: isSuperAdmin
      ? {}
      : {
          OR: [
            { mentorId: mentorProfile?.id },
            { mentorId: session.userId },
          ],
        },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: { lessons: true },
          },
        },
      },
      students: {
        include: {
          user: {
            include: { tsIdentity: true },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  // Fallback: If mentor has no batch assigned yet, fetch active batches so mentor can work
  let effectiveBatches = batches;
  if (effectiveBatches.length === 0) {
    effectiveBatches = await prisma.batch.findMany({
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: { lessons: true },
            },
          },
        },
        students: {
          include: {
            user: {
              include: { tsIdentity: true },
            },
          },
        },
      },
      take: 5,
    });
  }

  const batchIds = effectiveBatches.map((b) => b.id);

  // Fetch all assignments for these batches or created by this mentor
  const assignments = await (prisma as any).assignment.findMany({
    where: isSuperAdmin
      ? {}
      : {
          OR: [
            { batchId: { in: batchIds } },
            { createdById: session.userId },
          ],
        },
    include: {
      batch: true,
      module: true,
      submissions: {
        include: {
          student: {
            include: { tsIdentity: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AssignmentsManagerClient
      batches={effectiveBatches}
      initialAssignments={assignments}
      currentUserId={session.userId}
      userRole={session.role}
    />
  );
}
